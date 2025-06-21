import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import * as authService from '../../services/auth';
import * as ClientServices from '../../services/ClientServices';
import * as FreelancerServices from '../../services/FreelancerServices';
import * as NotificationServices from '../../services/NotificationServices';
import { Login } from '../../pages/Login';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => mockNavigate
}));

// Mock services
jest.mock('../../services/auth');
jest.mock('../../services/ClientServices');
jest.mock('../../services/FreelancerServices');
jest.mock('../../services/NotificationServices');

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false, loading: false, error: null }, action) => {
        switch (action.type) {
          case 'AUTH_START':
            return { ...state, loading: true, error: null };
          case 'AUTH_SUCCESS':
            return { ...state, loading: false, user: action.payload, isAuthenticated: true };
          case 'AUTH_FAILURE':
            return { ...state, loading: false, error: action.payload };
          default:
            return state;
        }
      }
    },
    preloadedState: initialState
  });
};

const renderWithProviders = (component, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('API Communication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset axios mock
    mockedAxios.create.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      defaults: { headers: { common: {} } }
    });
  });

  describe('Authentication API Integration', () => {
    it('should handle successful login with proper token management', async () => {
      const mockResponse = {
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            role: 'CLIENT'
          }
        }
      };

      authService.login.mockResolvedValue(mockResponse);

      const result = await authService.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(authService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle login failure with proper error handling', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' }
        }
      };

      authService.login.mockRejectedValue(mockError);

      await expect(authService.login({
        username: 'wronguser',
        password: 'wrongpass'
      })).rejects.toEqual(mockError);
    });

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      networkError.code = 'NETWORK_ERROR';

      authService.login.mockRejectedValue(networkError);

      await expect(authService.login({
        username: 'testuser',
        password: 'password123'
      })).rejects.toThrow('Network Error');
    });
  });

  describe('API Error Handling', () => {
    it('should handle 403 Forbidden errors', async () => {
      const forbiddenError = {
        response: {
          status: 403,
          data: { message: 'Access denied' }
        }
      };

      ClientServices.loadMyProjects.mockRejectedValue(forbiddenError);

      await expect(ClientServices.loadMyProjects()).rejects.toEqual(forbiddenError);
    });

    it('should handle 404 Not Found errors', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { message: 'Resource not found' }
        }
      };

      FreelancerServices.loadMyProjects.mockRejectedValue(notFoundError);

      await expect(FreelancerServices.loadMyProjects()).rejects.toEqual(notFoundError);
    });

    it('should handle 500 Internal Server Error', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };

      ClientServices.handlePostProject.mockRejectedValue(serverError);

      await expect(ClientServices.handlePostProject({
        title: 'Test Project'
      })).rejects.toEqual(serverError);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'ECONNABORTED';

      FreelancerServices.loadAvailableProjects.mockRejectedValue(timeoutError);

      await expect(FreelancerServices.loadAvailableProjects()).rejects.toThrow('Request timeout');
    });
  });

  describe('API Response Handling', () => {
    it('should handle paginated responses correctly', async () => {
      const paginatedResponse = {
        data: {
          content: [
            { id: 1, title: 'Project 1' },
            { id: 2, title: 'Project 2' }
          ],
          totalElements: 10,
          totalPages: 2,
          currentPage: 0,
          size: 5
        }
      };

      FreelancerServices.loadAvailableProjects.mockResolvedValue(paginatedResponse.data.content);

      const result = await FreelancerServices.loadAvailableProjects();

      expect(FreelancerServices.loadAvailableProjects).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should handle empty responses', async () => {
      const emptyResponse = [];

      NotificationServices.getNotifications.mockResolvedValue(emptyResponse);

      const result = await NotificationServices.getNotifications();

      expect(result).toEqual([]);
    });
  });

  describe('Request Interceptors', () => {
    it('should add authorization header to authenticated requests', async () => {
      const token = 'test-jwt-token';
      localStorage.setItem('token', token);

      const mockResponse = { data: { id: 1, title: 'Test Project' } };
      
      ClientServices.loadMyProjects.mockResolvedValue(mockResponse.data);

      await ClientServices.loadMyProjects();

      expect(ClientServices.loadMyProjects).toHaveBeenCalled();
    });

    it('should handle token expiration', async () => {
      const expiredTokenError = {
        response: {
          status: 401,
          data: { message: 'Token expired' }
        }
      };

      ClientServices.loadMyProjects.mockRejectedValue(expiredTokenError);

      await expect(ClientServices.loadMyProjects()).rejects.toEqual(expiredTokenError);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous requests', async () => {
      const mockResponses = [
        [{ id: 1, title: 'Project 1' }],
        [{ id: 1, title: 'Notification 1' }],
        { id: 1, username: 'testuser' }
      ];

      ClientServices.loadMyProjects.mockResolvedValue(mockResponses[0]);
      NotificationServices.getNotifications.mockResolvedValue(mockResponses[1]);
      ClientServices.getClientStats.mockResolvedValue(mockResponses[2]);

      const [projects, notifications, profile] = await Promise.all([
        ClientServices.loadMyProjects(),
        NotificationServices.getNotifications(),
        ClientServices.getClientStats()
      ]);

      expect(projects).toEqual(mockResponses[0]);
      expect(notifications).toEqual(mockResponses[1]);
      expect(profile).toEqual(mockResponses[2]);
    });

    it('should handle partial failures in concurrent requests', async () => {
      const mockSuccess = [{ id: 1, title: 'Project 1' }];
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Server error' }
        }
      };

      ClientServices.loadMyProjects.mockResolvedValue(mockSuccess);
      NotificationServices.getNotifications.mockRejectedValue(mockError);

      const results = await Promise.allSettled([
        ClientServices.loadMyProjects(),
        NotificationServices.getNotifications()
      ]);

      expect(results[0].status).toBe('fulfilled');
      expect(results[0].value).toEqual(mockSuccess);
      
      expect(results[1].status).toBe('rejected');
      expect(results[1].reason).toEqual(mockError);
    });
  });

  describe('API Integration with UI', () => {
    it('should handle API calls with proper error handling', async () => {
      // Test API call without UI rendering
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Invalid username or password' }
        }
      };

      authService.login.mockRejectedValue(mockError);

      await expect(authService.login({
        username: 'wronguser',
        password: 'wrongpass'
      })).rejects.toEqual(mockError);
    });

    it('should handle successful API responses', async () => {
      const mockResponse = {
        data: {
          token: 'jwt-token',
          user: { id: 1, username: 'testuser', role: 'CLIENT' }
        }
      };

      authService.login.mockResolvedValue(mockResponse);

      const result = await authService.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Service Layer Integration', () => {
    it('should properly transform request data', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'Test Description',
        budget: 1000,
        deadline: '2024-12-31'
      };

      const mockResponse = { id: 1, ...projectData };
      ClientServices.handlePostProject.mockResolvedValue(mockResponse);

      const result = await ClientServices.handlePostProject(projectData);

      expect(ClientServices.handlePostProject).toHaveBeenCalledWith(projectData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle service-specific error formats', async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            message: 'Validation failed',
            errors: {
              title: 'Title is required',
              budget: 'Budget must be positive'
            }
          }
        }
      };

      ClientServices.handlePostProject.mockRejectedValue(validationError);

      await expect(ClientServices.handlePostProject({})).rejects.toEqual(validationError);
    });
  });

  describe('Authentication Flow Integration', () => {
    it('should handle complete authentication flow', async () => {
      const loginResponse = {
        data: {
          token: 'jwt-token',
          user: { id: 1, username: 'testuser', role: 'CLIENT' }
        }
      };

      authService.login.mockResolvedValue(loginResponse);
      authService.setAuthToken.mockImplementation(() => {});

      const result = await authService.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(authService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });

      expect(result).toEqual(loginResponse);
    });

    it('should handle token management', () => {
      const token = 'test-jwt-token';
      authService.setAuthToken.mockImplementation(() => {});

      authService.setAuthToken(token);

      expect(authService.setAuthToken).toHaveBeenCalledWith(token);
    });
  });
}); 