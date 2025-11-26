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

    // Toggle chat open/close
    window.toggleAIChat = function() {
        const container = document.getElementById('aiChatContainer');
        chatOpen = !chatOpen;
        
        if (chatOpen) {
            container.classList.add('active');

            const checkMessagesExist = setInterval(() => {
                const messagesContainer = document.getElementById('chatMessages');
                if (messagesContainer) {
                    clearInterval(checkMessagesExist);
                    document.getElementById('chatInput').focus();
                    loadChatHistory().then(() => {
                        insertWelcomeMessage();
                    });
                    hideNotificationDot();
                }
            }, 50);
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

    // Clear chat modal
    window.openClearChatModal = function() {
        createAndShowChatModal();
    };

    function createAndShowChatModal() {
        const existingModal = document.getElementById('aiChatConfirmModal');
        if (existingModal) existingModal.remove();

        const modalHTML = `
            <div id="aiChatConfirmModal" style="position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:999999;">
                <div style="background:white; border-radius:12px; padding:32px; max-width:420px; width:90%; text-align:center;">
                    <div style="width:48px; height:48px; background:#fee2e2; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px;">
                        <svg width="24" height="24" fill="#dc2626" viewBox="0 0 24 24">
                            <path d="M3 6h18l-1.5 12H4.5L3 6zM19 8H5l1.1 8h11.8L19 8zM8 2v2h8V2H8z"/>
                        </svg>
                    </div>
                    <h3 style="margin:0 0 12px 0; color:#111827; font-size:20px; font-weight:600;">Clear Chat History</h3>
                    <p style="margin:0 0 28px 0; color:#6b7280; font-size:15px;">This will permanently delete your entire conversation history. This action cannot be undone.</p>
                    <div style="display:flex; gap:12px; justify-content:center;">
                        <button id="aiChatCancelBtn" style="padding:10px 20px; border:1px solid #d1d5db; background:white; color:#374151; border-radius:8px; cursor:pointer;">Cancel</button>
                        <button id="aiChatConfirmBtn" style="padding:10px 20px; border:none; background:#dc2626; color:white; border-radius:8px; cursor:pointer;">Clear Chat</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('aiChatCancelBtn').onclick = closeChatConfirmModal;
        document.getElementById('aiChatConfirmBtn').onclick = function() {
            closeChatConfirmModal();
            confirmClearChat();
        };
        document.getElementById('aiChatConfirmModal').onclick = function(e) {
            if (e.target.id === 'aiChatConfirmModal') closeChatConfirmModal();
        };
    }

    function closeChatConfirmModal() {
        const modal = document.getElementById('aiChatConfirmModal');
        if (modal) modal.remove();
    }

    // Insert welcome message
    function insertWelcomeMessage() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        if (messagesContainer.children.length === 0) {
            const userName = window.AI_USER_NAME || 'there';
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            welcomeDiv.innerHTML = `
                <div class="ai-avatar">🧠</div>
                <div class="message-content">
                    <strong>👋 Hi ${userName}!</strong><br>
                    Welcome to MindEase AI Companion. I'm here to help you navigate the platform, answer questions, and provide support 24/7. How can I assist you today?
                </div>
            `;
            messagesContainer.appendChild(welcomeDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Load chat history
    async function loadChatHistory() {
        try {
            const response = await fetch(`/ai-companion/history/?session_id=${sessionId}`);
            const data = await response.json();
            if (data.messages && data.messages.length > 0) {
                const messagesContainer = document.getElementById('chatMessages');
                messagesContainer.innerHTML = '';
                data.messages.forEach(msg => addMessage(msg.content, msg.sender));
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    // Send regular message
    window.sendMessage = async function() {
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
                headers: {'Content-Type': 'application/json','X-CSRFToken': getCookie('csrftoken')},
                body: JSON.stringify({message, session_id: sessionId})
            });
            const data = await response.json();
            hideTypingIndicator();
            isTyping = false;

            if (data.response) addMessage(data.response, 'ai');
        } catch (error) {
            hideTypingIndicator();
            isTyping = false;
            addMessage('Error sending message. Please try again.', 'ai');
        }
    };

    // Send quick message
    window.sendQuickMessage = async function(message) {
        if (isTyping) return;
        const input = document.getElementById('chatInput');
        if (input) input.value = message;

        addMessage(message, 'user');
        if (input) input.value = '';

        showTypingIndicator();
        isTyping = true;

        try {
            const response = await fetch('/ai-companion/chat/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json','X-CSRFToken': getCookie('csrftoken')},
                body: JSON.stringify({message, session_id: sessionId})
            });
            const data = await response.json();
            hideTypingIndicator();
            isTyping = false;

            if (data.response) addMessage(data.response, 'ai');
        } catch (error) {
            hideTypingIndicator();
            isTyping = false;
            addMessage('Error sending quick message. Please try again.', 'ai');
        }
    };

    function addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const welcomeMsg = messagesContainer.querySelector('.welcome-message');
        if (welcomeMsg && sender === 'user') welcomeMsg.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        const timestamp = new Date().toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', hour12:true });
        messageDiv.innerHTML = `
            <div class="message-bubble">
                ${formatMessage(content)}
                <div class="message-time">${timestamp}</div>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function formatMessage(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/• /g, '<br>• ')
            .replace(/^\d+\.\s+/gm, '<br>$&')
            .replace(/\n/g, '<br>');
    }

    function showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

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

    function hideNotificationDot() {
        const dot = document.querySelector('.notification-dot');
        if (dot) dot.style.display = 'none';
    }

    async function confirmClearChat() {
        try {
            const response = await fetch('/ai-companion/chat/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json','X-CSRFToken': getCookie('csrftoken')},
                body: JSON.stringify({session_id: sessionId, clear_chat: true})
            });
            const data = await response.json();
            if (data.status === 'chat_cleared') {
                const messagesContainer = document.getElementById('chatMessages');
                messagesContainer.innerHTML = '';
                insertWelcomeMessage();
            }
        } catch (error) {
            console.error('Error clearing chat:', error);
        }
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                cookie = cookie.trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.slice(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    document.addEventListener('DOMContentLoaded', () => {
        insertWelcomeMessage();
    });

})();
