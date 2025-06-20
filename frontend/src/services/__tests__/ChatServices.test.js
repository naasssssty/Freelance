import axios from 'axios';
import {
  sendMessage,
  getMessages,
  getChatRooms
} from '../ChatServices';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    sub: 'testuser',
    role: 'FREELANCER',
    verified: true
  }))
}));

describe('ChatServices', () => {
  let mockCreate;
  let mockGet;
  let mockPost;

  beforeEach(() => {
    mockGet = jest.fn();
    mockPost = jest.fn();
    mockCreate = jest.fn(() => ({
      get: mockGet,
      post: mockPost,
      defaults: {
        headers: {
          common: {}
        }
      }
    }));
    mockedAxios.create = mockCreate;

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-jwt-token'),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should successfully send a message', async () => {
      const messageData = {
        chatRoomId: 1,
        content: 'Hello, how is the project going?',
        recipientUsername: 'client1'
      };

      const mockResponse = {
        data: {
          id: 1,
          chatRoomId: 1,
          senderUsername: 'testuser',
          content: 'Hello, how is the project going?',
          timestamp: '2024-01-15T10:30:00Z',
          read: false
        },
        status: 201
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await sendMessage(messageData);

      expect(mockPost).toHaveBeenCalledWith('/chat/send', messageData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error when sending message', async () => {
      const messageData = {
        chatRoomId: 1,
        content: 'Test message',
        recipientUsername: 'client1'
      };

      const mockError = {
        response: {
          data: { message: 'Chat room not found' },
          status: 404
        }
      };

      mockPost.mockRejectedValue(mockError);

      await expect(sendMessage(messageData)).rejects.toThrow('Chat room not found');
    });

    it('should handle unauthorized access', async () => {
      const messageData = {
        chatRoomId: 1,
        content: 'Test message',
        recipientUsername: 'client1'
      };

      const mockError = {
        response: {
          data: { message: 'Unauthorized' },
          status: 401
        }
      };

      mockPost.mockRejectedValue(mockError);

      await expect(sendMessage(messageData)).rejects.toThrow('Unauthorized');
    });

    it('should handle empty message content', async () => {
      const messageData = {
        chatRoomId: 1,
        content: '',
        recipientUsername: 'client1'
      };

      const mockError = {
        response: {
          data: { message: 'Message content cannot be empty' },
          status: 400
        }
      };

      mockPost.mockRejectedValue(mockError);

      await expect(sendMessage(messageData)).rejects.toThrow('Message content cannot be empty');
    });
  });

  describe('getMessages', () => {
    it('should successfully fetch messages for a chat room', async () => {
      const chatRoomId = 1;
      const mockMessages = [
        {
          id: 1,
          chatRoomId: 1,
          senderUsername: 'testuser',
          content: 'Hello!',
          timestamp: '2024-01-15T10:30:00Z',
          read: true
        },
        {
          id: 2,
          chatRoomId: 1,
          senderUsername: 'client1',
          content: 'Hi there! How can I help you?',
          timestamp: '2024-01-15T10:35:00Z',
          read: false
        },
        {
          id: 3,
          chatRoomId: 1,
          senderUsername: 'testuser',
          content: 'I wanted to discuss the project requirements.',
          timestamp: '2024-01-15T10:40:00Z',
          read: false
        }
      ];

      const mockResponse = {
        data: mockMessages,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getMessages(chatRoomId);

      expect(mockGet).toHaveBeenCalledWith(`/chat/room/${chatRoomId}/messages`);
      expect(result).toEqual(mockMessages);
    });

    it('should handle empty messages list', async () => {
      const chatRoomId = 1;
      const mockResponse = {
        data: [],
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getMessages(chatRoomId);

      expect(result).toEqual([]);
    });

    it('should handle API error when fetching messages', async () => {
      const chatRoomId = 1;
      const mockError = {
        response: {
          data: { message: 'Chat room not found' },
          status: 404
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getMessages(chatRoomId)).rejects.toThrow('Chat room not found');
    });

    it('should handle unauthorized access when fetching messages', async () => {
      const chatRoomId = 1;
      const mockError = {
        response: {
          data: { message: 'Unauthorized access to chat room' },
          status: 403
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getMessages(chatRoomId)).rejects.toThrow('Unauthorized access to chat room');
    });

    it('should handle invalid chat room ID', async () => {
      const chatRoomId = -1;
      const mockError = {
        response: {
          data: { message: 'Invalid chat room ID' },
          status: 400
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getMessages(chatRoomId)).rejects.toThrow('Invalid chat room ID');
    });
  });

  describe('getChatRooms', () => {
    it('should successfully fetch user chat rooms', async () => {
      const mockChatRooms = [
        {
          id: 1,
          projectId: 1,
          projectTitle: 'React Development Project',
          participants: ['testuser', 'client1'],
          lastMessage: {
            content: 'Project looks great!',
            timestamp: '2024-01-15T15:30:00Z',
            senderUsername: 'client1'
          },
          unreadCount: 2
        },
        {
          id: 2,
          projectId: 2,
          projectTitle: 'Node.js API Development',
          participants: ['testuser', 'client2'],
          lastMessage: {
            content: 'When can we start?',
            timestamp: '2024-01-14T09:15:00Z',
            senderUsername: 'testuser'
          },
          unreadCount: 0
        }
      ];

      const mockResponse = {
        data: mockChatRooms,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getChatRooms();

      expect(mockGet).toHaveBeenCalledWith('/chat/rooms');
      expect(result).toEqual(mockChatRooms);
    });

    it('should handle empty chat rooms list', async () => {
      const mockResponse = {
        data: [],
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getChatRooms();

      expect(result).toEqual([]);
    });

    it('should handle API error when fetching chat rooms', async () => {
      const mockError = {
        response: {
          data: { message: 'Server Error' },
          status: 500
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getChatRooms()).rejects.toThrow('Server Error');
    });

    it('should handle unauthorized access when fetching chat rooms', async () => {
      const mockError = {
        response: {
          data: { message: 'Unauthorized' },
          status: 401
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getChatRooms()).rejects.toThrow('Unauthorized');
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      const mockError = new Error('Network Error');
      mockGet.mockRejectedValue(mockError);

      await expect(getChatRooms()).rejects.toThrow('Network Error');
    });

    it('should handle timeout errors', async () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getChatRooms()).rejects.toThrow('timeout of 5000ms exceeded');
    });

    it('should handle malformed response data', async () => {
      const mockResponse = {
        data: 'invalid json',
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getChatRooms();

      expect(result).toBe('invalid json');
    });

    it('should handle null response', async () => {
      const mockResponse = {
        data: null,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getChatRooms();

      expect(result).toBe(null);
    });
  });

  describe('Authentication token handling', () => {
    it('should handle missing token', () => {
      window.localStorage.getItem.mockReturnValue(null);

      expect(() => getChatRooms()).not.toThrow();
    });

    it('should handle invalid token format', () => {
      window.localStorage.getItem.mockReturnValue('invalid-token');

      expect(() => getChatRooms()).not.toThrow();
    });
  });

  describe('API client configuration', () => {
    it('should create axios instance with correct configuration', () => {
      getChatRooms();

      expect(mockCreate).toHaveBeenCalled();
    });

    it('should set authorization headers correctly', async () => {
      const mockResponse = {
        data: [],
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      await getChatRooms();

      expect(mockGet).toHaveBeenCalled();
    });
  });
}); 