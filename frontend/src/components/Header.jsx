import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

    useEffect(() => {
        fetchNotifications();
        // Set up polling for both notifications and unread count
        const interval = setInterval(() => {
            fetchNotifications();
            fetchUnreadCount();
        }, 5000); // Poll every 5 seconds
        
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
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
            // Refresh both notifications and unread count
            await fetchNotifications();
            await fetchUnreadCount();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            // Refresh both notifications and unread count
            await fetchNotifications();
            await fetchUnreadCount();
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