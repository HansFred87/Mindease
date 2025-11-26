# ai_companion/views.py

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db import transaction, IntegrityError
import json

from .models import Conversation, Message
from .services import build_message_history, call_openrouter_api, create_simple_fallback

@login_required
def ai_companion(request):
    """
    Main AI chat endpoint.
    Handles POST requests from frontend, saves messages, calls AI, and returns response.
    """
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        session_id = data.get("session_id")
        user_input = data.get("message")
        clear_chat = data.get("clear_chat", False)

        if not session_id:
            return JsonResponse({"error": "Missing session_id"}, status=400)

        # Safely get or create conversation
        try:
            with transaction.atomic():
                conversation, created = Conversation.objects.get_or_create(
                    session_id=session_id,
                    defaults={"user": request.user, "is_active": True}
                )
                # Update user and active status if conversation exists
                if not created:
                    conversation.user = request.user
                    conversation.is_active = True
                    conversation.save()
        except IntegrityError:
            conversation = Conversation.objects.get(session_id=session_id)

        # Clear chat if requested
        if clear_chat:
            conversation.messages.all().delete()
            return JsonResponse({"status": "chat_cleared"})

        if not user_input:
            return JsonResponse({"error": "Missing message"}, status=400)

        # Save user message
        Message.objects.create(
            conversation=conversation,
            sender="user",
            content=user_input
        )

        # Build conversation history
        history = build_message_history(conversation)

        # Call AI via OpenRouter
        ai_response = call_openrouter_api(history, request)

        # Fallback if API fails or response is too short
        if not ai_response or len(ai_response.strip()) < 10:
            ai_response = create_simple_fallback(user_input)

        # Save AI response
        Message.objects.create(
            conversation=conversation,
            sender="ai",
            content=ai_response
        )

        return JsonResponse({"response": ai_response})

    else:
        # Render chat page for GET requests
        return render(request, "ai_companion/chat.html")


@login_required(login_url="/accounts/form/?action=login")
def chat_history(request):
    """
    Fetch past messages for a given conversation/session.
    """
    session_id = request.GET.get('session_id')
    conversation = Conversation.objects.filter(session_id=session_id).first()
    
    if conversation:
        messages = conversation.messages.order_by('timestamp').values('sender', 'content')
        return JsonResponse({'messages': list(messages)})
    
    return JsonResponse({'messages': []})
