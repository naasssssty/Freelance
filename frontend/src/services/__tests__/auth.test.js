import axios from 'axios';
import { login, register, setAuthToken } from '../auth';

// Mock axios.create BEFORE importing the auth module
jest.mock('axios', () => {
    const mockApiClient = {
        post: jest.fn(),
        defaults: {
            headers: {
                common: {}
            }
        }
    };
    return {
        create: jest.fn(() => mockApiClient)
    };
});

// Now import the auth module AFTER mocking axios

// Get the mocked apiClient instance
const mockApiClient = axios.create();

describe('auth service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockApiClient.post.mockClear();
        mockApiClient.defaults.headers.common = {};
    });

    describe('login', () => {
        it('should successfully login with valid credentials', async () => {
            const mockCredentials = { username: 'testuser', password: 'testpassword' };
            const mockResponse = { data: { token: 'jwt.token.here' } };
            
            mockApiClient.post.mockResolvedValue(mockResponse);

            const result = await login(mockCredentials);
            expect(result).toEqual(mockResponse);
            expect(mockApiClient.post).toHaveBeenCalledWith('/api/login', mockCredentials);
        });

        it('should throw server error when login fails', async () => {
            const mockCredentials = { username: 'wronguser', password: 'wrongpassword' };
            const mockError = { response: { data: { message: 'Invalid credentials' } } };
            
            mockApiClient.post.mockRejectedValue(mockError);

            await expect(login(mockCredentials)).rejects.toEqual(mockError.response.data);
        });
    });

    describe('register', () => {
        it('should successfully register with valid user data', async () => {
            const mockUserData = { username: 'newuser', email: 'test@example.com', password: 'password123', role: 'CLIENT' };
            const mockResponse = { data: { message: 'User registered successfully' } };
            
            mockApiClient.post.mockResolvedValue(mockResponse);

            const result = await register(mockUserData);
            expect(result).toEqual(mockResponse.data);
            expect(mockApiClient.post).toHaveBeenCalledWith('/api/register', mockUserData);
        });
    });

    describe('setAuthToken', () => {
        it('should set authorization header when token is provided', () => {
            const token = 'test.jwt.token';
            
            setAuthToken(token);
            expect(mockApiClient.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
        });

        it('should remove authorization header when token is null', () => {
            // First set a token
            mockApiClient.defaults.headers.common['Authorization'] = 'Bearer existing.token';
            
            setAuthToken(null);
            expect(mockApiClient.defaults.headers.common['Authorization']).toBeUndefined();
        });
    });
});
