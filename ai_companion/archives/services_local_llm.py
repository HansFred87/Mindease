import torch
import random
from transformers import AutoTokenizer, AutoModelForCausalLM

# -------------------------------
# Model Setup
# -------------------------------
MODEL_NAME = "mosaicml/mpt-7b-instruct"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)
model.to(DEVICE)

# -------------------------------
# System prompt
# -------------------------------
SYSTEM_PROMPT = (
    "You are MindEase AI, a supportive mental health companion. "
    "Provide empathetic, concise, and actionable advice."
)

# -------------------------------
# Build message history
# -------------------------------
def build_message_history(conversation):
    """
    Build structured message history from the database conversation.
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in conversation.messages.all().order_by("timestamp"):
        role = "user" if msg.sender == "user" else "assistant"
        messages.append({"role": role, "content": msg.content})
    return messages

# -------------------------------
# Call Local LLM
# -------------------------------
def call_local_llm(history):
    """
    Generates AI response using local MPT-7B Instruct model.
    """
    # Build prompt from conversation history
    prompt = ""
    for m in history:
        role = "User" if m["role"] == "user" else "AI"
        prompt += f"{role}: {m['content']}\n"
    prompt += "AI: "

    # Tokenize and generate
    inputs = tokenizer(prompt, return_tensors="pt").to(DEVICE)
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=200,
            do_sample=True,
            temperature=0.7,
            top_p=0.9
        )
    response = tokenizer.decode(outputs[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True)
    return response.strip()

# -------------------------------
# Fallback response
# -------------------------------
def create_simple_fallback(user_input: str) -> str:
    if not user_input or user_input.strip() == "":
        return "I'm here with you. What’s on your mind right now?"
    return random.choice([
        "I hear you. Can you tell me more?",
        "That sounds challenging. How does that make you feel?",
        "Let's take a moment to breathe and think about it.",
        "I understand. What do you want to focus on right now?"
    ])
