/**
 * Cybersecurity Chatbot Widget
 * Embeddable chatbot widget for explaining cybersecurity terminology
 */

(function() {
    'use strict';

    // Configuration - update this URL when deploying
    const API_BASE_URL = window.CHATBOT_API_URL || 'http://localhost:8080';

    // Widget state
    let isOpen = false;
    let isLoading = false;

    // Create widget HTML structure
    function createWidget() {
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'cyber-chatbot-widget';
        widgetContainer.innerHTML = `
            <style>
                #cyber-chatbot-widget {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 9999;
                }

                #cyber-chatbot-button {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                #cyber-chatbot-button:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
                }

                #cyber-chatbot-button svg {
                    width: 28px;
                    height: 28px;
                    fill: white;
                }

                #cyber-chatbot-window {
                    position: fixed;
                    bottom: 90px;
                    right: 20px;
                    width: 380px;
                    height: 500px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    animation: slideUp 0.3s ease-out;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                #cyber-chatbot-window.open {
                    display: flex;
                }

                .chatbot-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .chatbot-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                }

                .chatbot-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .chatbot-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    background: #f9fafb;
                }

                .chatbot-message {
                    margin-bottom: 12px;
                    display: flex;
                    flex-direction: column;
                }

                .chatbot-message.user {
                    align-items: flex-end;
                }

                .chatbot-message.bot {
                    align-items: flex-start;
                }

                .message-bubble {
                    max-width: 80%;
                    padding: 10px 14px;
                    border-radius: 12px;
                    word-wrap: break-word;
                    line-height: 1.4;
                    font-size: 14px;
                }

                .chatbot-message.user .message-bubble {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .chatbot-message.bot .message-bubble {
                    background: white;
                    color: #1f2937;
                    border-bottom-left-radius: 4px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                }

                .chatbot-input-area {
                    padding: 16px;
                    background: white;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    gap: 8px;
                }

                .chatbot-input {
                    flex: 1;
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .chatbot-input:focus {
                    border-color: #667eea;
                }

                .chatbot-send-btn {
                    padding: 10px 16px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: opacity 0.2s;
                }

                .chatbot-send-btn:hover {
                    opacity: 0.9;
                }

                .chatbot-send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .typing-indicator {
                    display: flex;
                    gap: 4px;
                    padding: 10px 14px;
                }

                .typing-indicator span {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #9ca3af;
                    animation: typing 1.4s infinite;
                }

                .typing-indicator span:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-indicator span:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes typing {
                    0%, 60%, 100% {
                        opacity: 0.3;
                        transform: translateY(0);
                    }
                    30% {
                        opacity: 1;
                        transform: translateY(-4px);
                    }
                }

                .welcome-message {
                    text-align: center;
                    padding: 20px;
                    color: #6b7280;
                    font-size: 14px;
                }

                @media (max-width: 480px) {
                    #cyber-chatbot-window {
                        width: calc(100vw - 40px);
                        height: calc(100vh - 110px);
                        right: 20px;
                        bottom: 90px;
                    }
                }
            </style>

            <button id="cyber-chatbot-button" aria-label="Open chatbot">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.68-.31-3.85-.87l-.28-.14-2.85.48.48-2.85-.14-.28A7.93 7.93 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm-1-11h2v2h-2zm0 4h2v6h-2z"/>
                </svg>
            </button>

            <div id="cyber-chatbot-window">
                <div class="chatbot-header">
                    <h3>🔒 Cybersecurity Assistant</h3>
                    <button class="chatbot-close" aria-label="Close chatbot">&times;</button>
                </div>
                <div class="chatbot-messages" id="chatbot-messages">
                    <div class="welcome-message">
                        👋 Hello! I'm here to help you understand cybersecurity concepts and terminology. Ask me anything!
                    </div>
                </div>
                <div class="chatbot-input-area">
                    <input 
                        type="text" 
                        class="chatbot-input" 
                        id="chatbot-input" 
                        placeholder="Ask about cybersecurity..."
                        aria-label="Chat message"
                    />
                    <button class="chatbot-send-btn" id="chatbot-send-btn">Send</button>
                </div>
            </div>
        `;

        document.body.appendChild(widgetContainer);
        attachEventListeners();
    }

    // Attach event listeners
    function attachEventListeners() {
        const button = document.getElementById('cyber-chatbot-button');
        const closeBtn = document.querySelector('.chatbot-close');
        const sendBtn = document.getElementById('chatbot-send-btn');
        const input = document.getElementById('chatbot-input');

        button.addEventListener('click', toggleWidget);
        closeBtn.addEventListener('click', toggleWidget);
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !isLoading) {
                sendMessage();
            }
        });
    }

    // Toggle widget open/close
    function toggleWidget() {
        isOpen = !isOpen;
        const window = document.getElementById('cyber-chatbot-window');
        if (isOpen) {
            window.classList.add('open');
            document.getElementById('chatbot-input').focus();
        } else {
            window.classList.remove('open');
        }
    }

    // Send message to API
    async function sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();

        if (!message || isLoading) return;

        // Add user message to chat
        addMessage(message, 'user');
        input.value = '';

        // Show loading indicator
        isLoading = true;
        updateSendButton();
        showTypingIndicator();

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            const data = await response.json();

            if (response.ok) {
                addMessage(data.response, 'bot');
            } else {
                addMessage('Sorry, I encountered an error. Please try again.', 'bot');
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            addMessage('Sorry, I\'m having trouble connecting. Please check if the chatbot service is running.', 'bot');
        } finally {
            isLoading = false;
            updateSendButton();
            removeTypingIndicator();
        }
    }

    // Add message to chat
    function addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;
        
        messageDiv.appendChild(bubble);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Show typing indicator
    function showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const indicator = document.createElement('div');
        indicator.className = 'chatbot-message bot';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="message-bubble typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Update send button state
    function updateSendButton() {
        const sendBtn = document.getElementById('chatbot-send-btn');
        sendBtn.disabled = isLoading;
        sendBtn.textContent = isLoading ? 'Sending...' : 'Send';
    }

    // Initialize widget when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
    } else {
        createWidget();
    }
})();

