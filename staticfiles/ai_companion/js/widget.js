(function() {
    let chatOpen = false;
    let sessionId = localStorage.getItem('ai_session_id') || generateSessionId();
    let isTyping = false;
    let isFullscreen = false;

    function generateSessionId() {
        const id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('ai_session_id', id);
        return id;
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    window.toggleAIChat = function() {
        const container = document.getElementById('aiChatContainer');
        chatOpen = !chatOpen;
        if (chatOpen) {
            container.classList.add('active');
            document.getElementById('chatInput').focus();
            loadChatHistory();
            hideNotificationDot();
        } else {
            container.classList.remove('active');
        }
    };

    // Toggle fullscreen
    window.toggleFullscreen = function() {
        const container = document.getElementById('aiChatContainer');
        isFullscreen = !isFullscreen;
        if (isFullscreen) {
            container.classList.add('fullscreen');
            document.querySelector('.fullscreen-btn').innerHTML = '↗';
            document.body.style.overflow = 'hidden';
        } else {
            container.classList.remove('fullscreen');
            document.querySelector('.fullscreen-btn').innerHTML = '⛶';
            document.body.style.overflow = '';
        }
    };

    function addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const timestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        messageDiv.innerHTML = `
            <div class="message-bubble">
                ${content}
                <div class="message-time">${timestamp}</div>
            </div>
        `;

        const welcomeMsg = messagesContainer.querySelector('.welcome-message');
        if (welcomeMsg && sender === 'user') welcomeMsg.remove();

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addSystemMessage(content) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.innerHTML = `<div class="system-message"><span class="system-icon">✓</span> <span>${content}</span></div>`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        setTimeout(() => messageDiv.remove(), 3000);
    }

    function showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `<div class="typing-indicator active"><span></span><span></span><span></span></div>`;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    // Load chat history
 async function loadChatHistory() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = ''; // clear existing

    try {
        const response = await fetch(`/ai-companion/history/?session_id=${sessionId}`);
        const data = await response.json();

        if (data.messages && data.messages.length > 0) {
            data.messages.forEach(msg => addMessage(msg.content, msg.sender));
        } else {
            // Show personalized welcome message
            const userName = window.AI_USER_NAME || 'there';
            const welcomeHTML = `
                <div class="welcome-message">
                    <div class="emoji">👋</div>
                    <h3>Hi ${userName}! Welcome to MindEase AI Companion</h3>
                    <p>I'm here to help you navigate the platform, answer questions, 
                    and provide support 24/7. How can I assist you today?</p>
                </div>
            `;
            messagesContainer.innerHTML = welcomeHTML;
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
        const userName = window.AI_USER_NAME || 'there';
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <div class="emoji">👋</div>
                <h3>Hi ${userName}! Welcome to MindEase AI Companion</h3>
                <p>I'm here to help you navigate the platform, answer questions, 
                and provide support 24/7. How can I assist you today?</p>
            </div>
        `;
    }
}


    async function sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message || isTyping) return;

        input.value = '';
        addMessage(message, 'user');
        showTypingIndicator();
        isTyping = true;

        try {
            const response = await fetch('/ai-companion/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
                body: JSON.stringify({ message: message, session_id: sessionId })
            });
            const data = await response.json();
            hideTypingIndicator();
            isTyping = false;

            if (data.reply) addMessage(data.reply, 'ai');
        } catch (error) {
            console.error('Error sending message:', error);
            hideTypingIndicator();
            isTyping = false;
            addMessage('I apologize, but I encountered an error. Please try again or refresh the page if the issue persists.', 'ai');
        }
    }

    window.sendQuickMessage = async function(message) {
        document.getElementById('chatInput').value = message;
        await sendMessage();
    };

    window.handleKeyPress = function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        loadChatHistory();
    });

})();
