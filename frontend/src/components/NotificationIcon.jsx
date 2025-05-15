import React from 'react';
import { FaBell } from 'react-icons/fa';
// Σχολιάζουμε το import μέχρι να βρεθεί το σωστό αρχείο
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