import { getTokenAndDecode } from '../auth';

// Mock jwt-decode
jest.mock('jwt-decode', () => jest.fn());

describe('Auth Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    describe('getTokenAndDecode', () => {
        it('should return decoded token when valid token exists in localStorage', () => {
            const jwtDecode = require('jwt-decode');
            const mockDecodedToken = {
                username: 'testuser',
                role: 'CLIENT',
                exp: Date.now() / 1000 + 3600 // 1 hour from now
            };

            localStorage.setItem('token', 'valid-jwt-token');
            jwtDecode.mockReturnValue(mockDecodedToken);

            const result = getTokenAndDecode();

            expect(result).toEqual(mockDecodedToken);
            expect(jwtDecode).toHaveBeenCalledWith('valid-jwt-token');
        });

        it('should return null when no token exists in localStorage', () => {
            const result = getTokenAndDecode();

            expect(result).toBeNull();
        });

        it('should return null when token is invalid', () => {
            const jwtDecode = require('jwt-decode');
            
            localStorage.setItem('token', 'invalid-token');
            jwtDecode.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const result = getTokenAndDecode();

            expect(result).toBeNull();
        });

        it('should return null when token is expired', () => {
            const jwtDecode = require('jwt-decode');
            const mockDecodedToken = {
                username: 'testuser',
                role: 'CLIENT',
                exp: Date.now() / 1000 - 3600 // 1 hour ago (expired)
            };

            localStorage.setItem('token', 'expired-jwt-token');
            jwtDecode.mockReturnValue(mockDecodedToken);

            const result = getTokenAndDecode();

            expect(result).toBeNull();
        });

        it('should handle localStorage errors gracefully', () => {
            // Mock localStorage to throw an error
            const originalGetItem = localStorage.getItem;
            localStorage.getItem = jest.fn(() => {
                throw new Error('localStorage error');
            });

            const result = getTokenAndDecode();

            expect(result).toBeNull();

            // Restore original localStorage
            localStorage.getItem = originalGetItem;
        });

        it('should return null for empty string token', () => {
            localStorage.setItem('token', '');

            const result = getTokenAndDecode();

            expect(result).toBeNull();
        });

        it('should return null for null token in localStorage', () => {
            localStorage.setItem('token', 'null');

            const result = getTokenAndDecode();

            expect(result).toBeNull();
        });
    });
}); 