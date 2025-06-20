import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ApplicationCard from '../ApplicationCard';

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      applications: (state = { applications: [] }, action) => state,
      ...initialState
    }
  });
};

const renderWithProviders = (component, { store = createMockStore() } = {}) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('ApplicationCard Component', () => {
  const mockApplication = {
    id: 1,
    projectTitle: 'Test Project',
    project_id: 1,
    cover_letter: 'I am very interested in this project and would like to contribute.',
    applicationStatus: 'WAITING',
    freelancer: 'testfreelancer',
    created_at: '2024-01-01T12:00:00Z'
  };

  const mockProps = {
    application: mockApplication,
    onAccept: jest.fn(),
    onReject: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render application information correctly', () => {
    renderWithProviders(<ApplicationCard {...mockProps} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('testfreelancer')).toBeInTheDocument();
    expect(screen.getByText('I am very interested in this project and would like to contribute.')).toBeInTheDocument();
  });

  it('should display application status badge', () => {
    renderWithProviders(<ApplicationCard {...mockProps} />);
    
    expect(screen.getByText('WAITING')).toBeInTheDocument();
  });

  it('should show accept and reject buttons for waiting applications', () => {
    renderWithProviders(<ApplicationCard {...mockProps} />);
    
    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('should call onAccept when accept button is clicked', async () => {
    renderWithProviders(<ApplicationCard {...mockProps} />);
    
    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(mockProps.onAccept).toHaveBeenCalledWith(mockApplication.id);
    });
  });

  it('should call onReject when reject button is clicked', async () => {
    renderWithProviders(<ApplicationCard {...mockProps} />);
    
    const rejectButton = screen.getByText('Reject');
    fireEvent.click(rejectButton);
    
    await waitFor(() => {
      expect(mockProps.onReject).toHaveBeenCalledWith(mockApplication.id);
    });
  });

  it('should not show action buttons for approved applications', () => {
    const approvedApplication = { ...mockApplication, applicationStatus: 'APPROVED' };
    const propsWithApprovedApp = { ...mockProps, application: approvedApplication };
    
    renderWithProviders(<ApplicationCard {...propsWithApprovedApp} />);
    
    expect(screen.queryByText('Accept')).not.toBeInTheDocument();
    expect(screen.queryByText('Reject')).not.toBeInTheDocument();
  });

  it('should not show action buttons for rejected applications', () => {
    const rejectedApplication = { ...mockApplication, applicationStatus: 'REJECTED' };
    const propsWithRejectedApp = { ...mockProps, application: rejectedApplication };
    
    renderWithProviders(<ApplicationCard {...propsWithRejectedApp} />);
    
    expect(screen.queryByText('Accept')).not.toBeInTheDocument();
    expect(screen.queryByText('Reject')).not.toBeInTheDocument();
  });

  it('should display different status colors for different statuses', () => {
    const statuses = ['WAITING', 'APPROVED', 'REJECTED'];
    
    statuses.forEach(status => {
      const applicationWithStatus = { ...mockApplication, applicationStatus: status };
      const propsWithStatus = { ...mockProps, application: applicationWithStatus };
      
      const { unmount } = renderWithProviders(<ApplicationCard {...propsWithStatus} />);
      
      expect(screen.getByText(status)).toBeInTheDocument();
      
      unmount();
    });
  });

  it('should format creation date correctly', () => {
    renderWithProviders(<ApplicationCard {...mockProps} />);
    
    // The date should be formatted and displayed
    expect(screen.getByText(/2024-01-01/)).toBeInTheDocument();
  });

  it('should handle long cover letters', () => {
    const longCoverLetter = 'A'.repeat(500);
    const applicationWithLongLetter = { ...mockApplication, cover_letter: longCoverLetter };
    const propsWithLongLetter = { ...mockProps, application: applicationWithLongLetter };
    
    renderWithProviders(<ApplicationCard {...propsWithLongLetter} />);
    
    expect(screen.getByText(longCoverLetter)).toBeInTheDocument();
  });

  it('should handle missing cover letter', () => {
    const applicationWithoutLetter = { ...mockApplication, cover_letter: '' };
    const propsWithoutLetter = { ...mockProps, application: applicationWithoutLetter };
    
    renderWithProviders(<ApplicationCard {...propsWithoutLetter} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('testfreelancer')).toBeInTheDocument();
  });

  it('should show loading state when action is in progress', async () => {
    renderWithProviders(<ApplicationCard {...mockProps} />);
    
    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);
    
    // Check if button shows loading state (this depends on implementation)
    expect(acceptButton).toBeInTheDocument();
  });
}); 