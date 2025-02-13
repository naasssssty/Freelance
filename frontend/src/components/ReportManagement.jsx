import React, { useState, useEffect } from 'react';
import '../styles/admin-dashboard/reports.css';

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [adminResponse, setAdminResponse] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/reports', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setReports(data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    };

    const handleStatusUpdate = async (reportId, status) => {
        try {
            const response = await fetch(`http://localhost:8080/api/reports/${reportId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: status,
                    adminResponse: adminResponse
                })
            });

            if (response.ok) {
                setSelectedReport(null);
                setAdminResponse('');
                fetchReports();
                alert('Report status updated successfully');
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update report status');
            }
        } catch (error) {
            console.error('Error updating report:', error);
            alert(error.message || 'Failed to update report status');
        }
    };

    return (
        <div className="reports-container">
            <h2>Reports Management</h2>
            <div className="reports-list">
                {reports.map(report => (
                    <div key={report.id} className="report-card">
                        <h3>Project: {report.projectTitle}</h3>
                        <span className={`status-badge ${report.status}`}>
                            {report.status}
                        </span>
                        <p><strong>Reporter:</strong> {report.reporterUsername}</p>
                        <p className="report-description">
                            <strong>Description:</strong> {report.description}
                        </p>
                        {report.adminResponse && (
                            <p className="report-description">
                                <strong>Admin Response:</strong> {report.adminResponse}
                            </p>
                        )}
                        <button onClick={() => setSelectedReport(report)}>
                            Review
                        </button>
                    </div>
                ))}
            </div>

            {selectedReport && (
                <div className="report-review-modal">
                    <h3>Review Report</h3>
                    <p><strong>Project:</strong> {selectedReport.projectTitle}</p>
                    <p><strong>Reporter:</strong> {selectedReport.reporterUsername}</p>
                    <p><strong>Description:</strong> {selectedReport.description}</p>
                    <p><strong>Current Status:</strong> {selectedReport.status}</p>
                    <textarea
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        placeholder="Enter your response..."
                    />
                    <div className="action-buttons">
                        <button onClick={() => handleStatusUpdate(selectedReport.id, 'IN_REVIEW')}>
                            Mark as In Review
                        </button>
                        <button onClick={() => handleStatusUpdate(selectedReport.id, 'RESOLVED')}>
                            Resolve
                        </button>
                        <button onClick={() => handleStatusUpdate(selectedReport.id, 'DISMISSED')}>
                            Dismiss
                        </button>
                        <button onClick={() => setSelectedReport(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportManagement; 