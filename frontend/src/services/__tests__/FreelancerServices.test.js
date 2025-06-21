import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import * as FreelancerServices from '../FreelancerServices';

// Mock dependencies
jest.mock('axios');
jest.mock('jwt-decode');

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

// Mock fetch for file upload tests
global.fetch = jest.fn();

describe('FreelancerServices', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue('mock.jwt.token');
        jwtDecode.mockReturnValue({ sub: 'testfreelancer' });
    });

    describe('loadAvailableProjects', () => {
        it('should successfully load available projects', async () => {
            const mockProjects = [{ id: 1, title: 'Test Project' }];
            const mockResponse = { data: mockProjects };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await FreelancerServices.loadAvailableProjects();

            expect(axios.get).toHaveBeenCalledWith('/project/available', {
                headers: {
                    'Authorization': 'Bearer mock.jwt.token',
                    'Content-Type': 'application/json',
                },
            });
            expect(result).toEqual(mockProjects);
        });

        it('should handle load available projects error', async () => {
            const mockError = {
                response: { data: { message: 'Server error' } }
            };
            
            axios.get.mockRejectedValue(mockError);

            await expect(FreelancerServices.loadAvailableProjects()).rejects.toEqual(mockError.response.data);
            expect(console.error).toHaveBeenCalledWith('Error loading available projects:', mockError);
        });
    });

    describe('applyForProject', () => {
        it('should successfully apply for project', async () => {
            const projectId = 123;
            const coverLetter = 'I am interested in this project';
            const mockResponse = { data: { message: 'Application submitted' } };
            
            axios.post.mockResolvedValue(mockResponse);

            const result = await FreelancerServices.applyForProject(projectId, coverLetter);

            expect(axios.post).toHaveBeenCalledWith(
                '/project/123/apply/testfreelancer',
                coverLetter,
                {
                    headers: {
                        'Authorization': 'Bearer mock.jwt.token',
                        'Content-Type': 'application/json',
                    },
                }
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('should throw error when cover letter is empty', async () => {
            const projectId = 123;
            const coverLetter = '';

            await expect(FreelancerServices.applyForProject(projectId, coverLetter))
                .rejects.toThrow('Cover Letter cannot be empty.');
        });

        it('should throw error when cover letter is only whitespace', async () => {
            const projectId = 123;
            const coverLetter = '   ';

            await expect(FreelancerServices.applyForProject(projectId, coverLetter))
                .rejects.toThrow('Cover Letter cannot be empty.');
        });
    });

    describe('searchProjectsByTitle', () => {
        it('should successfully search projects by title', async () => {
            const title = 'React';
            const mockProjects = [{ id: 1, title: 'React Developer' }];
            const mockResponse = { data: mockProjects };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await FreelancerServices.searchProjectsByTitle(title);

            expect(axios.get).toHaveBeenCalledWith('/project/title/React', {
                headers: {
                    'Authorization': 'Bearer mock.jwt.token',
                    'Content-Type': 'application/json',
                },
            });
            expect(result).toEqual(mockProjects);
        });
    });

    describe('getAssignedProjects', () => {
        it('should successfully get assigned projects', async () => {
            const mockProjects = [{ id: 1, title: 'Assigned Project' }];
            const mockResponse = { data: mockProjects };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await FreelancerServices.getAssignedProjects();

            expect(axios.get).toHaveBeenCalledWith('/project/freelancer/testfreelancer', {
                headers: {
                    'Authorization': 'Bearer mock.jwt.token',
                    'Content-Type': 'application/json',
                },
            });
            expect(result).toEqual(mockProjects);
        });
    });

    describe('loadMyProjects', () => {
        it('should successfully load freelancer projects', async () => {
            const mockProjects = [{ id: 1, title: 'My Project' }];
            const mockResponse = { data: mockProjects };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await FreelancerServices.loadMyProjects();

            expect(axios.get).toHaveBeenCalledWith('/project/freelancer/my-projects', {
                headers: {
                    'Authorization': 'Bearer mock.jwt.token',
                    'Content-Type': 'application/json',
                },
            });
            expect(result).toEqual(mockProjects);
        });
    });

    describe('loadMyApplications', () => {
        it('should successfully load freelancer applications', async () => {
            const mockApplications = [{ id: 1, status: 'PENDING' }];
            const mockResponse = { data: mockApplications };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await FreelancerServices.loadMyApplications();

            expect(axios.get).toHaveBeenCalledWith('/freelancer/testfreelancer/my-applications', {
                headers: {
                    'Authorization': 'Bearer mock.jwt.token',
                    'Content-Type': 'application/json',
                },
            });
            expect(result).toEqual(mockApplications);
        });
    });

    describe('handleCompleteProject', () => {
        it('should successfully complete project', async () => {
            const projectId = 123;
            const mockResponse = { data: { message: 'Project completed' } };
            
            axios.put.mockResolvedValue(mockResponse);

            const result = await FreelancerServices.handleCompleteProject(projectId);

            expect(axios.put).toHaveBeenCalledWith(
                '/project/123/complete',
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

    describe('createReport', () => {
        it('should successfully create report', async () => {
            const projectId = 123;
            const description = 'Report description';
            const mockResponse = { data: { id: 1, message: 'Report created' } };
            
            axios.post.mockResolvedValue(mockResponse);

            const result = await FreelancerServices.createReport(projectId, description);

            expect(axios.post).toHaveBeenCalledWith(
                '/report',
                {
                    projectId: 123,
                    description: description
                },
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

    describe('applyForProjectWithCV', () => {
        it('should successfully apply for project with CV', async () => {
            const projectId = 123;
            const coverLetter = 'Cover letter';
            const cvFile = new File(['cv content'], 'cv.pdf', { type: 'application/pdf' });
            const mockResponse = { message: 'Application with CV submitted' };
            
            fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse)
            });

            const result = await FreelancerServices.applyForProjectWithCV(projectId, coverLetter, cvFile);

            expect(fetch).toHaveBeenCalledWith(
                '/project/123/apply/testfreelancer/with-cv',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer mock.jwt.token'
                    },
                    body: expect.any(FormData)
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it('should handle apply with CV error', async () => {
            const projectId = 123;
            const coverLetter = 'Cover letter';
            const cvFile = new File(['cv content'], 'cv.pdf', { type: 'application/pdf' });
            
            fetch.mockResolvedValue({
                ok: false,
                json: jest.fn().mockResolvedValue({ message: 'Upload failed' })
            });

            await expect(FreelancerServices.applyForProjectWithCV(projectId, coverLetter, cvFile))
                .rejects.toThrow('Upload failed');
        });

        it('should throw error when no token found for CV upload', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            
            const projectId = 123;
            const coverLetter = 'Cover letter';
            const cvFile = new File(['cv content'], 'cv.pdf', { type: 'application/pdf' });

            await expect(FreelancerServices.applyForProjectWithCV(projectId, coverLetter, cvFile))
                .rejects.toThrow('Unauthorized. No token found.');
        });
    });

    describe('Token validation', () => {
        it('should throw error when no token is found', async () => {
            localStorageMock.getItem.mockReturnValue(null);

            await expect(FreelancerServices.loadAvailableProjects()).rejects.toThrow('Unauthorized. No token found.');
        });

        it('should throw error when username not found in token', async () => {
            jwtDecode.mockReturnValue({ role: 'FREELANCER' }); // Missing sub field

            await expect(FreelancerServices.loadAvailableProjects()).rejects.toThrow('Username not found in token.');
        });
    });
});
