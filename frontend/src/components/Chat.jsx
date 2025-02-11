import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/Chat.css';

const Chat = ({ projectId, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const token = localStorage.getItem('token');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        loadMessages();
        // Set up polling for new messages every 3 seconds
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
    }, [projectId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/chat/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await axios.post(
                `http://localhost:8080/chat/project/${projectId}/message`,
                newMessage,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'text/plain'
                    }
                }
            );
            setNewMessage('');
            loadMessages();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h3>Chat</h3>
                <button className="close-button" onClick={onClose}>×</button>
            </div>
            
            <div className="messages-container">
                {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            
            <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

const ChatMessage = ({ message }) => {
    const currentUser = localStorage.getItem('username');
    const isOwnMessage = message.senderUsername === currentUser;

    return (
        <div className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
            <div className="message-content">
                <div className="message-sender">{message.senderUsername}</div>
                <div className="message-text">{message.content}</div>
                <div className="message-timestamp">{message.timestamp}</div>
            </div>
        </div>
    );
};

export default Chat; 