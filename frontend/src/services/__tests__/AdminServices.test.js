import axios from 'axios';
import * as AdminServices from '../AdminServices';

// Mock axios
jest.mock('axios');

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

describe('AdminServices', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue('mock.jwt.token');
    });

    describe('loadUsersList', () => {
        it('should successfully load users list with dispatch', async () => {
            const mockUsers = [
                { id: 1, username: 'user1', role: 'CLIENT' },
                { id: 2, username: 'user2', role: 'FREELANCER' }
            ];
            const mockResponse = { data: mockUsers };
            const mockDispatch = jest.fn();
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await AdminServices.loadUsersList(mockDispatch);

            expect(mockDispatch).toHaveBeenCalledWith({ type: "USERS_LOADING" });
            expect(axios.get).toHaveBeenCalledWith('/api/user/all', {
                headers: {
                    'Authorization': 'Bearer mock.jwt.token',
                    'Content-Type': 'application/json',
                }
            });
            expect(mockDispatch).toHaveBeenCalledWith({ 
                type: "SET_USERS_LIST", 
                payload: mockUsers 
            });
            expect(result).toEqual(mockUsers);
        });

        it('should successfully load users list without dispatch', async () => {
            const mockUsers = [{ id: 1, username: 'user1' }];
            const mockResponse = { data: mockUsers };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await AdminServices.loadUsersList();

            expect(axios.get).toHaveBeenCalledWith('/api/user/all', {
                headers: {
                    'Authorization': 'Bearer mock.jwt.token',
                    'Content-Type': 'application/json',
                }
            });
            expect(result).toEqual(mockUsers);
        });

        it('should handle load users error with dispatch', async () => {
            const mockError = {
                response: { data: { message: 'Unauthorized' } },
                message: 'Request failed'
            };
            const mockDispatch = jest.fn();
            
            axios.get.mockRejectedValue(mockError);

            await expect(AdminServices.loadUsersList(mockDispatch)).rejects.toEqual(mockError.response.data);
            expect(mockDispatch).toHaveBeenCalledWith({ type: "USERS_LOADING" });
            expect(mockDispatch).toHaveBeenCalledWith({ 
                type: "USERS_ERROR", 
                payload: mockError.message 
            });
            expect(console.error).toHaveBeenCalledWith('Error loading users list:', mockError);
        });

        it('should handle load users error without response', async () => {
            const mockError = new Error('Network error');
            
            axios.get.mockRejectedValue(mockError);

            await expect(AdminServices.loadUsersList()).rejects.toEqual(mockError);
            expect(console.error).toHaveBeenCalledWith('Error loading users list:', mockError);
        });
    });

    describe('loadProjectsList', () => {
        it('should successfully load projects list with dispatch', async () => {
            const mockProjects = [
                { id: 1, title: 'Project 1', status: 'PENDING' },
                { id: 2, title: 'Project 2', status: 'APPROVED' }
            ];
            const mockResponse = { data: mockProjects };
            const mockDispatch = jest.fn();
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await AdminServices.loadProjectsList(mockDispatch);

            expect(mockDispatch).toHaveBeenCalledWith({ type: "PROJECTS_LOADING" });
            expect(axios.get).toHaveBeenCalledWith('/api/project/allProjects', {
                headers: {
                    'Authorization': 'Bearer mock.jwt.token',
                    'Content-Type': 'application/json',
                }
            });
            expect(mockDispatch).toHaveBeenCalledWith({ 
                type: "SET_PROJECTS_LIST", 
                payload: mockProjects 
            });
            expect(result).toEqual(mockProjects);
        });

        it('should handle load projects error', async () => {
            const mockError = new Error('Server error');
            const mockDispatch = jest.fn();
            
            axios.get.mockRejectedValue(mockError);

            await expect(AdminServices.loadProjectsList(mockDispatch)).rejects.toThrow(mockError);
            expect(mockDispatch).toHaveBeenCalledWith({ type: "PROJECTS_LOADING" });
            expect(mockDispatch).toHaveBeenCalledWith({ 
                type: "PROJECTS_ERROR", 
                payload: mockError.message 
            });
            expect(console.error).toHaveBeenCalledWith('Error loading projects:', mockError);
            expect(window.alert).toHaveBeenCalledWith('Failed to load the projects.');
        });
    });

    describe('handleVerify', () => {
        it('should successfully verify user', async () => {
            const username = 'testuser';
            const verify = true;
            const mockResponse = { data: { message: 'User verified' } };
            
            axios.put.mockResolvedValue(mockResponse);

            const result = await AdminServices.handleVerify(username, verify);

            expect(axios.put).toHaveBeenCalledWith(
                '/api/user/testuser/verify',
                true,
                {
                    headers: {
                        'Authorization': 'Bearer mock.jwt.token',
                        'Content-Type': 'application/json',
                    }
                }
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('should successfully unverify user', async () => {
            const username = 'testuser';
            const verify = false;
            const mockResponse = { data: { message: 'User unverified' } };
            
            axios.put.mockResolvedValue(mockResponse);

            const result = await AdminServices.handleVerify(username, verify);

            expect(axios.put).toHaveBeenCalledWith(
                '/api/user/testuser/verify',
                false,
                {
                    headers: {
                        'Authorization': 'Bearer mock.jwt.token',
                        'Content-Type': 'application/json',
                    }
                }
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('should handle verify user error', async () => {
            const username = 'testuser';
            const verify = true;
            const mockError = new Error('Verification failed');
            
            axios.put.mockRejectedValue(mockError);

            await expect(AdminServices.handleVerify(username, verify)).rejects.toThrow(mockError);
            expect(console.error).toHaveBeenCalledWith('Failed to verify user:', mockError);
        });

        it('should handle unverify user error', async () => {
            const username = 'testuser';
            const verify = false;
            const mockError = new Error('Unverification failed');
            
            axios.put.mockRejectedValue(mockError);

            await expect(AdminServices.handleVerify(username, verify)).rejects.toThrow(mockError);
            expect(console.error).toHaveBeenCalledWith('Failed to unverify user:', mockError);
        });
    });

    describe('handleApproveProject', () => {
        it('should successfully approve project', async () => {
            const projectId = 123;
            const mockResponse = { data: { message: 'Project approved' } };
            
            axios.put.mockResolvedValue(mockResponse);

            const result = await AdminServices.handleApproveProject(projectId);

            expect(axios.put).toHaveBeenCalledWith(
                '/api/project/123/approve',
                true,
                {
                    headers: {
                        'Authorization': 'Bearer mock.jwt.token',
                        'Content-Type': 'application/json',
                    }
                }
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('should handle approve project error', async () => {
            const projectId = 123;
            const mockError = new Error('Approval failed');
            
            axios.put.mockRejectedValue(mockError);

            await expect(AdminServices.handleApproveProject(projectId)).rejects.toThrow(mockError);
            expect(console.error).toHaveBeenCalledWith('Error approving project:', mockError);
        });
    });

    describe('handleDenyProject', () => {
        it('should successfully deny project', async () => {
            const projectId = 123;
            const mockResponse = { data: { message: 'Project denied' } };
            
            axios.put.mockResolvedValue(mockResponse);

            const result = await AdminServices.handleDenyProject(projectId);

            expect(axios.put).toHaveBeenCalledWith(
                '/api/project/123/deny',
                false,
                {
                    headers: {
                        'Authorization': 'Bearer mock.jwt.token',
                        'Content-Type': 'application/json',
                    }
                }
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('should handle deny project error', async () => {
            const projectId = 123;
            const mockError = new Error('Denial failed');
            
            axios.put.mockRejectedValue(mockError);

            await expect(AdminServices.handleDenyProject(projectId)).rejects.toThrow(mockError);
            expect(console.error).toHaveBeenCalledWith('Error rejecting project:', mockError);
        });
    });

    describe('Token handling', () => {
        it('should use token from localStorage in all requests', async () => {
            const mockResponse = { data: [] };
            axios.get.mockResolvedValue(mockResponse);
            axios.put.mockResolvedValue(mockResponse);

            await AdminServices.loadUsersList();
            await AdminServices.loadProjectsList();
            await AdminServices.handleVerify('user', true);
            await AdminServices.handleApproveProject(1);
            await AdminServices.handleDenyProject(1);

            // Check that all requests used the token
            expect(localStorageMock.getItem).toHaveBeenCalledTimes(5);
            expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
        });
    });
});
