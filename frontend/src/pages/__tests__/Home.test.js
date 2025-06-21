import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../Home';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        section: ({ children, ...props }) => <section {...props}>{children}</section>,
        button: ({ children, onClick, ...props }) => <button onClick={onClick} {...props}>{children}</button>,
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
    FaBriefcase: () => <div data-testid="briefcase-icon">Briefcase</div>,
    FaUserTie: () => <div data-testid="user-tie-icon">UserTie</div>,
    FaShieldAlt: () => <div data-testid="shield-icon">Shield</div>,
    FaSearch: () => <div data-testid="search-icon">Search</div>,
    FaFileContract: () => <div data-testid="contract-icon">Contract</div>,
    FaCheckCircle: () => <div data-testid="check-icon">Check</div>,
}));

// Simple mock for useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

describe('HomePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render main heading and description', () => {
        render(<HomePage />);

        expect(screen.getByText('Welcome to FreelancerProject')).toBeInTheDocument();
        expect(screen.getByText('Connect with top freelancers and clients for your next project')).toBeInTheDocument();
    });

    it('should render CTA buttons', () => {
        render(<HomePage />);

        expect(screen.getByText('Get Started')).toBeInTheDocument();
        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('should navigate to register when Get Started is clicked', () => {
        render(<HomePage />);

        fireEvent.click(screen.getByText('Get Started'));
        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('should navigate to login when Login is clicked', () => {
        render(<HomePage />);

        fireEvent.click(screen.getByText('Login'));
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should render Platform Features section', () => {
        render(<HomePage />);

        expect(screen.getByText('Platform Features')).toBeInTheDocument();
    });

    it('should render all feature cards', () => {
        render(<HomePage />);

        // Check feature titles
        expect(screen.getByText('Post Projects')).toBeInTheDocument();
        expect(screen.getByText('Find Work')).toBeInTheDocument();
        expect(screen.getByText('Quality Assurance')).toBeInTheDocument();

        // Check feature descriptions
        expect(screen.getByText('Clients can post their projects and find the perfect freelancer')).toBeInTheDocument();
        expect(screen.getByText('Freelancers can browse and apply to available projects')).toBeInTheDocument();
        expect(screen.getByText('Admin verification ensures project and freelancer quality')).toBeInTheDocument();

        // Check role badges
        expect(screen.getByText('Client')).toBeInTheDocument();
        expect(screen.getByText('Freelancer')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should render feature icons', () => {
        render(<HomePage />);

        expect(screen.getByTestId('briefcase-icon')).toBeInTheDocument();
        expect(screen.getByTestId('user-tie-icon')).toBeInTheDocument();
        expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
    });

    it('should render How It Works section', () => {
        render(<HomePage />);

        expect(screen.getByText('How It Works')).toBeInTheDocument();
    });

    it('should render all process steps', () => {
        render(<HomePage />);

        // Check step titles
        expect(screen.getByText('1. Project Submission')).toBeInTheDocument();
        expect(screen.getByText('2. Admin Verification')).toBeInTheDocument();
        expect(screen.getByText('3. Freelancer Applications')).toBeInTheDocument();

        // Check step descriptions
        expect(screen.getByText('Clients submit detailed project requirements')).toBeInTheDocument();
        expect(screen.getByText('Projects are verified by admin before going live')).toBeInTheDocument();
        expect(screen.getByText('Qualified freelancers can browse and apply')).toBeInTheDocument();
    });

    it('should render process icons', () => {
        render(<HomePage />);

        expect(screen.getByTestId('contract-icon')).toBeInTheDocument();
        expect(screen.getByTestId('check-icon')).toBeInTheDocument();
        expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('should have proper CSS structure', () => {
        const { container } = render(<HomePage />);

        expect(container.querySelector('.home-page')).toBeInTheDocument();
        expect(container.querySelector('.background-overlay')).toBeInTheDocument();
        expect(container.querySelector('.background-pattern')).toBeInTheDocument();
        expect(container.querySelector('.hero-section')).toBeInTheDocument();
        expect(container.querySelector('.features-section')).toBeInTheDocument();
        expect(container.querySelector('.how-it-works-section')).toBeInTheDocument();
    });

    it('should render CTA buttons with correct classes', () => {
        render(<HomePage />);

        const getStartedButton = screen.getByText('Get Started');
        const loginButton = screen.getByText('Login');

        expect(getStartedButton).toHaveClass('cta-button', 'primary');
        expect(loginButton).toHaveClass('cta-button', 'secondary');
    });

    it('should render features in a grid layout', () => {
        const { container } = render(<HomePage />);

        expect(container.querySelector('.features-grid')).toBeInTheDocument();
        expect(container.querySelectorAll('.feature-card')).toHaveLength(3);
    });

    it('should render process steps in a grid layout', () => {
        const { container } = render(<HomePage />);

        expect(container.querySelector('.process-grid')).toBeInTheDocument();
        expect(container.querySelectorAll('.process-card')).toHaveLength(3);
    });

    it('should handle multiple button clicks correctly', () => {
        render(<HomePage />);

        // Click Get Started multiple times
        fireEvent.click(screen.getByText('Get Started'));
        fireEvent.click(screen.getByText('Get Started'));
        
        expect(mockNavigate).toHaveBeenCalledTimes(2);
        expect(mockNavigate).toHaveBeenCalledWith('/register');

        // Click Login
        fireEvent.click(screen.getByText('Login'));
        
        expect(mockNavigate).toHaveBeenCalledTimes(3);
        expect(mockNavigate).toHaveBeenLastCalledWith('/login');
    });
});
