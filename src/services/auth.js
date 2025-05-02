import axios from 'axios';

// Create an instance of Axios with default configuration
const apiClient = axios.create({
    baseURL: "http://localhost:8080", // Replace with your backend URL
    headers: {
        "Content-Type": "application/json",
    },
});

// Login API call
export const login = async (credentials) => {
    try {
        const response = await apiClient.post("/login", credentials);
        return response; // Return the entire response object
    } catch (error) {
        throw error.response ? error.response.data : error; // Throw the error message from the server
    }
};

// Register API call
export const register = async (userData) => {
    try {
        const response = await apiClient.post("/register", userData);
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

// Rest of your auth.js file 