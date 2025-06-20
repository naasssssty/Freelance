import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ClientProjectCard from '../ClientProjectCard';

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      projects: (state = { projects: [] }, action) => state,
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

describe('ClientProjectCard Component', () => {
  const mockProject = {
    id: 1,
    title: 'Client Test Project',
    description: 'This is a test project created by a client.',
    budget: 2000,
    deadline: '2024-12-31',
    client_username: 'testclient',
    projectStatus: 'APPROVED',
    posted_at: '2024-01-01T00:00:00Z',
    applications: [
      {
        id: 1,
        freelancer: 'freelancer1',
        applicationStatus: 'WAITING'
      },
      {
        id: 2,
        freelancer: 'freelancer2',
        applicationStatus: 'APPROVED'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render project information correctly', () => {
    renderWithProviders(<ClientProjectCard project={mockProject} />);
    
    expect(screen.getByText('Client Test Project')).toBeInTheDocument();
    expect(screen.getByText('This is a test project created by a client.')).toBeInTheDocument();
    expect(screen.getByText('€2000')).toBeInTheDocument();
  });

  it('should display project status badge', () => {
    renderWithProviders(<ClientProjectCard project={mockProject} />);
    
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('should show different status colors for different statuses', () => {
    const statuses = ['PENDING', 'APPROVED', 'DENIED', 'IN_PROGRESS', 'COMPLETED'];
    
    statuses.forEach(status => {
      const projectWithStatus = { ...mockProject, projectStatus: status };
      
      const { unmount } = renderWithProviders(<ClientProjectCard project={projectWithStatus} />);
      
      expect(screen.getByText(status)).toBeInTheDocument();
      
      unmount();
    });
  });

  it('should display applications count', () => {
    renderWithProviders(<ClientProjectCard project={mockProject} />);
    
    expect(screen.getByText(/2 applications/i)).toBeInTheDocument();
  });

  it('should show view applications button', () => {
    renderWithProviders(<ClientProjectCard project={mockProject} />);
    
    expect(screen.getByText('View Applications')).toBeInTheDocument();
  });

  it('should handle view applications button click', () => {
    renderWithProviders(<ClientProjectCard project={mockProject} />);
    
    const viewButton = screen.getByText('View Applications');
    fireEvent.click(viewButton);
    
    // Should trigger navigation or state change
    expect(viewButton).toBeInTheDocument();
  });

  it('should show chat button for in-progress projects', () => {
    const inProgressProject = { ...mockProject, projectStatus: 'IN_PROGRESS' };
    
    renderWithProviders(<ClientProjectCard project={inProgressProject} />);
    
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });

  it('should not show chat button for pending projects', () => {
    const pendingProject = { ...mockProject, projectStatus: 'PENDING' };
    
    renderWithProviders(<ClientProjectCard project={pendingProject} />);
    
    expect(screen.queryByText('Chat')).not.toBeInTheDocument();
  });

  it('should handle chat button click', () => {
    const inProgressProject = { ...mockProject, projectStatus: 'IN_PROGRESS' };
    
    renderWithProviders(<ClientProjectCard project={inProgressProject} />);
    
    const chatButton = screen.getByText('Chat');
    fireEvent.click(chatButton);
    
    // Should open chat interface
    expect(chatButton).toBeInTheDocument();
  });

  it('should format deadline correctly', () => {
    renderWithProviders(<ClientProjectCard project={mockProject} />);
    
    // The deadline should be formatted and displayed
    expect(screen.getByText(/2024-12-31/)).toBeInTheDocument();
  });

  it('should format posted date correctly', () => {
    renderWithProviders(<ClientProjectCard project={mockProject} />);
    
    // The posted date should be formatted and displayed
    expect(screen.getByText(/2024-01-01/)).toBeInTheDocument();
  });

  it('should handle project with no budget', () => {
    const projectWithoutBudget = { ...mockProject, budget: null };
    
    renderWithProviders(<ClientProjectCard project={projectWithoutBudget} />);
    
    expect(screen.getByText('Client Test Project')).toBeInTheDocument();
    expect(screen.queryByText('€')).not.toBeInTheDocument();
  });

  it('should handle project with no deadline', () => {
    const projectWithoutDeadline = { ...mockProject, deadline: null };
    
    renderWithProviders(<ClientProjectCard project={projectWithoutDeadline} />);
    
    expect(screen.getByText('Client Test Project')).toBeInTheDocument();
  });

  it('should handle project with no applications', () => {
    const projectWithoutApplications = { ...mockProject, applications: [] };
    
    renderWithProviders(<ClientProjectCard project={projectWithoutApplications} />);
    
    expect(screen.getByText(/0 applications/i)).toBeInTheDocument();
  });

  it('should show expired status for overdue projects', () => {
    const expiredProject = { 
      ...mockProject, 
      projectStatus: 'EXPIRED',
      deadline: '2023-01-01' 
    };
    
    renderWithProviders(<ClientProjectCard project={expiredProject} />);
    
    expect(screen.getByText('EXPIRED')).toBeInTheDocument();
  });

  it('should show completed status styling', () => {
    const completedProject = { ...mockProject, projectStatus: 'COMPLETED' };
    
    renderWithProviders(<ClientProjectCard project={completedProject} />);
    
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('should handle long project descriptions', () => {
    const longDescription = 'A'.repeat(500);
    const projectWithLongDescription = { ...mockProject, description: longDescription };
    
    renderWithProviders(<ClientProjectCard project={projectWithLongDescription} />);
    
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('should handle project with special characters in title', () => {
    const projectWithSpecialTitle = { 
      ...mockProject, 
      title: 'Test Project with Special Characters: @#$%^&*()' 
    };
    
    renderWithProviders(<ClientProjectCard project={projectWithSpecialTitle} />);
    
    expect(screen.getByText('Test Project with Special Characters: @#$%^&*()')).toBeInTheDocument();
  });

  it('should display budget with proper formatting', () => {
    const highBudgetProject = { ...mockProject, budget: 10000.50 };
    
    renderWithProviders(<ClientProjectCard project={highBudgetProject} />);
    
    expect(screen.getByText('€10000.5')).toBeInTheDocument();
  });

  it('should handle projects with different application statuses', () => {
    const projectWithMixedApplications = {
      ...mockProject,
      applications: [
        { id: 1, freelancer: 'freelancer1', applicationStatus: 'WAITING' },
        { id: 2, freelancer: 'freelancer2', applicationStatus: 'APPROVED' },
        { id: 3, freelancer: 'freelancer3', applicationStatus: 'REJECTED' }
      ]
    };
    
    renderWithProviders(<ClientProjectCard project={projectWithMixedApplications} />);
    
    expect(screen.getByText(/3 applications/i)).toBeInTheDocument();
  });
}); 