import React from 'react';
import { FaBell } from 'react-icons/fa';
import '../styles/notifications/notificationIcon.css';

const NotificationIcon = ({ onClick, unreadCount }) => {
    return (
        <div className="notification-icon" onClick={onClick}>
            <FaBell size={24} />
            {unreadCount > 0 && (
                <span className="notification-badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </div>
    );
};

export default NotificationIcon; 