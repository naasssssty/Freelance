import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import FreelancerSearchComponent from '../components/FreelancerSearchComponent';
import "../styles/header.css";
import { useNavigate } from "react-router-dom";
import {
    // eslint-disable-next-line
    // applyForProject δεν χρησιμοποιείται, οπότε το σχολιάζουμε
    // applyForProject,
    // eslint-disable-next-line
    // handleCompleteProject δεν χρησιμοποιείται, οπότε το σχολιάζουμε
    // handleCompleteProject,
    // eslint-disable-next-line
    // handleWithdrawApplication δεν χρησιμοποιείται, οπότε το σχολιάζουμε
    // handleWithdrawApplication
    loadAvailableProjects,
    loadMyApplications,
    loadMyProjects,
} from "../services/FreelancerServices";
import { useDispatch, useSelector } from "react-redux";
import AvailableProjectCard from '../components/AvailableProjectCard';
import FreelancerProjectCard from '../components/FreelancerProjectCard';
import ApplicationCard from '../components/ApplicationCard';
import SearchedProjectCard from '../components/SearchedProjectCard';
import Footer from '../components/Footer';
// eslint-disable-next-line no-unused-vars
import { FaProjectDiagram, FaClipboardList, FaCheckCircle, FaUser, FaClock, FaCalendarAlt, FaDollarSign, FaFileAlt } from 'react-icons/fa';
import { jwtDecode } from "jwt-decode";

const FreelancerDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showAvailableProjects, setShowAvailableProjects] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [coverLetters, setCoverLetters] = useState({});
    const [searchedProject, setSearchedProject] = useState(null);
    const [showMyApplications, setShowMyApplications] = useState(false);
    const [showMyProjects, setShowMyProjects] = useState(false);

    const { availableProjects } = useSelector((state) => state.projects);
    const { myFApplications } = useSelector((state) => state.applications);
    const { myFProjects } = useSelector((state) => state.projects);

    // Add new state for dashboard stats
    const [dashboardStats, setDashboardStats] = useState({
        totalAvailableProjects: 0,
        myApplications: 0,
        myActiveProjects: 0
    });

    // Παίρνουμε το username από το token
    const getUsername = () => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            return decoded.sub;
        }
        return '';
    };

    const username = getUsername();
    console.log('Username from token:', username);

    // Add useEffect to calculate statistics when data is loaded
    useEffect(() => {
        setDashboardStats({
            totalAvailableProjects: availableProjects?.length || 0,
            myApplications: myFApplications?.length || 0,
            myActiveProjects: myFProjects?.filter(p => p.projectStatus === 'IN_PROGRESS')?.length || 0
        });
    }, [availableProjects, myFApplications, myFProjects]);

    const handleSearchResult = (result) => {
        setSearchedProject(result);
        setShowAvailableProjects(false);
    };

    const handleLoadAvailableProjects = async () => {
        try {
            const projects = await loadAvailableProjects();
            dispatch({ type: "SET_AVAILABLE_PROJECTS", payload: projects });
            setSearchedProject(null);
            setShowMyProjects(false);
            setShowMyApplications(false);
            setShowAvailableProjects(true);
        } catch (error) {
            console.error("Error loading available projects:", error);
        }
    };

    const handleLoadMyProjects = async () => {
        try {
            const projects = await loadMyProjects();
            dispatch({type: "SET_MY_FPROJECTS", payload: projects});
            setShowAvailableProjects(false);
            setShowMyApplications(false);
            setSearchedProject(null);
            setShowMyProjects(true);
        } catch (error) {
            console.log("Error loading your projects:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // eslint-disable-next-line
    // handleApplyForProject δεν χρησιμοποιείται, οπότε το σχολιάζουμε
    // const handleApplyForProject = async (projectId) => {
    //     const coverLetter = coverLetters[projectId] || '';
    //     try {
    //         setLoading(true);
    //         await applyForProject(projectId, coverLetter);
    //         dispatch(loadMyApplications());
    //         dispatch(loadAvailableProjects());
    //         alert('Application submitted successfully!');
    //     } catch (error) {
    //         console.error('Error applying for project:', error);
    //         alert('Failed to apply for project. Please try again.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleLoadMyApplications = async () => {
        try {
            const applications = await loadMyApplications(); // This calls the API function
            dispatch({ type: "SET_MY_APPLICATIONS_F", payload: applications }); // Ensure this action is dispatched
            setShowAvailableProjects(false);
            setSearchedProject(null);
            setShowMyProjects(false);
            setShowMyApplications(true);
        } catch (error) {
            console.error("Error loading your applications:", error); // Log actual error
            alert("Failed to load your applications"); // Error message shown in the UI
        }
    };

    // Προσθήκη του handleLogoClick
    const handleLogoClick = () => {
        setShowAvailableProjects(false);
        setSearchedProject(null);
        setShowMyProjects(false);
        setShowMyApplications(false);
    };

    const FreelancerMenuOptions = [
        { label: "Browse Projects", link: "#", onClick: handleLoadAvailableProjects },
        { label: "My Applications", link: "#", onClick: handleLoadMyApplications },
        { label: "My Projects", link: "#", onClick: handleLoadMyProjects },
        { label: "Logout", link: "#", onClick: handleLogout },
    ];

    return (
        <div className="dashboard-layout">
            <Header
                menuOptions={FreelancerMenuOptions}
                searchComponent={<FreelancerSearchComponent onSearchResult={handleSearchResult} />}
                onLogoClick={handleLogoClick}
                username={username}
            />
            <div className="dashboard-container">
                {/* Add Welcome Dashboard Section */}
                {!showAvailableProjects && !showMyApplications && !showMyProjects && !searchedProject && (
                    <div className="welcome-dashboard">
                        <h1>Welcome to Your Freelancer Dashboard</h1>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <FaProjectDiagram />
                                </div>
                                <div className="stat-content">
                                    <h3>Available Projects</h3>
                                    <p>{dashboardStats.totalAvailableProjects}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <FaClipboardList />
                                </div>
                                <div className="stat-content">
                                    <h3>My Applications</h3>
                                    <p>{dashboardStats.myApplications}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <FaCheckCircle />
                                </div>
                                <div className="stat-content">
                                    <h3>Active Projects</h3>
                                    <p>{dashboardStats.myActiveProjects}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {searchedProject && (
                    <div className="search-result-container">
                        <h2>Search Result</h2>
                        <SearchedProjectCard project={searchedProject} />
                    </div>
                )}
                {showAvailableProjects && availableProjects.length > 0 && (
                    <div className="projects-grid">
                        <h2><FaProjectDiagram className="title-icon" /> Available Projects</h2>
                        <div className="projects-container">
                            {availableProjects.map(project => (
                                <AvailableProjectCard
                                    key={project.id}
                                    project={project}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {showMyApplications && myFApplications.length > 0 && (
                    <div className="applications-grid">
                        <h2><FaClipboardList className="title-icon" /> Your Applications</h2>
                        <div className="applications-container">
                            {myFApplications.map(application => (
                                <ApplicationCard
                                    key={application.id}
                                    application={application}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {showMyProjects && myFProjects.length > 0 && (
                    <div className="projects-grid">
                        <h2><FaCheckCircle className="title-icon" /> Your Projects</h2>
                        <div className="projects-container">
                            {myFProjects.map(project => (
                                <FreelancerProjectCard
                                    key={project.id}
                                    project={project}
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

export default FreelancerDashboard;