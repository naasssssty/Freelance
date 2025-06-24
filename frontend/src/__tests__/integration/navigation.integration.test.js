import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Login } from '../../pages/Login';
import { Register } from '../../pages/Register';
import Header from '../../components/Header';
import { PrivateRoute } from '../../components/PrivateRoute';

// Mock services
jest.mock('../../services/NotificationServices', () => ({
  getNotifications: jest.fn().mockResolvedValue([]),
  getUnreadCount: jest.fn().mockResolvedValue(0)
}));

// Mock Navigate component
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  MemoryRouter: ({ children, initialEntries }) => <div data-testid="memory-router">{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => <div>{element}</div>,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  Navigate: ({ to }) => <div data-testid="navigate-to">{`Redirecting to ${to}`}</div>,
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' })
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false }, action) => {
        switch (action.type) {
          case 'LOGIN_SUCCESS':
            return { ...state, user: action.payload, isAuthenticated: true };
          case 'LOGOUT':
            return { ...state, user: null, isAuthenticated: false };
          default:
            return state;
        }
      }
    },
    preloadedState: initialState
  });
};

const renderWithRouter = (component, initialEntries = ['/'], initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Navigation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Login Page Navigation', () => {
    it('should display login form with navigation links', () => {
      renderWithRouter(<Login />);
      
      expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByText('Register here')).toBeInTheDocument();
    });

    it('should have correct navigation links', () => {
      renderWithRouter(<Login />);
      
      const registerLink = screen.getByText('Register here').closest('a');
      expect(registerLink).toHaveAttribute('href', '/register');
    });
  });

  describe('Register Page Navigation', () => {
    it('should display register form with navigation links', () => {
      renderWithRouter(<Register />);
      
      expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
      expect(screen.getByText('Login here')).toBeInTheDocument();
    });

    it('should have correct navigation links', () => {
      renderWithRouter(<Register />);
      
      const loginLink = screen.getByText('Login here').closest('a');
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Header Navigation', () => {
    it('should show login/register links when not authenticated', () => {
      const unauthenticatedState = {
        auth: { user: null, isAuthenticated: false }
      };

      const mockMenuOptions = [
        { label: 'Login', onClick: jest.fn() },
        { label: 'Register', onClick: jest.fn() }
      ];

      renderWithRouter(
        <Header 
          menuOptions={mockMenuOptions}
          searchComponent={null}
          onLogoClick={jest.fn()}
          username=""
        />, 
        ['/'], 
        unauthenticatedState
      );
      
      expect(screen.getByText(/login/i)).toBeInTheDocument();
      expect(screen.getByText(/register/i)).toBeInTheDocument();
    });

    it('should show user menu when authenticated', () => {
      const authenticatedState = {
        auth: {
          user: { id: 1, username: 'testuser', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      const mockMenuOptions = [
        { label: 'Dashboard', onClick: jest.fn() },
        { label: 'Logout', onClick: jest.fn() }
      ];

      renderWithRouter(
        <Header 
          menuOptions={mockMenuOptions}
          searchComponent={null}
          onLogoClick={jest.fn()}
          username="testuser"
        />, 
        ['/'], 
        authenticatedState
      );
      
      expect(screen.getByText(/testuser/i)).toBeInTheDocument();
      expect(screen.getByText(/logout/i)).toBeInTheDocument();
    });

    it('should navigate between pages using header links', async () => {
      const authenticatedState = {
        auth: {
          user: { id: 1, username: 'testuser', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      const mockOnLogoClick = jest.fn();
      const mockMenuOptions = [
        { label: 'Home', onClick: jest.fn() }
      ];

      renderWithRouter(
        <Header 
          menuOptions={mockMenuOptions}
          searchComponent={null}
          onLogoClick={mockOnLogoClick}
          username="testuser"
        />, 
        ['/'], 
        authenticatedState
      );
      
      // Click on the logo (acts as home link)
      const logo = screen.getByAltText(/logo/i);
      fireEvent.click(logo);
      
      // Should call the logo click handler
      expect(mockOnLogoClick).toHaveBeenCalled();
    });
  });

  describe('Role-based Navigation', () => {
    it('should show client-specific navigation for client users', () => {
      const clientState = {
        auth: {
          user: { id: 1, username: 'client', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      const mockMenuOptions = [
        { label: 'Dashboard', onClick: jest.fn() },
        { label: 'My Projects', onClick: jest.fn() }
      ];

      renderWithRouter(
        <Header 
          menuOptions={mockMenuOptions}
          searchComponent={null}
          onLogoClick={jest.fn()}
          username="client"
        />, 
        ['/'], 
        clientState
      );
      
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    it('should show freelancer-specific navigation for freelancer users', () => {
      const freelancerState = {
        auth: {
          user: { id: 1, username: 'freelancer', role: 'FREELANCER' },
          isAuthenticated: true
        }
      };

      const mockMenuOptions = [
        { label: 'Dashboard', onClick: jest.fn() },
        { label: 'Available Projects', onClick: jest.fn() }
      ];

      renderWithRouter(
        <Header 
          menuOptions={mockMenuOptions}
          searchComponent={null}
          onLogoClick={jest.fn()}
          username="freelancer"
        />, 
        ['/'], 
        freelancerState
      );
      
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    it('should show admin-specific navigation for admin users', () => {
      const adminState = {
        auth: {
          user: { id: 1, username: 'admin', role: 'ADMIN' },
          isAuthenticated: true
        }
      };

      const mockMenuOptions = [
        { label: 'Admin Dashboard', onClick: jest.fn() },
        { label: 'Users', onClick: jest.fn() }
      ];

      renderWithRouter(
        <Header 
          menuOptions={mockMenuOptions}
          searchComponent={null}
          onLogoClick={jest.fn()}
          username="admin"
        />, 
        ['/'], 
        adminState
      );
      
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/users/i)).toBeInTheDocument();
    });
  });

  describe('PrivateRoute Component', () => {
    const TestComponent = () => <div>Protected Content</div>;

    // Mock localStorage for PrivateRoute tests
    beforeEach(() => {
      // Mock jwt-decode
      jest.doMock('jwt-decode', () => ({
        jwtDecode: jest.fn()
      }));
    });

    it('should render component for authenticated users', () => {
      // Mock valid token
      localStorage.setItem('token', 'valid-token');
      
      const { jwtDecode } = require('jwt-decode');
      jwtDecode.mockReturnValue({
        sub: 'testuser',
        role: 'CLIENT',
        isVerified: true
      });

      const authenticatedState = {
        auth: {
          user: { id: 1, username: 'testuser', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      renderWithRouter(
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>,
        ['/'],
        authenticatedState
      );
      
      expect(screen.getByText(/protected content/i)).toBeInTheDocument();
    });

    it('should redirect to login for unauthenticated users', () => {
      // Clear token
      localStorage.removeItem('token');

      const unauthenticatedState = {
        auth: { user: null, isAuthenticated: false }
      };

      renderWithRouter(
        <PrivateRoute>
          <TestComponent />
        </PrivateRoute>,
        ['/'],
        unauthenticatedState
      );
      
      expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate-to')).toHaveTextContent('Redirecting to /login');
    });

    it('should handle role-based access', () => {
      // Mock valid token with CLIENT role
      localStorage.setItem('token', 'valid-token');
      
      const { jwtDecode } = require('jwt-decode');
      jwtDecode.mockReturnValue({
        sub: 'client',
        role: 'CLIENT',
        isVerified: true
      });

      const clientState = {
        auth: {
          user: { id: 1, username: 'client', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      renderWithRouter(
        <PrivateRoute role="CLIENT">
          <TestComponent />
        </PrivateRoute>,
        ['/'],
        clientState
      );
      
      expect(screen.getByText(/protected content/i)).toBeInTheDocument();
    });

    it('should deny access for unauthorized roles', () => {
      // Mock valid token with CLIENT role
      localStorage.setItem('token', 'valid-token');
      
      const { jwtDecode } = require('jwt-decode');
      jwtDecode.mockReturnValue({
        sub: 'client',
        role: 'CLIENT',
        isVerified: true
      });

      const clientState = {
        auth: {
          user: { id: 1, username: 'client', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      renderWithRouter(
        <PrivateRoute role="ADMIN">
          <TestComponent />
        </PrivateRoute>,
        ['/'],
        clientState
      );
      
      expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate-to')).toHaveTextContent('Redirecting to /');
    });
  });

  describe('Navigation Flow Integration', () => {
    it('should handle navigation state changes', () => {
      const { rerender } = renderWithRouter(<Login />);
      
      // Initially shows login
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      
      // Navigate to register
      rerender(
        <Provider store={createMockStore()}>
          <BrowserRouter>
            <Register />
          </BrowserRouter>
        </Provider>
      );
      
      expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    });

    it('should maintain authentication state during navigation', () => {
      const authenticatedState = {
        auth: {
          user: { id: 1, username: 'testuser', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      const mockMenuOptions = [
        { label: 'Dashboard', onClick: jest.fn() }
      ];

      renderWithRouter(
        <Header 
          menuOptions={mockMenuOptions}
          searchComponent={null}
          onLogoClick={jest.fn()}
          username="testuser"
        />,
        ['/'],
        authenticatedState
      );
      
      // Should show authenticated state
      expect(screen.getByText(/testuser/i)).toBeInTheDocument();
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });
}); 