// AdminDashboard.jsx

import {
    handleVerify,
    handleDenyProject,
    handleApproveProject,
    loadUsersList,
    loadProjectsList
} from "../services/AdminServices";
import React, { useState, useEffect } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Header from '../components/Header';
import AdminSearchComponent from '../components/AdminSearchComponent';
import '../styles/header.css';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line
import UserCard from '../components/UserCard';
// eslint-disable-next-line
import ProjectCard from '../components/ProjectCard';
import Footer from '../components/Footer';
import '../styles/admin dashboard/cards.css';
import { FaUsers, FaProjectDiagram, FaCheckCircle, FaClock, FaUser, FaEnvelope, FaUserTag, FaDollarSign, FaCalendarAlt } from 'react-icons/fa';
import ReportManagement from '../components/ReportManagement';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';

const AdminDashboard = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showUsersList, setShowUsersList] = useState(false);
    const [showProjectsList, setShowProjectsList] = useState(false);
    const [searchedUser, setSearchedUser] = useState(null);
    // eslint-disable-next-line
    const [users, setUsers] = useState([]);
    // eslint-disable-next-line
    const [projects, setProjects] = useState([]);
    // eslint-disable-next-line
    const [activeTab, setActiveTab] = useState('users');
    const [showReports, setShowReports] = useState(false);
    const [showDashboard, setShowDashboard] = useState(true);

    const { usersList, loading: usersLoading, error: usersError } = useSelector((state) => state.users);
    const { projectsList, loading: projectsLoading, error: projectsError } = useSelector((state) => state.projects);
    
    // Παίρνουμε το username απευθείας από το token
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

    // Add new state for statistics
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        pendingVerifications: 0,
        totalProjects: 0,
        pendingProjects: 0
    });

    // Add useEffect to calculate statistics when lists are loaded
    useEffect(() => {
        if (usersList) {
            const pendingVerifications = usersList.filter(user => !user.verified && user.role === 'FREELANCER').length;
            setDashboardStats(prev => ({
                ...prev,
                totalUsers: usersList.length,
                pendingVerifications
            }));
        }
        if (projectsList) {
            const pendingProjects = projectsList.filter(project => project.projectStatus === 'PENDING').length;
            setDashboardStats(prev => ({
                ...prev,
                totalProjects: projectsList.length,
                pendingProjects
            }));
        }
    }, [usersList, projectsList]);

    const handleSearchResult = (result) => {
        setSearchedUser(result);
        setShowUsersList(false);
        setShowProjectsList(false);
        setShowReports(false);
        setShowDashboard(false);
    };

    const handleLoadUsers = async () => {
        try {
            const usersData = await loadUsersList();
            setUsers(usersData);
            dispatch({ type: "SET_USERS_LIST", payload: usersData });
            setShowUsersList(true);
            setShowProjectsList(false);
            setShowReports(false);
            setShowDashboard(false);
        } catch (error) {
            console.error("Error loading users:", error);
        }
    };

    const handleLoadProjects = async () => {
        try {
            const projectsData = await loadProjectsList();
            setProjects(projectsData);
            dispatch({ type: "SET_PROJECTS_LIST", payload: projectsData });
            setShowProjectsList(true);
            setShowUsersList(false);
            setShowReports(false);
            setShowDashboard(false);
        } catch (error) {
            console.error("Error loading projects:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // eslint-disable-next-line
    const handleVerifyUserOld = async (username) => {
        // Σχολιάζουμε αυτή τη συνάρτηση καθώς δεν χρησιμοποιείται
        // try {
        //     const response = await handleVerify(username);
        //     console.log(`User ${username} verified:`, response);
        //     // Refresh users list
        //     loadUsers();
        // } catch (error) {
        //     console.error(`Error verifying user ${username}:`, error);
        // }
    };

    const handleLogoClick = () => {
        setShowUsersList(false);
        setShowProjectsList(false);
        setShowReports(false);
        setShowDashboard(true);
        setSearchedUser(null);
    };

    const menuOptions = [
        {
            label: "Users List",
            onClick: handleLoadUsers
        },
        {
            label: "Projects List",
            onClick: handleLoadProjects
        },
        {
            label: "Reports",
            onClick: () => {
                setShowUsersList(false);
                setShowProjectsList(false);
                setShowReports(true);
                setShowDashboard(false);
            }
        },
        {
            label: "Logout",
            onClick: handleLogout
        }
    ];

    // Add new welcome dashboard section after the Header component
    const renderWelcomeDashboard = () => {
        if (showUsersList || showProjectsList || searchedUser) {
            return null;
        }

        return (
            <div className="welcome-dashboard">
                <h1>Welcome to Admin Dashboard</h1>
                <p>Manage your platform's users and projects from here</p>
                
                <div className="stats-container">
                    <div className="stat-card">
                        <FaUsers className="stat-icon" />
                        <div className="stat-info">
                            <h3>Total Users</h3>
                            <p>{dashboardStats.totalUsers}</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <FaCheckCircle className="stat-icon" />
                        <div className="stat-info">
                            <h3>Pending Verifications</h3>
                            <p>{dashboardStats.pendingVerifications}</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <FaProjectDiagram className="stat-icon" />
                        <div className="stat-info">
                            <h3>Total Projects</h3>
                            <p>{dashboardStats.totalProjects}</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <FaClock className="stat-icon" />
                        <div className="stat-info">
                            <h3>Pending Projects</h3>
                            <p>{dashboardStats.pendingProjects}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleVerifyUser = async (userId, verify) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`/user/${userId}/verify`, { verify }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                alert(`User ${verify ? 'verified' : 'unverified'} successfully`);
                // Ενημερώνουμε το state για να αντικατοπτρίζει την αλλαγή
                setUsers(users.map(user => 
                    user.id === userId ? { ...user, verified: verify } : user
                ));
                dispatch({
                    type: "SET_USERS_LIST",
                    payload: usersList.map(user => 
                        user.id === userId ? { ...user, verified: verify } : user
                    )
                });
            }
        } catch (error) {
            console.error(`Error ${verify ? 'verifying' : 'unverifying'} user:`, error);
            alert(`Failed to ${verify ? 'verify' : 'unverify'} user`);
        }
    };

    const handleProjectApprove = async (id) => {
        try {
            // Ενημερώνουμε άμεσα την κατάσταση τοπικά για να φαίνεται η αλλαγή στο UI
            setProjects(projects.map(project => 
                project.id === id ? { ...project, projectStatus: 'APPROVED' } : project
            ));
            dispatch({
                type: "SET_PROJECTS_LIST",
                payload: projectsList.map(project => 
                    project.id === id ? { ...project, projectStatus: 'APPROVED' } : project
                )
            });

            // Εκτελούμε το API call στο παρασκήνιο
            await handleApproveProject(id);
        } catch (error) {
            console.error("Error approving project:", error);
            // Σε περίπτωση σφάλματος, επαναφέρουμε την κατάσταση
            setProjects(projects.map(project => 
                project.id === id ? { ...project, projectStatus: 'PENDING' } : project
            ));
            dispatch({
                type: "SET_PROJECTS_LIST",
                payload: projectsList.map(project => 
                    project.id === id ? { ...project, projectStatus: 'PENDING' } : project
                )
            });
        }
    };

    const handleProjectDeny = async (id) => {
        try {
            // Ενημερώνουμε άμεσα την κατάσταση τοπικά για να φαίνεται η αλλαγή στο UI
            setProjects(projects.map(project => 
                project.id === id ? { ...project, projectStatus: 'DENIED' } : project
            ));
            dispatch({
                type: "SET_PROJECTS_LIST",
                payload: projectsList.map(project => 
                    project.id === id ? { ...project, projectStatus: 'DENIED' } : project
                )
            });

            // Εκτελούμε το API call στο παρασκήνιο
            await handleDenyProject(id);
        } catch (error) {
            console.error("Error denying project:", error);
            // Σε περίπτωση σφάλματος, επαναφέρουμε την κατάσταση
            setProjects(projects.map(project => 
                project.id === id ? { ...project, projectStatus: 'PENDING' } : project
            ));
            dispatch({
                type: "SET_PROJECTS_LIST",
                payload: projectsList.map(project => 
                    project.id === id ? { ...project, projectStatus: 'PENDING' } : project
                )
            });
        }
    };

    return (
        <div className="dashboard">
            <Header
                menuOptions={menuOptions}
                searchComponent={
                    <AdminSearchComponent onSearchResult={handleSearchResult}/>
                }
                onLogoClick={handleLogoClick}
                username={username}
            />
            
            <div className="dashboard-content">
                {showDashboard && (
                    <div className="dashboard-stats">
                        {renderWelcomeDashboard()}
                    </div>
                )}

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
                                        <h3><FaUser className="card-icon" /> {user.username}</h3>
                                    </div>
                                    <div className="card-content">
                                        <p><FaEnvelope className="card-icon" /> {user.email}</p>
                                        <p><FaUserTag className="card-icon" /> {user.role}</p>
                                        <p><FaCheckCircle className="card-icon" /> 
                                           Status: {user.verified ? 'Verified' : 'Not Verified'}
                                        </p>
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
                                        <h3><FaProjectDiagram className="card-icon" /> {project.title}</h3>
                                    </div>
                                    <div className="card-content">
                                        <p><FaUser className="card-icon" /> Client: {project.client_username}</p>
                                        <p><FaDollarSign className="card-icon" /> ${project.budget}</p>
                                        <p><FaClock className="card-icon" /> {project.projectStatus}</p>
                                        <p><FaCalendarAlt className="card-icon" /> {project.deadline}</p>
                                    </div>
                                    <div className="card-footer">
                                        {project.projectStatus === 'PENDING' && (
                                            <>
                                                <button 
                                                    className="card-button verify-button"
                                                    onClick={() => handleProjectApprove(project.id)}
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    className="card-button deny-button"
                                                    onClick={() => handleProjectDeny(project.id)}
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

                {showReports && <ReportManagement />}
            </div>
            
            <Footer />
        </div>
    );
};

export default AdminDashboard;