# ai_companion/fallback.py

def create_simple_fallback(user_message: str) -> str:
    """
    Generates a safe fallback response in case the AI API fails.
    This function is intentionally simple to avoid dependency errors.
    """

    if not user_message or user_message.strip() == "":
        return "I'm here with you. What’s on your mind right now?"

    msg = user_message.lower()

    # -------------------------------------
    # 🧠 Emotional / Mental-Health Fallbacks
    # -------------------------------------
    if "sad" in msg or "depress" in msg or "down" in msg:
        return "I'm really sorry you're feeling this way. You're not alone — I'm here to listen. What do you think contributed to how you're feeling today?"

    if "anxious" in msg or "anxiety" in msg or "nervous" in msg:
        return "It sounds like you're feeling anxious. That can be really overwhelming. Would you like to talk about what's triggering those feelings?"

    if "stress" in msg or "burnout" in msg:
        return "Stress can take a big toll. Want to share what's been weighing on you lately?"

    if "alone" in msg or "lonely" in msg:
        return "Feeling alone can be heavy. I'm here with you — want to talk about what's making you feel this way?"

    if "angry" in msg or "mad" in msg:
        return "It’s okay to feel angry. Want to tell me what happened so I can understand better?"

    # -------------------------------------
    # ⚠️ Safety-Sensitive Statements
    # (Non-diagnostic + supportive)
    # -------------------------------------
    if "suicid" in msg or "kill myself" in msg or "end my life" in msg:
        return (
            "I'm really sorry you're feeling such intense pain. "
            "You deserve support, and you’re not alone. "
            "Please reach out to someone who can help immediately — "
            "a trusted person or a local emergency or crisis hotline."
        )

    if "hurt myself" in msg or "self harm" in msg:
        return (
            "It sounds like you're going through something very difficult. "
            "You deserve care and safety. Consider reaching out to someone "
            "you trust or a local professional who can help you right now."
        )

    # -------------------------------------
    # 💬 General Conversational Fallback
    # -------------------------------------
    generic_responses = [
        "I hear you. Tell me more so I can understand better.",
        "That sounds important. What part of this matters most to you?",
        "I'm here with you. Can you share a little more?",
        "Thank you for opening up. What else is on your mind?",
        "I’m listening — tell me what happened."
    ]

    # Simple deterministic fallback (optional randomization)
    return generic_responses[0]
