import axios from 'axios';
import { login, register, setAuthToken } from '../auth';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Clear localStorage before each test
        localStorage.clear();
    });

    describe('login', () => {
        it('should login successfully and return token', async () => {
            const mockResponse = {
                data: {
                    token: 'mock-jwt-token'
                }
            };
            
            mockedAxios.post.mockResolvedValue(mockResponse);

            const credentials = {
                username: 'testuser',
                password: 'testpass'
            };

            const result = await login(credentials);

            expect(mockedAxios.post).toHaveBeenCalledWith('/api/login', credentials);
            expect(result).toEqual(mockResponse.data);
        });

        it('should handle login failure', async () => {
            const mockError = new Error('Login failed');
            mockedAxios.post.mockRejectedValue(mockError);

            const credentials = {
                username: 'testuser',
                password: 'wrongpass'
            };

            await expect(login(credentials)).rejects.toThrow('Login failed');
        });
    });

    describe('register', () => {
        it('should register successfully', async () => {
            const mockResponse = {
                data: {
                    message: 'User registered successfully'
                }
            };
            
            mockedAxios.post.mockResolvedValue(mockResponse);

            const userData = {
                username: 'newuser',
                email: 'test@example.com',
                password: 'password123',
                role: 'CLIENT'
            };

            const result = await register(userData);

            expect(mockedAxios.post).toHaveBeenCalledWith('/api/register', userData);
            expect(result).toEqual(mockResponse.data);
        });

        it('should handle registration failure', async () => {
            const mockError = new Error('Registration failed');
            mockedAxios.post.mockRejectedValue(mockError);

            const userData = {
                username: 'existinguser',
                email: 'existing@example.com',
                password: 'password123',
                role: 'CLIENT'
            };

            await expect(register(userData)).rejects.toThrow('Registration failed');
        });
    });

    describe('setAuthToken', () => {
        it('should set authorization header when token is provided', () => {
            const token = 'test-token';
            
            setAuthToken(token);

            expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
        });

        it('should remove authorization header when token is null', () => {
            setAuthToken(null);

            expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
        });
    });
}); 