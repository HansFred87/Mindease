# ai_companion/services.py

import os
import random
from openai import OpenAI  # using OpenAI-compatible client

# Get your DeepSeek API key from env
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
if not DEEPSEEK_API_KEY:
    raise ValueError("DEEPSEEK_API_KEY environment variable is required")

# Initialize client to use DeepSeek base URL
client = OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com"  # use DeepSeek endpoint :contentReference[oaicite:1]{index=1}
)

SYSTEM_PROMPT = (
    "You are MindEase AI, an empathetic, knowledgeable mental health companion. "
    "Respond with genuine care, support, and helpful advice. You do not diagnose."
)

def get_deepseek_model():
    # Use the chat model
    return "deepseek-chat"  # or "deepseek-reasoner" for more reasoning power :contentReference[oaicite:2]{index=2}

def build_message_history(conversation):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in conversation.messages.all().order_by("timestamp"):
        role = "user" if msg.sender == "user" else "assistant"
        messages.append({"role": role, "content": msg.content})
    return messages

def call_deepseek_api(history):
    try:
        model_id = get_deepseek_model()
        response = client.chat.completions.create(
            model=model_id,
            messages=history,
            temperature=0.8,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"DeepSeek API error: {e}")
        return None

def create_simple_fallback(user_input: str) -> str:
    responses = [
        "I hear you. Can you tell me more?",
        "That sounds challenging. How does that make you feel?",
        "Let's take a moment to breathe.",
        "I understand. What do you want to focus on right now?"
    ]
    return random.choice(responses)
