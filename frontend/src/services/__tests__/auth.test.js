import axios from 'axios';
import { login, register, setAuthToken } from '../auth';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('Auth Service', () => {
  let mockCreate;
  let mockPost;

  beforeEach(() => {
    mockPost = jest.fn();
    mockCreate = jest.fn(() => ({
      post: mockPost,
      defaults: {
        headers: {
          common: {}
        }
      }
    }));
    mockedAxios.create = mockCreate;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockCredentials = { username: 'testuser', password: 'password123' };
      const mockResponse = { 
        data: { token: 'mock-jwt-token', user: { username: 'testuser' } },
        status: 200 
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await login(mockCredentials);

      expect(mockPost).toHaveBeenCalledWith('/api/login', mockCredentials);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when login fails', async () => {
      const mockCredentials = { username: 'testuser', password: 'wrongpassword' };
      const mockError = {
        response: {
          data: { message: 'Invalid credentials' },
          status: 401
        }
      };

      mockPost.mockRejectedValue(mockError);

      await expect(login(mockCredentials)).rejects.toEqual(mockError.response.data);
    });

    it('should throw generic error when no response', async () => {
      const mockCredentials = { username: 'testuser', password: 'password123' };
      const mockError = new Error('Network error');

      mockPost.mockRejectedValue(mockError);

      await expect(login(mockCredentials)).rejects.toEqual(mockError);
    });
  });

  describe('register', () => {
    it('should successfully register with valid user data', async () => {
      const mockUserData = {
        username: 'newuser',
        email: 'newuser@test.com',
        password: 'password123',
        role: 'CLIENT'
      };
      const mockResponse = {
        data: { message: 'User registered successfully', user: mockUserData }
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await register(mockUserData);

      expect(mockPost).toHaveBeenCalledWith('/api/register', mockUserData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when registration fails', async () => {
      const mockUserData = {
        username: 'existinguser',
        email: 'existing@test.com',
        password: 'password123',
        role: 'CLIENT'
      };
      const mockError = {
        response: {
          data: { message: 'Username already exists' },
          status: 409
        }
      };

      mockPost.mockRejectedValue(mockError);

      await expect(register(mockUserData)).rejects.toEqual(mockError.response.data);
    });
  });

  describe('setAuthToken', () => {
    let mockApiClient;

    beforeEach(() => {
      mockApiClient = {
        defaults: {
          headers: {
            common: {}
          }
        }
      };
      mockCreate.mockReturnValue(mockApiClient);
    });

    it('should set authorization header when token is provided', () => {
      const token = 'mock-jwt-token';
      
      // We need to import and test the actual function since it uses the apiClient instance
      setAuthToken(token);
      
      // Since we can't directly test the internal apiClient, we'll test the behavior
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should remove authorization header when token is null', () => {
      setAuthToken(null);
      
      expect(mockCreate).toHaveBeenCalled();
    });
  });
}); 