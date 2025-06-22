import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Fix import: `jwtDecode` is not a named export

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
        const response = await axios.get(`/api/project/available`, {
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
            `/api/project/${projectId}/apply/${username}`,
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
        const response = await axios.get(`/api/project/title/${title}`, {
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
        const response = await axios.get(`/api/project/freelancer/${username}`, {
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
        const response = await axios.get(`/api/project/freelancer/my-projects`, {
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
        const response = await axios.get(`/api/freelancer/${username}/my-applications`,
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
            `/api/project/${projectId}/complete`,
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

export const createReport = async (projectId, description) => {
    try {
        console.log('Creating report with:', { projectId, description });
        console.log('Making request to: /api/report');
        
        const response = await axios.post(
            `/api/report`,
            {
                projectId: parseInt(projectId),
                description: description
            },
            {
                headers: getAuthHeaders()
            }
        );
        console.log('Report created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating report:", error);
        console.error("Request URL:", error.config?.url);
        console.error("Request method:", error.config?.method);
        console.error("Request headers:", error.config?.headers);
        console.error("Request data:", error.config?.data);
        throw error.response ? error.response.data : error;
    }
};

// Update the applyForProject function to handle CV uploads
export const applyForProjectWithCV = async (projectId, coverLetter, cvFile) => {
    try {
        const { token, username } = getTokenAndDecode();
        if (!token) {
            throw new Error('No authentication token found');
        }

        const formData = new FormData();
        formData.append('coverLetter', coverLetter);
        if (cvFile) {
            formData.append('cvFile', cvFile);
        }

        const response = await fetch(`/api/project/${projectId}/apply/${username}/with-cv`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit application');
        }

        return await response.json();
    } catch (error) {
        console.error('Error applying for project with CV:', error);
        throw error;
    }
};

// New function for getting dashboard statistics
export const getDashboardStats = async () => {
    try {
        const { token, username } = getTokenAndDecode();
        if (!token) {
            throw new Error('No authentication token found');
        }

        // Get all data in parallel using axios with relative URLs
        const [availableProjectsResponse, applicationsResponse, projectsResponse] = await Promise.allSettled([
            axios.get('/api/project/available', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            axios.get(`/api/freelancer/${username}/my-applications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            axios.get('/api/project/freelancer/my-projects', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        let stats = {
            totalAvailableProjects: 0,
            myApplications: 0,
            myActiveProjects: 0,
            completedProjects: 0,
            pendingApplications: 0,
            approvedApplications: 0,
            rejectedApplications: 0,
            totalEarnings: 0
        };

        // Process available projects
        if (availableProjectsResponse.status === 'fulfilled' && availableProjectsResponse.value.status === 200) {
            const availableProjects = availableProjectsResponse.value.data;
            stats.totalAvailableProjects = availableProjects.length;
        }

        // Process applications
        if (applicationsResponse.status === 'fulfilled' && applicationsResponse.value.status === 200) {
            const applications = applicationsResponse.value.data;
            stats.myApplications = applications.length;
            stats.pendingApplications = applications.filter(a => a.applicationStatus === 'PENDING').length;
            stats.approvedApplications = applications.filter(a => a.applicationStatus === 'APPROVED').length;
            stats.rejectedApplications = applications.filter(a => a.applicationStatus === 'REJECTED').length;
        }

        // Process projects
        if (projectsResponse.status === 'fulfilled' && projectsResponse.value.status === 200) {
            const projects = projectsResponse.value.data;
            stats.myActiveProjects = projects.filter(p => p.projectStatus === 'IN_PROGRESS').length;
            stats.completedProjects = projects.filter(p => p.projectStatus === 'COMPLETED').length;
            
            // Calculate total earnings from completed projects
            stats.totalEarnings = projects
                .filter(p => p.projectStatus === 'COMPLETED')
                .reduce((total, project) => total + (project.budget || 0), 0);
        }

        return stats;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};
