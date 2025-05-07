import React, { useState } from "react";
import { 
    FaUser, 
    FaFileAlt, 
    FaDollarSign, 
    FaCalendarAlt,
    // eslint-disable-next-line
    FaClock,
    // eslint-disable-next-line
    FaTags,
    // eslint-disable-next-line
    FaTools,
    // eslint-disable-next-line
    FaInfoCircle,
    FaUpload,
    FaFilePdf,
    FaFileWord,
    FaFileImage
} from 'react-icons/fa';
import '../styles/freelancer dashboard/availableProjectCard.css';
import { applyForProject, applyForProjectWithCV } from "../services/FreelancerServices";

const AvailableProjectCard = ({ project }) => {
    const [isApplying, setIsApplying] = useState(false);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');

    const handleApply = async (e) => {
        e.preventDefault();
        
        if (!coverLetter.trim()) {
            setError("Please provide a cover letter");
            return;
        }
        
        try {
            setIsApplying(true);
            setError("");
            
            console.log("Applying for project with CV:", {
                projectId: project.id,
                coverLetter,
                cvFile: cvFile ? cvFile.name : 'none'
            });
            
            if (cvFile) {
                // Apply with CV
                await applyForProjectWithCV(project.id, coverLetter, cvFile);
            } else {
                // Apply without CV
                await applyForProject(project.id, coverLetter);
            }
            
            // Reset form and close it
            setShowApplyForm(false);
            setCoverLetter('');
            setCvFile(null);
            setFileName('');
            
            // Show success message
            alert("Application submitted successfully!");
        } catch (error) {
            console.error("Application error:", error);
            setError(error.message || "Failed to submit application. Please try again.");
        } finally {
            setIsApplying(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file type
            const fileType = file.type;
            if (
                fileType === "application/pdf" || 
                fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                fileType.startsWith("image/")
            ) {
                setCvFile(file);
                setFileName(file.name);
                setError("");
            } else {
                setCvFile(null);
                setFileName("");
                setError("Please upload a PDF, DOCX, or image file");
            }
        }
    };

    const getFileIcon = () => {
        if (!fileName) return null;
        
        if (fileName.endsWith('.pdf')) {
            return <FaFilePdf className="file-icon pdf" />;
        } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
            return <FaFileWord className="file-icon docx" />;
        } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png')) {
            return <FaFileImage className="file-icon image" />;
        }
        
        return <FaFileAlt className="file-icon" />;
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'APPROVED':
                return 'approved';
            default:
                return '';
        }
    };

    // Μετατροπή ημερομηνιών σε αναγνώσιμη μορφή
    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        if (typeof dateStr === 'string') {
            return new Date(dateStr).toLocaleDateString();
        }
        return dateStr.toLocaleDateString();
    };

    return (
        <div className="project-card">
            <div className="project-card-content">
                <div className="project-header">
                    <h3 className="project-title">{project.title || "Untitled Project"}</h3>
                    
                </div>
                
                <div className="project-description">
                    <p>{project.description || "No description available"}</p>
                </div>
                
                <div className="project-meta">
                    <div className="meta-item" >
                        <FaUser className="meta-icon"  />
                        <span className="label" >Client:</span>
                        <span className="value">{project.clientUsername || "N/A"}</span>
                    </div>
                    <div className="meta-item" >
                        <FaDollarSign className="meta-icon" />
                        <span className="label" >Budget:</span>
                        <span className="value">${project.budget || "0"}</span>
                    </div>
                    <div className="meta-item" >
                        <FaCalendarAlt className="meta-icon" />
                        <span className="label" >Deadline:</span>
                        <span className="value">{formatDate(project.deadline)}</span>
                    </div>
                </div>
                
                <div className="project-actions">
                    <button 
                        className="apply-button"
                        onClick={() => setShowApplyForm(!showApplyForm)}
                    >
                        {showApplyForm ? "Cancel" : "Apply Now"}
                    </button>
                </div>
                
                {showApplyForm && (
                    <div className="apply-form-container">
                        <h4 style={{color: 'black'}}>Apply for this Project</h4>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleApply}>
                            <div className="form-group">
                                <label htmlFor="coverLetter" style={{color: 'black'}}>
                                    <FaFileAlt /> Cover Letter
                                </label>
                                <textarea
                                    id="coverLetter"
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    placeholder="Explain why you're a good fit for this project..."
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="cvFile" style={{color: 'black'}}>
                                    <FaUpload /> Upload CV (PDF, DOCX, or Image)
                                </label>
                                <div className="file-upload-container">
                                    <input
                                        type="file"
                                        id="cvFile"
                                        onChange={handleFileChange}
                                        accept=".pdf,.docx,.jpg,.jpeg,.png"
                                        className="file-input"
                                    />
                                    <div className="file-upload-button">
                                        Choose File
                                    </div>
                                    {fileName && (
                                        <div className="file-name">
                                            {getFileIcon()}
                                            <span>{fileName}</span>
                                        </div>
                                    )}
                                </div>
                                <small style={{color: 'black'}}>Optional: Upload your CV to increase your chances</small>
                            </div>
                            
                            <div className="form-actions">
                                <button 
                                    type="submit" 
                                    className="submit-button"
                                    disabled={isApplying}
                                >
                                    {isApplying ? "Submitting..." : "Submit Application"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvailableProjectCard; 