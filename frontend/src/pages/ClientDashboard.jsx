//ClientDashboard.jsx

import React, { useState } from 'react';
import Header from '../components/Header';
import '../styles/header.css';
import { useNavigate } from "react-router-dom";
import ProjectForm from '../components/ProjectForm';
import {loadAvailableProjects} from "../services/FreelancerServices";
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

const ClientDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showProjectForm, setShowProjectForm] = useState(false);

    const [showMyApplications, setShowMyApplications] = useState(false);
    const [showMyProjects, setShowMyProjects] = useState(false);

    const { myApplications, loading: myApplicationsLoading, error: myApplicationsError  } = useSelector((state) => state.applications);
    const { myProjects, loading: myProjectsLoading, error: myProjectsError  } = useSelector((state) => state.projects);

    const handleLoadProjectForm = () => {
        setShowProjectForm(true);
        setShowMyProjects(false);
        setShowMyApplications(false);
    };

    const handleLoadMyApplications = async () => {
        try {
            const applications = await loadMyApplications();
            dispatch({ type: "SET_MY_APPLICATIONS", payload: applications });
            setShowProjectForm(false);
            setShowMyApplications(true);
            setShowMyProjects(false);
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
        } catch (error) {
            console.error("Error loading your projects:", error);
        }
    };


    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const clientMenuOptions = [
        {   label: "My Projects",
            link: "#", onClick: handleLoadMyProjects
        },
        {   label: "Post a Project",
            link: "#",
            onClick: handleLoadProjectForm
        },
        {   label: "My Applications",
            link: "#", onClick: handleLoadMyApplications
        },
        {   label: "Logout",
            link: "#",
            onClick: handleLogout }
    ];

    const handleFormClose = () => {
        setShowProjectForm(false);

    };

    return (
        <div className="dashboard-layout">
            <Header menuOptions={clientMenuOptions}/>
            <div className="dashboard-container">
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
                                    onAccept={async (id) => {
                                        await handleAcceptApplication(id);
                                        dispatch({
                                            type: "SET_MY_APPLICATIONS",
                                            payload: myApplications.map(a =>
                                                a.id === id ? { ...a, applicationStatus: "ACCEPTED" } : a
                                            )
                                        });
                                    }}
                                    onReject={async (id) => {
                                        await handleRejectApplication(id);
                                        dispatch({
                                            type: "SET_MY_APPLICATIONS",
                                            payload: myApplications.map(a =>
                                                a.id === id ? { ...a, applicationStatus: "REJECTED" } : a
                                            )
                                        });
                                    }}
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
