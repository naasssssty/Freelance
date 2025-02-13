import axios from 'axios';
import { getTokenAndDecode } from '../utils/auth';

export const sendMessage = async (projectId, content) => {
    try {
        const { token } = getTokenAndDecode();
        const response = await axios.post(
            `http://localhost:8080/chat/${projectId}/send`,
            { content },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

export const getMessages = async (projectId) => {
    try {
        const { token } = getTokenAndDecode();
        const response = await axios.get(
            `http://localhost:8080/chat/${projectId}/messages`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
}; 