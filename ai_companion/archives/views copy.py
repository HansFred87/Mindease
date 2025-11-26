from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db import transaction, IntegrityError
import json

from .models import Conversation, Message
from .services_local_llm import build_message_history, call_local_llm, create_simple_fallback
#from .services import build_message_history, create_simple_fallback, call_deepseek_api
#from .services import call_gpt_api

@login_required
def ai_companion(request):
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

        # Get or create conversation safely
        try:
            with transaction.atomic():
                conversation = Conversation.objects.filter(session_id=session_id).first()
                if not conversation:
                    conversation = Conversation.objects.create(
                        session_id=session_id,
                        user=request.user,
                        is_active=True
                    )
                else:
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

        # Build message history
        history = build_message_history(conversation)
        try:
            ai_response = call_local_llm(history)
        except Exception as e:
            print("LLM Error:", e)
            ai_response = create_simple_fallback(user_input)

        # Call GPT
        #ai_response = call_gemini_api(history)
        #ai_response = call_gpt_api(history)
        #ai_response = call_deepseek_api(history)

        # Fallback
        if not ai_response:
            ai_response = create_simple_fallback(user_input)

        # Save AI response
        Message.objects.create(
            conversation=conversation,
            sender="ai",
            content=ai_response
        )

        return JsonResponse({"response": ai_response})

    else:
        return render(request, "ai_companion/chat.html")


@login_required(login_url="/accounts/form/?action=login")
def chat_history(request):
    session_id = request.GET.get('session_id')
    conversation = Conversation.objects.filter(session_id=session_id).first()
    if conversation:
        messages = conversation.messages.order_by('timestamp').values('sender', 'content')
        return JsonResponse({'messages': list(messages)})
    return JsonResponse({'messages': []})
