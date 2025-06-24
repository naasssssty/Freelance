import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NoPage from '../NoPage';

// Simple mock for useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

describe('NoPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render verification pending message', () => {
        render(<NoPage />);
        expect(screen.getByText('Verification Pending')).toBeInTheDocument();
        expect(screen.getByText('Thank you for registering! Your account is currently pending verification.')).toBeInTheDocument();
    });

    it('should render information text', () => {
        render(<NoPage />);
        expect(screen.getByText('Our administrators will review your account shortly.')).toBeInTheDocument();
        expect(screen.getByText('You will be able to access the platform once your account is verified.')).toBeInTheDocument();
    });

    it('should render what happens next section', () => {
        render(<NoPage />);
        expect(screen.getByText('What happens next?')).toBeInTheDocument();
        expect(screen.getByText('Admin reviews your registration')).toBeInTheDocument();
        expect(screen.getByText('Your account gets verified')).toBeInTheDocument();
        expect(screen.getByText('You can log in and start using the platform')).toBeInTheDocument();
    });

    it('should render back to login button', () => {
        render(<NoPage />);
        expect(screen.getByText('Back to Login')).toBeInTheDocument();
    });

    it('should navigate to login when back to login button is clicked', () => {
        render(<NoPage />);
        fireEvent.click(screen.getByText('Back to Login'));
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should have proper CSS structure', () => {
        const { container } = render(<NoPage />);
        expect(container.querySelector('.verification-pending-container')).toBeInTheDocument();
        expect(container.querySelector('.verification-card')).toBeInTheDocument();
        expect(container.querySelector('.verification-icon')).toBeInTheDocument();
        expect(container.querySelector('.main-message')).toBeInTheDocument();
        expect(container.querySelector('.info-text')).toBeInTheDocument();
        expect(container.querySelector('.steps')).toBeInTheDocument();
        expect(container.querySelector('.back-to-login')).toBeInTheDocument();
    });

    it('should render verification steps as ordered list', () => {
        const { container } = render(<NoPage />);
        const orderedList = container.querySelector('ol');
        expect(orderedList).toBeInTheDocument();
        const listItems = orderedList.querySelectorAll('li');
        expect(listItems).toHaveLength(3);
    });

    it('should render verification icon', () => {
        const { container } = render(<NoPage />);
        const iconElement = container.querySelector('.fas.fa-user-clock');
        expect(iconElement).toBeInTheDocument();
    });

    it('should handle multiple button clicks', () => {
        render(<NoPage />);
        const backButton = screen.getByText('Back to Login');
        fireEvent.click(backButton);
        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledTimes(2);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should render all text content correctly', () => {
        render(<NoPage />);
        expect(screen.getByRole('heading', { name: 'Verification Pending' })).toBeInTheDocument();
        expect(screen.getByText(/Thank you for registering/)).toBeInTheDocument();
        expect(screen.getByText(/Our administrators will review/)).toBeInTheDocument();
        expect(screen.getByText(/You will be able to access/)).toBeInTheDocument();
        expect(screen.getByText(/What happens next/)).toBeInTheDocument();
    });

    it('should have button with correct class', () => {
        render(<NoPage />);
        const button = screen.getByText('Back to Login');
        expect(button).toHaveClass('back-to-login');
    });

    it('should render component without errors', () => {
        const { container } = render(<NoPage />);
        expect(container.firstChild).toHaveClass('verification-pending-container');
        expect(container.firstChild.firstChild).toHaveClass('verification-card');
    });
});
