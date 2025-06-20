import { getTokenAndDecode } from '../auth';
import { jwtDecode } from 'jwt-decode';

// Mock jwt-decode
jest.mock('jwt-decode');

describe('Auth Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    describe('getTokenAndDecode', () => {
        it('should return token and username when valid token exists in localStorage', () => {
            const mockDecodedToken = {
                sub: 'testuser',
                role: 'CLIENT',
                exp: Date.now() / 1000 + 3600 // 1 hour from now
            };

            localStorage.setItem('token', 'valid-jwt-token');
            jwtDecode.mockReturnValue(mockDecodedToken);

            const result = getTokenAndDecode();

            expect(result).toEqual({
                token: 'valid-jwt-token',
                username: 'testuser'
            });
            expect(jwtDecode).toHaveBeenCalledWith('valid-jwt-token');
        });

        it('should throw error when no token exists in localStorage', () => {
            expect(() => {
                getTokenAndDecode();
            }).toThrow('No token found');
        });

        it('should throw error when token is invalid', () => {            
            localStorage.setItem('token', 'invalid-token');
            jwtDecode.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            expect(() => {
                getTokenAndDecode();
            }).toThrow();
        });

        it('should throw error when decoded token has no sub field', () => {
            const mockDecodedToken = {
                role: 'CLIENT',
                exp: Date.now() / 1000 + 3600
            };

            localStorage.setItem('token', 'no-sub-token');
            jwtDecode.mockReturnValue(mockDecodedToken);

            expect(() => {
                getTokenAndDecode();
            }).toThrow('Invalid token');
        });

        it('should throw error when decoded token has empty sub field', () => {
            const mockDecodedToken = {
                sub: '',
                role: 'CLIENT',
                exp: Date.now() / 1000 + 3600
            };

            localStorage.setItem('token', 'empty-sub-token');
            jwtDecode.mockReturnValue(mockDecodedToken);

            expect(() => {
                getTokenAndDecode();
            }).toThrow('Invalid token');
        });

        it('should throw error for empty string token', () => {
            localStorage.setItem('token', '');

            expect(() => {
                getTokenAndDecode();
            }).toThrow('No token found');
        });

        it('should throw error for null token in localStorage', () => {
            localStorage.removeItem('token');

            expect(() => {
                getTokenAndDecode();
            }).toThrow('No token found');
        });
    });
}); 