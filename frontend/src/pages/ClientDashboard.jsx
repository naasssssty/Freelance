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
    // eslint-disable-next-line
    const [projects, setProjects] = useState([]);
    // eslint-disable-next-line
    const [applications, setApplications] = useState([]);
    const [username, setUsername] = useState('');
    const [showMyApplications, setShowMyApplications] = useState(false);
    const [showMyProjects, setShowMyProjects] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);

    // eslint-disable-next-line
    const { myApplications, loading: myApplicationsLoading, error: myApplicationsError  } = useSelector((state) => state.applications);
    // eslint-disable-next-line
    const { myProjects, loading: myProjectsLoading, error: myProjectsError  } = useSelector((state) => state.projects);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            setUsername(decoded.sub);
            fetchProjects(decoded.sub);
            fetchApplications(decoded.sub);
        }
    }, []);

    const fetchProjects = async (username) => {
        try {
            const projectsData = await loadMyProjects(username);
            setProjects(projectsData);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchApplications = async (username) => {
        try {
            const applicationsData = await loadMyApplications(username);
            setApplications(applicationsData);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const handleLoadProjectForm = () => {
        setShowProjectForm(true);
        setShowMyProjects(false);
        setShowMyApplications(false);
        setShowWelcome(false);  // Κρύβουμε το welcome screen
    };

    const handleLoadMyApplications = async () => {
        try {
            const applications = await loadMyApplications();
            dispatch({ type: "SET_MY_APPLICATIONS", payload: applications });
            setShowProjectForm(false);
            setShowMyApplications(true);
            setShowMyProjects(false);
            setShowWelcome(false);  // Κρύβουμε το welcome screen
        } catch (error) {
            console.error("Error loading your applications:", error);
        }
    };

    const handleLoadMyProjects = async () => {
        try {
            const projects = await loadMyProjects();
            dispatch({ type: "SET_MY_PROJECTS", payload: projects });
            setShowProjectForm(false);
            setShowMyProjects(true);
            setShowMyApplications(false);
            setShowWelcome(false);  // Κρύβουμε το welcome screen
        } catch (error) {
            console.error("Error loading your projects:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
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
        // Refresh projects after form is closed
        const decoded = jwtDecode(localStorage.getItem('token'));
        fetchProjects(decoded.sub);
    };

    const handleAccept = async (applicationId) => {
        try {
            await handleAcceptApplication(applicationId);
            await fetchApplications(username);
        } catch (error) {
            console.error('Error accepting application:', error);
        }
    };

    const handleReject = async (applicationId) => {
        try {
            await handleRejectApplication(applicationId);
            await fetchApplications(username);
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

                {showMyProjects && myProjects.length > 0 && (
                    <div className="projects-grid">
                        <h2>My Projects</h2>
                        <div className="projects-container">
                            {myProjects.map(project => (
                                <ClientProjectCard
                                    key={project.id}
                                    project={project}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {myApplications && myApplications.length > 0 && showMyApplications && (
                    <div className="applications-grid">
                        <h2>Applications Received</h2>
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
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ClientDashboard;
