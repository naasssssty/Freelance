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

export const handleVerify = async (username) => {
    try {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        const response = await axios.put(
            `http://localhost:8080/user/${username}/verify`, // Backend API endpoint
            true, // Payload (boolean `true` to verify)
            {
                headers: {
                    'Authorization': `Bearer ${token}`, // Pass the token
                    'Content-Type': 'application/json', // Ensure JSON format
                }
            }
        );
        alert(`User ${username} verified successfully.`);
        return response.data; // Return the response if needed
    } catch (error) {
        console.error("Error verifying user:", error);
        alert(`Failed to verify user ${username}.`);
        throw error;
    }
};

export const handleApproveProject = async (id) => {
    try {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        const response = await axios.put(
            `http://localhost:8080/project/${id}/approve`, // Backend API endpoint
            true, // Payload (boolean `true` to verify)
            {
                headers: {
                    'Authorization': `Bearer ${token}`, // Pass the token
                    'Content-Type': 'application/json', // Ensure JSON format
                }
            }
        );
        alert(`Project ${id} approved successfully.`);
        return response.data; // Return the response if needed
    } catch (error) {
        console.error("Error approving project:", error);
        alert(`Failed to approve project ${id}.`);
        throw error;
    }
};
export const handleDenyProject = async (id) => {
    try {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        const response = await axios.put(
            `http://localhost:8080/project/${id}/deny`, // Backend API endpoint
            false, // Payload (boolean `false` to reject)
            {
                headers: {
                    'Authorization': `Bearer ${token}`, // Pass the token
                    'Content-Type': 'application/json', // Ensure JSON format
                }
            }
        );
        alert(`Project ${id} rejected successfully.`);
        return response.data; // Return the response if needed
    } catch (error) {
        console.error("Error rejecting project:", error);
        alert(`Failed to reject project ${id}.`);
        throw error;
    }
};