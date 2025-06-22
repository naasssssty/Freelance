import axios from 'axios';
import * as ReportServices from '../ReportServices';

// Mock axios
jest.mock('axios');

// Mock console
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
});

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('ReportServices', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue('mock.jwt.token');
    });

    describe('fetchReports', () => {
        it('should successfully fetch reports', async () => {
            const mockReports = [
                {
                    id: 1,
                    projectId: 123,
                    description: 'Report description 1',
                    status: 'PENDING',
                    reporterUsername: 'freelancer1',
                    createdAt: '2024-01-01T10:00:00Z'
                },
                {
                    id: 2,
                    projectId: 456,
                    description: 'Report description 2',
                    status: 'RESOLVED',
                    reporterUsername: 'client1',
                    createdAt: '2024-01-02T10:00:00Z'
                }
            ];
            const mockResponse = { data: mockReports };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await ReportServices.fetchReports();

            expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
            expect(axios.get).toHaveBeenCalledWith('/api/report', {
                headers: {
                    'Authorization': 'Bearer mock.jwt.token',
                    'Content-Type': 'application/json',
                },
            });
            expect(result).toEqual(mockReports);
        });

        it('should handle fetch reports error', async () => {
            const mockError = new Error('Server error');
            
            axios.get.mockRejectedValue(mockError);

            await expect(ReportServices.fetchReports()).rejects.toThrow(mockError);
            expect(console.error).toHaveBeenCalledWith('Error fetching reports:', mockError);
        });

        it('should handle missing token', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            const mockResponse = { data: [] };
            
            axios.get.mockResolvedValue(mockResponse);

            await ReportServices.fetchReports();

            expect(axios.get).toHaveBeenCalledWith('/api/report', {
                headers: {
                    'Authorization': 'Bearer null',
                    'Content-Type': 'application/json',
                },
            });
        });

        it('should handle empty reports response', async () => {
            const mockResponse = { data: [] };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await ReportServices.fetchReports();

            expect(result).toEqual([]);
        });

        it('should handle network errors', async () => {
            const networkError = {
                message: 'Network Error',
                response: {
                    status: 500,
                    data: { error: 'Internal Server Error' }
                }
            };
            
            axios.get.mockRejectedValue(networkError);

            await expect(ReportServices.fetchReports()).rejects.toEqual(networkError);
            expect(console.error).toHaveBeenCalledWith('Error fetching reports:', networkError);
        });
    });

    describe('updateReportStatus', () => {
        it('should successfully update report status', async () => {
            const reportId = 123;
            const status = 'RESOLVED';
            const adminResponse = 'Issue has been resolved';
            const mockResponse = {
                data: {
                    id: reportId,
                    status: status,
                    adminResponse: adminResponse,
                    updatedAt: '2024-01-01T12:00:00Z'
                }
            };
            
            axios.put.mockResolvedValue(mockResponse);

            const result = await ReportServices.updateReportStatus(reportId, status, adminResponse);

            expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
            expect(axios.put).toHaveBeenCalledWith('/api/report/123', {
                status: status,
                adminResponse: adminResponse
            }, {
                headers: {
                    'Authorization': 'Bearer mock.jwt.token',
                    'Content-Type': 'application/json',
                },
            });
            expect(result).toEqual(mockResponse.data);
        });

        it('should handle update report status error', async () => {
            const reportId = 123;
            const status = 'RESOLVED';
            const adminResponse = 'Issue resolved';
            const mockError = new Error('Update failed');
            
            axios.put.mockRejectedValue(mockError);

            await expect(ReportServices.updateReportStatus(reportId, status, adminResponse)).rejects.toThrow(mockError);
            expect(console.error).toHaveBeenCalledWith('Error updating report status:', mockError);
        });

        it('should handle different status values', async () => {
            const reportId = 123;
            const adminResponse = 'Admin response';
            const statusValues = ['PENDING', 'RESOLVED', 'REJECTED', 'IN_PROGRESS'];

            for (const status of statusValues) {
                const mockResponse = { data: { id: reportId, status: status } };
                axios.put.mockResolvedValue(mockResponse);

                const result = await ReportServices.updateReportStatus(reportId, status, adminResponse);

                expect(axios.put).toHaveBeenCalledWith(`/report/${reportId}`, {
                    status: status,
                    adminResponse: adminResponse
                }, expect.any(Object));
                expect(result).toEqual(mockResponse.data);
            }
        });

        it('should handle empty admin response', async () => {
            const reportId = 123;
            const status = 'RESOLVED';
            const adminResponse = '';
            const mockResponse = { data: { id: reportId, status: status } };
            
            axios.put.mockResolvedValue(mockResponse);

            const result = await ReportServices.updateReportStatus(reportId, status, adminResponse);

            expect(axios.put).toHaveBeenCalledWith('/api/report/123', {
                status: status,
                adminResponse: ''
            }, expect.any(Object));
            expect(result).toEqual(mockResponse.data);
        });

        it('should handle null admin response', async () => {
            const reportId = 123;
            const status = 'RESOLVED';
            const adminResponse = null;
            const mockResponse = { data: { id: reportId, status: status } };
            
            axios.put.mockResolvedValue(mockResponse);

            const result = await ReportServices.updateReportStatus(reportId, status, adminResponse);

            expect(axios.put).toHaveBeenCalledWith('/api/report/123', {
                status: status,
                adminResponse: null
            }, expect.any(Object));
            expect(result).toEqual(mockResponse.data);
        });

        it('should handle different report IDs', async () => {
            const reportIds = [1, 999, 12345];
            const status = 'RESOLVED';
            const adminResponse = 'Fixed';

            for (const reportId of reportIds) {
                const mockResponse = { data: { id: reportId } };
                axios.put.mockResolvedValue(mockResponse);

                await ReportServices.updateReportStatus(reportId, status, adminResponse);

                expect(axios.put).toHaveBeenCalledWith(`/report/${reportId}`, expect.any(Object), expect.any(Object));
            }
        });

        it('should handle authorization errors', async () => {
            const reportId = 123;
            const status = 'RESOLVED';
            const adminResponse = 'Fixed';
            const authError = {
                response: {
                    status: 401,
                    data: { message: 'Unauthorized' }
                }
            };
            
            axios.put.mockRejectedValue(authError);

            await expect(ReportServices.updateReportStatus(reportId, status, adminResponse)).rejects.toEqual(authError);
            expect(console.error).toHaveBeenCalledWith('Error updating report status:', authError);
        });
    });

    describe('Token handling', () => {
        it('should use token from localStorage in all requests', async () => {
            const mockResponse = { data: {} };
            axios.get.mockResolvedValue(mockResponse);
            axios.put.mockResolvedValue(mockResponse);

            await ReportServices.fetchReports();
            await ReportServices.updateReportStatus(1, 'RESOLVED', 'Fixed');

            expect(localStorageMock.getItem).toHaveBeenCalledTimes(2);
            expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
        });

        it('should handle different token values', async () => {
            const tokens = ['token1', 'token2', 'very.long.jwt.token'];
            const mockResponse = { data: [] };

            for (const token of tokens) {
                localStorageMock.getItem.mockReturnValue(token);
                axios.get.mockResolvedValue(mockResponse);

                await ReportServices.fetchReports();

                expect(axios.get).toHaveBeenCalledWith('/api/report', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            }
        });
    });
});
