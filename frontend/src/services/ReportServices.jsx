import axios from 'axios';

export const fetchReports = async () => {
    try {
        const response = await axios.get('/api/report', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching reports:", error);
        throw error;
    }
};

export const updateReportStatus = async (reportId, status, adminResponse) => {
    try {
        const response = await axios.put(`/api/report/${reportId}`, {
            status: status,
            adminResponse: adminResponse
        }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating report status:", error);
        throw error;
    }
}; 