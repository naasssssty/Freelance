import { FaUserCircle } from "react-icons/fa";
import React from "react";
import logo from '../assets/logo.png';
import { Link } from "react-router-dom";

const Header = ({ menuOptions, searchComponent, onLogoClick }) => {
    return (
        <header className="header">
            <div className="inner_header">
                <div className="logo_container" onClick={onLogoClick}>
                    <img src={logo} alt="Logo" className="logo" />
                </div>

                {/* Επανατοποθέτηση του search component */}
                {searchComponent}

                <div className="navbar">
                    <nav>
                        <ul className="navigation">
                            {menuOptions.map((option, index) => (
                                <li key={index}>
                                    <button className="nav_button"
                                        onClick={(e) => {
                                            if (option.onClick) {
                                                option.onClick();
                                            } else if (option.link) {
                                                window.location.href = option.link;
                                            }
                                        }}
                                    >
                                        {option.label}
                                    </button>

                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>

            <div>
                <Link to="/profile">
                    <i className="profile_icon">
                        <FaUserCircle size={30}/>
                    </i>
                </Link>
            </div>
        </header>
    );
};

export default Header;