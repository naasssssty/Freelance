//AdminServices.jsx

import axios from "axios";

export const loadUsersList = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
            'http://localhost:8080/user/all',
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error loading users list:", error);
        throw error.response ? error.response.data : error;
    }
}

export const loadProjectsList = async () => {
    try {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        const response = await axios.get(
            'http://localhost:8080/project/allProjects',
            {
                headers: {
                    'Authorization': `Bearer ${token}`, // Pass the token
                    'Content-Type': 'application/json', // Ensure JSON format
                }
            }
        );
        return response.data; // Return the response if needed
    } catch (error) {
        console.error("Error loading projects:", error);
        alert('Failed to load the projects.');
        throw error;
    }
};

export const handleVerify = async (username, verify) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
            `http://localhost:8080/user/${username}/verify`,
            verify,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to ${verify ? 'verify' : 'unverify'} user:`, error);
        throw error;
    }
};

export const handleApproveProject = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
            `http://localhost:8080/project/${id}/approve`,
            true,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error approving project:", error);
        throw error;
    }
};

export const handleDenyProject = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
            `http://localhost:8080/project/${id}/deny`,
            false,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error rejecting project:", error);
        throw error;
    }
};
