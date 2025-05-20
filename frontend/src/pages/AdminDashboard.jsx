// AdminDashboard.jsx

import {
    // eslint-disable-next-line
    // handleVerify δεν χρησιμοποιείται, οπότε το σχολιάζουμε
    // handleVerify,
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
// eslint-disable-next-line no-unused-vars
import jwtDecode from 'jwt-decode';
import axios from 'axios';

const AdminDashboard = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const username = localStorage.getItem('username');
    
    // Αποφεύγουμε εντελώς το useSelector προς το παρόν
    const [usersList, setUsersList] = useState([]);
    const [projectsList, setProjectsList] = useState([]);
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [usersError, setUsersError] = useState(null);
    const [projectsError, setProjectsError] = useState(null);
    const [showUsersList, setShowUsersList] = useState(true);
    const [showProjectsList, setShowProjectsList] = useState(true);
    const [searchedUser, setSearchedUser] = useState(null);
    const [activeTab, setActiveTab] = useState('users');
    const [showReports, setShowReports] = useState(false);
    const [showDashboard, setShowDashboard] = useState(true);

    // eslint-disable-next-line
    // getUsername δεν χρησιμοποιείται, οπότε το σχολιάζουμε
    // const getUsername = () => {
    //     const token = localStorage.getItem('token');
    //     if (token) {
    //         try {
    //             const decoded = jwtDecode(token);
    //             return decoded.sub || 'Admin';
    //         } catch (error) {
    //             console.error('Error decoding token:', error);
    //             return 'Admin';
    //         }
    //     }
    //     return 'Admin';
    // };

    console.log('Username from token:', username);

    // Add new state for statistics
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        pendingVerifications: 0,
        totalProjects: 0,
        pendingProjects: 0
    });

    // Φορτώνουμε τα δεδομένα απευθείας χωρίς να βασιζόμαστε στο Redux
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Φορτώνουμε τους χρήστες
                const usersData = await loadUsersList();
                setUsersList(usersData);
                setUsers(usersData);
                
                // Φορτώνουμε τα projects
                const projectsData = await loadProjectsList();
                setProjectsList(projectsData);
                setProjects(projectsData);
                
                // Υπολογίζουμε τα στατιστικά
                const pendingVerifications = usersData.filter(user => !user.verified && user.role === 'FREELANCER').length;
                const pendingProjects = projectsData.filter(project => project.projectStatus === 'PENDING').length;
                
                setDashboardStats({
                    totalUsers: usersData.length,
                    pendingVerifications,
                    totalProjects: projectsData.length,
                    pendingProjects
                });
            } catch (error) {
                console.error("Error loading initial data:", error);
                if (error.message.includes('users')) {
                    setUsersError(error.message);
                }
                if (error.message.includes('projects')) {
                    setProjectsError(error.message);
                }
            }
        };
        
        loadInitialData();
    }, []);

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
            setUsersList(usersData);
            setShowUsersList(true);
            setShowProjectsList(false);
            setShowReports(false);
            setShowDashboard(false);
        } catch (error) {
            console.error("Error loading users:", error);
            setUsersError(error.message);
        }
    };

    const handleLoadProjects = async () => {
        try {
            const projectsData = await loadProjectsList();
            setProjects(projectsData);
            setProjectsList(projectsData);
            setShowProjectsList(true);
            setShowUsersList(false);
            setShowReports(false);
            setShowDashboard(false);
        } catch (error) {
            console.error("Error loading projects:", error);
            setProjectsError(error.message);
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
            label: "Dashboard",
            onClick: () => {
                setShowDashboard(true);
                setShowUsersList(false);
                setShowProjectsList(false);
                setShowReports(false);
            }
        },
        {
            label: "Users",
            onClick: handleLoadUsers
        },
        {
            label: "Projects",
            onClick: handleLoadProjects
        },
        {
            label: "Reports",
            onClick: () => {
                setShowReports(true);
                setShowUsersList(false);
                setShowProjectsList(false);
                setShowDashboard(false);
            }
        },
        {
            label: "Logout",
            onClick: handleLogout
        }
    ];

    // Προσθέτουμε μια συνάρτηση για το renderWelcomeDashboard
    const renderWelcomeDashboard = () => {
        return (
            <div className="welcome-dashboard">
                <h1>Καλώς ήρθες, {username}!</h1>
                <div className="dashboard-stats-grid">
                    <div className="stat-card">
                        <FaUsers className="stat-icon" />
                        <div className="stat-content">
                            <h3>Συνολικοί Χρήστες</h3>
                            <p className="stat-number">{dashboardStats.totalUsers}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <FaCheckCircle className="stat-icon" />
                        <div className="stat-content">
                            <h3>Εκκρεμείς Επαληθεύσεις</h3>
                            <p className="stat-number">{dashboardStats.pendingVerifications}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <FaProjectDiagram className="stat-icon" />
                        <div className="stat-content">
                            <h3>Συνολικά Έργα</h3>
                            <p className="stat-number">{dashboardStats.totalProjects}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <FaClock className="stat-icon" />
                        <div className="stat-content">
                            <h3>Εκκρεμή Έργα</h3>
                            <p className="stat-number">{dashboardStats.pendingProjects}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Ορίζουμε τις επιλογές του μενού
    const handleVerifyUser = async (userId, verify) => {
        try {
            // Ενημερώνουμε τοπικά την κατάσταση για άμεση ανταπόκριση UI
            setUsersList(usersList.map(user => 
                user.id === userId ? { ...user, verified: verify } : user
            ));
            
            // Εκτελούμε το API call
            await handleVerify(userId, verify);
        } catch (error) {
            console.error("Error verifying user:", error);
            // Επαναφέρουμε την κατάσταση σε περίπτωση σφάλματος
            setUsersList(usersList);
        }
    };

    // Συνάρτηση για έγκριση έργου
    const handleProjectApprove = async (id) => {
        try {
            // Ενημερώνουμε τοπικά την κατάσταση
            setProjectsList(projectsList.map(project => 
                project.id === id ? { ...project, projectStatus: 'APPROVED' } : project
            ));
            
            // Εκτελούμε το API call
            await handleApproveProject(id);
        } catch (error) {
            console.error("Error approving project:", error);
            // Επαναφέρουμε την κατάσταση σε περίπτωση σφάλματος
            setProjectsList(projectsList);
        }
    };

    // Συνάρτηση για απόρριψη έργου
    const handleProjectDeny = async (id) => {
        try {
            // Ενημερώνουμε τοπικά την κατάσταση
            setProjectsList(projectsList.map(project => 
                project.id === id ? { ...project, projectStatus: 'DENIED' } : project
            ));
            
            // Εκτελούμε το API call
            await handleDenyProject(id);
        } catch (error) {
            console.error("Error denying project:", error);
            // Επαναφέρουμε την κατάσταση σε περίπτωση σφάλματος
            setProjectsList(projectsList);
        }
    };

    return (
        <div className="dashboard">
            <Header
                menuOptions={menuOptions}
                searchComponent={
                    <AdminSearchComponent onSearchResult={handleSearchResult}/>
                }
                onLogoClick={() => {
                    setShowDashboard(true);
                    setShowUsersList(false);
                    setShowProjectsList(false);
                    setShowReports(false);
                }}
                username={username}
            />
            
            <div className="dashboard-content">
                {showDashboard && renderWelcomeDashboard()}

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
                                                onClick={() => handleVerifyUser(user.id, true)}
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