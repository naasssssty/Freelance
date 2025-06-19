import React, { useState, useEffect } from 'react';
// eslint-disable-next-line
// Το useNavigate δεν χρησιμοποιείται, οπότε το σχολιάζουμε
// import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import logo from '../assets/logo.png';
import NotificationIcon from './NotificationIcon';
import NotificationPanel from './NotificationPanel';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../services/NotificationServices';
// eslint-disable-next-line
// Το Link δεν χρησιμοποιείται, οπότε το σχολιάζουμε ή το αφαιρούμε
// import { Link } from "react-router-dom";
import '../styles/header.css';

const Header = ({ menuOptions, searchComponent, onLogoClick, username }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Initial fetch
        fetchNotifications();
        fetchUnreadCount();
        
        // Set up polling only when notifications panel is closed
        let interval;
        if (!showNotifications) {
            interval = setInterval(() => {
                fetchNotifications();
                fetchUnreadCount();
            }, 10000); // Poll every 10 seconds when panel is closed
        }
        
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [showNotifications]); // Depend on showNotifications to control polling

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getNotifications();
            console.log('Notifications received:', data);
            
            // Ensure data is always an array
            if (Array.isArray(data)) {
                setNotifications(data);
            } else {
                console.warn('Notifications data is not an array:', data);
                setNotifications([]);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError('Failed to load notifications');
            setNotifications([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const count = await getUnreadCount();
            console.log('Unread count received:', count);
            
            // Ensure count is a number
            if (typeof count === 'number') {
                setUnreadCount(count);
            } else {
                console.warn('Unread count is not a number:', count);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
            setUnreadCount(0); // Set 0 on error
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const success = await markAsRead(notificationId);
            if (success) {
                // Update local state immediately for better UX
                setNotifications(prev => 
                    prev.map(notif => 
                        notif.id === notificationId 
                            ? { ...notif, read: true }
                            : notif
                    )
                );
                // Refresh unread count
                await fetchUnreadCount();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            setError('Failed to mark notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const success = await markAllAsRead();
            if (success) {
                // Update local state immediately for better UX
                setNotifications(prev => 
                    prev.map(notif => ({ ...notif, read: true }))
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            setError('Failed to mark all notifications as read');
        }
    };

    const handleNotificationToggle = () => {
        setShowNotifications(!showNotifications);
        // If opening notifications panel, refresh data
        if (!showNotifications) {
            fetchNotifications();
            fetchUnreadCount();
        }
    };

    const handleCloseNotifications = () => {
        setShowNotifications(false);
        // Refresh data when closing to get latest state
        fetchNotifications();
        fetchUnreadCount();
    };

    return (
        <header className="header">
            <div className="header_left">
                <div className="logo_container" onClick={onLogoClick}>
                    <img src={logo} alt="Logo" className="logo"/>
                </div>

                {searchComponent}
            </div>

            
            <div className="nav_container">
                <nav>
                    <ul>
                        {menuOptions.map((option, index) => (
                            <li key={index}>
                                <button className="nav_button"
                                    onClick={option.onClick}
                                >
                                    {option.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            <div className="profile_container">
                <NotificationIcon 
                    onClick={handleNotificationToggle}
                    unreadCount={unreadCount}
                />
                <div className="profile_icon">
                    <FaUserCircle className="icon" size={30}/>
                    <span className="profile_username">
                        {username || 'Guest'}
                    </span>
                </div>
            </div>

            {showNotifications && (
                <NotificationPanel
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onClose={handleCloseNotifications}
                    loading={loading}
                    error={error}
                />
            )}
        </header>
    );
};

export default Header;