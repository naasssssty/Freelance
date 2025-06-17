import React from "react";
import '../styles/freelancer dashboard/applicationCard.css';
import { FaUser, FaCalendarAlt, FaIdCard, FaFileAlt, FaDownload } from 'react-icons/fa';
import { downloadCV } from '../services/ClientServices';

const ApplicationCard = ({ application, onAccept, onReject }) => {
    // eslint-disable-next-line
    const getStatusColor = (status) => {
        // Σχολιάζουμε αυτή τη συνάρτηση καθώς δεν χρησιμοποιείται
        // return status === 'ACCEPTED' ? '#4CAF50' : status === 'REJECTED' ? '#F44336' : '#FFC107';
    };

    const handleDownloadCV = async () => {
        try {
            if (application.cvFilePath) {
                await downloadCV(application.id);
            } else {
                alert("No CV available for this application");
            }
        } catch (error) {
            console.error("Error downloading CV:", error);
            alert("Failed to download CV");
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
                        {application.cvFilePath && (
                            <div className="meta-item">
                                <span className="label"><FaFileAlt className="field-icon" /> CV: </span>
                                <button 
                                    className="download-cv-button"
                                    onClick={handleDownloadCV}
                                >
                                    <FaDownload /> Download CV
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default ApplicationCard; 