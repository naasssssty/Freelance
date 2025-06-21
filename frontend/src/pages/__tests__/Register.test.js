import React from 'react';
import { render, screen } from '@testing-library/react';
import { Register } from '../Register';

// Mock all dependencies
jest.mock('../../services/auth');
jest.mock('react-hook-form', () => ({
    useForm: () => ({
        register: jest.fn(),
        handleSubmit: jest.fn(),
        formState: { errors: {} },
        watch: jest.fn(),
    }),
}));
jest.mock('../../components/Footer', () => {
    return function Footer() {
        return <div data-testid="footer">Footer</div>;
    };
});
jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn(),
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

describe('Register', () => {
    it('should render register form', () => {
        render(<Register />);
        expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render role selection', () => {
        render(<Register />);
        expect(screen.getByText('Client')).toBeInTheDocument();
        expect(screen.getByText('Freelancer')).toBeInTheDocument();
    });

    it('should render login link', () => {
        render(<Register />);
        expect(screen.getByText('Already have an account?')).toBeInTheDocument();
        expect(screen.getByText('Login here')).toBeInTheDocument();
    });

    it('should have proper CSS structure', () => {
        const { container } = render(<Register />);
        expect(container.querySelector('.auth-container')).toBeInTheDocument();
        expect(container.querySelector('.wrapper')).toBeInTheDocument();
        expect(container.querySelector('.input-box')).toBeInTheDocument();
        expect(container.querySelector('.register-link')).toBeInTheDocument();
    });

    it('should render all input fields with correct types', () => {
        render(<Register />);
        const usernameInput = screen.getByPlaceholderText('Username');
        const emailInput = screen.getByPlaceholderText('Email');
        const passwordInput = screen.getByPlaceholderText('Password');
        const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');

        expect(usernameInput).toHaveAttribute('type', 'text');
        expect(emailInput).toHaveAttribute('type', 'email');
        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
});