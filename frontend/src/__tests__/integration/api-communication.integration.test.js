import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import * as authService from '../../services/auth';
import * as ClientServices from '../../services/ClientServices';
import * as FreelancerServices from '../../services/FreelancerServices';
import * as NotificationServices from '../../services/NotificationServices';
import Login from '../../pages/Login';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

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

      const mockApiClient = {
        post: jest.fn().mockResolvedValue(mockResponse),
        defaults: { headers: { common: {} } }
      };

      mockedAxios.create.mockReturnValue(mockApiClient);

      const result = await authService.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/login', {
        username: 'testuser',
        password: 'password123'
      });

      expect(result).toEqual(mockResponse);

      // Verify token is set in Authorization header
      expect(mockApiClient.defaults.headers.common['Authorization'])
        .toBe(`Bearer ${mockResponse.data.token}`);
    });

    it('should handle login failure with proper error handling', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' }
        }
      };

      const mockApiClient = {
        post: jest.fn().mockRejectedValue(mockError),
        defaults: { headers: { common: {} } }
      };

      mockedAxios.create.mockReturnValue(mockApiClient);

      await expect(authService.login({
        username: 'wronguser',
        password: 'wrongpass'
      })).rejects.toEqual(mockError.response.data);
    });

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      networkError.code = 'NETWORK_ERROR';

      const mockApiClient = {
        post: jest.fn().mockRejectedValue(networkError),
        defaults: { headers: { common: {} } }
      };

      mockedAxios.create.mockReturnValue(mockApiClient);

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

      const mockApiClient = {
        get: jest.fn().mockRejectedValue(forbiddenError),
        defaults: { headers: { common: {} } }
      };

      mockedAxios.create.mockReturnValue(mockApiClient);

      await expect(ClientServices.getProjects()).rejects.toEqual(forbiddenError.response.data);
    });

    it('should handle 404 Not Found errors', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { message: 'Resource not found' }
        }
      };

      const mockApiClient = {
        get: jest.fn().mockRejectedValue(notFoundError),
        defaults: { headers: { common: {} } }
      };

      mockedAxios.create.mockReturnValue(mockApiClient);

      await expect(ClientServices.getProject(999)).rejects.toEqual(notFoundError.response.data);
    });

    it('should handle 500 Internal Server Error', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };

      const mockApiClient = {
        post: jest.fn().mockRejectedValue(serverError),
        defaults: { headers: { common: {} } }
      };

      mockedAxios.create.mockReturnValue(mockApiClient);

      await expect(ClientServices.createProject({
        title: 'Test Project'
      })).rejects.toEqual(serverError.response.data);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'ECONNABORTED';

      const mockApiClient = {
        get: jest.fn().mockRejectedValue(timeoutError),
        defaults: { headers: { common: {} } }
      };

      mockedAxios.create.mockReturnValue(mockApiClient);

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

      const mockApiClient = {
        get: jest.fn().mockResolvedValue(paginatedResponse),
        defaults: { headers: { common: {} } }
      };

      mockedAxios.create.mockReturnValue(mockApiClient);

      const result = await FreelancerServices.getAvailableProjects({ page: 0, size: 5 });

      expect(mockApiClient.get).toHaveBeenCalledWith('/projects/available', {
        params: { page: 0, size: 5 }
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

      const mockApiClient = {
        get: jest.fn().mockResolvedValue(emptyResponse),
        defaults: { headers: { common: {} } }
      };

      mockedAxios.create.mockReturnValue(mockApiClient);

      const result = await NotificationServices.getNotifications();

      expect(result.data.content).toEqual([]);
      expect(result.data.totalElements).toBe(0);
    });
  });

  describe('Request Interceptors', () => {
    it('should add authorization header to authenticated requests', async () => {
      const token = 'test-jwt-token';
      localStorage.setItem('token', token);

      const mockResponse = { data: { id: 1, title: 'Test Project' } };
      const mockApiClient = {
        get: jest.fn().mockResolvedValue(mockResponse),
        defaults: { headers: { common: {} } }
      };

      mockedAxios.create.mockReturnValue(mockApiClient);

      // Set token in auth header
      authService.setAuthToken(token);

      await ClientServices.getProject(1);

      expect(mockApiClient.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
    });

    it('should handle token expiration', async () => {
      const expiredTokenError = {
        response: {
          status: 401,
          data: { message: 'Token expired' }
        }
      };

      const mockApiClient = {
        get: jest.fn().mockRejectedValue(expiredTokenError),
        defaults: { headers: { common: {} } }
      };

      mockedAxios.create.mockReturnValue(mockApiClient);

      await expect(ClientServices.getProjects()).rejects.toEqual(expiredTokenError.response.data);

      // Verify token is removed from headers after expiration
      expect(mockApiClient.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous requests', async () => {
      const mockResponses = [
        { data: [{ id: 1, title: 'Project 1' }] },
        { data: [{ id: 1, title: 'Notification 1' }] },
        { data: { id: 1, username: 'testuser' } }
      ];

      const mockApiClient = {
        get: jest.fn()
          .mockResolvedValueOnce(mockResponses[0])
          .mockResolvedValueOnce(mockResponses[1])
          .mockResolvedValueOnce(mockResponses[2]),
        defaults: { headers: { common: {} } }
      };

      mockedAxios.create.mockReturnValue(mockApiClient);

      const [projects, notifications, profile] = await Promise.all([
        ClientServices.getProjects(),
        NotificationServices.getNotifications(),
        ClientServices.getProfile()
      ]);

      expect(projects.data).toEqual(mockResponses[0].data);
      expect(notifications.data).toEqual(mockResponses[1].data);
      expect(profile.data).toEqual(mockResponses[2].data);
      expect(mockApiClient.get).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures in concurrent requests', async () => {
      const mockSuccess = { data: [{ id: 1, title: 'Project 1' }] };
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Server error' }
        }
      };

      const mockApiClient = {
        get: jest.fn()
          .mockResolvedValueOnce(mockSuccess)
          .mockRejectedValueOnce(mockError),
        defaults: { headers: { common: {} } }
      };

      mockedAxios.create.mockReturnValue(mockApiClient);

      const results = await Promise.allSettled([
        ClientServices.getProjects(),
        NotificationServices.getNotifications()
      ]);

      expect(results[0].status).toBe('fulfilled');
      expect(results[0].value.data).toEqual(mockSuccess.data);
      
      expect(results[1].status).toBe('rejected');
      expect(results[1].reason).toEqual(mockError.response.data);
    });
  });

  describe('API Integration with UI', () => {
    it('should show loading state during API calls', async () => {
      const mockApiClient = {
        post: jest.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({ data: { token: 'test' } }), 100))
        ),
        defaults: { headers: { common: {} } }
      };

      mockedAxios.create.mockReturnValue(mockApiClient);

      renderWithProviders(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
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

      const mockApiClient = {
        post: jest.fn().mockRejectedValue(mockError),
        defaults: { headers: { common: {} } }
      };

      mockedAxios.create.mockReturnValue(mockApiClient);

      renderWithProviders(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
      });
    });
  });
}); 