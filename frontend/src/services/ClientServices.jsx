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
        const { token } = getTokenAndDecode();
        const response = await axios.post(
            `/api/project/post`,
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
            `/api/client/${username}/my-applications`,
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
        throw error;
    }
};

export const loadMyProjects = async () => {
    try {
        const { token } = getTokenAndDecode();
        const response = await axios.get(
            `/api/project/my-projects`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error loading projects:", error);
        throw error;
    }
};

export const handleAcceptApplication = async (applicationId) => {
    try {
        const { token } = getTokenAndDecode();
        const response = await axios.put(
            `/api/application/${applicationId}/approve`,
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
            `/api/application/${applicationId}/reject`,
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

// Download CV from an application
export const downloadCV = async (applicationId) => {
    try {
        // Απλά ανοίγουμε το URL σε νέο tab
        window.open(`/api/application/${applicationId}/download-cv`, '_blank');
        return true;
    } catch (error) {
        console.error("Error downloading CV:", error);
        alert("Failed to download CV. Please try again.");
        throw error;
    }
};

// Get client statistics
export const getClientStats = async () => {
    try {
        const { token } = getTokenAndDecode();
        const response = await axios.get(
            `/api/project/client/stats`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error loading client statistics:", error);
        throw error;
    }
};
