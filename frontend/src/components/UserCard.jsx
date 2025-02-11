import React from "react";
import '../styles/admin dashboard/userCard.css';

const UserCard = ({ user }) => {
    const getRoleColor = (role) => {
        switch(role) {
            case 'ADMIN':
                return 'admin';
            case 'CLIENT':
                return 'client';
            case 'FREELANCER':
                return 'freelancer';
            default:
                return '';
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'ACTIVE':
                return 'active';
            case 'INACTIVE':
                return 'inactive';
            case 'BANNED':
                return 'banned';
            default:
                return '';
        }
    };

    return (
        <div className="user-card">
            <div className="user-info">
                <div className="user-header">
                    <div className="user-main-info">
                        <h3>{user.username}</h3>
                        <div className="user-badges">
                            <span className={`role-badge ${getRoleColor(user.role)}`}>
                                {user.role}
                            </span>
                            <span className={`status-badge ${getStatusColor(user.status)}`}>
                                {user.status}
                            </span>
                        </div>
                    </div>
                    <div className="user-id">
                        <span className="label">ID:</span>
                        <span className="value">{user.id}</span>
                    </div>
                </div>
                
                <div className="user-details">
                    <div className="contact-info">
                        <div className="info-item">
                            <span className="label">Email:</span>
                            <span className="value">{user.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Phone:</span>
                            <span className="value">{user.phone || 'Not provided'}</span>
                        </div>
                    </div>
                    
                    <div className="user-meta">
                        <div className="meta-item">
                            <span className="label">First Name:</span>
                            <span className="value">{user.firstName || 'Not provided'}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Last Name:</span>
                            <span className="value">{user.lastName || 'Not provided'}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Joined:</span>
                            <span className="value">
                                {new Date(user.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Last Updated:</span>
                            <span className="value">
                                {new Date(user.updated_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCard;
