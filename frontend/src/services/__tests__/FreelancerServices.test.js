import axios from 'axios';
import {
  loadAvailableProjects,
  loadMyApplications,
  handleApplyToProject,
  loadMyProjects,
  loadProjectsForSearch,
  getFreelancerStats,
  updateProfile,
  getProfile,
  markProjectAsCompleted
} from '../FreelancerServices';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    sub: 'testfreelancer',
    role: 'FREELANCER',
    verified: true
  }))
}));

describe('FreelancerServices', () => {
  let mockCreate;
  let mockGet;
  let mockPost;
  let mockPut;

  beforeEach(() => {
    mockGet = jest.fn();
    mockPost = jest.fn();
    mockPut = jest.fn();
    mockCreate = jest.fn(() => ({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      defaults: {
        headers: {
          common: {}
        }
      }
    }));
    mockedAxios.create = mockCreate;

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-jwt-token'),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadAvailableProjects', () => {
    it('should successfully load available projects', async () => {
      const mockProjects = [
        {
          id: 1,
          title: 'Test Project 1',
          description: 'Description 1',
          budget: 1500,
          projectStatus: 'APPROVED',
          client_username: 'client1'
        },
        {
          id: 2,
          title: 'Test Project 2',
          description: 'Description 2',
          budget: 2500,
          projectStatus: 'APPROVED',
          client_username: 'client2'
        }
      ];

      const mockResponse = {
        data: mockProjects,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await loadAvailableProjects();

      expect(mockGet).toHaveBeenCalledWith('/project/available');
      expect(result).toEqual(mockProjects);
    });

    it('should handle empty projects list', async () => {
      const mockResponse = {
        data: [],
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await loadAvailableProjects();

      expect(result).toEqual([]);
    });

    it('should handle API error', async () => {
      const mockError = {
        response: {
          data: { message: 'Server Error' },
          status: 500
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(loadAvailableProjects()).rejects.toThrow('Server Error');
    });
  });

  describe('loadMyApplications', () => {
    it('should successfully load freelancer applications', async () => {
      const mockApplications = [
        {
          id: 1,
          projectTitle: 'Test Project 1',
          applicationStatus: 'WAITING',
          cover_letter: 'Application letter 1',
          project: { id: 1, title: 'Test Project 1' }
        },
        {
          id: 2,
          projectTitle: 'Test Project 2',
          applicationStatus: 'APPROVED',
          cover_letter: 'Application letter 2',
          project: { id: 2, title: 'Test Project 2' }
        }
      ];

      const mockResponse = {
        data: mockApplications,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await loadMyApplications();

      expect(mockGet).toHaveBeenCalledWith('/freelancer/testfreelancer/my-applications');
      expect(result).toEqual(mockApplications);
    });

    it('should handle API error when loading applications', async () => {
      const mockError = {
        response: {
          data: { message: 'Unauthorized' },
          status: 401
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(loadMyApplications()).rejects.toThrow('Unauthorized');
    });
  });

  describe('handleApplyToProject', () => {
    it('should successfully apply to project with file', async () => {
      const applicationData = {
        projectId: 1,
        coverLetter: 'Test cover letter',
        cvFile: new File(['cv content'], 'cv.pdf', { type: 'application/pdf' })
      };

      const mockResponse = {
        data: {
          id: 1,
          projectId: 1,
          freelancer: 'testfreelancer',
          applicationStatus: 'WAITING',
          cover_letter: 'Test cover letter'
        },
        status: 201
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await handleApplyToProject(applicationData);

      expect(mockPost).toHaveBeenCalledWith(
        '/application/apply',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should successfully apply to project without file', async () => {
      const applicationData = {
        projectId: 1,
        coverLetter: 'Test cover letter'
      };

      const mockResponse = {
        data: {
          id: 1,
          projectId: 1,
          freelancer: 'testfreelancer',
          applicationStatus: 'WAITING',
          cover_letter: 'Test cover letter'
        },
        status: 201
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await handleApplyToProject(applicationData);

      expect(mockPost).toHaveBeenCalledWith(
        '/application/apply',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error when applying', async () => {
      const applicationData = {
        projectId: 1,
        coverLetter: 'Test cover letter'
      };

      const mockError = {
        response: {
          data: { message: 'Application already exists' },
          status: 409
        }
      };

      mockPost.mockRejectedValue(mockError);

      await expect(handleApplyToProject(applicationData)).rejects.toThrow('Application already exists');
    });
  });

  describe('loadMyProjects', () => {
    it('should successfully load freelancer assigned projects', async () => {
      const mockProjects = [
        {
          id: 1,
          title: 'Assigned Project 1',
          description: 'Description 1',
          budget: 1500,
          projectStatus: 'IN_PROGRESS'
        },
        {
          id: 2,
          title: 'Assigned Project 2',
          description: 'Description 2',
          budget: 2500,
          projectStatus: 'COMPLETED'
        }
      ];

      const mockResponse = {
        data: mockProjects,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await loadMyProjects();

      expect(mockGet).toHaveBeenCalledWith('/freelancer/testfreelancer/my-projects');
      expect(result).toEqual(mockProjects);
    });

    it('should handle API error when loading projects', async () => {
      const mockError = {
        response: {
          data: { message: 'Server Error' },
          status: 500
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(loadMyProjects()).rejects.toThrow('Server Error');
    });
  });

  describe('loadProjectsForSearch', () => {
    it('should successfully load projects for search', async () => {
      const searchParams = {
        title: 'React',
        minBudget: 1000,
        maxBudget: 5000
      };

      const mockProjects = [
        {
          id: 1,
          title: 'React Project 1',
          description: 'React development',
          budget: 2000,
          projectStatus: 'APPROVED'
        }
      ];

      const mockResponse = {
        data: mockProjects,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await loadProjectsForSearch(searchParams);

      expect(mockGet).toHaveBeenCalledWith('/project/search', {
        params: searchParams
      });
      expect(result).toEqual(mockProjects);
    });

    it('should handle search with no parameters', async () => {
      const mockResponse = {
        data: [],
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await loadProjectsForSearch({});

      expect(mockGet).toHaveBeenCalledWith('/project/search', {
        params: {}
      });
      expect(result).toEqual([]);
    });

    it('should handle API error during search', async () => {
      const mockError = {
        response: {
          data: { message: 'Invalid search parameters' },
          status: 400
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(loadProjectsForSearch({})).rejects.toThrow('Invalid search parameters');
    });
  });

  describe('getFreelancerStats', () => {
    it('should successfully fetch freelancer statistics', async () => {
      const mockStats = {
        totalApplications: 10,
        approvedApplications: 5,
        rejectedApplications: 3,
        pendingApplications: 2,
        completedProjects: 4,
        totalEarnings: 8500
      };

      const mockResponse = {
        data: mockStats,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getFreelancerStats();

      expect(mockGet).toHaveBeenCalledWith('/freelancer/testfreelancer/stats');
      expect(result).toEqual(mockStats);
    });

    it('should handle API error when fetching stats', async () => {
      const mockError = {
        response: {
          data: { message: 'Unauthorized' },
          status: 401
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getFreelancerStats()).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateProfile', () => {
    it('should successfully update freelancer profile', async () => {
      const profileData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        skills: 'React, Node.js, Python',
        bio: 'Experienced full-stack developer'
      };

      const mockResponse = {
        data: {
          id: 1,
          username: 'testfreelancer',
          ...profileData
        },
        status: 200
      };

      mockPut.mockResolvedValue(mockResponse);

      const result = await updateProfile(profileData);

      expect(mockPut).toHaveBeenCalledWith('/freelancer/testfreelancer/profile', profileData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error when updating profile', async () => {
      const profileData = {
        firstName: 'John',
        lastName: 'Doe'
      };

      const mockError = {
        response: {
          data: { message: 'Validation failed' },
          status: 400
        }
      };

      mockPut.mockRejectedValue(mockError);

      await expect(updateProfile(profileData)).rejects.toThrow('Validation failed');
    });
  });

  describe('getProfile', () => {
    it('should successfully fetch freelancer profile', async () => {
      const mockProfile = {
        id: 1,
        username: 'testfreelancer',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        skills: 'React, Node.js, Python',
        bio: 'Experienced full-stack developer'
      };

      const mockResponse = {
        data: mockProfile,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getProfile();

      expect(mockGet).toHaveBeenCalledWith('/freelancer/testfreelancer/profile');
      expect(result).toEqual(mockProfile);
    });

    it('should handle API error when fetching profile', async () => {
      const mockError = {
        response: {
          data: { message: 'Profile not found' },
          status: 404
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getProfile()).rejects.toThrow('Profile not found');
    });
  });

  describe('markProjectAsCompleted', () => {
    it('should successfully mark project as completed', async () => {
      const projectId = 1;
      const mockResponse = {
        data: {
          id: projectId,
          projectStatus: 'COMPLETED'
        },
        status: 200
      };

      mockPut.mockResolvedValue(mockResponse);

      const result = await markProjectAsCompleted(projectId);

      expect(mockPut).toHaveBeenCalledWith(`/project/${projectId}/complete`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error when marking project as completed', async () => {
      const projectId = 1;
      const mockError = {
        response: {
          data: { message: 'Project not found' },
          status: 404
        }
      };

      mockPut.mockRejectedValue(mockError);

      await expect(markProjectAsCompleted(projectId)).rejects.toThrow('Project not found');
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      const mockError = new Error('Network Error');
      mockGet.mockRejectedValue(mockError);

      await expect(loadAvailableProjects()).rejects.toThrow('Network Error');
    });

    it('should handle timeout errors', async () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };

      mockGet.mockRejectedValue(mockError);

      await expect(loadAvailableProjects()).rejects.toThrow('timeout of 5000ms exceeded');
    });

    it('should handle malformed response data', async () => {
      const mockResponse = {
        data: 'invalid json',
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await loadAvailableProjects();

      expect(result).toBe('invalid json');
    });
  });

  describe('Authentication token handling', () => {
    it('should handle missing token', () => {
      window.localStorage.getItem.mockReturnValue(null);

      expect(() => loadAvailableProjects()).not.toThrow();
    });

    it('should handle invalid token format', () => {
      window.localStorage.getItem.mockReturnValue('invalid-token');

      expect(() => loadAvailableProjects()).not.toThrow();
    });
  });
}); 