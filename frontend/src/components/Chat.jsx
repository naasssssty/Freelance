import React, { useState, useEffect, useRef } from 'react';
import '../styles/Chat.css';
import { sendMessage, getMessages } from '../services/ChatServices';
import { getTokenAndDecode } from '../utils/auth';

const Chat = ({ projectId, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const { username } = getTokenAndDecode();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const fetchedMessages = await getMessages(projectId);
                setMessages(fetchedMessages);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [projectId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        try {
            setIsSending(true);
            await sendMessage(projectId, newMessage.trim());
            setNewMessage('');
            // Άμεση ενημέρωση του UI
            const newMsg = {
                id: Date.now(),
                content: newMessage.trim(),
                sender: username,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, newMsg]);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h3>Chat</h3>
                <button className="close-button" onClick={onClose}>×</button>
            </div>
            
            <div className="messages-container">
                {messages.map((message, index) => (
                    <div 
                        key={message.id || index} 
                        className={`message ${message.sender === username ? 'sent' : 'received'}`}
                    >
                        <div className="message-content">
                            <div className="message-sender">{message.sender}</div>
                            <div className="message-text">{message.content}</div>
                            <div className="message-time">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="message-input-container">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="message-input"
                    disabled={isSending}
                />
                <button 
                    type="submit" 
                    className="send-button"
                    disabled={!newMessage.trim() || isSending}
                >
                    {isSending ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default Chat; 