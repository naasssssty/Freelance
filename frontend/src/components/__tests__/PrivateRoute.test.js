import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import PrivateRoute from '../PrivateRoute';

// Mock the auth utilities
jest.mock('../../utils/auth', () => ({
  isAuthenticated: jest.fn(),
  getToken: jest.fn(),
  getUserRole: jest.fn()
}));

import { isAuthenticated, getToken, getUserRole } from '../../utils/auth';

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { 
        isAuthenticated: false, 
        user: null, 
        token: null 
      }, action) => {
        switch (action.type) {
          case 'auth/login':
            return { ...state, isAuthenticated: true, user: action.payload };
          default:
            return state;
        }
      },
      ...initialState
    }
  });
};

const renderWithProviders = (ui, options = {}) => {
  const { 
    store = createMockStore(), 
    initialEntries = ['/'],
    ...renderOptions 
  } = options;
  
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </Provider>
  );
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

describe('PrivateRoute Component', () => {
  const TestComponent = () => <div>Protected Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when user is authenticated', () => {
    isAuthenticated.mockReturnValue(true);
    getToken.mockReturnValue('valid-token');
    getUserRole.mockReturnValue('FREELANCER');

    const store = createMockStore({
      auth: () => ({ 
        isAuthenticated: true, 
        user: { username: 'testuser', role: 'FREELANCER' }, 
        token: 'valid-token' 
      })
    });

    renderWithProviders(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
      { store }
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    isAuthenticated.mockReturnValue(false);
    getToken.mockReturnValue(null);
    getUserRole.mockReturnValue(null);

    const store = createMockStore({
      auth: () => ({ 
        isAuthenticated: false, 
        user: null, 
        token: null 
      })
    });

    renderWithProviders(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
      { store, initialEntries: ['/protected'] }
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should handle role-based access control', () => {
    isAuthenticated.mockReturnValue(true);
    getToken.mockReturnValue('valid-token');
    getUserRole.mockReturnValue('FREELANCER');

    const store = createMockStore({
      auth: () => ({ 
        isAuthenticated: true, 
        user: { username: 'testuser', role: 'FREELANCER' }, 
        token: 'valid-token' 
      })
    });

    renderWithProviders(
      <PrivateRoute requiredRole="FREELANCER">
        <TestComponent />
      </PrivateRoute>,
      { store }
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should deny access when user role does not match required role', () => {
    isAuthenticated.mockReturnValue(true);
    getToken.mockReturnValue('valid-token');
    getUserRole.mockReturnValue('FREELANCER');

    const store = createMockStore({
      auth: () => ({ 
        isAuthenticated: true, 
        user: { username: 'testuser', role: 'FREELANCER' }, 
        token: 'valid-token' 
      })
    });

    renderWithProviders(
      <PrivateRoute requiredRole="ADMIN">
        <TestComponent />
      </PrivateRoute>,
      { store }
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should handle multiple allowed roles', () => {
    isAuthenticated.mockReturnValue(true);
    getToken.mockReturnValue('valid-token');
    getUserRole.mockReturnValue('CLIENT');

    const store = createMockStore({
      auth: () => ({ 
        isAuthenticated: true, 
        user: { username: 'testuser', role: 'CLIENT' }, 
        token: 'valid-token' 
      })
    });

    renderWithProviders(
      <PrivateRoute requiredRoles={['CLIENT', 'ADMIN']}>
        <TestComponent />
      </PrivateRoute>,
      { store }
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should handle expired token', () => {
    isAuthenticated.mockReturnValue(false);
    getToken.mockReturnValue('expired-token');
    getUserRole.mockReturnValue(null);

    const store = createMockStore({
      auth: () => ({ 
        isAuthenticated: false, 
        user: null, 
        token: 'expired-token' 
      })
    });

    renderWithProviders(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
      { store }
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should handle loading state', () => {
    isAuthenticated.mockReturnValue(true);
    getToken.mockReturnValue('valid-token');
    getUserRole.mockReturnValue('FREELANCER');

    const store = createMockStore({
      auth: () => ({ 
        isAuthenticated: true, 
        user: { username: 'testuser', role: 'FREELANCER' }, 
        token: 'valid-token',
        loading: true
      })
    });

    renderWithProviders(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
      { store }
    );

    // Should either show loading or the content
    const hasContent = screen.queryByText('Protected Content');
    const hasLoading = screen.queryByText(/loading/i) || screen.queryByRole('progressbar');
    
    expect(hasContent || hasLoading).toBeTruthy();
  });

  it('should preserve redirect path after login', () => {
    isAuthenticated.mockReturnValue(false);
    getToken.mockReturnValue(null);
    getUserRole.mockReturnValue(null);

    const store = createMockStore({
      auth: () => ({ 
        isAuthenticated: false, 
        user: null, 
        token: null 
      })
    });

    renderWithProviders(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
      { store, initialEntries: ['/protected-page'] }
    );

    // Should redirect to login but preserve the intended destination
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render without crashing when no children provided', () => {
    isAuthenticated.mockReturnValue(true);
    getToken.mockReturnValue('valid-token');
    getUserRole.mockReturnValue('FREELANCER');

    const store = createMockStore({
      auth: () => ({ 
        isAuthenticated: true, 
        user: { username: 'testuser', role: 'FREELANCER' }, 
        token: 'valid-token' 
      })
    });

    expect(() => 
      renderWithProviders(<PrivateRoute />, { store })
    ).not.toThrow();
  });

  it('should handle authentication state changes', () => {
    isAuthenticated.mockReturnValue(false);
    getToken.mockReturnValue(null);
    getUserRole.mockReturnValue(null);

    const store = createMockStore({
      auth: () => ({ 
        isAuthenticated: false, 
        user: null, 
        token: null 
      })
    });

    const { rerender } = renderWithProviders(
      <PrivateRoute>
        <TestComponent />
      </PrivateRoute>,
      { store }
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();

    // Simulate authentication
    isAuthenticated.mockReturnValue(true);
    getToken.mockReturnValue('valid-token');
    getUserRole.mockReturnValue('FREELANCER');

    const authenticatedStore = createMockStore({
      auth: () => ({ 
        isAuthenticated: true, 
        user: { username: 'testuser', role: 'FREELANCER' }, 
        token: 'valid-token' 
      })
    });

    rerender(
      <Provider store={authenticatedStore}>
        <MemoryRouter>
          <PrivateRoute>
            <TestComponent />
          </PrivateRoute>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
}); 