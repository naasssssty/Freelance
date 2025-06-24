import { getTokenAndDecode } from '../auth';
import { jwtDecode } from 'jwt-decode';

// Mock jwt-decode
jest.mock('jwt-decode');

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('auth utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTokenAndDecode', () => {
        it('should successfully decode a valid token and return token and username', () => {
            const mockToken = 'valid.jwt.token';
            const mockDecodedToken = {
                sub: 'testuser',
                role: 'CLIENT',
                isVerified: true
            };

            localStorageMock.getItem.mockReturnValue(mockToken);
            jwtDecode.mockReturnValue(mockDecodedToken);

            const result = getTokenAndDecode();

            expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
            expect(jwtDecode).toHaveBeenCalledWith(mockToken);
            expect(result).toEqual({
                token: mockToken,
                username: 'testuser'
            });
        });

        it('should throw error when no token is found in localStorage', () => {
            localStorageMock.getItem.mockReturnValue(null);

            expect(() => getTokenAndDecode()).toThrow('No token found');
            expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
            expect(jwtDecode).not.toHaveBeenCalled();
        });

        it('should throw error when token exists but is empty string', () => {
            localStorageMock.getItem.mockReturnValue('');

            expect(() => getTokenAndDecode()).toThrow('No token found');
            expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
            expect(jwtDecode).not.toHaveBeenCalled();
        });

        it('should throw error when decoded token has no username in sub field', () => {
            const mockToken = 'valid.jwt.token';
            const mockDecodedToken = {
                role: 'CLIENT',
                isVerified: true
                // missing sub field
            };

            localStorageMock.getItem.mockReturnValue(mockToken);
            jwtDecode.mockReturnValue(mockDecodedToken);

            expect(() => getTokenAndDecode()).toThrow('Invalid token');
            expect(jwtDecode).toHaveBeenCalledWith(mockToken);
        });

        it('should throw error when decoded token has empty username in sub field', () => {
            const mockToken = 'valid.jwt.token';
            const mockDecodedToken = {
                sub: '',
                role: 'CLIENT',
                isVerified: true
            };

            localStorageMock.getItem.mockReturnValue(mockToken);
            jwtDecode.mockReturnValue(mockDecodedToken);

            expect(() => getTokenAndDecode()).toThrow('Invalid token');
            expect(jwtDecode).toHaveBeenCalledWith(mockToken);
        });

        it('should throw error when decoded token has null username in sub field', () => {
            const mockToken = 'valid.jwt.token';
            const mockDecodedToken = {
                sub: null,
                role: 'CLIENT',
                isVerified: true
            };

            localStorageMock.getItem.mockReturnValue(mockToken);
            jwtDecode.mockReturnValue(mockDecodedToken);

            expect(() => getTokenAndDecode()).toThrow('Invalid token');
            expect(jwtDecode).toHaveBeenCalledWith(mockToken);
        });

        it('should throw error when jwtDecode throws an error', () => {
            const mockToken = 'invalid.jwt.token';
            
            localStorageMock.getItem.mockReturnValue(mockToken);
            jwtDecode.mockImplementation(() => {
                throw new Error('Invalid token format');
            });

            expect(() => getTokenAndDecode()).toThrow('Invalid token format');
            expect(jwtDecode).toHaveBeenCalledWith(mockToken);
        });

        it('should handle token with different username formats', () => {
            const testCases = [
                'user123',
                'test.user@example.com',
                'user_with_underscores',
                'user-with-dashes'
            ];

            testCases.forEach(username => {
                const mockToken = 'valid.jwt.token';
                const mockDecodedToken = {
                    sub: username,
                    role: 'FREELANCER',
                    isVerified: false
                };

                localStorageMock.getItem.mockReturnValue(mockToken);
                jwtDecode.mockReturnValue(mockDecodedToken);

                const result = getTokenAndDecode();

                expect(result).toEqual({
                    token: mockToken,
                    username: username
                });
            });
        });
    });
});
