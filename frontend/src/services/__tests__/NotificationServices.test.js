import axios from 'axios';
import * as NotificationServices from '../NotificationServices';

// Mock axios
jest.mock('axios');

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
});

afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
});

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

describe('NotificationServices', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue('mock.jwt.token');
    });

    describe('getNotifications', () => {
        it('should successfully fetch notifications', async () => {
            const mockNotifications = [
                { id: 1, message: 'Test notification 1', read: false },
                { id: 2, message: 'Test notification 2', read: true }
            ];
            const mockResponse = { data: mockNotifications, status: 200 };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await NotificationServices.getNotifications();

            expect(axios.get).toHaveBeenCalledWith('/notifications', {
                headers: {
                    'Authorization': 'Bearer mock.jwt.token',
                    'Content-Type': 'application/json'
                }
            });
            expect(result).toEqual(mockNotifications);
            expect(console.log).toHaveBeenCalledWith('Fetching notifications...');
            expect(console.log).toHaveBeenCalledWith('Notifications response status:', 200);
        });

        it('should return empty array when API returns non-array data', async () => {
            const mockResponse = { data: 'invalid data', status: 200 };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await NotificationServices.getNotifications();

            expect(result).toEqual([]);
            expect(console.warn).toHaveBeenCalledWith('API returned non-array data:', 'invalid data');
        });

        it('should return empty array when no token is found', async () => {
            localStorageMock.getItem.mockReturnValue(null);

            const result = await NotificationServices.getNotifications();

            expect(result).toEqual([]);
            expect(console.error).toHaveBeenCalledWith('Error fetching notifications:', expect.any(Error));
        });

        it('should return empty array when request fails', async () => {
            const mockError = {
                message: 'Network Error',
                response: {
                    status: 500,
                    data: { error: 'Server error' },
                    headers: {}
                }
            };
            
            axios.get.mockRejectedValue(mockError);

            const result = await NotificationServices.getNotifications();

            expect(result).toEqual([]);
            expect(console.error).toHaveBeenCalledWith('Error fetching notifications:', mockError);
            expect(console.error).toHaveBeenCalledWith('Error details:', {
                message: 'Network Error',
                status: 500,
                data: { error: 'Server error' },
                headers: {}
            });
        });
    });

    describe('getUnreadCount', () => {
        it('should successfully fetch unread count', async () => {
            const mockResponse = { data: 5 };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await NotificationServices.getUnreadCount();

            expect(axios.get).toHaveBeenCalledWith('/notifications/unread-count', {
                headers: {
                    'Authorization': 'Bearer mock.jwt.token',
                    'Content-Type': 'application/json'
                }
            });
            expect(result).toBe(5);
            expect(console.log).toHaveBeenCalledWith('Fetching unread count...');
            expect(console.log).toHaveBeenCalledWith('Unread count response:', 5);
        });

        it('should return 0 when API returns non-number data', async () => {
            const mockResponse = { data: 'invalid count' };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await NotificationServices.getUnreadCount();

            expect(result).toBe(0);
        });

        it('should return 0 when no token is found', async () => {
            localStorageMock.getItem.mockReturnValue(null);

            const result = await NotificationServices.getUnreadCount();

            expect(result).toBe(0);
            expect(console.error).toHaveBeenCalledWith('Error fetching unread count:', expect.any(Error));
        });

        it('should return 0 when request fails', async () => {
            const mockError = {
                message: 'Network Error',
                response: {
                    status: 500,
                    data: { error: 'Server error' }
                }
            };
            
            axios.get.mockRejectedValue(mockError);

            const result = await NotificationServices.getUnreadCount();

            expect(result).toBe(0);
            expect(console.error).toHaveBeenCalledWith('Error fetching unread count:', mockError);
        });
    });

    describe('markAsRead', () => {
        it('should successfully mark notification as read', async () => {
            const notificationId = 123;
            const mockResponse = { data: { success: true } };
            
            axios.put.mockResolvedValue(mockResponse);

            const result = await NotificationServices.markAsRead(notificationId);

            expect(axios.put).toHaveBeenCalledWith(
                '/notifications/123/read',
                null,
                {
                    headers: {
                        'Authorization': 'Bearer mock.jwt.token',
                        'Content-Type': 'application/json'
                    }
                }
            );
            expect(result).toBe(true);
            expect(console.log).toHaveBeenCalledWith('Marking notification as read:', 123);
            expect(console.log).toHaveBeenCalledWith('Successfully marked notification as read');
        });

        it('should throw error when no token is found', async () => {
            localStorageMock.getItem.mockReturnValue(null);

            await expect(NotificationServices.markAsRead(123)).rejects.toThrow('No authentication token found');
        });

        it('should throw error when request fails', async () => {
            const mockError = new Error('Network Error');
            
            axios.put.mockRejectedValue(mockError);

            await expect(NotificationServices.markAsRead(123)).rejects.toThrow(mockError);
            expect(console.error).toHaveBeenCalledWith('Error marking notification as read:', mockError);
        });
    });

    describe('markAllAsRead', () => {
        it('should successfully mark all notifications as read', async () => {
            const mockResponse = { data: { success: true } };
            
            axios.put.mockResolvedValue(mockResponse);

            const result = await NotificationServices.markAllAsRead();

            expect(axios.put).toHaveBeenCalledWith(
                '/notifications/mark-all-read',
                null,
                {
                    headers: {
                        'Authorization': 'Bearer mock.jwt.token',
                        'Content-Type': 'application/json'
                    }
                }
            );
            expect(result).toBe(true);
            expect(console.log).toHaveBeenCalledWith('Marking all notifications as read...');
            expect(console.log).toHaveBeenCalledWith('Successfully marked all notifications as read');
        });

        it('should throw error when no token is found', async () => {
            localStorageMock.getItem.mockReturnValue(null);

            await expect(NotificationServices.markAllAsRead()).rejects.toThrow('No authentication token found');
        });

        it('should throw error when request fails', async () => {
            const mockError = new Error('Network Error');
            
            axios.put.mockRejectedValue(mockError);

            await expect(NotificationServices.markAllAsRead()).rejects.toThrow(mockError);
            expect(console.error).toHaveBeenCalledWith('Error marking all notifications as read:', mockError);
        });
    });
});
