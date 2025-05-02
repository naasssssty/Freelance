//NoPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/nopage.css';

const NoPage = () => {
    const navigate = useNavigate();

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="verification-pending-container">
            <div className="verification-card">
                <h1>Verification Pending</h1>
                <div className="verification-icon">
                    <i className="fas fa-user-clock"></i>
                </div>
                <p className="main-message">
                    Thank you for registering! Your account is currently pending verification.
                </p>
                <div className="info-text">
                    <p>Our administrators will review your account shortly.</p>
                    <p>You will be able to access the platform once your account is verified.</p>
                </div>
                <div className="steps">
                    <p>What happens next?</p>
                    <ol>
                        <li>Admin reviews your registration</li>
                        <li>Your account gets verified</li>
                        <li>You can log in and start using the platform</li>
                    </ol>
                </div>
                <button onClick={handleBackToLogin} className="back-to-login">
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default NoPage;
