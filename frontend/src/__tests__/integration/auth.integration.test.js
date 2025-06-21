import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import * as authService from '../../services/auth';

// Mock the auth service
jest.mock('../../services/auth');

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false }, action) => {
        switch (action.type) {
          case 'LOGIN_SUCCESS':
            return { ...state, user: action.payload, isAuthenticated: true };
          case 'LOGOUT':
            return { ...state, user: null, isAuthenticated: false };
          default:
            return state;
        }
      }
    },
    preloadedState: initialState
  });
};

const renderWithProviders = (component, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  describe('Login Flow', () => {
    it('should complete full login flow successfully', async () => {
      // Mock successful login response
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'CLIENT'
      };
      
      authService.login.mockResolvedValue({
        data: {
          token: 'mock-jwt-token',
          user: mockUser
        }
      });

      renderWithProviders(<Login />);

      // Fill in login form
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Submit form
      fireEvent.click(loginButton);

      // Wait for login to complete
      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123'
        });
      });

      // Verify success message or redirect would happen
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should handle login failure correctly', async () => {
      // Mock failed login
      authService.login.mockRejectedValue({
        message: 'Invalid credentials'
      });

      renderWithProviders(<Login />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalled();
      });

      // Should show error message
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  describe('Registration Flow', () => {
    it('should complete full registration flow successfully', async () => {
      // Mock successful registration
      authService.register.mockResolvedValue({
        message: 'User registered successfully'
      });

      renderWithProviders(<Register />);

      // Fill registration form
      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const roleSelect = screen.getByLabelText(/role/i);
      const registerButton = screen.getByRole('button', { name: /register/i });

      fireEvent.change(usernameInput, { target: { value: 'newuser' } });
      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.change(roleSelect, { target: { value: 'CLIENT' } });

      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
          role: 'CLIENT'
        });
      });

      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should validate password confirmation', async () => {
      renderWithProviders(<Register />);

      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const registerButton = screen.getByRole('button', { name: /register/i });

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
      fireEvent.click(registerButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });

      expect(authService.register).not.toHaveBeenCalled();
    });
  });

  describe('Authentication State Management', () => {
    it('should persist authentication state across page reloads', () => {
      // Mock localStorage with token
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: 'testuser',
        role: 'CLIENT'
      }));

      const initialState = {
        auth: {
          user: { id: 1, username: 'testuser', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      renderWithProviders(<Login />, initialState);

      // Should not show login form if already authenticated
      expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
    });
  });
}); 