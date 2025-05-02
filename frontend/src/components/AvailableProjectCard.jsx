import React, { useState } from "react";
import { 
    FaUser, 
    FaFileAlt, 
    FaDollarSign, 
    FaCalendarAlt,
    FaClock,
    FaTags,
    FaTools,
    FaInfoCircle,
    FaUpload
} from 'react-icons/fa';
import '../styles/freelancer dashboard/availableProjectCard.css';
import { applyForProjectWithCV } from "../services/FreelancerServices";

const AvailableProjectCard = ({ project }) => {
    const [isApplying, setIsApplying] = useState(false);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [fileName, setFileName] = useState('');

    const handleApply = async () => {
        try {
            setIsApplying(true);
            await applyForProjectWithCV(project.id, coverLetter, cvFile);
            setShowApplyForm(false);
            setCoverLetter('');
            setCvFile(null);
            setFileName('');
            alert('Application submitted successfully!');
        } catch (error) {
            alert(error.message || 'Failed to submit application');
        } finally {
            setIsApplying(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCvFile(file);
            setFileName(file.name);
        }
    };

    return (
        <div className="project-card">
            <div className="project-header">
                <h3>{project.title}</h3>
                <span className="status-badge">
                    <FaClock className="field-icon" /> {project.projectStatus}
                </span>
            </div>

            <div className="project-details">
                <div className="detail-item">
                    <span className="label">
                        <FaUser className="field-icon" /> Client
                    </span>
                    <span className="value">{project.clientUsername || 'N/A'}</span>
                </div>

                <div className="detail-item">
                    <span className="label">
                        <FaFileAlt className="field-icon" /> Description
                    </span>
                    <p className="value description">{project.description}</p>
                </div>

                <div className="detail-item">
                    <span className="label">
                        <FaDollarSign className="field-icon" /> Budget
                    </span>
                    <span className="value">${project.budget}</span>
                </div>

                <div className="detail-item">
                    <span className="label">
                        <FaCalendarAlt className="field-icon" /> Deadline
                    </span>
                    <span className="value">{new Date(project.deadline).toLocaleDateString()}</span>
                </div>

                {project.category && (
                    <div className="detail-item">
                        <span className="label">
                            <FaTags className="field-icon" /> Category:
                        </span>
                        <span className="value">{project.category}</span>
                    </div>
                )}

                {project.requiredSkills && (
                    <div className="detail-item">
                        <span className="label">
                            <FaTools className="field-icon" /> Required Skills:
                        </span>
                        <span className="value">{Array.isArray(project.requiredSkills) ? project.requiredSkills.join(', ') : project.requiredSkills}</span>
                    </div>
                )}

                {project.additionalInfo && (
                    <div className="detail-item">
                        <span className="label">
                            <FaInfoCircle className="field-icon" /> Additional Info:
                        </span>
                        <p className="value">{project.additionalInfo}</p>
                    </div>
                )}
            </div>

            <div className="project-footer">
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
                        
                        <div className="cv-upload-container">
                            <label className="cv-upload-label">
                                <FaUpload className="upload-icon" />
                                <span>Upload your CV (PDF, DOC, DOCX)</span>
                                <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx" 
                                    onChange={handleFileChange}
                                    disabled={isApplying}
                                />
                            </label>
                            {fileName && (
                                <div className="file-name">
                                    <FaFileAlt /> {fileName}
                                </div>
                            )}
                        </div>
                        
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
                                    setCvFile(null);
                                    setFileName('');
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