import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

// Mock the notification services
jest.mock('../../services/NotificationServices', () => ({
    getNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn()
}));

const mockMenuOptions = [
    { name: 'Dashboard', action: jest.fn() },
    { name: 'Projects', action: jest.fn() },
    { name: 'Logout', action: jest.fn() }
];

const mockSearchComponent = <div data-testid="search-component">Search Component</div>;

const renderHeader = (props = {}) => {
    const defaultProps = {
        menuOptions: mockMenuOptions,
        searchComponent: mockSearchComponent,
        onLogoClick: jest.fn(),
        username: 'testuser'
    };

    return render(
        <BrowserRouter>
            <Header {...defaultProps} {...props} />
        </BrowserRouter>
    );
};

describe('Header Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render header with logo and username', () => {
        renderHeader();

        expect(screen.getByText('FreelanceProject')).toBeInTheDocument();
        expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('should render menu options', () => {
        renderHeader();

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Projects')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should render search component when provided', () => {
        renderHeader();

        expect(screen.getByTestId('search-component')).toBeInTheDocument();
    });

    it('should call onLogoClick when logo is clicked', () => {
        const mockOnLogoClick = jest.fn();
        renderHeader({ onLogoClick: mockOnLogoClick });

        const logo = screen.getByText('FreelanceProject');
        fireEvent.click(logo);

        expect(mockOnLogoClick).toHaveBeenCalledTimes(1);
    });

    it('should call menu option action when clicked', () => {
        renderHeader();

        const dashboardOption = screen.getByText('Dashboard');
        fireEvent.click(dashboardOption);

        expect(mockMenuOptions[0].action).toHaveBeenCalledTimes(1);
    });

    it('should render notification icon', () => {
        renderHeader();

        const notificationIcon = screen.getByRole('button', { name: /notification/i });
        expect(notificationIcon).toBeInTheDocument();
    });

    it('should not render search component when not provided', () => {
        renderHeader({ searchComponent: null });

        expect(screen.queryByTestId('search-component')).not.toBeInTheDocument();
    });

    it('should handle missing username gracefully', () => {
        renderHeader({ username: null });

        expect(screen.queryByText('testuser')).not.toBeInTheDocument();
    });

    it('should render with minimal props', () => {
        render(
            <BrowserRouter>
                <Header menuOptions={[]} />
            </BrowserRouter>
        );

        expect(screen.getByText('FreelanceProject')).toBeInTheDocument();
    });
}); 