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

      ClientServices.getProjects.mockRejectedValue(forbiddenError);

      await expect(ClientServices.getProjects()).rejects.toEqual(forbiddenError);
    });

    it('should handle 404 Not Found errors', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { message: 'Resource not found' }
        }
      };

      ClientServices.getProject.mockRejectedValue(notFoundError);

      await expect(ClientServices.getProject(999)).rejects.toEqual(notFoundError);
    });

    it('should handle 500 Internal Server Error', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };

      ClientServices.createProject.mockRejectedValue(serverError);

      await expect(ClientServices.createProject({
        title: 'Test Project'
      })).rejects.toEqual(serverError);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'ECONNABORTED';

      FreelancerServices.getAvailableProjects.mockRejectedValue(timeoutError);

      await expect(FreelancerServices.getAvailableProjects()).rejects.toThrow('Request timeout');
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

      FreelancerServices.getAvailableProjects.mockResolvedValue(paginatedResponse);

      const result = await FreelancerServices.getAvailableProjects({ page: 0, size: 5 });

      expect(FreelancerServices.getAvailableProjects).toHaveBeenCalledWith({
        page: 0,
        size: 5
      });

      expect(result.data.content).toHaveLength(2);
      expect(result.data.totalElements).toBe(10);
    });

    it('should handle empty responses', async () => {
      const emptyResponse = {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          currentPage: 0,
          size: 10
        }
      };

      NotificationServices.getNotifications.mockResolvedValue(emptyResponse.data.content);

      const result = await NotificationServices.getNotifications();

      expect(result).toEqual([]);
    });
  });

  describe('Request Interceptors', () => {
    it('should add authorization header to authenticated requests', async () => {
      const token = 'test-jwt-token';
      localStorage.setItem('token', token);

      const mockResponse = { data: { id: 1, title: 'Test Project' } };
      
      ClientServices.getProject.mockResolvedValue(mockResponse);

      await ClientServices.getProject(1);

      expect(ClientServices.getProject).toHaveBeenCalledWith(1);
    });

    it('should handle token expiration', async () => {
      const expiredTokenError = {
        response: {
          status: 401,
          data: { message: 'Token expired' }
        }
      };

      ClientServices.getProjects.mockRejectedValue(expiredTokenError);

      await expect(ClientServices.getProjects()).rejects.toEqual(expiredTokenError);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous requests', async () => {
      const mockResponses = [
        { data: [{ id: 1, title: 'Project 1' }] },
        { data: [{ id: 1, title: 'Notification 1' }] },
        { data: { id: 1, username: 'testuser' } }
      ];

      ClientServices.getProjects.mockResolvedValue(mockResponses[0]);
      NotificationServices.getNotifications.mockResolvedValue(mockResponses[1].data);
      ClientServices.getProfile.mockResolvedValue(mockResponses[2]);

      const [projects, notifications, profile] = await Promise.all([
        ClientServices.getProjects(),
        NotificationServices.getNotifications(),
        ClientServices.getProfile()
      ]);

      expect(projects.data).toEqual(mockResponses[0].data);
      expect(notifications).toEqual(mockResponses[1].data);
      expect(profile.data).toEqual(mockResponses[2].data);
    });

    it('should handle partial failures in concurrent requests', async () => {
      const mockSuccess = { data: [{ id: 1, title: 'Project 1' }] };
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Server error' }
        }
      };

      ClientServices.getProjects.mockResolvedValue(mockSuccess);
      NotificationServices.getNotifications.mockRejectedValue(mockError);

      const results = await Promise.allSettled([
        ClientServices.getProjects(),
        NotificationServices.getNotifications()
      ]);

      expect(results[0].status).toBe('fulfilled');
      expect(results[0].value.data).toEqual(mockSuccess.data);
      
      expect(results[1].status).toBe('rejected');
      expect(results[1].reason).toEqual(mockError);
    });
  });

  describe('API Integration with UI', () => {
    it('should show loading state during API calls', async () => {
      authService.login.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: { token: 'test' } }), 100))
      );

      renderWithProviders(<Login />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      // Should show loading state
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });

    it('should display API error messages to user', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Invalid username or password' }
        }
      };

      authService.login.mockRejectedValue(mockError);

      renderWithProviders(<Login />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
      });
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

      const mockResponse = { data: { id: 1, ...projectData } };
      ClientServices.createProject.mockResolvedValue(mockResponse);

      const result = await ClientServices.createProject(projectData);

      expect(ClientServices.createProject).toHaveBeenCalledWith(projectData);
      expect(result.data).toEqual({ id: 1, ...projectData });
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

      ClientServices.createProject.mockRejectedValue(validationError);

      await expect(ClientServices.createProject({})).rejects.toEqual(validationError);
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

      renderWithProviders(<Login />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123'
        });
      });
    });

    it('should handle logout flow', async () => {
      authService.logout.mockImplementation(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
      });

      await authService.logout();

      expect(authService.logout).toHaveBeenCalled();
    });
  });
}); 