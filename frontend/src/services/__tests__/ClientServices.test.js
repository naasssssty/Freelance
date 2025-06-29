import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import * as ClientServices from '../ClientServices';

// Mock dependencies
jest.mock('axios');
jest.mock('jwt-decode');

// Mock console and alert
const originalConsoleError = console.error;
const originalAlert = window.alert;

beforeAll(() => {
    console.error = jest.fn();
    window.alert = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
    window.alert = originalAlert;
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

describe('ClientServices', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue('mock.jwt.token');
        jwtDecode.mockReturnValue({ sub: 'testuser' });
    });

    describe('handlePostProject', () => {
        it('should successfully post a project', async () => {
            const mockProject = {
                title: 'Test Project',
                description: 'Test Description',
                budget: 1000
            };
            const mockResponse = { data: { id: 1, ...mockProject } };
            
            axios.post.mockResolvedValue(mockResponse);

            const result = await ClientServices.handlePostProject(mockProject);

            expect(axios.post).toHaveBeenCalledWith(
                '/api/project/post',
                mockProject,
                {
                    headers: {
                        'Authorization': 'Bearer mock.jwt.token',
                        'Content-Type': 'application/json',
                    },
                }
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('should handle post project error', async () => {
            const mockProject = { title: 'Test Project' };
            const mockError = new Error('Network error');
            
            axios.post.mockRejectedValue(mockError);

            await expect(ClientServices.handlePostProject(mockProject)).rejects.toThrow(mockError);
            expect(console.error).toHaveBeenCalledWith('Error posting project:', mockError);
            expect(window.alert).toHaveBeenCalledWith('Failed to post the project.');
        });
    });

    describe('loadMyApplications', () => {
        it('should successfully load applications', async () => {
            const mockApplications = [{ id: 1, status: 'PENDING' }];
            const mockResponse = { data: mockApplications };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await ClientServices.loadMyApplications();

            expect(axios.get).toHaveBeenCalledWith(
                '/api/client/testuser/my-applications',
                {
                    headers: {
                        'Authorization': 'Bearer mock.jwt.token',
                        'Content-Type': 'application/json',
                    },
                }
            );
            expect(result).toEqual(mockApplications);
        });

        it('should handle load applications error', async () => {
            const mockError = new Error('Network error');
            axios.get.mockRejectedValue(mockError);

            await expect(ClientServices.loadMyApplications()).rejects.toThrow(mockError);
            expect(console.error).toHaveBeenCalledWith('Error loading applications:', mockError);
        });
    });

    describe('loadMyProjects', () => {
        it('should successfully load projects', async () => {
            const mockProjects = [{ id: 1, title: 'Test Project' }];
            const mockResponse = { data: mockProjects };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await ClientServices.loadMyProjects();

            expect(axios.get).toHaveBeenCalledWith(
                '/api/project/my-projects',
                {
                    headers: {
                        'Authorization': 'Bearer mock.jwt.token',
                        'Content-Type': 'application/json',
                    },
                }
            );
            expect(result).toEqual(mockProjects);
        });
    });

    describe('handleAcceptApplication', () => {
        it('should successfully accept application', async () => {
            const applicationId = 123;
            const mockResponse = { data: { message: 'Application accepted' } };
            
            axios.put.mockResolvedValue(mockResponse);

            const result = await ClientServices.handleAcceptApplication(applicationId);

            expect(axios.put).toHaveBeenCalledWith(
                '/api/application/123/approve',
                null,
                {
                    headers: {
                        'Authorization': 'Bearer mock.jwt.token',
                        'Content-Type': 'application/json',
                    },
                }
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('should handle accept application error', async () => {
            const applicationId = 123;
            const mockError = {
                response: { data: { message: 'Application not found' } }
            };
            
            axios.put.mockRejectedValue(mockError);

            await expect(ClientServices.handleAcceptApplication(applicationId)).rejects.toEqual(mockError);
            expect(window.alert).toHaveBeenCalledWith('Failed to accept application: Application not found');
        });
    });

    describe('handleRejectApplication', () => {
        it('should successfully reject application', async () => {
            const applicationId = 123;
            const mockResponse = { data: { message: 'Application rejected' } };
            
            axios.put.mockResolvedValue(mockResponse);

            const result = await ClientServices.handleRejectApplication(applicationId);

            expect(axios.put).toHaveBeenCalledWith(
                '/api/application/123/reject',
                null,
                {
                    headers: {
                        'Authorization': 'Bearer mock.jwt.token',
                        'Content-Type': 'application/json',
                    },
                }
            );
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('downloadCV', () => {
        it('should open CV download in new tab', async () => {
            const applicationId = 123;
            const mockOpen = jest.fn();
            Object.defineProperty(window, 'open', {
                value: mockOpen,
                writable: true
            });

            // Mock window.location.origin for the test
            Object.defineProperty(window, 'location', {
                value: {
                    origin: 'http://localhost'
                },
                writable: true
            });

            const result = await ClientServices.downloadCV(applicationId);

            expect(mockOpen).toHaveBeenCalledWith('http://localhost/api/application/123/download-cv', '_blank');
            expect(result).toBe(true);
        });

        it('should handle download CV error', async () => {
            const applicationId = 123;
            Object.defineProperty(window, 'open', {
                value: () => { throw new Error('Failed to open'); },
                writable: true
            });

            await expect(ClientServices.downloadCV(applicationId)).rejects.toThrow();
            expect(window.alert).toHaveBeenCalledWith('Failed to download CV. Please try again.');
        });
    });

    describe('getClientStats', () => {
        it('should successfully get client statistics', async () => {
            const mockStats = { totalProjects: 5, activeProjects: 2 };
            const mockResponse = { data: mockStats };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await ClientServices.getClientStats();

            expect(axios.get).toHaveBeenCalledWith(
                '/api/project/client/stats',
                {
                    headers: {
                        'Authorization': 'Bearer mock.jwt.token',
                        'Content-Type': 'application/json',
                    },
                }
            );
            expect(result).toEqual(mockStats);
        });
    });

    describe('Token validation', () => {
        it('should throw error when no token is found', async () => {
            localStorageMock.getItem.mockReturnValue(null);

            await expect(ClientServices.handlePostProject({})).rejects.toThrow('Unauthorized. No token found.');
        });

        it('should throw error when username not found in token', async () => {
            jwtDecode.mockReturnValue({ role: 'CLIENT' }); // Missing sub field

            await expect(ClientServices.handlePostProject({})).rejects.toThrow('Username not found in token.');
        });
    });
});
