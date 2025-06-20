import React from 'react';
import { FaEnvelope, FaCheck, FaBell, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import '../styles/notifications/notificationPanel.css';

const NotificationPanel = ({ notifications, onMarkAsRead, onMarkAllAsRead, onClose, loading, error }) => {

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'APPLICATION_RECEIVED':
                return <FaEnvelope />;
            case 'APPLICATION_ACCEPTED':
                return <FaCheck />;
            case 'APPLICATION_REJECTED':
                return <FaExclamationTriangle />;
            case 'PROJECT_COMPLETED':
                return <FaCheck />;
            case 'NEW_MESSAGE':
                return <FaEnvelope />;
            case 'REPORT_STATUS_CHANGED':
                return <FaBell />;
            default:
                return <FaBell />;
        }
    };

    const handleMarkAsRead = async (notificationId, event) => {
        event.stopPropagation();
        try {
            await onMarkAsRead(notificationId);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async (event) => {
        event.stopPropagation();
        try {
            await onMarkAllAsRead();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const handleClose = (event) => {
        event.stopPropagation();
        onClose();
    };

    // Ensure notifications is always an array
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    const hasUnreadNotifications = safeNotifications.some(notif => !notif.read);

    return (
        <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
            <div className="notification-header">
                <h3>Notifications</h3>
                <div className="notification-actions">
                    {hasUnreadNotifications && !loading && (
                        <button onClick={handleMarkAllAsRead} title="Mark all as read">
                            Mark all read
                        </button>
                    )}
                    <button onClick={handleClose} className="close-btn" title="Close">
                        <FaTimes />
                    </button>
                </div>
            </div>

                {loading && (
                <div className="notification-loading">
                    <p>Loading notifications...</p>
                </div>
                )}
                
                {error && (
                <div className="notification-error">
                    <p>Failed to load notifications. Please try again.</p>
                    </div>
                )}
                
            {!loading && !error && (
                <div className="notification-list">
                    {safeNotifications.length === 0 ? (
                    <div className="no-notifications">
                            <FaBell />
                            <p>No notifications yet</p>
                    </div>
                    ) : (
                        safeNotifications.map((notification) => (
                        <div 
                            key={notification.id} 
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                        >
                                <div className="notification-icon">
                                {getNotificationIcon(notification.type)}
                                </div>
                            <div className="notification-content">
                                <p className="notification-message">{notification.message}</p>
                                    <span className="notification-time">{notification.timestamp}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            )}
        </div>
    );
};

export default NotificationPanel; 