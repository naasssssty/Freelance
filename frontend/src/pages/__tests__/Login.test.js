import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../Login';
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

describe('Login Component', () => {
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

  it('should render login form elements', () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('should update form fields when user types', () => {
    renderWithRouter(<Login />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  it('should submit form with correct credentials', async () => {
    const mockResponse = {
      data: {
        token: 'mock-jwt-token'
      }
    };
    
    authService.login.mockResolvedValue(mockResponse);
    
    renderWithRouter(<Login />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });
  });

  it('should store token in cookies on successful login', async () => {
    const mockResponse = {
      data: {
        token: 'mock-jwt-token'
      }
    };
    
    authService.login.mockResolvedValue(mockResponse);
    
    renderWithRouter(<Login />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockCookies.set).toHaveBeenCalledWith('token', 'mock-jwt-token', { path: '/' });
    });
  });

  it('should display error message on failed login', async () => {
    const mockError = {
      message: 'Invalid credentials'
    };
    
    authService.login.mockRejectedValue(mockError);
    
    renderWithRouter(<Login />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should prevent form submission with empty fields', () => {
    renderWithRouter(<Login />);
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    // Should not call login service with empty fields
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should navigate to register page when register link is clicked', () => {
    renderWithRouter(<Login />);
    
    const registerLink = screen.getByText(/register now/i);
    fireEvent.click(registerLink);
    
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('should handle form submission with enter key', async () => {
    const mockResponse = {
      data: {
        token: 'mock-jwt-token'
      }
    };
    
    authService.login.mockResolvedValue(mockResponse);
    
    renderWithRouter(<Login />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.keyPress(passwordInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled();
    });
  });

  it('should clear error message when user starts typing', async () => {
    const mockError = {
      message: 'Invalid credentials'
    };
    
    authService.login.mockRejectedValue(mockError);
    
    renderWithRouter(<Login />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    // First, trigger an error
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    
    // Then, start typing again
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    
    // Error message should be cleared (this depends on implementation)
    await waitFor(() => {
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
    });
  });

  it('should show loading state during login process', async () => {
    let resolveLogin;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    
    authService.login.mockReturnValue(loginPromise);
    
    renderWithRouter(<Login />);
    
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    // Check if login button is disabled during loading
    expect(loginButton).toBeDisabled();
    
    // Resolve the promise
    resolveLogin({ data: { token: 'mock-token' } });
    
    await waitFor(() => {
      expect(loginButton).not.toBeDisabled();
    });
  });
}); 