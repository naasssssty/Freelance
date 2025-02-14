import React from "react";
import '../styles/freelancer dashboard/applicationCard.css';
import { FaUser, FaCalendarAlt, FaIdCard, FaFileAlt } from 'react-icons/fa';

const ApplicationCard = ({ application }) => {
    const getStatusColor = (status) => {
        switch(status) {
            case 'PENDING':
                return 'pending';
            case 'APPROVED':
                return 'approved';
            case 'REJECTED':
                return 'rejected';
            default:
                return '';
        }
    };

    return (
        <div className="application-card">
            <div className="application-info">
                <div className="application-header">
                    <h3>{application.projectTitle}</h3>
                    <div className="application-status">
                        <span className={`status-${application.applicationStatus.toLowerCase()}`}>
                            {application.applicationStatus}
                        </span>
                    </div>
                </div>
                
                <div className="application-details">
                    <div className="cover-letter">
                        <span className="label"><FaFileAlt className="field-icon" /> Cover Letter:</span>
                        <p className="value letter-text">
                            {application.cover_letter}
                        </p>
                    </div>
                    
                    <div className="application-meta">
                        <div className="meta-item">
                            <span className="label"><FaIdCard className="field-icon" /> Application ID:</span>
                            <span className="value">{application.id}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label"><FaUser className="field-icon" /> Submitted By:</span>
                            <span className="value">{application.freelancer}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label"><FaCalendarAlt className="field-icon" /> Submitted on:</span>
                            <span className="value">
                                {new Date(application.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationCard; 