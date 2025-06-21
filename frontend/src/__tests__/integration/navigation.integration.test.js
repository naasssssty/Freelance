import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from '../../App';
import Header from '../../components/Header';
import PrivateRoute from '../../components/PrivateRoute';

// Mock services
jest.mock('../../services/NotificationServices', () => ({
  getNotifications: jest.fn().mockResolvedValue([]),
  getUnreadCount: jest.fn().mockResolvedValue(0)
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
      <MemoryRouter initialEntries={initialEntries}>
        {component}
      </MemoryRouter>
    </Provider>
  );
};

describe('Navigation Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Public Routes', () => {
    it('should navigate to home page by default', () => {
      renderWithRouter(<App />);
      
      expect(screen.getByText(/welcome to freelancerproject/i)).toBeInTheDocument();
      expect(screen.getByText(/connect with top freelancers/i)).toBeInTheDocument();
    });

    it('should navigate to login page', () => {
      renderWithRouter(<App />, ['/login']);
      
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should navigate to register page', () => {
      renderWithRouter(<App />, ['/register']);
      
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('should show 404 page for invalid routes', () => {
      renderWithRouter(<App />, ['/invalid-route']);
      
      expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      const unauthenticatedState = {
        auth: { user: null, isAuthenticated: false }
      };

      renderWithRouter(<App />, ['/client-dashboard'], unauthenticatedState);
      
      // Should redirect to login
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    it('should allow authenticated users to access protected routes', () => {
      const authenticatedState = {
        auth: {
          user: { id: 1, username: 'testuser', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      renderWithRouter(<App />, ['/client-dashboard'], authenticatedState);
      
      // Should show dashboard (or loading state)
      expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
    });
  });

  describe('Header Navigation', () => {
    it('should show login/register links when not authenticated', () => {
      const unauthenticatedState = {
        auth: { user: null, isAuthenticated: false }
      };

      renderWithRouter(<Header />, ['/'], unauthenticatedState);
      
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

      renderWithRouter(<Header />, ['/'], authenticatedState);
      
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

      renderWithRouter(<App />, ['/'], authenticatedState);
      
      // Click on a navigation link
      const homeLink = screen.getByText(/home/i);
      fireEvent.click(homeLink);
      
      // Should navigate to home
      await waitFor(() => {
        expect(screen.getByText(/welcome to freelancerproject/i)).toBeInTheDocument();
      });
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

      renderWithRouter(<Header />, ['/'], clientState);
      
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    it('should show freelancer-specific navigation for freelancer users', () => {
      const freelancerState = {
        auth: {
          user: { id: 1, username: 'freelancer', role: 'FREELANCER' },
          isAuthenticated: true
        }
      };

      renderWithRouter(<Header />, ['/'], freelancerState);
      
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    it('should show admin-specific navigation for admin users', () => {
      const adminState = {
        auth: {
          user: { id: 1, username: 'admin', role: 'ADMIN' },
          isAuthenticated: true
        }
      };

      renderWithRouter(<Header />, ['/'], adminState);
      
      expect(screen.getByText(/admin/i)).toBeInTheDocument();
    });
  });

  describe('PrivateRoute Component', () => {
    const TestComponent = () => <div>Protected Content</div>;

    it('should render component for authenticated users', () => {
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
    });

    it('should handle role-based access', () => {
      const clientState = {
        auth: {
          user: { id: 1, username: 'client', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      renderWithRouter(
        <PrivateRoute allowedRoles={['CLIENT']}>
          <TestComponent />
        </PrivateRoute>,
        ['/'],
        clientState
      );
      
      expect(screen.getByText(/protected content/i)).toBeInTheDocument();
    });

    it('should deny access for unauthorized roles', () => {
      const clientState = {
        auth: {
          user: { id: 1, username: 'client', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      renderWithRouter(
        <PrivateRoute allowedRoles={['ADMIN']}>
          <TestComponent />
        </PrivateRoute>,
        ['/'],
        clientState
      );
      
      expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
    });
  });
}); 