import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Fix import: `jwtDecode` is not a named export

const API_BASE_URL = "http://localhost:8080";

// Utility: Retrieve token and decode username
const getTokenAndDecode = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Unauthorized. No token found.");

    const decoded = jwtDecode(token);
    const username = decoded?.sub;

    if (!username) throw new Error("Username not found in token.");
    return { token, username };
};

// Utility: Generate Authorization headers
const getAuthHeaders = () => {
    const { token } = getTokenAndDecode();
    return {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

// Load available projects for freelancers
export const loadAvailableProjects = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/project/available`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error("Error loading available projects:", error);
        throw error.response ? error.response.data : error;
    }
};

// Apply for a project
export const applyForProject = async (projectId, coverLetter) => {
    try {
        const { username } = getTokenAndDecode();
        if (!coverLetter || coverLetter.trim() === "") {
            throw new Error("Cover Letter cannot be empty.");
        }

        const response = await axios.post(
            `${API_BASE_URL}/project/${projectId}/apply/${username}`,
            coverLetter,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error("Error applying for project:", error);
        throw error.response ? error.response.data : error;
    }
};

// Search projects by title
export const searchProjectsByTitle = async (title) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/project/title/${title}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error("Error searching projects:", error);
        throw error.response ? error.response.data : error;
    }
};

// Get projects assigned to a freelancer
export const getAssignedProjects = async () => {
    try {
        const { username } = getTokenAndDecode();
        const response = await axios.get(`${API_BASE_URL}/project/freelancer/${username}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching assigned projects:", error);
        throw error.response ? error.response.data : error;
    }
};

// Load freelancer's projects
export const loadMyProjects = async () => {
    try {
        const { username } = getTokenAndDecode();
        const response = await axios.get(`${API_BASE_URL}/project/freelancer/${username}/my-projects`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching freelancer projects:", error);
        throw error.response ? error.response.data : error;
    }
};


export const loadMyApplications = async () => {
    try {
        const { token, username } = getTokenAndDecode();
        const response = await axios.get(`${API_BASE_URL}/freelancer/${username}/my-applications`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
        return response.data;
    } catch (error) {
        console.error("Error loading applications:", error);
        throw error.response ? error.response.data : error;
    }
};

export const handleCompleteProject = async (projectId) => {
    try {
        const { token } = getTokenAndDecode();
        const response = await axios.put(
            `http://localhost:8080/project/${projectId}/complete`,
            null,  // Request body (null since we don't need to send data)
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error completing project:", error);
        throw error.response ? error.response.data : error;
    }
};
