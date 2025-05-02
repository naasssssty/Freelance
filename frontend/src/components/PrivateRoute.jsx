//PrivateRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import NoPage from "../pages/NoPage"; // Import the NoPage component

export const PrivateRoute = ({ children, role }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        // If no token, redirect to login
        return <Navigate to="/login" />;
    }

    try {
        // Decode the token
        const decoded = jwtDecode(token);

        // Check if the role matches and if the user is verified
        if (role && decoded.role !== role) {
            return <Navigate to="/" />; // Redirect if the role doesn't match
        }

        if (!decoded.isVerified) {
            // If the user is not verified, render NoPage
            return <NoPage />;
        }

        return children; // Render the child component if everything is valid
    } catch (err) {
        console.error("Invalid token:", err);
        return <Navigate to="/login" />; // Redirect to login on error
    }
};
