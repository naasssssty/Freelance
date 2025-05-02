//Footer.jsx

import React from 'react';
import '../styles/footer.css';

const Footer = () => {
    return (
        <div className="footer-content">
            <p>&copy; 2025 Freelance Platform</p>
            <div className="footer-links">
                <a href="#terms">Terms</a>
                <a href="#privacy">Privacy</a>
                <a href="#contact">Contact</a>
            </div>
        </div>
    );
};

export default Footer;