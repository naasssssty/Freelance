import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Utility function to handle token and decoding
const getTokenAndDecode = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Unauthorized. No token found.");

    const decoded = jwtDecode(token);
    const username = decoded?.sub;

    if (!username) throw new Error("Username not found in token.");
    return { token, username };
};

export const handlePostProject = async (project) => {
    try {
        const { token, username } = getTokenAndDecode();
        const response = await axios.post(
            `http://localhost:8080/project/${username}/post`,
            project,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error posting project:", error);
        alert('Failed to post the project.');
        throw error;
    }
};

export const loadMyApplications = async () => {
    try {
        const { token, username } = getTokenAndDecode();
        const response = await axios.get(
            `http://localhost:8080/client/${username}/my-applications`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error loading applications:", error);
        alert('Failed to load applications.');
        throw error;
    }
};

export const loadMyProjects = async () => {
    try {
        const { token, username } = getTokenAndDecode();
        console.log('Token:', token);
        console.log('Username:', username);
        console.log('URL:', `http://localhost:8080/project/${username}/my-projects`);
        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded);

        const response = await axios.get(
            `http://localhost:8080/project/${username}/my-projects`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Full error:", error);
        console.error("Error response:", error.response);
        console.error("Error loading projects:", error);
        alert('Failed to load projects.');
        throw error;
    }
};

export const handleAcceptApplication = async (applicationId) => {
    try {
        const { token } = getTokenAndDecode();
        const response = await axios.put(
            `http://localhost:8080/application/${applicationId}/approve`,
            null,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        alert(`Failed to accept application: ${error.response?.data?.message || error.message}`);
        throw error;
    }
};

export const handleRejectApplication = async (applicationId) => {
    try {
        const { token } = getTokenAndDecode();
        const response = await axios.put(
            `http://localhost:8080/application/${applicationId}/reject`,
            null,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        alert(`Failed to reject application: ${error.response?.data?.message || error.message}`);
        throw error;
    }
};
