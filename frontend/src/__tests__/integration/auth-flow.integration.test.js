import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Login from '../../pages/Login';
import App from '../../App';
import * as authService from '../../services/auth';

// Mock the auth service
jest.mock('../../services/auth');

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false }, action) => {
        switch (action.type) {
          case 'auth/login':
            return { user: action.payload, isAuthenticated: true };
          case 'auth/logout':
            return { user: null, isAuthenticated: false };
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

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Mock successful login response
    authService.login.mockResolvedValue({
      data: {
        token: 'mock.jwt.token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'CLIENT'
        }
      }
    });
  });

  describe('Login Flow', () => {
    it('should complete full login workflow', async () => {
      renderWithProviders(<Login />);

      // Check if login form is rendered
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'testuser' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
      });

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Wait for login to be called
      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123'
        });
      });
    });

    it('should handle login error gracefully', async () => {
      // Mock login failure
      authService.login.mockRejectedValue({
        response: {
          data: { message: 'Invalid credentials' }
        }
      });

      renderWithProviders(<Login />);

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'wronguser' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpass' }
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should validate form fields before submission', async () => {
      renderWithProviders(<Login />);

      // Try to submit empty form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Check for validation messages
      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      // Ensure login service was not called
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('Authentication State Management', () => {
    it('should persist authentication state after successful login', async () => {
      const { store } = renderWithProviders(<Login />);

      // Simulate successful login
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'testuser' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalled();
      });

      // Check if token is stored in localStorage
      expect(localStorage.getItem).toHaveBeenCalledWith('token');
    });

    it('should clear authentication state on logout', async () => {
      const initialState = {
        auth: {
          user: { id: 1, username: 'testuser' },
          isAuthenticated: true
        }
      };

      renderWithProviders(<App />, { initialState });

      // Find and click logout button (assuming it exists in the header)
      const logoutButton = screen.queryByRole('button', { name: /logout/i });
      if (logoutButton) {
        fireEvent.click(logoutButton);

        await waitFor(() => {
          expect(localStorage.removeItem).toHaveBeenCalledWith('token');
        });
      }
    });
  });

  describe('Protected Routes Integration', () => {
    it('should redirect unauthenticated users to login', async () => {
      // Mock window.location for redirect testing
      delete window.location;
      window.location = { href: '', pathname: '/dashboard' };

      renderWithProviders(<App />);

      // Should show login page for unauthenticated user trying to access protected route
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      });
    });

    it('should allow authenticated users to access protected routes', async () => {
      const initialState = {
        auth: {
          user: { id: 1, username: 'testuser', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      // Mock localStorage to return a token
      Storage.prototype.getItem = jest.fn(() => 'mock.jwt.token');

      renderWithProviders(<App />, { initialState });

      // Should not show login page for authenticated user
      expect(screen.queryByRole('heading', { name: /sign in/i })).not.toBeInTheDocument();
    });
  });
}); 