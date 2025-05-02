import axios from 'axios';

export const getNotifications = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/notifications', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

export const getUnreadCount = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/notifications/unread-count', {
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
        await axios.put(`/api/notifications/${notificationId}/read`, null, {
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
        await axios.put('/api/notifications/mark-all-read', null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
}; 