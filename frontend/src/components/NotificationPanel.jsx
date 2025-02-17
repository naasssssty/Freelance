import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import '../styles/notifications/notificationPanel.css';

const NotificationPanel = ({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }) => {
    console.log('NotificationPanel received notifications:', notifications);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'APPLICATION_RECEIVED':
                return '📝';
            case 'APPLICATION_ACCEPTED':
                return '✅';
            case 'APPLICATION_REJECTED':
                return '❌';
            case 'PROJECT_COMPLETED':
                return '🎉';
            case 'NEW_MESSAGE':
                return '💬';
            case 'REPORT_STATUS_CHANGED':
                return '🔔';
            default:
                return '📌';
        }
    };

    if (!notifications) {
        return (
            <div className="notification-panel">
                <div className="notification-header">
                    <h3>Notifications</h3>
                    <button onClick={onClose}>Close</button>
                </div>
                <div className="notification-list">
                    <div className="no-notifications">Loading notifications...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="notification-panel">
            <div className="notification-header">
                <h3>Notifications</h3>
                <div className="notification-actions">
                    <button onClick={onMarkAllAsRead}>Mark all as read</button>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="no-notifications">
                        No notifications
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div 
                            key={notification.id} 
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                            onClick={() => onMarkAsRead(notification.id)}
                        >
                            <span className="notification-icon">
                                {getNotificationIcon(notification.type)}
                            </span>
                            <div className="notification-content">
                                <p className="notification-message">{notification.message}</p>
                                <span className="notification-time">
                                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationPanel; 