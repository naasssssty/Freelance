import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBriefcase, FaUserTie, FaShieldAlt, FaSearch, FaFileContract, FaCheckCircle } from 'react-icons/fa';

import '../styles/homePage.css';

const HomePage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <FaBriefcase />,
            title: "Post Projects",
            description: "Clients can post their projects and find the perfect freelancer",
            role: "Client"
        },
        {
            icon: <FaUserTie />,
            title: "Find Work",
            description: "Freelancers can browse and apply to available projects",
            role: "Freelancer"
        },
        {
            icon: <FaShieldAlt />,
            title: "Quality Assurance",
            description: "Admin verification ensures project and freelancer quality",
            role: "Admin"
        }
    ];

    const howItWorks = [
        {
            icon: <FaFileContract />,
            title: "1. Project Submission",
            description: "Clients submit detailed project requirements"
        },
        {
            icon: <FaCheckCircle />,
            title: "2. Admin Verification",
            description: "Projects are verified by admin before going live"
        },
        {
            icon: <FaSearch />,
            title: "3. Freelancer Applications",
            description: "Qualified freelancers can browse and apply"
        }
    ];

    return (
        <div className="home-page">
            <div className="background-overlay" />
            <div className="background-pattern" />

            <motion.section
                className="hero-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1>Welcome to FreelancerProject</h1>
                <p>Connect with top freelancers and clients for your next project</p>

                <div className="cta-buttons">
                    <motion.button
                        className="cta-button primary"
                        onClick={() => navigate('/register')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Get Started
                    </motion.button>
                    <motion.button
                        className="cta-button secondary"
                        onClick={() => navigate('/login')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Login
                    </motion.button>
                </div>
            </motion.section>

            <section className="features-section">
                <h2>Platform Features</h2>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="feature-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                            <span className="role-badge">{feature.role}</span>
                        </motion.div>
                    ))}
                </div>
            </section>
            <section className="how-it-works-section">
                <h2>How It Works</h2>
                <div className="process-grid">
                    {howItWorks.map((step, index) => (
                        <motion.div
                            key={index}
                            className="process-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.3 }}
                        >
                            <div className="process-icon">{step.icon}</div>
                            <h3>{step.title}</h3>
                            <p>{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;