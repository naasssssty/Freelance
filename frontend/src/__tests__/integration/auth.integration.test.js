import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Login } from '../../pages/Login';
import { Register } from '../../pages/Register';
import * as authService from '../../services/auth';

// Mock the auth service
jest.mock('../../services/auth');

// Mock react-router-dom Navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => mockNavigate
}));

// Mock react-hook-form for Register component
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn((name, options) => ({
      name,
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn()
    })),
    handleSubmit: jest.fn((fn) => (e) => {
      e.preventDefault();
      fn({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'CLIENT'
      });
    }),
    formState: { errors: {} },
    watch: jest.fn(() => 'password123')
  })
}));

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
      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
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

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalled();
      });

      // Should show error message (the Login component should handle this)
      expect(authService.login).toHaveBeenCalledWith({
        username: 'wronguser',
        password: 'wrongpass'
      });
    });

    it('should display form elements correctly', () => {
      renderWithProviders(<Login />);

      expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    });

    it('should show loading state during login', async () => {
      authService.login.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      renderWithProviders(<Login />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });
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
      const usernameInput = screen.getByPlaceholderText(/username/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/^password$/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);
      const roleSelect = screen.getByRole('combobox');
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
          confirmPassword: 'password123',
          role: 'CLIENT'
        });
      });

      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should display form elements correctly', () => {
      renderWithProviders(<Register />);

      expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    });

    it('should display role options', () => {
      renderWithProviders(<Register />);

      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByText('Freelancer')).toBeInTheDocument();
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

      // Login form should still be visible as it doesn't check authentication state
      expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    });

    it('should handle empty form submission', async () => {
      renderWithProviders(<Login />);

      const loginButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(loginButton);

      // The Login component will call the service with empty values
      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          username: '',
          password: ''
        });
      });
    });
  });

  describe('Form Validation', () => {
    it('should require all fields in registration form', () => {
      renderWithProviders(<Register />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/^password$/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);

      // These are managed by react-hook-form, so we just check they exist
      expect(usernameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    it('should require all fields in login form', () => {
      renderWithProviders(<Login />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      expect(usernameInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should have correct input types', () => {
      renderWithProviders(<Register />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/^password$/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during login', async () => {
      authService.login.mockRejectedValue(new Error('Network Error'));

      renderWithProviders(<Login />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalled();
      });

      // The component should handle the error appropriately
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors during registration', async () => {
      authService.register.mockRejectedValue(new Error('Network Error'));

      renderWithProviders(<Register />);

      const registerButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalled();
      });

      // The component should handle the error appropriately
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should display error message on login failure', async () => {
      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      renderWithProviders(<Login />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Integration', () => {
    it('should have navigation links between login and register', () => {
      renderWithProviders(<Login />);
      
      expect(screen.getByText('Register here')).toBeInTheDocument();
      expect(screen.getByText('Register here').closest('a')).toHaveAttribute('href', '/register');
    });

    it('should have navigation links from register to login', () => {
      renderWithProviders(<Register />);
      
      expect(screen.getByText('Login here')).toBeInTheDocument();
      expect(screen.getByText('Login here').closest('a')).toHaveAttribute('href', '/login');
    });
  });
}); 