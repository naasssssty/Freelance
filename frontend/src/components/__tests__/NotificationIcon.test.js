import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationIcon from '../NotificationIcon';

// Mock react-icons
jest.mock('react-icons/fa', () => ({
    FaBell: ({ size }) => <div data-testid="bell-icon" data-size={size}>Bell Icon</div>
}));

describe('NotificationIcon', () => {
    const mockOnClick = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render bell icon', () => {
        render(<NotificationIcon onClick={mockOnClick} unreadCount={0} />);
        
        expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
        expect(screen.getByTestId('bell-icon')).toHaveAttribute('data-size', '24');
    });

    it('should handle click events', () => {
        render(<NotificationIcon onClick={mockOnClick} unreadCount={0} />);
        
        fireEvent.click(screen.getByTestId('bell-icon').parentElement);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not show badge when unreadCount is 0', () => {
        render(<NotificationIcon onClick={mockOnClick} unreadCount={0} />);
        
        expect(screen.queryByText('0')).not.toBeInTheDocument();
        expect(screen.queryByText('99+')).not.toBeInTheDocument();
    });

    it('should show badge with correct count when unreadCount is between 1-99', () => {
        render(<NotificationIcon onClick={mockOnClick} unreadCount={5} />);
        
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('5')).toHaveClass('notification-badge');
    });

    it('should show 99+ when unreadCount is over 99', () => {
        render(<NotificationIcon onClick={mockOnClick} unreadCount={150} />);
        
        expect(screen.getByText('99+')).toBeInTheDocument();
        expect(screen.getByText('99+')).toHaveClass('notification-badge');
    });

    it('should show exact count for edge case of 99', () => {
        render(<NotificationIcon onClick={mockOnClick} unreadCount={99} />);
        
        expect(screen.getByText('99')).toBeInTheDocument();
        expect(screen.queryByText('99+')).not.toBeInTheDocument();
    });

    it('should show 99+ for edge case of 100', () => {
        render(<NotificationIcon onClick={mockOnClick} unreadCount={100} />);
        
        expect(screen.getByText('99+')).toBeInTheDocument();
        expect(screen.queryByText('100')).not.toBeInTheDocument();
    });

    it('should have proper CSS class', () => {
        const { container } = render(<NotificationIcon onClick={mockOnClick} unreadCount={0} />);
        
        expect(container.querySelector('.notification-icon')).toBeInTheDocument();
    });

    it('should handle missing onClick prop gracefully', () => {
        render(<NotificationIcon unreadCount={5} />);
        
        expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should handle negative unreadCount', () => {
        render(<NotificationIcon onClick={mockOnClick} unreadCount={-5} />);
        
        // Should not show badge for negative numbers
        expect(screen.queryByText('-5')).not.toBeInTheDocument();
        expect(screen.queryByText('99+')).not.toBeInTheDocument();
    });

    it('should handle various unreadCount values correctly', () => {
        const testCases = [
            { count: 1, expected: '1' },
            { count: 10, expected: '10' },
            { count: 50, expected: '50' },
            { count: 99, expected: '99' },
            { count: 100, expected: '99+' },
            { count: 999, expected: '99+' }
        ];

        testCases.forEach(({ count, expected }, index) => {
            const { unmount } = render(
                <NotificationIcon onClick={mockOnClick} unreadCount={count} />
            );
            
            expect(screen.getByText(expected)).toBeInTheDocument();
            unmount();
        });
    });
});
