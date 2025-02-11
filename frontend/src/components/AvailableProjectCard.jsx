import React, { useState } from "react";
import '../styles/freelancer dashboard/availableProjectCard.css';
import { applyForProject } from "../services/FreelancerServices";

const AvailableProjectCard = ({ project }) => {
    const [isApplying, setIsApplying] = useState(false);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');

    const handleApply = async () => {
        try {
            setIsApplying(true);
            await applyForProject(project.id, coverLetter);
            setShowApplyForm(false);
            setCoverLetter('');
            alert('Application submitted successfully!');
        } catch (error) {
            alert(error.message || 'Failed to submit application');
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="available-project-card">
            <div className="project-info">
                <div className="project-header">
                    <h3>{project.title}</h3>
                    <span className="budget-badge">
                        ${project.budget}
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
                            <span className="label">Deadline:</span>
                            <span className="value">{new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Posted:</span>
                            <span className="value">{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="project-actions">
                {!showApplyForm ? (
                    <button 
                        className="apply-button"
                        onClick={() => setShowApplyForm(true)}
                    >
                        Apply Now
                    </button>
                ) : (
                    <div className="apply-form">
                        <textarea
                            placeholder="Write your cover letter here..."
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            disabled={isApplying}
                        />
                        <div className="form-actions">
                            <button 
                                className={`submit-button ${isApplying ? 'loading' : ''}`}
                                onClick={handleApply}
                                disabled={isApplying || !coverLetter.trim()}
                            >
                                {isApplying ? 'Submitting...' : 'Submit Application'}
                            </button>
                            <button 
                                className="cancel-button"
                                onClick={() => {
                                    setShowApplyForm(false);
                                    setCoverLetter('');
                                }}
                                disabled={isApplying}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvailableProjectCard; 