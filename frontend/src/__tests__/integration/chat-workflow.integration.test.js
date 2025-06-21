import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Chat from '../../pages/Chat';
import * as ChatServices from '../../services/ChatServices';

// Mock the chat services
jest.mock('../../services/ChatServices');

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: true
  };
  return jest.fn(() => mockSocket);
});

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false }, action) => {
        switch (action.type) {
          case 'auth/login':
            return { user: action.payload, isAuthenticated: true };
          default:
            return state;
        }
      },
      chat: (state = { messages: [], activeChat: null }, action) => {
        switch (action.type) {
          case 'chat/setMessages':
            return { ...state, messages: action.payload };
          case 'chat/addMessage':
            return { ...state, messages: [...state.messages, action.payload] };
          case 'chat/setActiveChat':
            return { ...state, activeChat: action.payload };
          default:
            return state;
        }
      }
    },
    preloadedState: initialState
  });
};

const renderWithProviders = (component, { initialState = {} } = {}) => {
  const store = createMockStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    ),
    store
  };
};

describe('Chat Workflow Integration Tests', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'CLIENT'
  };

  const mockMessages = [
    {
      id: 1,
      content: 'Hello, I need help with my project',
      sender: { id: 1, username: 'testuser' },
      timestamp: '2024-01-15T10:00:00Z',
      chatId: 1
    },
    {
      id: 2,
      content: 'Sure, I can help you with that',
      sender: { id: 2, username: 'freelancer' },
      timestamp: '2024-01-15T10:05:00Z',
      chatId: 1
    }
  ];

  const mockChats = [
    {
      id: 1,
      participants: [
        { id: 1, username: 'testuser', role: 'CLIENT' },
        { id: 2, username: 'freelancer', role: 'FREELANCER' }
      ],
      lastMessage: 'Sure, I can help you with that',
      updatedAt: '2024-01-15T10:05:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock ChatServices methods
    ChatServices.getUserChats.mockResolvedValue({ data: mockChats });
    ChatServices.getChatMessages.mockResolvedValue({ data: mockMessages });
    ChatServices.sendMessage.mockResolvedValue({
      data: {
        id: 3,
        content: 'New test message',
        sender: mockUser,
        timestamp: new Date().toISOString(),
        chatId: 1
      }
    });
  });

  describe('Chat List Integration', () => {
    it('should load and display user chats on component mount', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Chat />, { initialState });

      // Wait for chats to load
      await waitFor(() => {
        expect(ChatServices.getUserChats).toHaveBeenCalledWith(mockUser.id);
      });

      // Check if chat list is displayed
      await waitFor(() => {
        expect(screen.getByText('freelancer')).toBeInTheDocument();
      });
    });

    it('should handle empty chat list gracefully', async () => {
      ChatServices.getUserChats.mockResolvedValue({ data: [] });

      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Chat />, { initialState });

      await waitFor(() => {
        expect(screen.getByText(/no conversations yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Message Loading Integration', () => {
    it('should load messages when chat is selected', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Chat />, { initialState });

      // Wait for chats to load
      await waitFor(() => {
        expect(screen.getByText('freelancer')).toBeInTheDocument();
      });

      // Click on a chat
      fireEvent.click(screen.getByText('freelancer'));

      // Wait for messages to load
      await waitFor(() => {
        expect(ChatServices.getChatMessages).toHaveBeenCalledWith(1);
      });

      // Check if messages are displayed
      await waitFor(() => {
        expect(screen.getByText('Hello, I need help with my project')).toBeInTheDocument();
        expect(screen.getByText('Sure, I can help you with that')).toBeInTheDocument();
      });
    });

    it('should handle message loading errors gracefully', async () => {
      ChatServices.getChatMessages.mockRejectedValue(new Error('Failed to load messages'));

      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Chat />, { initialState });

      await waitFor(() => {
        expect(screen.getByText('freelancer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('freelancer'));

      await waitFor(() => {
        expect(screen.getByText(/failed to load messages/i)).toBeInTheDocument();
      });
    });
  });

  describe('Message Sending Integration', () => {
    it('should send message and update chat interface', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Chat />, { initialState });

      // Wait for chats to load and select a chat
      await waitFor(() => {
        expect(screen.getByText('freelancer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('freelancer'));

      // Wait for messages to load
      await waitFor(() => {
        expect(screen.getByText('Hello, I need help with my project')).toBeInTheDocument();
      });

      // Find message input and send button
      const messageInput = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      // Type and send message
      fireEvent.change(messageInput, { target: { value: 'New test message' } });
      fireEvent.click(sendButton);

      // Wait for message to be sent
      await waitFor(() => {
        expect(ChatServices.sendMessage).toHaveBeenCalledWith({
          chatId: 1,
          content: 'New test message',
          senderId: mockUser.id
        });
      });

      // Check if message input is cleared
      expect(messageInput.value).toBe('');
    });

    it('should handle message sending errors', async () => {
      ChatServices.sendMessage.mockRejectedValue(new Error('Failed to send message'));

      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Chat />, { initialState });

      await waitFor(() => {
        expect(screen.getByText('freelancer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('freelancer'));

      await waitFor(() => {
        const messageInput = screen.getByPlaceholderText(/type your message/i);
        const sendButton = screen.getByRole('button', { name: /send/i });

        fireEvent.change(messageInput, { target: { value: 'Test message' } });
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/failed to send message/i)).toBeInTheDocument();
      });
    });

    it('should prevent sending empty messages', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Chat />, { initialState });

      await waitFor(() => {
        expect(screen.getByText('freelancer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('freelancer'));

      await waitFor(() => {
        const sendButton = screen.getByRole('button', { name: /send/i });
        
        // Try to send empty message
        fireEvent.click(sendButton);
      });

      // Ensure sendMessage was not called
      expect(ChatServices.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Real-time Updates Integration', () => {
    it('should handle incoming messages via socket', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Chat />, { initialState });

      await waitFor(() => {
        expect(screen.getByText('freelancer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('freelancer'));

      // Simulate receiving a new message via socket
      const newMessage = {
        id: 4,
        content: 'New incoming message',
        sender: { id: 2, username: 'freelancer' },
        timestamp: new Date().toISOString(),
        chatId: 1
      };

      // This would normally be handled by socket event listeners
      // For testing, we can simulate the effect by checking if socket.on was called
      const io = require('socket.io-client');
      const mockSocket = io();
      
      expect(mockSocket.on).toHaveBeenCalledWith('newMessage', expect.any(Function));
    });
  });

  describe('Chat Search and Filter Integration', () => {
    it('should filter chats based on search input', async () => {
      const multipleChats = [
        ...mockChats,
        {
          id: 2,
          participants: [
            { id: 1, username: 'testuser', role: 'CLIENT' },
            { id: 3, username: 'designer', role: 'FREELANCER' }
          ],
          lastMessage: 'Design project discussion',
          updatedAt: '2024-01-15T09:00:00Z'
        }
      ];

      ChatServices.getUserChats.mockResolvedValue({ data: multipleChats });

      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Chat />, { initialState });

      await waitFor(() => {
        expect(screen.getByText('freelancer')).toBeInTheDocument();
        expect(screen.getByText('designer')).toBeInTheDocument();
      });

      // Search for specific chat
      const searchInput = screen.getByPlaceholderText(/search conversations/i);
      fireEvent.change(searchInput, { target: { value: 'freelancer' } });

      // Should show only matching chat
      await waitFor(() => {
        expect(screen.getByText('freelancer')).toBeInTheDocument();
        expect(screen.queryByText('designer')).not.toBeInTheDocument();
      });
    });
  });
}); 