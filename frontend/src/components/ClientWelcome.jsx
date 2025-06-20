import React, { useState, useEffect } from 'react';
import '../styles/client dashboard/clientWelcome.css';
import { FaProjectDiagram, FaFileAlt, FaClipboardList } from 'react-icons/fa';
import { getClientStats } from '../services/ClientServices';

const ClientWelcome = ({ username }) => {
    const [stats, setStats] = useState({
        activeProjects: 0,
        pendingApplications: 0,
        completedProjects: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const clientStats = await getClientStats();
                setStats({
                    activeProjects: clientStats.activeProjects || 0,
                    pendingApplications: clientStats.pendingApplications || 0,
                    completedProjects: clientStats.completedProjects || 0
                });
            } catch (error) {
                console.error('Error fetching client stats:', error);
                // Keep default values on error
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

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
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{
                            width: '30px',
                            height: '30px',
                            border: '3px solid #f3f3f3',
                            borderTop: '3px solid #3498db',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto'
                        }}></div>
                        <p style={{ marginTop: '1rem', color: '#666' }}>Loading statistics...</p>
                    </div>
                ) : (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h4>Active Projects</h4>
                            <span className="stat-number">{stats.activeProjects}</span>
                        </div>
                        <div className="stat-card">
                            <h4>Pending Applications</h4>
                            <span className="stat-number">{stats.pendingApplications}</span>
                        </div>
                        <div className="stat-card">
                            <h4>Completed Projects</h4>
                            <span className="stat-number">{stats.completedProjects}</span>
                        </div>
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ClientWelcome; 