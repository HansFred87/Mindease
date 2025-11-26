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

    // Fixed function name to avoid collision with home page
    window.openClearChatModal = function() {
        createAndShowChatModal();
    };

    function createAndShowChatModal() {
        // Remove any existing modal
        const existingModal = document.getElementById('aiChatConfirmModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create minimal professional modal
        const modalHTML = `
            <div id="aiChatConfirmModal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                animation: modalFadeIn 0.2s ease-out;
            ">
                <div style="
                    background: white;
                    border-radius: 12px;
                    padding: 32px;
                    max-width: 420px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                    position: relative;
                    animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                ">
                    <div style="
                        width: 48px;
                        height: 48px;
                        background: #fee2e2;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 20px;
                    ">
                        <svg width="24" height="24" fill="#dc2626" viewBox="0 0 24 24">
                            <path d="M3 6h18l-1.5 12H4.5L3 6zM19 8H5l1.1 8h11.8L19 8zM8 2v2h8V2H8z"/>
                        </svg>
                    </div>
                    <h3 style="
                        margin: 0 0 12px 0;
                        color: #111827;
                        font-size: 20px;
                        font-weight: 600;
                    ">Clear Chat History</h3>
                    <p style="
                        margin: 0 0 28px 0;
                        color: #6b7280;
                        line-height: 1.5;
                        font-size: 15px;
                    ">
                        This will permanently delete your entire conversation history. This action cannot be undone.
                    </p>
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button id="aiChatCancelBtn" style="
                            padding: 10px 20px;
                            border: 1px solid #d1d5db;
                            background: white;
                            color: #374151;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            transition: all 0.2s ease;
                            min-width: 80px;
                        ">
                            Cancel
                        </button>
                        <button id="aiChatConfirmBtn" style="
                            padding: 10px 20px;
                            border: none;
                            background: #dc2626;
                            color: white;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            transition: all 0.2s ease;
                            min-width: 80px;
                        ">
                            Clear Chat
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add CSS animations only if they don't exist
        if (!document.querySelector('#aiChatModalStyles')) {
            const style = document.createElement('style');
            style.id = 'aiChatModalStyles';
            style.textContent = `
                @keyframes modalFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modalSlideUp {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px) scale(0.95); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                }
                @keyframes modalFadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners with hover effects
        const modal = document.getElementById('aiChatConfirmModal');
        const cancelBtn = document.getElementById('aiChatCancelBtn');
        const confirmBtn = document.getElementById('aiChatConfirmBtn');
        
        if (cancelBtn) {
            // Cancel button hover effects
            cancelBtn.addEventListener('mouseenter', function() {
                this.style.background = '#f3f4f6';
                this.style.borderColor = '#9ca3af';
            });
            cancelBtn.addEventListener('mouseleave', function() {
                this.style.background = 'white';
                this.style.borderColor = '#d1d5db';
            });
            cancelBtn.addEventListener('mousedown', function() {
                this.style.transform = 'scale(0.98)';
            });
            cancelBtn.addEventListener('mouseup', function() {
                this.style.transform = 'scale(1)';
            });
            cancelBtn.addEventListener('click', closeChatConfirmModal);
        }
        
        if (confirmBtn) {
            // Confirm button hover effects
            confirmBtn.addEventListener('mouseenter', function() {
                this.style.background = '#b91c1c';
            });
            confirmBtn.addEventListener('mouseleave', function() {
                this.style.background = '#dc2626';
            });
            confirmBtn.addEventListener('mousedown', function() {
                this.style.transform = 'scale(0.98)';
            });
            confirmBtn.addEventListener('mouseup', function() {
                this.style.transform = 'scale(1)';
            });
            confirmBtn.addEventListener('click', function() {
                closeChatConfirmModal();
                confirmClearChat();
            });
        }
        
        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeChatConfirmModal();
                }
            });
        }
        
        // Close with Escape key (but only for chat modal)
        const escapeHandler = function(e) {
            if (e.key === 'Escape' && document.getElementById('aiChatConfirmModal')) {
                closeChatConfirmModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    // Renamed to avoid collision
    function closeChatConfirmModal() {
        const modal = document.getElementById('aiChatConfirmModal');
        if (modal) {
            modal.style.animation = 'modalFadeOut 0.2s ease-in';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 200);
        }
    }

    // Keep this for backward compatibility but make it specific
    window.closeChatModal = function() {
        closeChatConfirmModal();
    };

    window.confirmClearChat = async function() {
        try {
            const response = await fetch('/ai-companion/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    clear_chat: true
                })
            });
            
            const data = await response.json();
            
            if (data.status === 'chat_cleared') {
                const messagesContainer = document.getElementById('chatMessages');
                if (messagesContainer) {
                    messagesContainer.innerHTML = `
                        <div class="welcome-message">
                            <div class="emoji">👋</div>
                            <h3>Welcome to MindEase AI Companion</h3>
                            <p>I'm here to help you navigate the platform, answer questions, and provide support 24/7. How can I assist you today?</p>
                        </div>
                    `;
                    addSystemMessage("Conversation cleared successfully!");
                }
            }
        } catch (error) {
            console.error('Error clearing chat:', error);
            addSystemMessage("Sorry, I couldn't clear the conversation. Please try again.");
        }
    };

    window.handleKeyPress = function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    window.sendQuickMessage = async function(message) {
        if (isTyping) return;
        
        const input = document.getElementById('chatInput');
        input.value = message;
        
        addMessage(message, 'user');
        input.value = '';
        
        showTypingIndicator();
        isTyping = true;
        
        const typingDelay = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, typingDelay));
        
        try {
            const response = await fetch('/ai-companion/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    message: message,
                    session_id: sessionId
                })
            });
            
            const data = await response.json();
            hideTypingIndicator();
            isTyping = false;
            
            if (data.reply) {
                addMessage(data.reply, 'ai');
                if (data.mood === 'crisis') {
                    highlightEmergencyResources();
                }
            }
        } catch (error) {
            console.error('Error sending quick message:', error);
            hideTypingIndicator();
            isTyping = false;
            addMessage('I apologize, but I encountered an error. Please try again or refresh the page if the issue persists.', 'ai');
        }
    };

    window.sendMessage = async function() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message || isTyping) return;
        
        if (message.length < 2 && !['ok', 'yes', 'no', 'hey', 'hi'].includes(message.toLowerCase())) {
            addSystemMessage("I noticed your message is very short. Would you like to share more?");
            return;
        }
        
        input.value = '';
        addMessage(message, 'user');
        showTypingIndicator();
        isTyping = true;
        
        try {
            const response = await fetch('/ai-companion/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    message: message,
                    session_id: sessionId
                })
            });
            
            const data = await response.json();
            hideTypingIndicator();
            isTyping = false;
            
            if (data.reply) {
                addMessage(data.reply, 'ai');
                if (data.mood === 'crisis') {
                    highlightEmergencyResources();
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            hideTypingIndicator();
            isTyping = false;
            addMessage('I apologize, but I encountered an error. Please try again or refresh the page if the issue persists.', 'ai');
        }
    };

    function addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const formattedContent = formatMessage(content);
        
        const timestamp = new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                ${formattedContent}
                <div class="message-time">${timestamp}</div>
            </div>
        `;
        
        const welcomeMsg = messagesContainer.querySelector('.welcome-message');
        if (welcomeMsg && sender === 'user') {
            welcomeMsg.remove();
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addSystemMessage(content) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        
        messageDiv.innerHTML = `
            <div class="system-message">
                <span class="system-icon">✓</span>
                <span>${content}</span>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Auto-remove system message after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.transition = 'opacity 0.5s ease-out';
                messageDiv.style.opacity = '0';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.remove();
                    }
                }, 500);
            }
        }, 3000);
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
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-indicator active">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function showNotificationDot() {
        const dot = document.querySelector('.notification-dot');
        if (dot && !chatOpen) {
            dot.style.display = 'block';
        }
    }

    function hideNotificationDot() {
        const dot = document.querySelector('.notification-dot');
        if (dot) {
            dot.style.display = 'none';
        }
    }

    function highlightEmergencyResources() {
        const lastMessage = document.querySelector('.message.ai:last-child .message-bubble');
        if (lastMessage) {
            lastMessage.classList.add('crisis');
            addSystemMessage("Urgent support resources highlighted above");
        }
    }

    async function loadChatHistory() {
        try {
            const response = await fetch(`/ai-companion/history/?session_id=${sessionId}`);
            const data = await response.json();
            
            if (data.messages && data.messages.length > 0) {
                const messagesContainer = document.getElementById('chatMessages');
                messagesContainer.innerHTML = '';
                
                data.messages.forEach(msg => {
                    addMessage(msg.content, msg.sender);
                });
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
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

    function initContextAwareness() {
        const currentPath = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        
        if (!localStorage.getItem('returning_visitor')) {
            setTimeout(() => {
                showNotificationDot();
                localStorage.setItem('returning_visitor', 'true');
            }, 3000);
        }
        
        if (urlParams.get('action') === 'register') {
            setTimeout(() => {
                if (!chatOpen) {
                    showNotificationDot();
                }
            }, 2000);
        } else if (urlParams.get('action') === 'login') {
            setTimeout(() => {
                if (!chatOpen) {
                    showNotificationDot();
                }
            }, 2000);
        }
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', initContextAwareness);
})();