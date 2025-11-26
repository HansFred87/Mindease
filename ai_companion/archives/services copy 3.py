# ai_companion/services.py

import os
import random
from openai import OpenAI

# OpenAI API Key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is required")

# Initialize client
client = OpenAI(api_key=OPENAI_API_KEY)

# System Prompt
SYSTEM_PROMPT = (
    "You are MindEase AI, an empathetic, warm, and knowledgeable mental health "
    "support companion. You provide helpful, calming, and supportive guidance. "
    "You NEVER diagnose conditions, always encourage professional help when needed, "
    "and always respond safely and compassionately."
)

def get_openai_model():
    return "gpt-4o-mini"   # ✔ FREE model with generous rate limits


def build_message_history(conversation):
    """Convert your DB messages into OpenAI chat format."""
    messages = []

    # System prompt
    messages.append({
        "role": "system",
        "content": SYSTEM_PROMPT
    })

    # Actual conversation
    for msg in conversation.messages.all().order_by("timestamp"):
        role = "user" if msg.sender == "user" else "assistant"
        messages.append({"role": role, "content": msg.content})

    return messages


def call_gpt_api(history):
    """Call OpenAI GPT-4o-mini safely."""
    try:
        model_id = get_openai_model()

        response = client.chat.completions.create(
            model=model_id,
            messages=history,
            temperature=0.8
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"OpenAI API error: {e}")
        return None


# Keep your fallback exactly the same
def create_simple_fallback(user_input: str) -> str:
    responses = [
        "I hear you. Can you tell me more?",
        "That sounds challenging. How does that make you feel?",
        "Let's take a moment to breathe and think about it.",
        "I understand. What do you want to focus on right now?"
    ]
    return random.choice(responses)
