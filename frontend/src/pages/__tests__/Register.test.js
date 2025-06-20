import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Register } from '../Register';
import * as authService from '../../services/auth';
import Cookies from 'universal-cookie';

// Mock dependencies
jest.mock('../../services/auth');
jest.mock('universal-cookie');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  let mockCookies;
  let mockNavigate;

  beforeEach(() => {
    mockCookies = {
      set: jest.fn(),
      get: jest.fn(),
      remove: jest.fn()
    };
    Cookies.mockImplementation(() => mockCookies);
    
    mockNavigate = jest.fn();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should render registration form elements', () => {
    renderWithRouter(<Register />);
    
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByDisplayValue('CLIENT')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it('should update form fields when user types', () => {
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(usernameInput.value).toBe('testuser');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should handle role selection', () => {
    renderWithRouter(<Register />);
    
    const roleSelect = screen.getByDisplayValue('CLIENT');
    fireEvent.change(roleSelect, { target: { value: 'FREELANCER' } });
    
    expect(roleSelect.value).toBe('FREELANCER');
  });

  it('should submit form with valid data', async () => {
    const mockResponse = {
      data: {
        token: 'mock-jwt-token'
      }
    };
    
    authService.register.mockResolvedValue(mockResponse);
    
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const roleSelect = screen.getByDisplayValue('CLIENT');
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(roleSelect, { target: { value: 'FREELANCER' } });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'FREELANCER'
      });
    });
  });

  it('should store token in cookies on successful registration', async () => {
    const mockResponse = {
      data: {
        token: 'mock-jwt-token'
      }
    };
    
    authService.register.mockResolvedValue(mockResponse);
    
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(mockCookies.set).toHaveBeenCalledWith('token', 'mock-jwt-token', { path: '/' });
    });
  });

  it('should display error message on failed registration', async () => {
    const mockError = {
      message: 'Username already exists'
    };
    
    authService.register.mockRejectedValue(mockError);
    
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    renderWithRouter(<Register />);
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    renderWithRouter(<Register />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('should validate password length', async () => {
    renderWithRouter(<Register />);
    
    const passwordInput = screen.getByPlaceholderText('Password');
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('should validate username length', async () => {
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    fireEvent.change(usernameInput, { target: { value: 'ab' } });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('should navigate to login page when login link is clicked', () => {
    renderWithRouter(<Register />);
    
    const loginLink = screen.getByText(/login here/i);
    fireEvent.click(loginLink);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should show loading state during registration', async () => {
    let resolveRegister;
    const registerPromise = new Promise((resolve) => {
      resolveRegister = resolve;
    });
    
    authService.register.mockReturnValue(registerPromise);
    
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(registerButton);
    
    // Check if register button is disabled during loading
    expect(registerButton).toBeDisabled();
    
    // Resolve the promise
    resolveRegister({ data: { token: 'mock-token' } });
    
    await waitFor(() => {
      expect(registerButton).not.toBeDisabled();
    });
  });

  it('should clear error message when user starts typing', async () => {
    const mockError = {
      message: 'Username already exists'
    };
    
    authService.register.mockRejectedValue(mockError);
    
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    // First, trigger an error
    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
    
    // Then, start typing again
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    
    // Error message should be cleared (this depends on implementation)
    await waitFor(() => {
      expect(screen.queryByText('Username already exists')).not.toBeInTheDocument();
    });
  });

  it('should handle form submission with enter key', async () => {
    const mockResponse = {
      data: {
        token: 'mock-jwt-token'
      }
    };
    
    authService.register.mockResolvedValue(mockResponse);
    
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.keyPress(passwordInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    await waitFor(() => {
      expect(authService.register).toHaveBeenCalled();
    });
  });

  it('should handle special characters in form fields', async () => {
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.change(usernameInput, { target: { value: 'test@user#123' } });
    fireEvent.change(emailInput, { target: { value: 'test+user@example.co.uk' } });
    fireEvent.change(passwordInput, { target: { value: 'P@ssw0rd!123' } });
    
    expect(usernameInput.value).toBe('test@user#123');
    expect(emailInput.value).toBe('test+user@example.co.uk');
    expect(passwordInput.value).toBe('P@ssw0rd!123');
  });

  it('should default to CLIENT role', () => {
    renderWithRouter(<Register />);
    
    const roleSelect = screen.getByDisplayValue('CLIENT');
    expect(roleSelect.value).toBe('CLIENT');
  });

  it('should handle all available roles', () => {
    renderWithRouter(<Register />);
    
    const roleSelect = screen.getByDisplayValue('CLIENT');
    
    // Test FREELANCER role
    fireEvent.change(roleSelect, { target: { value: 'FREELANCER' } });
    expect(roleSelect.value).toBe('FREELANCER');
    
    // Test back to CLIENT role
    fireEvent.change(roleSelect, { target: { value: 'CLIENT' } });
    expect(roleSelect.value).toBe('CLIENT');
  });
}); 