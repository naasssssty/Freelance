import React, { useState } from "react";
import Header from "../components/Header";
import FreelancerSearchComponent from '../components/FreelancerSearchComponent';
import "../styles/header.css";
import { useNavigate } from "react-router-dom";
import {
    applyForProject, handleCompleteProject,
    loadAvailableProjects,
    loadMyApplications,
    loadMyProjects
} from "../services/FreelancerServices";
import { useDispatch, useSelector } from "react-redux";
import AvailableProjectCard from '../components/AvailableProjectCard';
import FreelancerProjectCard from '../components/FreelancerProjectCard';
import ApplicationCard from '../components/ApplicationCard';
import SearchedProjectCard from '../components/SearchedProjectCard';
import Footer from '../components/Footer';

const FreelancerDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showAvailableProjects, setShowAvailableProjects] = useState(false);
    const [loading, setLoading] = useState(false);
    const [coverLetters, setCoverLetters] = useState({});
    const [searchedProject, setSearchedProject] = useState(null);
    const [showMyApplications, setShowMyApplications] = useState(false);
    const [showMyProjects, setShowMyProjects] = useState(false);

    const { availableProjects } = useSelector((state) => state.projects);
    const { myFApplications } = useSelector((state) => state.applications);
    const { myFProjects } = useSelector((state) => state.projects);

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

    const handleApplyForProject = async (projectId) => {
        try {
            setLoading(true);
            const cover_letter = coverLetters[projectId] || "";
            await applyForProject(projectId, cover_letter);
            alert("Application submitted successfully!");
        } catch (error) {
            alert(`Failed to apply: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

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
            />

            <div className="dashboard-container">
                
                {searchedProject && (
                    <div className="search-result-container">
                        <h2>Search Result</h2>
                        <SearchedProjectCard project={searchedProject} />
                    </div>
                )}
                {showAvailableProjects && availableProjects.length > 0 && (
                    <div className="projects-grid">
                        <h2>Available Projects</h2>
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
                        <h2>Your Applications</h2>
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
                        <h2>Your Projects</h2>
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