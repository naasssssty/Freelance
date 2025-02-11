import React from "react";
import '../styles/client dashboard/clientProjectCard.css';

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
                        <span className="budget-badge">
                            ${project.budget}
                        </span>
                        <span className={`status-badge ${getStatusColor(project.projectStatus)}`}>
                            {project.projectStatus}
                        </span>
                    </div>
                </div>
                
                <div className="project-details">
                    <p className="description">
                        {project.description}
                    </p>
                    
                    <div className="project-meta">
                        <div className="meta-item">
                            <span className="label">Project ID:</span>
                            <span className="value">{project.id}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Posted on:</span>
                            <span className="value">
                                {new Date(project.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Deadline:</span>
                            <span className="value">
                                {new Date(project.deadline).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {project.projectStatus === 'PENDING' && (
                        <div className="applications-count">
                            <span className="label">Applications:</span>
                            <span className="value">{project.applications_count || 0}</span>
                        </div>
                    )}
                </div>

                <div className="project-actions">
                    {project.projectStatus === 'PENDING' && (
                        <button 
                            className="view-applications-button"
                            onClick={() => {/* Handle view applications */}}
                        >
                            View Applications
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientProjectCard; 