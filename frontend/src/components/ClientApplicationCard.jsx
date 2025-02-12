import React, { useState } from 'react';
import '../styles/client dashboard/clientApplicationCard.css';
import Chat from "./Chat";

const ClientApplicationCard = ({ application, onAccept, onReject }) => {
    const getStatusColor = (status) => {
        switch(status) {
            case 'WAITING':
                return 'waiting';
            case 'ACCEPTED':
                return 'accepted';
            case 'REJECTED':
                return 'rejected';
            default:
                return '';
        }
    };

    const [showChat, setShowChat] = useState(false);

    return (
        <div className="client-application-card">
            <div className="application-info">
                <div className="application-header">
                    <h3>{application.projectTitle}</h3>
                    <span className={`status-badge ${getStatusColor(application.applicationStatus)}`}>
                        {application.applicationStatus}
                    </span>
                </div>

                <div className="application-details">
                    <div className="cover-letter">
                        <span className="label">Cover Letter:</span>
                        <p className="value letter-text">
                            {application.cover_letter}
                        </p>
                    </div>

                    <div className="application-meta">
                        <div className="meta-item">
                            <span className="label">Application ID:</span>
                            <span className="value">{application.id}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Freelancer:</span>
                            <span className="value">{application.freelancer}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Submitted on:</span>
                            <span className="value">
                                {new Date(application.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {application.applicationStatus === 'WAITING' && (
                    <div className="application-actions">
                        <button
                            className="accept-button"
                            onClick={() => onAccept(application.id)}
                        >
                            Accept
                        </button>
                        <button
                            className="reject-button"
                            onClick={() => onReject(application.id)}
                        >
                            Reject
                        </button>
                    </div>
                )}

                {application.projectStatus === 'IN_PROGRESS' && (
                    <div className="application-actions">
                        <button
                            className="chat-button"
                            onClick={() => setShowChat(true)}
                        >
                            Open Chat
                        </button>
                    </div>
                )}

                {showChat && (
                    <Chat
                        projectId={application.projectId}
                        onClose={() => setShowChat(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default ClientApplicationCard;