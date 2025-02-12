import axios from 'axios';

const API_URL = 'http://localhost:8080'; // ή όποιο είναι το API URL σας

// Load Users List
export const loadUsersList = async () => {
    try {
        const response = await axios.get(`${API_URL}/user/all`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error loading users:", error);
        throw error;
    }
};

// Load Projects List
export const loadProjectsList = async () => {
    try {
        const response = await axios.get(`${API_URL}/project/allProjects`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error loading projects:", error);
        throw error;
    }
};

// Handle Verify User
export const handleVerify = async (username, verify, dispatch, usersList) => {
    try {
        await axios.put(`${API_URL}/user/${username}/verify`, verify, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        // Ενημερώνουμε το state με τη νέα λίστα χρηστών
        const updatedUsersList = usersList.map(user => {
            if (user.username === username) {
                return { ...user, verified: true };
            }
            return user;
        });

        // Dispatch την ενημερωμένη λίστα
        dispatch({ type: "SET_USERS_LIST", payload: updatedUsersList });

    } catch (error) {
        console.error("Error verifying user:", error);
        throw error;
    }
};

// Handle Approve Project
export const handleApproveProject = async (projectId, dispatch, projectsList) => {
    try {
        await axios.put(`${API_URL}/project/${projectId}/approve`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const updatedProjectsList = projectsList.map(project => {
            if (project.id === projectId) {
                return { ...project, projectStatus: 'APPROVED' };
            }
            return project;
        });

        dispatch({ type: "SET_PROJECTS_LIST", payload: updatedProjectsList });
    } catch (error) {
        console.error("Error approving project:", error);
        throw error;
    }
};

// Handle Deny Project
export const handleDenyProject = async (projectId, dispatch, projectsList) => {
    try {
        await axios.put(`${API_URL}/project/${projectId}/deny`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const updatedProjectsList = projectsList.map(project => {
            if (project.id === projectId) {
                return { ...project, projectStatus: 'DENIED' };
            }
            return project;
        });

        dispatch({ type: "SET_PROJECTS_LIST", payload: updatedProjectsList });
    } catch (error) {
        console.error("Error denying project:", error);
        throw error;
    }
}; 