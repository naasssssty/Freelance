import React from "react";
import '../styles/freelancer dashboard/searchedProjectCard.css';

const SearchedProjectCard = ({ project }) => {
    const getStatusColor = (status) => {
        switch(status) {
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
        <div className="searched-project-card">
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
                            <span className="label">Client:</span>
                            <span className="value">{project.client_username}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Deadline:</span>
                            <span className="value">
                                {new Date(project.deadline).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Posted:</span>
                            <span className="value">
                                {new Date(project.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchedProjectCard; 