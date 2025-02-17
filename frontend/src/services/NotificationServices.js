import axios from 'axios';

const API_URL = 'http://localhost:8080/api/notifications';

export const getNotifications = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

export const getUnreadCount = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/unread-count`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        throw error;
    }
};

export const markAsRead = async (notificationId) => {
    try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/${notificationId}/read`, null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

export const markAllAsRead = async () => {
    try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/mark-all-read`, null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
}; 