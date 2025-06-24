import React, { useState, useEffect, useCallback } from "react";
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
    getDashboardStats,
} from "../services/FreelancerServices";
import { useDispatch, useSelector } from "react-redux";
import AvailableProjectCard from '../components/AvailableProjectCard';
import FreelancerProjectCard from '../components/FreelancerProjectCard';
import ApplicationCard from '../components/ApplicationCard';
import SearchedProjectCard from '../components/SearchedProjectCard';
import Footer from '../components/Footer';
// eslint-disable-next-line no-unused-vars
import { FaProjectDiagram, FaClipboardList, FaCheckCircle, FaUser, FaClock, FaCalendarAlt, FaDollarSign, FaFileAlt, FaSpinner } from 'react-icons/fa';
import { jwtDecode } from "jwt-decode";

const FreelancerDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Enhanced state management
    const [showAvailableProjects, setShowAvailableProjects] = useState(false);
    const [showMyApplications, setShowMyApplications] = useState(false);
    const [showMyProjects, setShowMyProjects] = useState(false);
    const [searchedProject, setSearchedProject] = useState(null);
    
    // Loading states for different sections
    const [loadingStates, setLoadingStates] = useState({
        availableProjects: false,
        myApplications: false,
        myProjects: false,
        dashboardStats: true,
        initialLoad: true
    });

    // Dashboard state persistence
    const [dashboardState, setDashboardState] = useState(() => {
        const saved = sessionStorage.getItem('freelancerDashboardState');
        return saved ? JSON.parse(saved) : {
            activeSection: 'welcome',
            lastRefresh: null,
            isFirstLogin: !localStorage.getItem('freelancerDashboardVisited')
        };
    });

    const { availableProjects } = useSelector((state) => state.projects);
    const { myFApplications } = useSelector((state) => state.applications);
    const { myFProjects } = useSelector((state) => state.projects);

    // Enhanced dashboard stats with loading state
    const [dashboardStats, setDashboardStats] = useState({
        totalAvailableProjects: 0,
        myApplications: 0,
        myActiveProjects: 0,
        completedProjects: 0,
        pendingApplications: 0,
        approvedApplications: 0
    });

    // Get username from token
    const getUsername = () => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            return decoded.sub;
        }
        return '';
    };

    const username = getUsername();

    // Save dashboard state to session storage
    const saveDashboardState = useCallback((newState) => {
        const updatedState = { ...dashboardState, ...newState };
        setDashboardState(updatedState);
        sessionStorage.setItem('freelancerDashboardState', JSON.stringify(updatedState));
    }, [dashboardState]);

    // Initialize dashboard data with enhanced stats loading
    const initializeDashboard = useCallback(async () => {
        try {
            setLoadingStates(prev => ({ ...prev, dashboardStats: true }));

            // Load dashboard stats using the new service
            const statsPromise = getDashboardStats();
            
            // Load all data in parallel for better performance
            const [statsData, availableProjectsData, applicationsData, projectsData] = await Promise.allSettled([
                statsPromise,
                loadAvailableProjects(),
                loadMyApplications(),
                loadMyProjects()
            ]);

            // Update dashboard stats first for immediate feedback
            if (statsData.status === 'fulfilled') {
                setDashboardStats(statsData.value);
            }

            // Dispatch successful results
            if (availableProjectsData.status === 'fulfilled') {
                dispatch({ type: "SET_AVAILABLE_PROJECTS", payload: availableProjectsData.value });
            }
            if (applicationsData.status === 'fulfilled') {
                dispatch({ type: "SET_MY_APPLICATIONS_F", payload: applicationsData.value });
            }
            if (projectsData.status === 'fulfilled') {
                dispatch({ type: "SET_MY_FPROJECTS", payload: projectsData.value });
            }

            // Mark first login as complete
            if (dashboardState.isFirstLogin) {
                localStorage.setItem('freelancerDashboardVisited', 'true');
                saveDashboardState({ isFirstLogin: false });
            }

        } catch (error) {
            console.error("Error initializing dashboard:", error);
        } finally {
            setLoadingStates(prev => ({ 
                ...prev, 
                dashboardStats: false, 
                initialLoad: false 
            }));
        }
    }, [dispatch, dashboardState.isFirstLogin, saveDashboardState]);

    // Enhanced stats calculation with real-time updates - Keep as fallback
    useEffect(() => {
        const calculateStats = () => {
            const stats = {
                totalAvailableProjects: availableProjects?.length || 0,
                myApplications: myFApplications?.length || 0,
                myActiveProjects: myFProjects?.filter(p => p.projectStatus === 'IN_PROGRESS')?.length || 0,
                completedProjects: myFProjects?.filter(p => p.projectStatus === 'COMPLETED')?.length || 0,
                pendingApplications: myFApplications?.filter(a => a.applicationStatus === 'PENDING')?.length || 0,
                approvedApplications: myFApplications?.filter(a => a.applicationStatus === 'APPROVED')?.length || 0
            };
            
            // Only update if we don't have fresh stats from the API
            setDashboardStats(prevStats => {
                if (prevStats.totalAvailableProjects === 0 && prevStats.myApplications === 0) {
                    return stats;
                }
                return prevStats;
            });
        };

        calculateStats();
    }, [availableProjects, myFApplications, myFProjects]);

    // Auto-refresh data every 3 minutes for real-time updates
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                // Refresh stats in background without loading state
                const freshStats = await getDashboardStats();
                setDashboardStats(freshStats);
            } catch (error) {
                console.error("Error refreshing dashboard stats:", error);
            }
        }, 3 * 60 * 1000); // 3 minutes

        return () => clearInterval(interval);
    }, []);

    // Initialize dashboard on mount and handle refresh
    useEffect(() => {
        const handleInitialization = async () => {
            // For fresh login, always show welcome screen first
            if (dashboardState.isFirstLogin) {
                setShowAvailableProjects(false);
                setShowMyApplications(false);
                setShowMyProjects(false);
                setSearchedProject(null);
            } else {
                // Restore previous state if not first login
                const { activeSection } = dashboardState;
                if (activeSection !== 'welcome') {
                    switch (activeSection) {
                        case 'availableProjects':
                            setShowAvailableProjects(true);
                            break;
                        case 'myApplications':
                            setShowMyApplications(true);
                            break;
                        case 'myProjects':
                            setShowMyProjects(true);
                            break;
                        default:
                            break;
                    }
                }
            }

            await initializeDashboard();
        };

        handleInitialization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dashboardState.isFirstLogin]);

    const handleSearchResult = (result) => {
        setSearchedProject(result);
        setShowAvailableProjects(false);
        setShowMyApplications(false);
        setShowMyProjects(false);
        saveDashboardState({ activeSection: 'search' });
    };

    const handleLoadAvailableProjects = async () => {
        try {
            setLoadingStates(prev => ({ ...prev, availableProjects: true }));
            
            const projects = await loadAvailableProjects();
            dispatch({ type: "SET_AVAILABLE_PROJECTS", payload: projects });
            
            // Smooth transition
            setSearchedProject(null);
            setShowMyProjects(false);
            setShowMyApplications(false);
            
            // Small delay for smooth transition
            setTimeout(() => {
                setShowAvailableProjects(true);
            }, 100);
            
            saveDashboardState({ activeSection: 'availableProjects' });
        } catch (error) {
            console.error("Error loading available projects:", error);
        } finally {
            setLoadingStates(prev => ({ ...prev, availableProjects: false }));
        }
    };

    const handleLoadMyProjects = async () => {
        try {
            setLoadingStates(prev => ({ ...prev, myProjects: true }));
            
            const projects = await loadMyProjects();
            dispatch({type: "SET_MY_FPROJECTS", payload: projects});
            
            // Smooth transition
            setShowAvailableProjects(false);
            setShowMyApplications(false);
            setSearchedProject(null);
            
            // Small delay for smooth transition
            setTimeout(() => {
                setShowMyProjects(true);
            }, 100);
            
            saveDashboardState({ activeSection: 'myProjects' });
        } catch (error) {
            console.log("Error loading your projects:", error);
        } finally {
            setLoadingStates(prev => ({ ...prev, myProjects: false }));
        }
    };

    const handleLoadMyApplications = async () => {
        try {
            setLoadingStates(prev => ({ ...prev, myApplications: true }));
            
            const applications = await loadMyApplications();
            dispatch({ type: "SET_MY_APPLICATIONS_F", payload: applications });
            
            // Smooth transition
            setShowAvailableProjects(false);
            setSearchedProject(null);
            setShowMyProjects(false);
            
            // Small delay for smooth transition
            setTimeout(() => {
                setShowMyApplications(true);
            }, 100);
            
            saveDashboardState({ activeSection: 'myApplications' });
        } catch (error) {
            console.error("Error loading your applications:", error);
            alert("Failed to load your applications");
        } finally {
            setLoadingStates(prev => ({ ...prev, myApplications: false }));
        }
    };

    const handleLogout = () => {
        // Clear all stored state on logout
        sessionStorage.removeItem('freelancerDashboardState');
        localStorage.removeItem('freelancerDashboardVisited');
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleLogoClick = () => {
        // Smooth transition to welcome screen
        setShowAvailableProjects(false);
        setSearchedProject(null);
        setShowMyProjects(false);
        setShowMyApplications(false);
        saveDashboardState({ activeSection: 'welcome' });
    };

    // Enhanced loading component
    const LoadingSpinner = ({ text = "Loading..." }) => (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '40px',
            flexDirection: 'column',
            gap: '15px'
        }}>
            <FaSpinner style={{ 
                animation: 'spin 1s linear infinite',
                fontSize: '2rem',
                color: '#2b85c2'
            }} />
            <span style={{ color: '#666', fontSize: '1rem' }}>{text}</span>
        </div>
    );

    const FreelancerMenuOptions = [
        { label: "Browse Projects", link: "#", onClick: handleLoadAvailableProjects },
        { label: "My Applications", link: "#", onClick: handleLoadMyApplications },
        { label: "My Projects", link: "#", onClick: handleLoadMyProjects },
        { label: "Logout", link: "#", onClick: handleLogout },
    ];

    // Show initial loading screen
    if (loadingStates.initialLoad) {
        return (
            <div className="dashboard-layout">
                <Header
                    menuOptions={FreelancerMenuOptions}
                    searchComponent={<FreelancerSearchComponent onSearchResult={handleSearchResult} />}
                    onLogoClick={handleLogoClick}
                    username={username}
                />
                <div className="dashboard-container">
                    <LoadingSpinner text="Initializing your dashboard..." />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Header
                menuOptions={FreelancerMenuOptions}
                searchComponent={<FreelancerSearchComponent onSearchResult={handleSearchResult} />}
                onLogoClick={handleLogoClick}
                username={username}
            />
            <div className="dashboard-container">
                {/* Enhanced Welcome Dashboard Section */}
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
                                    {loadingStates.dashboardStats ? (
                                        <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                                    ) : (
                                        <p>{dashboardStats.totalAvailableProjects}</p>
                                    )}
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <FaClipboardList />
                                </div>
                                <div className="stat-content">
                                    <h3>My Applications</h3>
                                    {loadingStates.dashboardStats ? (
                                        <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                                    ) : (
                                        <div>
                                            <p>{dashboardStats.myApplications}</p>
                                            <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                                {dashboardStats.pendingApplications} pending, {dashboardStats.approvedApplications} approved
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <FaCheckCircle />
                                </div>
                                <div className="stat-content">
                                    <h3>Active Projects</h3>
                                    {loadingStates.dashboardStats ? (
                                        <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                                    ) : (
                                        <div>
                                            <p>{dashboardStats.myActiveProjects}</p>
                                            <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                                {dashboardStats.completedProjects} completed
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Additional stats row */}
                        {!loadingStates.dashboardStats && (dashboardStats.totalEarnings > 0 || dashboardStats.completedProjects > 0) && (
                            <div className="stats-grid" style={{ marginTop: '20px' }}>
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <FaDollarSign />
                                    </div>
                                    <div className="stat-content">
                                        <h3>Total Earnings</h3>
                                        <p className="earnings">${dashboardStats.totalEarnings?.toLocaleString() || 0}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <FaClock />
                                    </div>
                                    <div className="stat-content">
                                        <h3>Success Rate</h3>
                                        <p className={
                                            dashboardStats.myApplications > 0 
                                                ? (() => {
                                                    const rate = Math.round((dashboardStats.approvedApplications / dashboardStats.myApplications) * 100);
                                                    return rate >= 70 ? 'success-rate-high' : rate >= 40 ? 'success-rate-medium' : 'success-rate-low';
                                                })()
                                                : ''
                                        }>
                                            {dashboardStats.myApplications > 0 
                                                ? Math.round((dashboardStats.approvedApplications / dashboardStats.myApplications) * 100)
                                                : 0
                                            }%
                                        </p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <FaCalendarAlt />
                                    </div>
                                    <div className="stat-content">
                                        <h3>Last Updated</h3>
                                        <p className="time-display">
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Quick action tips */}
                        <div style={{ 
                            marginTop: '30px', 
                            padding: '20px', 
                            background: 'rgba(255, 255, 255, 0.1)', 
                            borderRadius: '10px',
                            textAlign: 'center'
                        }}>
                            <h3 style={{ color: '#333', marginBottom: '10px' }}>Quick Tips</h3>
                            <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                {dashboardStats.myApplications === 0 
                                    ? "Start by browsing available projects and submitting your first application!"
                                    : dashboardStats.myActiveProjects === 0 
                                    ? "Great! You have applications pending. Check back regularly for updates."
                                    : "You're doing great! Keep up the excellent work on your active projects."
                                }
                            </p>
                        </div>
                    </div>
                )}

                {/* Search Results Section */}
                {searchedProject && (
                    <div className="search-result-container">
                        <h2>Search Result</h2>
                        <SearchedProjectCard project={searchedProject} />
                    </div>
                )}

                {/* Available Projects Section with Loading */}
                {loadingStates.availableProjects && (
                    <LoadingSpinner text="Loading available projects..." />
                )}
                {showAvailableProjects && !loadingStates.availableProjects && availableProjects.length > 0 && (
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

                {/* My Applications Section with Loading */}
                {loadingStates.myApplications && (
                    <LoadingSpinner text="Loading your applications..." />
                )}
                {showMyApplications && !loadingStates.myApplications && myFApplications.length > 0 && (
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

                {/* My Projects Section with Loading */}
                {loadingStates.myProjects && (
                    <LoadingSpinner text="Loading your projects..." />
                )}
                {showMyProjects && !loadingStates.myProjects && myFProjects.length > 0 && (
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