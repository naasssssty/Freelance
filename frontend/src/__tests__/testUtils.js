import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

// Default reducers for testing
const defaultReducers = {
  auth: (state = { user: null, isAuthenticated: false, loading: false, error: null }, action) => {
    switch (action.type) {
      case 'LOGIN_SUCCESS':
        return { ...state, user: action.payload, isAuthenticated: true, loading: false, error: null };
      case 'LOGOUT':
        return { user: null, isAuthenticated: false, loading: false, error: null };
      default:
        return state;
    }
  },
  projects: (state = { projects: [], loading: false, error: null }, action) => {
    switch (action.type) {
      case 'FETCH_PROJECTS_SUCCESS':
        return { ...state, projects: action.payload, loading: false, error: null };
      default:
        return state;
    }
  },
  applications: (state = { applications: [], loading: false, error: null }, action) => {
    switch (action.type) {
      case 'FETCH_APPLICATIONS_SUCCESS':
        return { ...state, applications: action.payload, loading: false, error: null };
      default:
        return state;
    }
  },
  users: (state = { users: [], loading: false, error: null }, action) => {
    switch (action.type) {
      case 'FETCH_USERS_SUCCESS':
        return { ...state, users: action.payload, loading: false, error: null };
      default:
        return state;
    }
  }
};

// Create a mock store with custom initial state
export const createMockStore = (initialState = {}, customReducers = {}) => {
  const reducers = { ...defaultReducers, ...customReducers };
  
  return configureStore({
    reducer: reducers,
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Render component with all providers
export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = createMockStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Mock user data
export const mockUsers = {
  admin: {
    id: 1,
    username: 'admin',
    email: 'admin@test.com',
    role: 'ADMIN',
    verified: true
  },
  client: {
    id: 2,
    username: 'testclient',
    email: 'client@test.com',
    role: 'CLIENT',
    verified: true
  },
  freelancer: {
    id: 3,
    username: 'testfreelancer',
    email: 'freelancer@test.com',
    role: 'FREELANCER',
    verified: true
  },
  unverifiedFreelancer: {
    id: 4,
    username: 'unverified',
    email: 'unverified@test.com',
    role: 'FREELANCER',
    verified: false
  }
};

// Mock project data
export const mockProjects = {
  pending: {
    id: 1,
    title: 'Test Project',
    description: 'This is a test project',
    budget: 1000,
    deadline: '2024-12-31',
    client_username: 'testclient',
    projectStatus: 'PENDING',
    posted_at: '2024-01-01T00:00:00Z'
  },
  approved: {
    id: 2,
    title: 'Approved Project',
    description: 'This project is approved',
    budget: 1500,
    deadline: '2024-11-30',
    client_username: 'testclient',
    projectStatus: 'APPROVED',
    posted_at: '2024-01-02T00:00:00Z'
  },
  inProgress: {
    id: 3,
    title: 'In Progress Project',
    description: 'This project is in progress',
    budget: 2000,
    deadline: '2024-10-31',
    client_username: 'testclient',
    projectStatus: 'IN_PROGRESS',
    posted_at: '2024-01-03T00:00:00Z'
  }
};

// Mock application data
export const mockApplications = {
  waiting: {
    id: 1,
    projectTitle: 'Test Project',
    project_id: 1,
    cover_letter: 'I am interested in this project',
    applicationStatus: 'WAITING',
    freelancer: 'testfreelancer',
    created_at: '2024-01-01T12:00:00Z'
  },
  approved: {
    id: 2,
    projectTitle: 'Approved Project',
    project_id: 2,
    cover_letter: 'Please consider my application',
    applicationStatus: 'APPROVED',
    freelancer: 'testfreelancer',
    created_at: '2024-01-02T12:00:00Z'
  },
  rejected: {
    id: 3,
    projectTitle: 'Rejected Project',
    project_id: 3,
    cover_letter: 'I would like to work on this',
    applicationStatus: 'REJECTED',
    freelancer: 'testfreelancer',
    created_at: '2024-01-03T12:00:00Z'
  }
};

// Mock notifications
export const mockNotifications = [
  {
    id: 1,
    message: 'New application received',
    timestamp: '2024-01-01T12:00:00Z',
    read: false,
    type: 'APPLICATION_RECEIVED'
  },
  {
    id: 2,
    message: 'Application approved',
    timestamp: '2024-01-02T12:00:00Z',
    read: true,
    type: 'APPLICATION_ACCEPTED'
  }
];

// Wait for async operations
export const waitForAsyncOperation = (timeout = 1000) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

// Mock localStorage
export const mockLocalStorage = () => {
  const store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };
};

// Mock axios responses
export const mockAxiosResponse = (data, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {}
});

export const mockAxiosError = (message, status = 400) => ({
  response: {
    data: { message },
    status,
    statusText: 'Bad Request'
  }
});

// Custom matchers
export const customMatchers = {
  toHaveClass: (received, className) => {
    const pass = received.classList.contains(className);
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to have class ${className}`,
      pass
    };
  }
};

// Setup function for common test setup
export const setupTest = () => {
  // Mock console methods to avoid noise in tests
  const originalError = console.error;
  const originalWarn = console.warn;
  
  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });
  
  afterEach(() => {
    console.error = originalError;
    console.warn = originalWarn;
    jest.clearAllMocks();
  });
}; 