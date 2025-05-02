import React from 'react';
import '../styles/client dashboard/clientWelcome.css';
import { FaProjectDiagram, FaFileAlt, FaClipboardList } from 'react-icons/fa';

const ClientWelcome = ({ username }) => {
    return (
        <div className="welcome-container">
            <div className="welcome-header">
                <p>Manage your projects and applications from your dashboard</p>
            </div>

            <div className="features-grid">
                <div className="feature-card">
                    <FaProjectDiagram className="feature-icon" />
                    <h3>My Projects</h3>
                    <p>View and manage all your posted projects</p>
                </div>

                <div className="feature-card">
                    <FaFileAlt className="feature-icon" />
                    <h3>Post a Project</h3>
                    <p>Create a new project and find talented freelancers</p>
                </div>

                <div className="feature-card">
                    <FaClipboardList className="feature-icon" />
                    <h3>Applications</h3>
                    <p>Review applications from freelancers</p>
                </div>
            </div>

            <div className="quick-stats">
                <h2>Quick Overview</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <h4>Active Projects</h4>
                        <span className="stat-number">3</span>
                    </div>
                    <div className="stat-card">
                        <h4>Pending Applications</h4>
                        <span className="stat-number">7</span>
                    </div>
                    <div className="stat-card">
                        <h4>Completed Projects</h4>
                        <span className="stat-number">12</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientWelcome; 