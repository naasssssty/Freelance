import React, { useState } from "react";
import ReactDOM from 'react-dom';
import '../styles/freelancer dashboard/freelancerProjectCard.css';
import { handleCompleteProject, createReport } from "../services/FreelancerServices";
import Chat from "./Chat";
import { FaUser, FaDollarSign, FaCalendarAlt,FaFileAlt } from 'react-icons/fa';

const FreelancerProjectCard = ({ project, onComplete }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportDescription, setReportDescription] = useState('');

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

    const renderChat = () => {
        if (!showChat || !project.id) return null;

        return ReactDOM.createPortal(
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999,
                width: '300px',
                height: '400px'
            }}>
                <Chat 
                    key={project.id}
                    projectId={Number(project.id)}
                    onClose={() => setShowChat(false)}
                />
            </div>,
            document.body
        );
    };

    const renderReportForm = () => {
        if (!showReportForm) return null;

        return ReactDOM.createPortal(
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999,
                width: '300px',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}>
                <div className="report-form-content">
                    <h3>Report Issue</h3>
                    <textarea
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        placeholder="Describe the issue..."
                    />
                    <div className="form-actions">
                        <button 
                            onClick={async () => {
                                try {
                                    await createReport(project.id, reportDescription);
                                    alert('Report submitted successfully');
                                    setShowReportForm(false);
                                    setReportDescription('');
                                } catch (error) {
                                    alert('Failed to submit report');
                                }
                            }}
                        >
                            Submit Report
                        </button>
                        <button 
                            onClick={() => {
                                setShowReportForm(false);
                                setReportDescription('');
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
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
                    <div className="meta-item description-item">
                        <span className="label">
                            <FaFileAlt className="field-icon"/> Description:
                        </span>
                        <p className="description">
                            {project.description}
                        </p>
                    </div>

                    <div className="project-meta">
                        <div className="meta-item">
                            <span className="label">
                                <FaUser className="meta-icon"/> Client:
                            </span>
                            <span className="value">{project.client_username}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">
                                <FaDollarSign className="meta-icon" /> Budget:
                            </span>
                            <span className="value">${project.budget}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">
                                <FaCalendarAlt className="meta-icon" /> Deadline:
                            </span>
                            <span className={`value ${isDeadlineNear(project.deadline) ? 'deadline-near' : ''}`}>
                                {new Date(project.deadline).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {(project.projectStatus === "IN_PROGRESS" || project.projectStatus === "EXPIRED") && (
                <div className="project-actions">
                    <button
                        className="chat-button"
                        onClick={() => {
                            if (project.id) {
                                setShowChat(prev => !prev);
                            }
                        }}>
                        {showChat ? 'Close Chat' : 'Open Chat'}
                    </button>
                    {project.projectStatus === "IN_PROGRESS" && (
                        <button 
                            className="report-button"
                            onClick={() => setShowReportForm(true)}
                        >
                            Report Issue
                        </button>
                    )}
                    <button
                        className={`complete-button ${isProcessing ? 'loading' : ''}`}
                        onClick={handleComplete}
                        disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Mark as Complete'}
                    </button>
                </div>
            )}

            {renderChat()}
            {renderReportForm()}
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