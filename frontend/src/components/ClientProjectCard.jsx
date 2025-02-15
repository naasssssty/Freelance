import React from "react";
import '../styles/client dashboard/clientProjectCard.css';
import { FaIdCard, FaDollarSign, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';

const ClientProjectCard = ({ project }) => {
    const getStatusColor = (status) => {
        switch(status) {
            case 'PENDING':
                return 'pending';
            case 'IN_PROGRESS':
                return 'in_progress';
            case 'COMPLETED':
                return 'completed';
            case 'EXPIRED':
                return 'expired';
            case 'APPROVED':
                return 'approved';
            case 'DENIED':
                return 'denied';
            default:
                return '';
        }
    };

    return (
        <div className="client-project-card">
            <div className="project-info">
                <div className="project-header">
                    <h3>{project.title}</h3>
                    <div className="header-badges">
                        <span className={`status-badge ${getStatusColor(project.projectStatus)}`}>
                            {project.projectStatus}
                        </span>
                    </div>
                </div>
                
                <div className="project-details">
                    <div className="meta-item description-item">
                        <span className="label">
                            <FaFileAlt className="field-icon" /> Description:
                        </span>
                        <p className="description">
                            {project.description}
                        </p>
                    </div>
                    
                    <div className="project-meta">
                        <div className="meta-item">
                            <span className="label">
                                <FaIdCard className="field-icon" /> Project ID:
                            </span>
                            <span className="value">{project.id}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">
                                <FaDollarSign className="field-icon" /> Budget:
                            </span>
                            <span className="value">${project.budget}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">
                                <FaCalendarAlt className="field-icon" /> Deadline:
                            </span>
                            <span className="value">
                                {new Date(project.deadline).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientProjectCard; 