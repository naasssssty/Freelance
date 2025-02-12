// AdminDashboard.jsx

import {
    handleVerify,
    handleDenyProject,
    handleApproveProject,
    loadUsersList,
    loadProjectsList
} from "../services/AdminServices";
import React, { useState } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Header from '../components/Header';
import AdminSearchComponent from '../components/AdminSearchComponent';
import '../styles/header.css';
import { useNavigate } from 'react-router-dom';
import UserCard from '../components/UserCard';
import ProjectCard from '../components/ProjectCard';
import Footer from '../components/Footer';
import '../styles/admin-dashboard/cards.css';

const AdminDashboard = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showUsersList, setShowUsersList] = useState(false);
    const [showProjectsList, setShowProjectsList] = useState(false);
    const [searchedUser, setSearchedUser] = useState(null);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);

    const { usersList, loading: usersLoading, error: usersError } = useSelector((state) => state.users);
    const { projectsList, loading: projectsLoading, error: projectsError } = useSelector((state) => state.projects);

    const handleSearchResult = (result) => {
        setSearchedUser(result);
        setShowUsersList(false);
        setShowProjectsList(false);
    };

    const handleLoadUsers = async () => {
        try {
            setIsLoadingUsers(true);
            const users = await loadUsersList();
            dispatch({ type: "SET_USERS_LIST", payload: users });
            setShowUsersList(true);
            setShowProjectsList(false);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleLoadProjects = async () => {
        try {
            const projects = await loadProjectsList();  // Assuming loadProjectsList fetches the list from API
            dispatch({ type: "SET_PROJECTS_LIST", payload: projects });  // Dispatch to Redux store if necessary
            setShowProjectsList(true);
            setShowUsersList(false);
        } catch (error) {
            console.error("Error loading projects:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleUserVerify = async (username) => {
        try {
            await handleVerify(username, JSON.stringify(true), dispatch, usersList);
        } catch (error) {
            console.error("Error verifying user:", error);
        }
    };

    const AdminMenuOptions = [
        {
            label: "Projects",
            link: "#",
            onClick: handleLoadProjects
        },
        {
            label: "Users",
            link: "#",
            onClick: handleLoadUsers
        },
        {
            label: "Reports",
            link: "#",
            onClick:  () => navigate('/reports')
        },
        {   label: "Logout",
            link: "#",
            onClick: handleLogout }
    ];

    return (
        <div className="dashboard-layout">
            <Header
                menuOptions={AdminMenuOptions}
                searchComponent={
                    <AdminSearchComponent onSearchResult={handleSearchResult}/>
                }
            />
            
            <div className="dashboard-container">
                {usersError && (
                    <div className="error-message">
                        Failed to load users: {usersError}
                    </div>
                )}

                {projectsError && (
                    <div className="error-message">
                        Failed to load projects: {projectsError}
                    </div>
                )}

                {searchedUser && (
                    <div className="search-result-container">
                        <h2>Search Result</h2>
                        <div className="cards-grid">
                            <div className="card">
                                <div className="card-header">
                                    <h3>{searchedUser.username}</h3>
                                </div>
                                <div className="card-content">
                                    <p>Email: {searchedUser.email}</p>
                                    <p>Role: {searchedUser.role}</p>
                                    <p>Status: {searchedUser.isVerified ? 'Verified' : 'Not Verified'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showUsersList && usersList.length > 0 && (
                    <div className="users-grid">
                        <h2>Users List</h2>
                        <div className="cards-grid">
                            {usersList.map(user => (
                                <div key={user.id} className="card">
                                    <div className="card-header">
                                        <h3>{user.username}</h3>
                                    </div>
                                    <div className="card-content">
                                        <p>Email: {user.email}</p>
                                        <p>Role: {user.role}</p>
                                        <p>Status: {user.verified ? 'Verified' : 'Not Verified'}</p>
                                    </div>
                                    <div className="card-footer">
                                        {!user.verified && user.role !== 'ADMIN' && (
                                            <button 
                                                className="card-button verify-button"
                                                onClick={() => handleUserVerify(user.username)}
                                            >
                                                Verify
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showProjectsList && projectsList.length > 0 && (
                    <div className="projects-grid">
                        <h2>Projects List</h2>
                        <div className="cards-grid">
                            {projectsList.map(project => (
                                <div key={project.id} className="card">
                                    <div className="card-header">
                                        <h3>{project.title}</h3>
                                    </div>
                                    <div className="card-content">
                                        <p>Client: {project.client}</p>
                                        <p>Budget: ${project.budget}</p>
                                        <p>Status: {project.projectStatus}</p>
                                        <p>Deadline: {project.deadline}</p>
                                    </div>
                                    <div className="card-footer">
                                        {project.projectStatus === 'PENDING' && (
                                            <>
                                                <button 
                                                    className="card-button verify-button"
                                                    onClick={() => handleApproveProject(project.id, dispatch, projectsList)}
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    className="card-button deny-button"
                                                    onClick={() => handleDenyProject(project.id, dispatch, projectsList)}
                                                >
                                                    Deny
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default AdminDashboard;