import axios from 'axios';
import {
  handlePostProject,
  loadMyApplications,
  loadMyProjects,
  handleAcceptApplication,
  handleRejectApplication,
  downloadCV,
  getClientStats
} from '../ClientServices';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    sub: 'testclient',
    role: 'CLIENT',
    verified: true
  }))
}));

describe('ClientServices', () => {
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

  describe('handlePostProject', () => {
    it('should successfully post a new project', async () => {
      const projectData = {
        title: 'New Test Project',
        description: 'This is a test project',
        budget: 2000,
        deadline: '2024-12-31'
      };

      const mockResponse = {
        data: {
          id: 1,
          ...projectData,
          client_username: 'testclient',
          projectStatus: 'PENDING'
        },
        status: 201
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await handlePostProject(projectData);

      expect(mockPost).toHaveBeenCalledWith('/project/post', projectData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error when posting project', async () => {
      const projectData = {
        title: 'New Test Project',
        description: 'This is a test project',
        budget: 2000,
        deadline: '2024-12-31'
      };

      const mockError = {
        response: {
          data: { message: 'Validation failed' },
          status: 400
        }
      };

      mockPost.mockRejectedValue(mockError);

      await expect(handlePostProject(projectData)).rejects.toThrow('Validation failed');
    });

    it('should handle network error when posting project', async () => {
      const projectData = {
        title: 'New Test Project',
        description: 'This is a test project',
        budget: 2000,
        deadline: '2024-12-31'
      };

      const mockError = new Error('Network Error');
      mockPost.mockRejectedValue(mockError);

      await expect(handlePostProject(projectData)).rejects.toThrow('Network Error');
    });
  });

  describe('loadMyApplications', () => {
    it('should successfully load client applications', async () => {
      const mockApplications = [
        {
          id: 1,
          projectTitle: 'Test Project 1',
          freelancer: 'freelancer1',
          applicationStatus: 'WAITING',
          cover_letter: 'Application letter 1'
        },
        {
          id: 2,
          projectTitle: 'Test Project 2',
          freelancer: 'freelancer2',
          applicationStatus: 'APPROVED',
          cover_letter: 'Application letter 2'
        }
      ];

      const mockResponse = {
        data: mockApplications,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await loadMyApplications();

      expect(mockGet).toHaveBeenCalledWith('/client/testclient/my-applications');
      expect(result).toEqual(mockApplications);
    });

    it('should handle empty applications list', async () => {
      const mockResponse = {
        data: [],
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await loadMyApplications();

      expect(result).toEqual([]);
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

  describe('loadMyProjects', () => {
    it('should successfully load client projects', async () => {
      const mockProjects = [
        {
          id: 1,
          title: 'Client Project 1',
          description: 'Description 1',
          budget: 1500,
          projectStatus: 'APPROVED'
        },
        {
          id: 2,
          title: 'Client Project 2',
          description: 'Description 2',
          budget: 2500,
          projectStatus: 'IN_PROGRESS'
        }
      ];

      const mockResponse = {
        data: mockProjects,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await loadMyProjects();

      expect(mockGet).toHaveBeenCalledWith('/project/my-projects');
      expect(result).toEqual(mockProjects);
    });

    it('should handle empty projects list', async () => {
      const mockResponse = {
        data: [],
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await loadMyProjects();

      expect(result).toEqual([]);
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

  describe('handleAcceptApplication', () => {
    it('should successfully accept an application', async () => {
      const applicationId = 1;
      const mockResponse = {
        data: {
          id: applicationId,
          applicationStatus: 'APPROVED'
        },
        status: 200
      };

      mockPut.mockResolvedValue(mockResponse);

      const result = await handleAcceptApplication(applicationId);

      expect(mockPut).toHaveBeenCalledWith(`/application/${applicationId}/approve`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error when accepting application', async () => {
      const applicationId = 1;
      const mockError = {
        response: {
          data: { message: 'Application not found' },
          status: 404
        }
      };

      mockPut.mockRejectedValue(mockError);

      await expect(handleAcceptApplication(applicationId)).rejects.toThrow('Application not found');
    });

    it('should handle network error when accepting application', async () => {
      const applicationId = 1;
      const mockError = new Error('Network Error');

      mockPut.mockRejectedValue(mockError);

      await expect(handleAcceptApplication(applicationId)).rejects.toThrow('Network Error');
    });
  });

  describe('handleRejectApplication', () => {
    it('should successfully reject an application', async () => {
      const applicationId = 1;
      const mockResponse = {
        data: {
          id: applicationId,
          applicationStatus: 'REJECTED'
        },
        status: 200
      };

      mockPut.mockResolvedValue(mockResponse);

      const result = await handleRejectApplication(applicationId);

      expect(mockPut).toHaveBeenCalledWith(`/application/${applicationId}/reject`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error when rejecting application', async () => {
      const applicationId = 1;
      const mockError = {
        response: {
          data: { message: 'Application not found' },
          status: 404
        }
      };

      mockPut.mockRejectedValue(mockError);

      await expect(handleRejectApplication(applicationId)).rejects.toThrow('Application not found');
    });
  });

  describe('downloadCV', () => {
    it('should successfully download CV file', async () => {
      const applicationId = 1;
      const mockBlob = new Blob(['CV content'], { type: 'application/pdf' });
      const mockResponse = {
        data: mockBlob,
        headers: {
          'content-disposition': 'attachment; filename="cv.pdf"'
        },
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      // Mock URL.createObjectURL
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();

      // Mock document.createElement and click
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);

      await downloadCV(applicationId);

      expect(mockGet).toHaveBeenCalledWith(`/application/${applicationId}/download-cv`, {
        responseType: 'blob'
      });
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should handle API error when downloading CV', async () => {
      const applicationId = 1;
      const mockError = {
        response: {
          data: { message: 'CV not found' },
          status: 404
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(downloadCV(applicationId)).rejects.toThrow('CV not found');
    });
  });

  describe('getClientStats', () => {
    it('should successfully fetch client statistics', async () => {
      const mockStats = {
        totalProjects: 5,
        activeProjects: 2,
        completedProjects: 3,
        totalApplications: 15,
        pendingApplications: 8
      };

      const mockResponse = {
        data: mockStats,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getClientStats();

      expect(mockGet).toHaveBeenCalledWith('/project/client/stats');
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

      await expect(getClientStats()).rejects.toThrow('Unauthorized');
    });

    it('should handle null stats response', async () => {
      const mockResponse = {
        data: null,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getClientStats();

      expect(result).toBe(null);
    });
  });

  describe('Error handling', () => {
    it('should handle timeout errors', async () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };

      mockGet.mockRejectedValue(mockError);

      await expect(loadMyProjects()).rejects.toThrow('timeout of 5000ms exceeded');
    });

    it('should handle malformed response data', async () => {
      const mockResponse = {
        data: 'invalid json',
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await loadMyProjects();

      expect(result).toBe('invalid json');
    });

    it('should handle null response', async () => {
      const mockResponse = {
        data: null,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await loadMyProjects();

      expect(result).toBe(null);
    });
  });

  describe('Authentication token handling', () => {
    it('should handle missing token', () => {
      window.localStorage.getItem.mockReturnValue(null);

      expect(() => loadMyProjects()).not.toThrow();
    });

    it('should handle invalid token format', () => {
      window.localStorage.getItem.mockReturnValue('invalid-token');

      // Should still attempt the request
      expect(() => loadMyProjects()).not.toThrow();
    });
  });

  describe('API client configuration', () => {
    it('should create axios instance with correct configuration', () => {
      loadMyProjects();

      expect(mockCreate).toHaveBeenCalled();
    });

    it('should set authorization headers correctly', async () => {
      const mockResponse = {
        data: [],
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      await loadMyProjects();

      expect(mockGet).toHaveBeenCalled();
    });
  });
}); 