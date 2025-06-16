import axios from 'axios';

export const fetchReports = async () => {
    try {
        const response = await axios.get(`/api/reports`, {
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
            `/api/reports/${reportId}`,
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