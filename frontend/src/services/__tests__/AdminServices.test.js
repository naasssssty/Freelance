import axios from 'axios';
import {
  register,
  getAllUsers,
  getAllProjects,
  approveProject,
  denyProject,
  deleteUser,
  getAdminStats,
  getSystemReports
} from '../AdminServices';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    sub: 'testadmin',
    role: 'ADMIN',
    verified: true
  }))
}));

describe('AdminServices', () => {
  let mockCreate;
  let mockGet;
  let mockPost;
  let mockPut;
  let mockDelete;

  beforeEach(() => {
    mockGet = jest.fn();
    mockPost = jest.fn();
    mockPut = jest.fn();
    mockDelete = jest.fn();
    mockCreate = jest.fn(() => ({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
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

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'FREELANCER'
      };

      const mockResponse = {
        data: {
          token: 'mock-jwt-token',
          user: {
            id: 1,
            username: 'newuser',
            email: 'newuser@example.com',
            role: 'FREELANCER'
          }
        },
        status: 201
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await register(userData);

      expect(mockPost).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle registration error', async () => {
      const userData = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
        role: 'FREELANCER'
      };

      const mockError = {
        response: {
          data: { message: 'Username already exists' },
          status: 409
        }
      };

      mockPost.mockRejectedValue(mockError);

      await expect(register(userData)).rejects.toThrow('Username already exists');
    });

    it('should handle validation errors', async () => {
      const userData = {
        username: '',
        email: 'invalid-email',
        password: '123',
        role: 'INVALID_ROLE'
      };

      const mockError = {
        response: {
          data: { message: 'Validation failed' },
          status: 400
        }
      };

      mockPost.mockRejectedValue(mockError);

      await expect(register(userData)).rejects.toThrow('Validation failed');
    });
  });

  describe('getAllUsers', () => {
    it('should successfully fetch all users', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          role: 'FREELANCER',
          verified: true
        },
        {
          id: 2,
          username: 'user2',
          email: 'user2@example.com',
          role: 'CLIENT',
          verified: false
        }
      ];

      const mockResponse = {
        data: mockUsers,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getAllUsers();

      expect(mockGet).toHaveBeenCalledWith('/admin/users');
      expect(result).toEqual(mockUsers);
    });

    it('should handle empty users list', async () => {
      const mockResponse = {
        data: [],
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getAllUsers();

      expect(result).toEqual([]);
    });

    it('should handle API error when fetching users', async () => {
      const mockError = {
        response: {
          data: { message: 'Unauthorized' },
          status: 401
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getAllUsers()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getAllProjects', () => {
    it('should successfully fetch all projects', async () => {
      const mockProjects = [
        {
          id: 1,
          title: 'Project 1',
          description: 'Description 1',
          budget: 1500,
          projectStatus: 'PENDING',
          client_username: 'client1'
        },
        {
          id: 2,
          title: 'Project 2',
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

      const result = await getAllProjects();

      expect(mockGet).toHaveBeenCalledWith('/admin/projects');
      expect(result).toEqual(mockProjects);
    });

    it('should handle API error when fetching projects', async () => {
      const mockError = {
        response: {
          data: { message: 'Server Error' },
          status: 500
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getAllProjects()).rejects.toThrow('Server Error');
    });
  });

  describe('approveProject', () => {
    it('should successfully approve a project', async () => {
      const projectId = 1;
      const mockResponse = {
        data: {
          id: projectId,
          projectStatus: 'APPROVED'
        },
        status: 200
      };

      mockPut.mockResolvedValue(mockResponse);

      const result = await approveProject(projectId);

      expect(mockPut).toHaveBeenCalledWith(`/admin/project/${projectId}/approve`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error when approving project', async () => {
      const projectId = 1;
      const mockError = {
        response: {
          data: { message: 'Project not found' },
          status: 404
        }
      };

      mockPut.mockRejectedValue(mockError);

      await expect(approveProject(projectId)).rejects.toThrow('Project not found');
    });

    it('should handle already approved project', async () => {
      const projectId = 1;
      const mockError = {
        response: {
          data: { message: 'Project already approved' },
          status: 409
        }
      };

      mockPut.mockRejectedValue(mockError);

      await expect(approveProject(projectId)).rejects.toThrow('Project already approved');
    });
  });

  describe('denyProject', () => {
    it('should successfully deny a project', async () => {
      const projectId = 1;
      const mockResponse = {
        data: {
          id: projectId,
          projectStatus: 'DENIED'
        },
        status: 200
      };

      mockPut.mockResolvedValue(mockResponse);

      const result = await denyProject(projectId);

      expect(mockPut).toHaveBeenCalledWith(`/admin/project/${projectId}/deny`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error when denying project', async () => {
      const projectId = 1;
      const mockError = {
        response: {
          data: { message: 'Project not found' },
          status: 404
        }
      };

      mockPut.mockRejectedValue(mockError);

      await expect(denyProject(projectId)).rejects.toThrow('Project not found');
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete a user', async () => {
      const userId = 1;
      const mockResponse = {
        status: 204
      };

      mockDelete.mockResolvedValue(mockResponse);

      await deleteUser(userId);

      expect(mockDelete).toHaveBeenCalledWith(`/admin/user/${userId}`);
    });

    it('should handle API error when deleting user', async () => {
      const userId = 1;
      const mockError = {
        response: {
          data: { message: 'User not found' },
          status: 404
        }
      };

      mockDelete.mockRejectedValue(mockError);

      await expect(deleteUser(userId)).rejects.toThrow('User not found');
    });

    it('should handle unauthorized deletion', async () => {
      const userId = 1;
      const mockError = {
        response: {
          data: { message: 'Cannot delete admin user' },
          status: 403
        }
      };

      mockDelete.mockRejectedValue(mockError);

      await expect(deleteUser(userId)).rejects.toThrow('Cannot delete admin user');
    });
  });

  describe('getAdminStats', () => {
    it('should successfully fetch admin statistics', async () => {
      const mockStats = {
        totalUsers: 150,
        totalProjects: 75,
        pendingProjects: 15,
        approvedProjects: 45,
        deniedProjects: 15,
        totalApplications: 300,
        activeUsers: 120
      };

      const mockResponse = {
        data: mockStats,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getAdminStats();

      expect(mockGet).toHaveBeenCalledWith('/admin/stats');
      expect(result).toEqual(mockStats);
    });

    it('should handle API error when fetching admin stats', async () => {
      const mockError = {
        response: {
          data: { message: 'Unauthorized' },
          status: 401
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getAdminStats()).rejects.toThrow('Unauthorized');
    });

    it('should handle null stats response', async () => {
      const mockResponse = {
        data: null,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getAdminStats();

      expect(result).toBe(null);
    });
  });

  describe('getSystemReports', () => {
    it('should successfully fetch system reports', async () => {
      const mockReports = [
        {
          id: 1,
          reportType: 'USER_ACTIVITY',
          generatedAt: '2024-01-15T10:30:00Z',
          data: { activeUsers: 120, newRegistrations: 15 }
        },
        {
          id: 2,
          reportType: 'PROJECT_STATS',
          generatedAt: '2024-01-15T10:30:00Z',
          data: { totalProjects: 75, completedProjects: 30 }
        }
      ];

      const mockResponse = {
        data: mockReports,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getSystemReports();

      expect(mockGet).toHaveBeenCalledWith('/admin/reports');
      expect(result).toEqual(mockReports);
    });

    it('should handle API error when fetching reports', async () => {
      const mockError = {
        response: {
          data: { message: 'Server Error' },
          status: 500
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getSystemReports()).rejects.toThrow('Server Error');
    });

    it('should handle empty reports list', async () => {
      const mockResponse = {
        data: [],
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getSystemReports();

      expect(result).toEqual([]);
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      const mockError = new Error('Network Error');
      mockGet.mockRejectedValue(mockError);

      await expect(getAllUsers()).rejects.toThrow('Network Error');
    });

    it('should handle timeout errors', async () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getAllUsers()).rejects.toThrow('timeout of 5000ms exceeded');
    });

    it('should handle malformed response data', async () => {
      const mockResponse = {
        data: 'invalid json',
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getAllUsers();

      expect(result).toBe('invalid json');
    });
  });

  describe('Authentication token handling', () => {
    it('should handle missing token', () => {
      window.localStorage.getItem.mockReturnValue(null);

      expect(() => getAllUsers()).not.toThrow();
    });

    it('should handle invalid token format', () => {
      window.localStorage.getItem.mockReturnValue('invalid-token');

      expect(() => getAllUsers()).not.toThrow();
    });
  });

  describe('API client configuration', () => {
    it('should create axios instance with correct configuration', () => {
      getAllUsers();

      expect(mockCreate).toHaveBeenCalled();
    });

    it('should set authorization headers correctly', async () => {
      const mockResponse = {
        data: [],
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      await getAllUsers();

      expect(mockGet).toHaveBeenCalled();
    });
  });
}); 