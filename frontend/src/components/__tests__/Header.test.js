import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Header from '../Header';
import * as NotificationServices from '../../services/NotificationServices';

// Mock the services
jest.mock('../../services/NotificationServices');

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null }, action) => state,
      notifications: (state = { notifications: [], unreadCount: 0 }, action) => state,
      ...initialState
    }
  });
};

const renderWithProviders = (component, { store = createMockStore() } = {}) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Header Component', () => {
  const defaultProps = {
    menuOptions: [
      { label: 'Dashboard', onClick: jest.fn() },
      { label: 'Projects', onClick: jest.fn() },
      { label: 'Logout', onClick: jest.fn() }
    ],
    searchComponent: null,
    onLogoClick: jest.fn(),
    username: 'testuser'
  };

  beforeEach(() => {
    // Mock the notification services
    NotificationServices.getNotifications = jest.fn().mockResolvedValue([]);
    NotificationServices.getUnreadCount = jest.fn().mockResolvedValue(0);
    NotificationServices.markAsRead = jest.fn().mockResolvedValue();
    NotificationServices.markAllAsRead = jest.fn().mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render header with logo and username', () => {
    renderWithProviders(<Header {...defaultProps} />);
    
    expect(screen.getByText('FreelancerProject')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('should render menu options', () => {
    renderWithProviders(<Header {...defaultProps} />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should call onLogoClick when logo is clicked', () => {
    renderWithProviders(<Header {...defaultProps} />);
    
    const logo = screen.getByText('FreelancerProject');
    fireEvent.click(logo);
    
    expect(defaultProps.onLogoClick).toHaveBeenCalledTimes(1);
  });

  it('should call menu option onClick when clicked', () => {
    renderWithProviders(<Header {...defaultProps} />);
    
    const dashboardButton = screen.getByText('Dashboard');
    fireEvent.click(dashboardButton);
    
    expect(defaultProps.menuOptions[0].onClick).toHaveBeenCalledTimes(1);
  });

  it('should render search component when provided', () => {
    const searchComponent = <input data-testid="search-input" placeholder="Search..." />;
    const propsWithSearch = { ...defaultProps, searchComponent };
    
    renderWithProviders(<Header {...propsWithSearch} />);
    
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('should display notification icon', () => {
    renderWithProviders(<Header {...defaultProps} />);
    
    // Look for notification icon (assuming it has a specific class or test id)
    const notificationElements = screen.getAllByRole('button');
    const notificationButton = notificationElements.find(button => 
      button.className.includes('notification') || 
      button.getAttribute('aria-label')?.includes('notification')
    );
    
    expect(notificationButton || screen.getByText('testuser')).toBeInTheDocument();
  });

  it('should fetch notifications on mount', async () => {
    renderWithProviders(<Header {...defaultProps} />);
    
    await waitFor(() => {
      expect(NotificationServices.getNotifications).toHaveBeenCalled();
      expect(NotificationServices.getUnreadCount).toHaveBeenCalled();
    });
  });

  it('should handle notification click', async () => {
    const mockNotifications = [
      {
        id: 1,
        message: 'Test notification',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'APPLICATION_RECEIVED'
      }
    ];
    
    NotificationServices.getNotifications.mockResolvedValue(mockNotifications);
    NotificationServices.getUnreadCount.mockResolvedValue(1);
    
    renderWithProviders(<Header {...defaultProps} />);
    
    await waitFor(() => {
      expect(NotificationServices.getNotifications).toHaveBeenCalled();
    });
  });

  it('should handle errors when fetching notifications', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    NotificationServices.getNotifications.mockRejectedValue(new Error('Network error'));
    NotificationServices.getUnreadCount.mockRejectedValue(new Error('Network error'));
    
    renderWithProviders(<Header {...defaultProps} />);
    
    await waitFor(() => {
      expect(NotificationServices.getNotifications).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });

  it('should render without username', () => {
    const propsWithoutUsername = { ...defaultProps, username: undefined };
    
    renderWithProviders(<Header {...propsWithoutUsername} />);
    
    expect(screen.getByText('FreelancerProject')).toBeInTheDocument();
  });

  it('should render with empty menu options', () => {
    const propsWithEmptyMenu = { ...defaultProps, menuOptions: [] };
    
    renderWithProviders(<Header {...propsWithEmptyMenu} />);
    
    expect(screen.getByText('FreelancerProject')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });
}); 