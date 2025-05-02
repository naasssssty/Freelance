import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const fetchReports = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/reports`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching reports:', error);
        throw error;
    }
};

export const updateReportStatus = async (reportId, status, adminResponse) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/reports/${reportId}`,
            null,
            {
                params: { status, adminResponse },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating report:', error);
        throw error;
    }
}; 