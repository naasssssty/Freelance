import React, { useState } from "react";
import '../styles/freelancer dashboard/freelancerProjectCard.css';
import { handleCompleteProject } from "../services/FreelancerServices";
import Chat from "./Chat";

const FreelancerProjectCard = ({ project }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const [showChat, setShowChat] = useState(false);

    const handleComplete = async () => {
        try {
            setIsProcessing(true);
            await handleCompleteProject(project.id);
            alert('Project marked as complete!');
        } catch (error) {
            alert(error.message || 'Failed to complete project');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="my-project-card">
            <div className="project-info">
                <div className="project-header">
                    <h3>{project.title}</h3>
                    <span className={`status-badge ${project.projectStatus.toLowerCase()}`}>
                        {project.projectStatus}
                    </span>
                </div>

                <div className="project-details">
                    <p className="description">
                        {project.description}
                    </p>

                    <div className="project-meta">
                        <div className="meta-item">
                            <span className="label">Client:</span>
                            <span className="value">{project.client_username}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Budget:</span>
                            <span className="value">${project.budget}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Deadline:</span>
                            <span className={`value ${isDeadlineNear(project.deadline) ? 'deadline-near' : ''}`}>
                                {new Date(project.deadline).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Started:</span>
                            <span className="value">
                                {new Date(project.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {(project.projectStatus === "IN_PROGRESS" || project.projectStatus === "EXPIRED") && (
                <div className="project-actions">
                    <button
                        className="chat-button"
                        onClick={() => {/* Handle chat open */
                        }}>
                        Open Chat
                    </button>
                    <button
                        className={`complete-button ${isProcessing ? 'loading' : ''}`}
                        onClick={handleComplete}
                        disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Mark as Complete'}
                    </button>
                </div>
            )}

            {showChat && (
                <Chat
                    projectId={project.id}
                    onClose={() => setShowChat(false)}
                />
            )}

        </div>
    );
};

// Helper function to check if deadline is within 3 days
const isDeadlineNear = (deadline) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
};

export default FreelancerProjectCard;