//auth.jsx

import axios from "axios";

// Create an instance of Axios with default configuration for relative paths
const apiClient = axios.create({
    headers: {
        "Content-Type": "application/json",
    },
});

// Login API call
export const login = async (credentials) => {
    try {
        const response = await apiClient.post("/api/login", credentials);
        return response; // Return the entire response object
    } catch (error) {
        throw error.response ? error.response.data : error; // Throw the error message from the server
    }
};

// Register API call
export const register = async (userData) => {
    try {
        const response = await apiClient.post("/api/register", userData);
        return response.data; // Return the response data
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

// Add a function to store and retrieve tokens if needed
export const setAuthToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common["Authorization"];
    }
};