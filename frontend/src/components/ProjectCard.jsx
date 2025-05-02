//ProjectCard.jsx

import React, { useState } from "react";
import '../styles/client dashboard/projectCard.css';

const ProjectCard = ({ project, onApprove, onDeny, dispatch, projectsList }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAction = async (action) => {
        try {
            setIsProcessing(true);
            if (action === 'approve') {
                await onApprove(project.id);
                dispatch({
                    type: "SET_PROJECTS_LIST",
                    payload: projectsList.map(p =>
                        p.id === project.id ? {...p, projectStatus: "APPROVED"} : p
                    )
                });
            } else {
                await onDeny(project.id);
                dispatch({
                    type: "SET_PROJECTS_LIST",
                    payload: projectsList.map(p =>
                        p.id === project.id ? {...p, projectStatus: "DENIED"} : p
                    )
                });
            }
        } catch (error) {
            console.error(`Project ${action} failed:`, error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="project-card">
            <div className="project-info">
                <div className="project-header">
                    <h3>{project.title}</h3>
                    <span className={`status-badge ${project.projectStatus.toLowerCase()}`}>
                        {project.projectStatus}
                    </span>
                </div>
                
                <div className="project-details">
                    <p>
                        <span className="label">ID:</span> 
                        <span className="value">{project.id}</span>
                    </p>
                    <p>
                        <span className="label">Description:</span> 
                        <span className="value description">{project.description}</span>
                    </p>
                    <p>
                        <span className="label">Budget:</span>
                        <span className="value">${project.budget}</span>
                    </p>
                    <p>
                        <span className="label">Client:</span>
                        <span className="value">{project.client_username}</span>
                    </p>
                </div>
            </div>

            {project.projectStatus === "PENDING" && (
                <div className="project-actions">
                    <button 
                        className={`approve-button ${isProcessing ? 'loading' : ''}`}
                        onClick={() => handleAction('approve')}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : 'Approve'}
                    </button>
                    <button 
                        className={`deny-button ${isProcessing ? 'loading' : ''}`}
                        onClick={() => handleAction('deny')}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : 'Deny'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProjectCard;