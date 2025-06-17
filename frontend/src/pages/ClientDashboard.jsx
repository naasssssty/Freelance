//ClientDashboard.jsx

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import '../styles/header.css';
import { useNavigate } from "react-router-dom";
import ProjectForm from '../components/ProjectForm';
import {useDispatch, useSelector} from "react-redux";
import {
    handleAcceptApplication,
    handleRejectApplication,
    loadMyApplications,
    loadMyProjects
} from "../services/ClientServices";
import ClientProjectCard from '../components/ClientProjectCard';
import ClientApplicationCard from '../components/ClientApplicationCard';
import Footer from '../components/Footer';
import { jwtDecode } from "jwt-decode";
import ClientWelcome from '../components/ClientWelcome';

const ClientDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showProjectForm, setShowProjectForm] = useState(false);
    const [username, setUsername] = useState('');
    const [showMyApplications, setShowMyApplications] = useState(false);
    const [showMyProjects, setShowMyProjects] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Get data from Redux store
    const { myApplications } = useSelector((state) => state.applications || {});
    const { myProjects } = useSelector((state) => state.projects || {});

    // Initialize username from token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUsername(decoded.sub);
            } catch (error) {
                console.error('Error decoding token:', error);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // Restore previous view state from localStorage after refresh
    useEffect(() => {
        const savedView = localStorage.getItem('clientDashboardView');
        if (savedView) {
            try {
                const viewState = JSON.parse(savedView);
                setShowProjectForm(viewState.showProjectForm || false);
                setShowMyApplications(viewState.showMyApplications || false);
                setShowMyProjects(viewState.showMyProjects || false);
                setShowWelcome(viewState.showWelcome !== false);
                
                // Load data if needed after restoring view
                if (viewState.showMyProjects && (!myProjects || myProjects.length === 0)) {
                    handleLoadMyProjects();
                }
                if (viewState.showMyApplications && (!myApplications || myApplications.length === 0)) {
                    handleLoadMyApplications();
                }
            } catch (error) {
                console.error('Error parsing saved view state:', error);
            }
        }
    }, []); // Empty dependency array to run only once

    // Save current view state to localStorage whenever it changes
    useEffect(() => {
        const viewState = {
            showProjectForm,
            showMyApplications,
            showMyProjects,
            showWelcome
        };
        localStorage.setItem('clientDashboardView', JSON.stringify(viewState));
    }, [showProjectForm, showMyApplications, showMyProjects, showWelcome]);

    const handleLoadProjectForm = () => {
        setShowProjectForm(true);
        setShowMyProjects(false);
        setShowMyApplications(false);
        setShowWelcome(false);
    };

    const handleLoadMyApplications = async () => {
        setIsLoading(true);
        try {
            const applications = await loadMyApplications();
            dispatch({ type: "SET_MY_APPLICATIONS", payload: applications });
            setShowProjectForm(false);
            setShowMyApplications(true);
            setShowMyProjects(false);
            setShowWelcome(false);
        } catch (error) {
            console.error("Error loading applications:", error);
            // Don't show alert on error, just log it
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadMyProjects = async () => {
        setIsLoading(true);
        try {
            const projects = await loadMyProjects();
            dispatch({ type: "SET_MY_PROJECTS", payload: projects });
            setShowProjectForm(false);
            setShowMyProjects(true);
            setShowMyApplications(false);
            setShowWelcome(false);
        } catch (error) {
            console.error("Error loading projects:", error);
            // Don't show alert on error, just log it
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('clientDashboardView');
        navigate('/login');
    };

    const clientMenuOptions = [
        {   
            label: "My Projects",
            onClick: handleLoadMyProjects
        },
        {   
            label: "Post a Project",
            onClick: handleLoadProjectForm
        },
        {   
            label: "My Applications",
            onClick: handleLoadMyApplications
        },
        {   
            label: "Logout",
            onClick: handleLogout 
        }
    ];

    const handleFormClose = () => {
        setShowProjectForm(false);
        setShowWelcome(true);
        // Refresh projects if they were previously loaded
        if (myProjects && myProjects.length > 0) {
            handleLoadMyProjects();
        }
    };

    const handleAccept = async (applicationId) => {
        try {
            await handleAcceptApplication(applicationId);
            // Refresh applications after action
            await handleLoadMyApplications();
        } catch (error) {
            console.error('Error accepting application:', error);
        }
    };

    const handleReject = async (applicationId) => {
        try {
            await handleRejectApplication(applicationId);
            // Refresh applications after action
            await handleLoadMyApplications();
        } catch (error) {
            console.error('Error rejecting application:', error);
        }
    };

    const handleLogoClick = () => {
        setShowProjectForm(false);
        setShowMyProjects(false);
        setShowMyApplications(false);
        setShowWelcome(true);
    };

    if (isLoading) {
        return (
            <div className="dashboard-layout">
                <Header
                    menuOptions={clientMenuOptions}
                    onLogoClick={handleLogoClick}
                    username={username}
                    searchComponent={null}
                />
                <div className="dashboard-container">
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        <h2>Loading...</h2>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Header
                menuOptions={clientMenuOptions}
                onLogoClick={handleLogoClick}
                username={username}
                searchComponent={null}
            />
            <div className="dashboard-container">
                {showWelcome && <ClientWelcome username={username} />}
                
                {showProjectForm && <ProjectForm handleFormClose={handleFormClose}/>}

                {showMyProjects && (
                    <div className="projects-grid">
                        <h2>My Projects</h2>
                        {myProjects && myProjects.length > 0 ? (
                            <div className="projects-container">
                                {myProjects.map(project => (
                                    <ClientProjectCard
                                        key={project.id}
                                        project={project}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <p>No projects found.</p>
                            </div>
                        )}
                    </div>
                )}

                {showMyApplications && (
                    <div className="applications-grid">
                        <h2>Applications Received</h2>
                        {myApplications && myApplications.length > 0 ? (
                            <div className="applications-container">
                                {myApplications.map(application => (
                                    <ClientApplicationCard
                                        key={application.id}
                                        application={application}
                                        onAccept={handleAccept}
                                        onReject={handleReject}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <p>No applications found.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ClientDashboard;
