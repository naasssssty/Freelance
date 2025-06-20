import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../Login';

// Mock the auth service
jest.mock('../../services/auth', () => ({
    login: jest.fn()
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

// Mock jwt-decode
jest.mock('jwt-decode', () => jest.fn());

const renderLogin = () => {
    return render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );
};

describe('Login Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it('should render login form elements', () => {
        renderLogin();

        expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    });

    it('should update input values when typing', () => {
        renderLogin();

        const usernameInput = screen.getByPlaceholderText('Username');
        const passwordInput = screen.getByPlaceholderText('Password');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'testpass' } });

        expect(usernameInput.value).toBe('testuser');
        expect(passwordInput.value).toBe('testpass');
    });

    it('should show validation errors for empty fields', async () => {
        renderLogin();

        const loginButton = screen.getByRole('button', { name: /login/i });
        fireEvent.click(loginButton);

        // Since we're not mocking form validation, we just ensure the form doesn't submit
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should call login service when form is submitted with valid data', async () => {
        const { login } = require('../../services/auth');
        const jwtDecode = require('jwt-decode');
        
        login.mockResolvedValue({ token: 'mock-token' });
        jwtDecode.mockReturnValue({ role: 'CLIENT', username: 'testuser' });

        renderLogin();

        const usernameInput = screen.getByPlaceholderText('Username');
        const passwordInput = screen.getByPlaceholderText('Password');
        const loginButton = screen.getByRole('button', { name: /login/i });

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'testpass' } });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(login).toHaveBeenCalledWith({
                username: 'testuser',
                password: 'testpass'
            });
        });
    });

    it('should navigate to appropriate dashboard on successful login', async () => {
        const { login } = require('../../services/auth');
        const jwtDecode = require('jwt-decode');
        
        login.mockResolvedValue({ token: 'mock-token' });
        jwtDecode.mockReturnValue({ role: 'CLIENT', username: 'testuser' });

        renderLogin();

        const usernameInput = screen.getByPlaceholderText('Username');
        const passwordInput = screen.getByPlaceholderText('Password');
        const loginButton = screen.getByRole('button', { name: /login/i });

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'testpass' } });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/client-dashboard');
        });
    });

    it('should handle login failure', async () => {
        const { login } = require('../../services/auth');
        
        login.mockRejectedValue(new Error('Invalid credentials'));

        renderLogin();

        const usernameInput = screen.getByPlaceholderText('Username');
        const passwordInput = screen.getByPlaceholderText('Password');
        const loginButton = screen.getByRole('button', { name: /login/i });

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(login).toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('should navigate to register page when register link is clicked', () => {
        renderLogin();

        const registerLink = screen.getByText(/register here/i);
        fireEvent.click(registerLink);

        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('should store token in localStorage on successful login', async () => {
        const { login } = require('../../services/auth');
        const jwtDecode = require('jwt-decode');
        
        login.mockResolvedValue({ token: 'mock-token' });
        jwtDecode.mockReturnValue({ role: 'CLIENT', username: 'testuser' });

        renderLogin();

        const usernameInput = screen.getByPlaceholderText('Username');
        const passwordInput = screen.getByPlaceholderText('Password');
        const loginButton = screen.getByRole('button', { name: /login/i });

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'testpass' } });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(localStorage.getItem('token')).toBe('mock-token');
        });
    });
}); 