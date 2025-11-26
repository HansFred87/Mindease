# services.py
import os
import random
from google import genai
from .fallback import create_simple_fallback

# -------------------------------
# Gemini API Configuration
# -------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required")

SYSTEM_PROMPT = (
    "You are MindEase AI, a knowledgeable mental health companion with genuine expertise "
    "and empathy. Provide supportive, actionable advice while maintaining warmth.\n\n"
    "CORE PERSONALITY:\n"
    "Helpful, empathetic, non-judgmental, and concise."
)

# -------------------------------
# Lazy client initialization
# -------------------------------
_client = None

def get_client():
    """Initialize Gemini client lazily."""
    global _client
    if _client is None:
        try:
            _client = genai.Client(api_key=GEMINI_API_KEY)
        except Exception as e:
            print(f"Error initializing Gemini client: {e}")
            _client = None
    return _client

def get_gemini_model():
    return "gemini-2.5-flash"

# -------------------------------
# Message history
# -------------------------------
def build_message_history(conversation):
    """
    Build structured message history for Gemini API.
    conversation: Conversation instance
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in conversation.messages.all().order_by('timestamp'):
        role = "user" if msg.sender == "user" else "assistant"
        messages.append({"role": role, "content": msg.content})
    return messages

# -------------------------------
# Call Gemini
# -------------------------------
def call_gemini(history):
    """
    Call Gemini API using the message history.
    Returns AI response string, or None if failed.
    """
    client = get_client()
    if not client:
        print("Gemini client not initialized!")
        return None

    try:
        # Build prompt text for API
        prompt_text = ""
        for msg in history:
            role = "User" if msg["role"] == "user" else "AI"
            prompt_text += f"{role}: {msg['content']}\n"

        response = client.models.generate_content(
            model=get_gemini_model(),
            contents=prompt_text,
        )

        return response.text.strip() if response else None

    except Exception as e:
        print(f"Gemini API Error: {e}")
        return None

# -------------------------------
# Fallback
# -------------------------------
def create_fallback_response(user_input: str) -> str:
    """
    Return a fallback response if Gemini fails.
    """
    return create_simple_fallback(user_input)

