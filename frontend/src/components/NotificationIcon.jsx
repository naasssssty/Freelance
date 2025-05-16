import React from 'react';
import { FaBell } from 'react-icons/fa';
// eslint-disable-next-line
// Σχολιάζουμε ή αφαιρούμε το import για το CSS που δεν υπάρχει
// import '../styles/notificationIcon.css';

const NotificationIcon = ({ notifications }) => {
    // eslint-disable-next-line
    const getUnreadCount = () => {
        // Σχολιάζουμε αυτή τη συνάρτηση καθώς δεν χρησιμοποιείται
        // return notifications.filter(notification => !notification.read).length;
    };

    return (
        <div className="notification-icon">
            <FaBell size={24} />
        </div>
    );
};

export default NotificationIcon; 