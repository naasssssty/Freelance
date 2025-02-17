import { FaUserCircle } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import logo from '../assets/logo.png';
import NotificationIcon from './NotificationIcon';
import NotificationPanel from './NotificationPanel';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../services/NotificationServices';
import { Link } from "react-router-dom";

const Header = ({ menuOptions, searchComponent, onLogoClick, username }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            console.log('Fetched notifications:', data);
            setNotifications(data);
            await fetchUnreadCount();
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const count = await getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markAsRead(notificationId);
            await fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            await fetchNotifications();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
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
                    onClick={() => setShowNotifications(!showNotifications)}
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
                    onClose={() => setShowNotifications(false)}
                />
            )}
        </header>
    );
};

export default Header;