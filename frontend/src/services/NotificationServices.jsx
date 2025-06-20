import axios from 'axios';

export const getNotifications = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        console.log('Fetching notifications...');
        
        const response = await axios.get('/notifications', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Notifications response status:', response.status);
        console.log('Notifications response data:', response.data);
        
        // Ensure we return an array
        if (Array.isArray(response.data)) {
            return response.data;
        } else {
            console.warn('API returned non-array data:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });
        
        // Return empty array instead of throwing to prevent UI breaks
        return [];
    }
};

export const getUnreadCount = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        console.log('Fetching unread count...');
        
        const response = await axios.get('/notifications/unread-count', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Unread count response:', response.data);
        
        // Ensure we return a number
        const count = response.data;
        return typeof count === 'number' ? count : 0;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        
        // Return 0 instead of throwing to prevent UI breaks
        return 0;
    }
};

export const markAsRead = async (notificationId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        console.log('Marking notification as read:', notificationId);
        
        await axios.put(`/notifications/${notificationId}/read`, null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Successfully marked notification as read');
        return true;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

export const markAllAsRead = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        console.log('Marking all notifications as read...');
        
        await axios.put('/notifications/mark-all-read', null, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Successfully marked all notifications as read');
        return true;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
}; 