import React from 'react';
import { render, screen } from '@testing-library/react';
import { Login } from '../Login';

// Mock dependencies
jest.mock('../../services/auth');
jest.mock('jwt-decode');
jest.mock('../../components/Footer', () => {
    return function Footer() {
        return <div data-testid="footer">Footer</div>;
    };
});
jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn(),
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));
jest.mock('react-redux', () => ({
    useDispatch: () => jest.fn(),
}));

describe('Login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                setItem: jest.fn(),
                getItem: jest.fn(),
                removeItem: jest.fn(),
                clear: jest.fn(),
            },
            writable: true,
        });
    });

    it('should render login form with all fields', () => {
        render(<Login />);

        expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
        expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render register link', () => {
        render(<Login />);
        expect(screen.getByText('Register here')).toBeInTheDocument();
    });

    it('should have proper CSS classes', () => {
        const { container } = render(<Login />);

        expect(container.querySelector('.auth-container')).toBeInTheDocument();
        expect(container.querySelector('.wrapper')).toBeInTheDocument();
        expect(container.querySelector('.input-box')).toBeInTheDocument();
        expect(container.querySelector('.register-link')).toBeInTheDocument();
    });

    it('should render input fields with correct types', () => {
        render(<Login />);
        
        const usernameInput = screen.getByPlaceholderText('Username');
        const passwordInput = screen.getByPlaceholderText('Password');

        expect(usernameInput).toHaveAttribute('type', 'text');
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should render form elements', () => {
        render(<Login />);
        
        const form = screen.getByRole('button', { name: 'Login' }).closest('form');
        expect(form).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });
});
