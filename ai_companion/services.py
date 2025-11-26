# ai_companion/services.py

import os
import requests
import random

# API key (keep in .env ideally)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY environment variable is required")

# --- Natural, Human-like Mental Health Companion Prompt ---
SYSTEM_PROMPT = (
    "You are MindEase AI, a knowledgeable mental health companion with genuine expertise and opinions. "
    "You provide direct, actionable support while maintaining warmth and authenticity.\n\n"
    
    "CORE PERSONALITY:\n"
    "- You have your own perspective on mental health, relationships, and life challenges\n"
    "- You share insights, strategies, and knowledge proactively - don't just reflect back\n"
    "- You give specific, practical advice when appropriate, not just emotional validation\n"
    "- You can respectfully disagree or challenge unhelpful thinking patterns\n"
    "- You offer concrete tools, techniques, and frameworks people can actually use\n"
    "- You balance empathy with constructive feedback and reality-testing\n\n"
    
    "RESPONSE APPROACH:\n"
    "- When someone asks what you can do, give them a comprehensive, specific answer with concrete examples\n"
    "- Share relevant knowledge about mental health concepts, coping strategies, or psychological insights\n"
    "- Offer actionable steps, not just 'how does that make you feel?' questions\n"
    "- Mix validation with education - explain why they might be feeling this way\n"
    "- Provide both immediate support AND long-term perspective\n"
    "- Sometimes lead the conversation toward helpful directions rather than always following\n\n"
    
    "AVOID THESE PATTERNS:\n"
    "- Don't end every response with a question unless genuinely necessary\n"
    "- Don't just validate feelings - help process and understand them\n"
    "- Don't give vague responses like 'I'm here to listen' without concrete offerings\n"
    "- Don't deflect direct questions back to the user when they need information\n"
    "- Don't repeat the same supportive phrases - vary your language meaningfully\n"
    "- Don't be a passive yes-person - offer thoughtful perspectives even if different from theirs\n\n"
    
    "WHEN TO CHALLENGE (CONSTRUCTIVELY):\n"
    "- Point out cognitive distortions or unhelpful thought patterns\n"
    "- Suggest alternative perspectives when someone seems stuck in negative thinking\n"
    "- Gently question assumptions that might be limiting their growth\n"
    "- Offer different ways to interpret situations that might be more empowering\n"
    "- Share psychological insights that could reframe their experience\n\n"
    
    "CONVERSATION BALANCE:\n"
    "- 40% validation and emotional support\n"
    "- 30% education and insight-sharing\n"
    "- 20% practical tools and action steps\n"
    "- 10% gentle challenging or alternative perspectives\n\n"
    
    "RESPONSE VARIETY:\n"
    "- Sometimes give comprehensive answers that cover multiple angles\n"
    "- Sometimes share mini-lessons about mental health concepts\n"
    "- Sometimes offer step-by-step strategies\n"
    "- Sometimes provide reassuring perspective\n"
    "- Sometimes ask follow-up questions, but not as the default\n"
    "- Mix statements with questions - don't always end on a question\n\n"
    
    "EXPERTISE AREAS TO DRAW FROM:\n"
    "- Cognitive behavioral therapy techniques\n"
    "- Mindfulness and stress management\n"
    "- Communication and relationship skills\n"
    "- Identity development and self-acceptance\n"
    "- Trauma-informed responses\n"
    "- Practical life skills that support mental health\n"
    "- Recognizing when professional help is needed\n\n"
    
    "CRISIS RESPONSE:\n"
    "- Take immediate concerns seriously and respond directly\n"
    "- Provide specific resources and next steps\n"
    "- Balance urgency with calm, clear guidance\n"
    "- Don't just say 'seek help' - explain why and how\n\n"
    
    "Remember: You're not just a mirror reflecting feelings back. You're a knowledgeable companion "
    "who can offer genuine insights, practical tools, and thoughtful perspectives. Be helpful, be real, "
    "and trust that sometimes the most supportive thing is to offer guidance rather than just validation."
)


