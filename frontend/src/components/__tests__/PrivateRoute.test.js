import React from 'react';
import { render, screen } from '@testing-library/react';
import { PrivateRoute } from '../PrivateRoute';
import { jwtDecode } from 'jwt-decode';

// Mock dependencies
jest.mock('jwt-decode');
jest.mock('../../pages/NoPage', () => {
    return function NoPage() {
        return <div data-testid="no-page">No Page Component</div>;
    };
});

// Mock Navigate component
jest.mock('react-router-dom', () => ({
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>,
}));

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
});

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

describe('PrivateRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render children when user is authenticated and verified', () => {
        const mockToken = 'valid.jwt.token';
        const mockDecodedToken = {
            sub: 'testuser',
            role: 'CLIENT',
            isVerified: true
        };

        localStorageMock.getItem.mockReturnValue(mockToken);
        jwtDecode.mockReturnValue(mockDecodedToken);

        render(
            <PrivateRoute>
                <TestComponent />
            </PrivateRoute>
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should redirect to login when no token exists', () => {
        localStorageMock.getItem.mockReturnValue(null);

        render(
            <PrivateRoute>
                <TestComponent />
            </PrivateRoute>
        );

        expect(screen.getByTestId('navigate')).toBeInTheDocument();
        expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should redirect to login when token is empty', () => {
        localStorageMock.getItem.mockReturnValue('');

        render(
            <PrivateRoute>
                <TestComponent />
            </PrivateRoute>
        );

        expect(screen.getByTestId('navigate')).toBeInTheDocument();
        expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should render NoPage when user is not verified', () => {
        const mockToken = 'valid.jwt.token';
        const mockDecodedToken = {
            sub: 'testuser',
            role: 'CLIENT',
            isVerified: false
        };

        localStorageMock.getItem.mockReturnValue(mockToken);
        jwtDecode.mockReturnValue(mockDecodedToken);

        render(
            <PrivateRoute>
                <TestComponent />
            </PrivateRoute>
        );

        expect(screen.getByTestId('no-page')).toBeInTheDocument();
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should redirect to home when role does not match required role', () => {
        const mockToken = 'valid.jwt.token';
        const mockDecodedToken = {
            sub: 'testuser',
            role: 'CLIENT',
            isVerified: true
        };

        localStorageMock.getItem.mockReturnValue(mockToken);
        jwtDecode.mockReturnValue(mockDecodedToken);

        render(
            <PrivateRoute role="ADMIN">
                <TestComponent />
            </PrivateRoute>
        );

        expect(screen.getByTestId('navigate')).toBeInTheDocument();
        expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should render children when role matches required role', () => {
        const mockToken = 'valid.jwt.token';
        const mockDecodedToken = {
            sub: 'testuser',
            role: 'ADMIN',
            isVerified: true
        };

        localStorageMock.getItem.mockReturnValue(mockToken);
        jwtDecode.mockReturnValue(mockDecodedToken);

        render(
            <PrivateRoute role="ADMIN">
                <TestComponent />
            </PrivateRoute>
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should redirect to login when token decode fails', () => {
        const mockToken = 'invalid.jwt.token';
        
        localStorageMock.getItem.mockReturnValue(mockToken);
        jwtDecode.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        render(
            <PrivateRoute>
                <TestComponent />
            </PrivateRoute>
        );

        expect(screen.getByTestId('navigate')).toBeInTheDocument();
        expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(console.error).toHaveBeenCalledWith('Invalid token:', expect.any(Error));
    });

    it('should handle different user roles correctly', () => {
        const roles = ['CLIENT', 'FREELANCER', 'ADMIN'];
        
        roles.forEach(role => {
            const mockToken = 'valid.jwt.token';
            const mockDecodedToken = {
                sub: 'testuser',
                role: role,
                isVerified: true
            };

            localStorageMock.getItem.mockReturnValue(mockToken);
            jwtDecode.mockReturnValue(mockDecodedToken);

            const { unmount } = render(
                <PrivateRoute role={role}>
                    <TestComponent />
                </PrivateRoute>
            );

            expect(screen.getByTestId('protected-content')).toBeInTheDocument();
            unmount();
        });
    });
});
