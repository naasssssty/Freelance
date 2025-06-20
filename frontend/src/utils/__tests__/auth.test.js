import { getTokenAndDecode } from '../auth';
import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';

// Mock dependencies
jest.mock('universal-cookie');
jest.mock('jwt-decode');

describe('Auth Utils', () => {
  let mockCookies;

  beforeEach(() => {
    mockCookies = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    };
    Cookies.mockImplementation(() => mockCookies);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTokenAndDecode', () => {
    it('should return decoded token when valid token exists', () => {
      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {
        username: 'testuser',
        role: 'CLIENT',
        isVerified: true,
        exp: Date.now() / 1000 + 3600 // 1 hour from now
      };

      mockCookies.get.mockReturnValue(mockToken);
      jwtDecode.mockReturnValue(mockDecodedToken);

      const result = getTokenAndDecode();

      expect(mockCookies.get).toHaveBeenCalledWith('token');
      expect(jwtDecode).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual(mockDecodedToken);
    });

    it('should return null when no token exists', () => {
      mockCookies.get.mockReturnValue(null);

      const result = getTokenAndDecode();

      expect(mockCookies.get).toHaveBeenCalledWith('token');
      expect(jwtDecode).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when token is invalid', () => {
      const mockToken = 'invalid.jwt.token';
      
      mockCookies.get.mockReturnValue(mockToken);
      jwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = getTokenAndDecode();

      expect(mockCookies.get).toHaveBeenCalledWith('token');
      expect(jwtDecode).toHaveBeenCalledWith(mockToken);
      expect(result).toBeNull();
    });

    it('should return null when token is expired', () => {
      const mockToken = 'expired.jwt.token';
      const mockDecodedToken = {
        username: 'testuser',
        role: 'CLIENT',
        isVerified: true,
        exp: Date.now() / 1000 - 3600 // 1 hour ago (expired)
      };

      mockCookies.get.mockReturnValue(mockToken);
      jwtDecode.mockReturnValue(mockDecodedToken);

      const result = getTokenAndDecode();

      expect(mockCookies.get).toHaveBeenCalledWith('token');
      expect(jwtDecode).toHaveBeenCalledWith(mockToken);
      expect(result).toBeNull();
    });
  });
}); 