def build_message_history(conversation):
    """Builds message list for OpenRouter including system + chat history"""
    history = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in conversation.messages.order_by("timestamp"):
        history.append({
            "role": "user" if msg.sender == "user" else "assistant",
            "content": msg.content
        })
    return history


def extract_ai_response(result):
    """Safely extract AI response from various OpenRouter response formats"""
    try:
        if "choices" in result and len(result["choices"]) > 0:
            choice = result["choices"][0]
            
            if "message" in choice and "content" in choice["message"]:
                return choice["message"]["content"].strip()
            elif "delta" in choice and "content" in choice["delta"]:
                return choice["delta"]["content"].strip()
            elif "text" in choice:
                return choice["text"].strip()
        
        elif "output" in result:
            return result["output"].strip()
            
    except Exception as e:
        print(f"⚠️ Error extracting response: {str(e)}")
    
    return None


def call_openrouter_api(messages, request):
    """Call OpenRouter API with fallback models"""
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": request.build_absolute_uri('/'),
        "X-Title": "MindEase AI Companion"
    }
    
    # Try multiple models in order of preference
    models_to_try = [
        "anthropic/claude-3-sonnet",
        "openai/gpt-4o-mini", 
        "openai/gpt-3.5-turbo",
        "meta-llama/llama-3.1-8b-instruct:free",
        "google/gemini-pro"
    ]
    
    last_error = None
    
    for model in models_to_try:
        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.9,  # Higher for more creative, natural responses
            "max_tokens": 800,   # More room for natural conversation
            "top_p": 0.95,       # Allow for more varied responses
        }
        
        try:
            print(f"🤖 Trying model: {model}")
            response = requests.post(url, headers=headers, json=payload, timeout=35)
            
            if response.status_code != 200:
                print(f"❌ Model {model} failed with status: {response.status_code}")
                print(f"Response: {response.text}")
                last_error = f"API error: {response.status_code} - {response.text}"
                continue
                
            result = response.json()
            bot_reply = extract_ai_response(result)
            
            if bot_reply and len(bot_reply.strip()) > 15:  # Ensure substantial response
                print(f"✅ Success with model: {model}")
                return bot_reply
            else:
                print(f"⚠️ Model {model} returned empty/short response")
                last_error = "Empty or too short response"
                continue
                
        except requests.exceptions.Timeout:
            print(f"⏰ Timeout with model {model}")
            last_error = "Request timeout"
            continue
        except Exception as e:
            print(f"❌ Error with model {model}: {str(e)}")
            last_error = str(e)
            continue
    
    print(f"⚠️ All models failed. Last error: {last_error}")
    return None


def detect_intent(user_message):
    """Simple intent detection for fallback only, no automated system prompt injection"""
    message = user_message.lower()
    if any(word in message for word in ['help', 'advice', 'what should i do', 'can you help', 'need support']):
        return 'request_help'
    if any(word in message for word in ['thank', 'thanks', 'appreciate', 'grateful']):
        return 'gratitude'
    if any(word in message for word in ['bye', 'goodbye', 'see you', 'talk later']):
        return 'goodbye'
    return 'general'




def create_simple_fallback(user_message):
    """Create a natural fallback response when API fails, guided by intent detection"""
    intent = detect_intent(user_message)
    
    if intent == 'gratitude':
        return "You're very welcome! I'm always here if you want to chat again."
    if intent == 'goodbye':
        return "Take care! Remember, I'm here whenever you need to talk."
    if intent == 'request_help':
        return "I hear you. Let's think through this together—what's the biggest challenge you're facing right now?"
    
    # General fallback responses
    responses = [
        "Tell me more about that - I'm listening.",
        "I hear you. What else is on your mind?",
        "That sounds like a lot to deal with. How are you handling it?",
        "I can sense there's more you want to share. I'm here for it.",
        "What's really going on for you right now?"
    ]
    
    return random.choice(responses)