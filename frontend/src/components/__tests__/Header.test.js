import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from '../Header';
import * as NotificationServices from '../../services/NotificationServices';

// Mock the notification services
jest.mock('../../services/NotificationServices');

// Mock the child components
jest.mock('../NotificationIcon', () => {
    return function NotificationIcon({ onClick, unreadCount }) {
        return (
            <button data-testid="notification-icon" onClick={onClick}>
                Notifications ({unreadCount})
            </button>
        );
    };
});

jest.mock('../NotificationPanel', () => {
    return function NotificationPanel({ notifications, onClose, loading, error }) {
        return (
            <div data-testid="notification-panel">
                <button data-testid="close-panel" onClick={onClose}>Close</button>
                {loading && <div data-testid="loading">Loading...</div>}
                {error && <div data-testid="error">{error}</div>}
                <div data-testid="notifications-count">{notifications.length}</div>
            </div>
        );
    };
});

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
beforeAll(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
});

describe('Header', () => {
    const mockProps = {
        menuOptions: [
            { label: 'Dashboard', onClick: jest.fn() },
            { label: 'Projects', onClick: jest.fn() },
            { label: 'Logout', onClick: jest.fn() }
        ],
        searchComponent: <div data-testid="search-component">Search</div>,
        onLogoClick: jest.fn(),
        username: 'testuser'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        NotificationServices.getNotifications.mockResolvedValue([]);
        NotificationServices.getUnreadCount.mockResolvedValue(0);
        NotificationServices.markAsRead.mockResolvedValue(true);
        NotificationServices.markAllAsRead.mockResolvedValue(true);
    });

    it('should render header with all components', async () => {
        render(<Header {...mockProps} />);

        expect(screen.getByAltText('Logo')).toBeInTheDocument();
        expect(screen.getByTestId('search-component')).toBeInTheDocument();
        expect(screen.getByTestId('notification-icon')).toBeInTheDocument();
        expect(screen.getByText('testuser')).toBeInTheDocument();

        // Check menu options
        mockProps.menuOptions.forEach(option => {
            expect(screen.getByText(option.label)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(NotificationServices.getNotifications).toHaveBeenCalled();
            expect(NotificationServices.getUnreadCount).toHaveBeenCalled();
        });
    });

    it('should handle logo click', () => {
        render(<Header {...mockProps} />);
        
        fireEvent.click(screen.getByAltText('Logo'));
        expect(mockProps.onLogoClick).toHaveBeenCalled();
    });

    it('should handle menu option clicks', () => {
        render(<Header {...mockProps} />);
        
        mockProps.menuOptions.forEach(option => {
            fireEvent.click(screen.getByText(option.label));
            expect(option.onClick).toHaveBeenCalled();
        });
    });

    it('should toggle notification panel', async () => {
        render(<Header {...mockProps} />);

        // Initially panel should not be visible
        expect(screen.queryByTestId('notification-panel')).not.toBeInTheDocument();

        // Click notification icon to open panel
        fireEvent.click(screen.getByTestId('notification-icon'));
        expect(screen.getByTestId('notification-panel')).toBeInTheDocument();

        // Click close to close panel
        fireEvent.click(screen.getByTestId('close-panel'));
        expect(screen.queryByTestId('notification-panel')).not.toBeInTheDocument();
    });

    it('should display unread count', async () => {
        NotificationServices.getUnreadCount.mockResolvedValue(5);
        
        render(<Header {...mockProps} />);

        await waitFor(() => {
            expect(screen.getByText('Notifications (5)')).toBeInTheDocument();
        });
    });

    it('should handle notifications fetch error', async () => {
        NotificationServices.getNotifications.mockRejectedValue(new Error('Network error'));
        
        render(<Header {...mockProps} />);

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('Error fetching notifications:', expect.any(Error));
        });
    });

    it('should handle unread count fetch error', async () => {
        NotificationServices.getUnreadCount.mockRejectedValue(new Error('Network error'));
        
        render(<Header {...mockProps} />);

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('Error fetching unread count:', expect.any(Error));
        });
    });

    it('should display guest when no username provided', () => {
        const propsWithoutUsername = { ...mockProps, username: undefined };
        render(<Header {...propsWithoutUsername} />);

        expect(screen.getByText('Guest')).toBeInTheDocument();
    });

    it('should handle notifications data validation', async () => {
        // Test with non-array response
        NotificationServices.getNotifications.mockResolvedValue('invalid data');
        
        render(<Header {...mockProps} />);

        await waitFor(() => {
            expect(console.warn).toHaveBeenCalledWith('Notifications data is not an array:', 'invalid data');
        });
    });

    it('should handle unread count data validation', async () => {
        // Test with non-number response
        NotificationServices.getUnreadCount.mockResolvedValue('invalid count');
        
        render(<Header {...mockProps} />);

        await waitFor(() => {
            expect(console.warn).toHaveBeenCalledWith('Unread count is not a number:', 'invalid count');
        });
    });
});
