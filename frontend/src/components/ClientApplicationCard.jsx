import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import '../styles/client dashboard/clientApplicationCard.css';
import Chat from "./Chat";
import { FaDownload } from 'react-icons/fa';
import axios from 'axios';

const ClientApplicationCard = ({ application, onAccept, onReject }) => {
    console.log('Application data:', application);
    const [showChat, setShowChat] = useState(false);
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportDescription, setReportDescription] = useState('');

    const getStatusColor = (status) => {
        switch(status) {
            case 'WAITING':
                return 'waiting';
            case 'APPROVED':
                return 'approved';
            case 'REJECTED':
                return 'rejected';
            default:
                return '';
        }
    };

    const renderChat = () => {
        if (!showChat || !application.project_id) return null;

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
                    key={application.project_id}
                    projectId={Number(application.project_id)}
                    onClose={() => setShowChat(false)}
                />
            </div>,
            document.body
        );
    };

    const handleReport = async () => {
        if (!reportDescription.trim()) {
            alert('Please enter a description for the report');
            return;
        }

        try {
            const response = await axios.post(
                `/api/report`,
                {
                    projectId: application.project_id,
                    description: reportDescription
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                alert('Report submitted successfully');
                setShowReportForm(false);
                setReportDescription('');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Failed to submit report: ' + (error.response?.data?.message || error.message));
        }
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
                height: '400px',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '15px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0 }}>Report Issue</h3>
                    <button 
                        onClick={() => setShowReportForm(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '18px'
                        }}
                    >
                        ×
                    </button>
                </div>
                <div style={{
                    padding: '15px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <textarea
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        placeholder="Describe the issue..."
                        style={{
                            width: '100%',
                            height: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            resize: 'none',
                            marginBottom: '10px',
                            color: '#333',
                            fontSize: '14px',
                            backgroundColor: '#fff'
                        }}
                    />
                    <button 
                        onClick={handleReport}
                        style={{
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Submit Report
                    </button>
                </div>
            </div>,
            document.body
        );
    };

    const handleDownloadCV = (applicationId) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        window.open(`http://freelance.local/api/application/${applicationId}/download-cv`, '_blank');
    };

    return (
        <div className="client-application-card">
            <div className="application-header">
                <h3>{application.projectTitle}</h3>
                <span className={`status-badge ${getStatusColor(application.applicationStatus)}`}>
                    {application.applicationStatus}
                </span>
            </div>
            
            <div className="application-details">
                <div className="cover-letter">
                    <span className="label">Cover Letter:</span>
                    <p className="letter-text">{application.cover_letter}</p>
                </div>
                
                <div className="application-meta">
                    <div className="meta-item">
                        <span className="label">Freelancer:</span>
                        <span className="value">{application.freelancer}</span>
                    </div>
                    <div className="meta-item">
                        <span className="label">Submitted:</span>
                        <span className="value">{application.created_at}</span>
                    </div>
                </div>

                {application.cvFilePath && (
                    <div className="cv-download">
                        <button 
                            className="download-cv-button"
                            onClick={() => handleDownloadCV(application.id)}
                        >
                            <FaDownload /> Download CV
                        </button>
                    </div>
                )}
            </div>

            <div className="application-actions">
                {application.applicationStatus === 'WAITING' && (
                    <>
                        <button 
                            className="accept-button"
                            onClick={() => onAccept(application.id)}
                        >
                            Accept
                        </button>
                        <button 
                            className="reject-button"
                            onClick={() => onReject(application.id)}
                        >
                            Reject
                        </button>
                    </>
                )}
                {application.applicationStatus === 'APPROVED' && (
                    <>
                        <button 
                            className="chat-button"
                            onClick={() => {
                                if (application.project_id) {
                                    setShowChat(prev => !prev);
                                }
                            }}
                        >
                            {showChat ? 'Close Chat' : 'Chat with Freelancer'}
                        </button>
                        <button 
                            className="report-button"
                            onClick={() => setShowReportForm(true)}
                        >
                            Report Issue
                        </button>
                    </>
                )}
            </div>

            {renderChat()}

            {renderReportForm()}
        </div>
    );
};

export default ClientApplicationCard;