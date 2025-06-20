import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ children }) => <div data-testid="route">{children}</div>,
}));

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false }, action) => state,
      projects: (state = { projects: [] }, action) => state,
      applications: (state = { applications: [] }, action) => state,
      users: (state = { users: [] }, action) => state,
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

describe('App Component', () => {
  it('renders app component without crashing', () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  it('renders with Redux store', () => {
    const store = createMockStore({
      auth: (state = { user: { username: 'testuser' }, isAuthenticated: true }, action) => state
    });
    
    renderWithProviders(<App />, { store });
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  it('renders routes container', () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  it('handles empty store state', () => {
    const store = createMockStore({});
    renderWithProviders(<App />, { store });
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  it('renders without any props', () => {
    renderWithProviders(<App />);
    // Just check that it renders without throwing
    expect(true).toBe(true);
  });
});
