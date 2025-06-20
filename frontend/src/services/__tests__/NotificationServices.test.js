import axios from 'axios';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../NotificationServices';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('NotificationServices', () => {
  let mockCreate;
  let mockGet;
  let mockPut;

  beforeEach(() => {
    mockGet = jest.fn();
    mockPut = jest.fn();
    mockCreate = jest.fn(() => ({
      get: mockGet,
      put: mockPut,
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

  describe('getNotifications', () => {
    it('should successfully fetch notifications', async () => {
      const mockNotifications = [
        {
          id: 1,
          message: 'New application received',
          timestamp: '2024-01-01T12:00:00Z',
          read: false,
          type: 'APPLICATION_RECEIVED'
        },
        {
          id: 2,
          message: 'Application approved',
          timestamp: '2024-01-02T12:00:00Z',
          read: true,
          type: 'APPLICATION_ACCEPTED'
        }
      ];

      const mockResponse = {
        data: mockNotifications,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getNotifications();

      expect(mockGet).toHaveBeenCalledWith('/notifications');
      expect(result).toEqual(mockNotifications);
    });

    it('should handle empty notifications list', async () => {
      const mockResponse = {
        data: [],
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getNotifications();

      expect(mockGet).toHaveBeenCalledWith('/notifications');
      expect(result).toEqual([]);
    });

    it('should handle API error', async () => {
      const mockError = {
        response: {
          data: { message: 'Unauthorized' },
          status: 401
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getNotifications()).rejects.toThrow('Unauthorized');
    });

    it('should handle network error', async () => {
      const mockError = new Error('Network Error');
      mockGet.mockRejectedValue(mockError);

      await expect(getNotifications()).rejects.toThrow('Network Error');
    });
  });

  describe('getUnreadCount', () => {
    it('should successfully fetch unread count', async () => {
      const mockResponse = {
        data: 5,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getUnreadCount();

      expect(mockGet).toHaveBeenCalledWith('/notifications/unread-count');
      expect(result).toBe(5);
    });

    it('should handle zero unread count', async () => {
      const mockResponse = {
        data: 0,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getUnreadCount();

      expect(mockGet).toHaveBeenCalledWith('/notifications/unread-count');
      expect(result).toBe(0);
    });

    it('should handle API error', async () => {
      const mockError = {
        response: {
          data: { message: 'Server Error' },
          status: 500
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getUnreadCount()).rejects.toThrow('Server Error');
    });

    it('should handle non-numeric response', async () => {
      const mockResponse = {
        data: null,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getUnreadCount();

      expect(result).toBe(null);
    });
  });

  describe('markAsRead', () => {
    it('should successfully mark notification as read', async () => {
      const notificationId = 1;
      const mockResponse = {
        status: 200
      };

      mockPut.mockResolvedValue(mockResponse);

      await markAsRead(notificationId);

      expect(mockPut).toHaveBeenCalledWith(`/notifications/${notificationId}/read`);
    });

    it('should handle string notification ID', async () => {
      const notificationId = '1';
      const mockResponse = {
        status: 200
      };

      mockPut.mockResolvedValue(mockResponse);

      await markAsRead(notificationId);

      expect(mockPut).toHaveBeenCalledWith(`/notifications/${notificationId}/read`);
    });

    it('should handle API error', async () => {
      const notificationId = 1;
      const mockError = {
        response: {
          data: { message: 'Notification not found' },
          status: 404
        }
      };

      mockPut.mockRejectedValue(mockError);

      await expect(markAsRead(notificationId)).rejects.toThrow('Notification not found');
    });

    it('should handle invalid notification ID', async () => {
      const notificationId = null;

      await expect(markAsRead(notificationId)).rejects.toThrow();
    });

    it('should handle network error', async () => {
      const notificationId = 1;
      const mockError = new Error('Network Error');

      mockPut.mockRejectedValue(mockError);

      await expect(markAsRead(notificationId)).rejects.toThrow('Network Error');
    });
  });

  describe('markAllAsRead', () => {
    it('should successfully mark all notifications as read', async () => {
      const mockResponse = {
        status: 200
      };

      mockPut.mockResolvedValue(mockResponse);

      await markAllAsRead();

      expect(mockPut).toHaveBeenCalledWith('/notifications/mark-all-read');
    });

    it('should handle API error', async () => {
      const mockError = {
        response: {
          data: { message: 'Unauthorized' },
          status: 401
        }
      };

      mockPut.mockRejectedValue(mockError);

      await expect(markAllAsRead()).rejects.toThrow('Unauthorized');
    });

    it('should handle server error', async () => {
      const mockError = {
        response: {
          data: { message: 'Internal Server Error' },
          status: 500
        }
      };

      mockPut.mockRejectedValue(mockError);

      await expect(markAllAsRead()).rejects.toThrow('Internal Server Error');
    });

    it('should handle network error', async () => {
      const mockError = new Error('Network Error');

      mockPut.mockRejectedValue(mockError);

      await expect(markAllAsRead()).rejects.toThrow('Network Error');
    });
  });

  describe('API client configuration', () => {
    it('should create axios instance with correct base configuration', () => {
      // Import any function to trigger axios.create call
      getNotifications();

      expect(mockCreate).toHaveBeenCalled();
    });

    it('should handle authentication headers', async () => {
      // Mock localStorage for token
      const mockToken = 'mock-jwt-token';
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => mockToken),
        },
        writable: true,
      });

      const mockResponse = {
        data: [],
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      await getNotifications();

      expect(mockGet).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle timeout errors', async () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getNotifications()).rejects.toThrow('timeout of 5000ms exceeded');
    });

    it('should handle malformed response data', async () => {
      const mockResponse = {
        data: 'invalid json',
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getNotifications();

      expect(result).toBe('invalid json');
    });

    it('should handle null response', async () => {
      const mockResponse = {
        data: null,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getNotifications();

      expect(result).toBe(null);
    });
  });
}); 