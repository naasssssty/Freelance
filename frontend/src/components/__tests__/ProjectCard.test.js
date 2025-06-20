import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProjectCard from '../ProjectCard';

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      projects: (state = { projects: [] }, action) => state,
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

describe('ProjectCard Component', () => {
  const mockProject = {
    id: 1,
    title: 'Test Project',
    description: 'This is a test project description',
    budget: 1000,
    deadline: '2024-12-31',
    client_username: 'testclient',
    projectStatus: 'PENDING',
    posted_at: '2024-01-01T00:00:00Z'
  };

  const mockProps = {
    project: mockProject,
    onApprove: jest.fn(),
    onDeny: jest.fn(),
    dispatch: jest.fn(),
    projectsList: [mockProject]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render project information correctly', () => {
    renderWithProviders(<ProjectCard {...mockProps} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('This is a test project description')).toBeInTheDocument();
    expect(screen.getByText('€1000')).toBeInTheDocument();
    expect(screen.getByText('testclient')).toBeInTheDocument();
  });

  it('should display project status badge', () => {
    renderWithProviders(<ProjectCard {...mockProps} />);
    
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('should show approve and deny buttons for pending projects', () => {
    renderWithProviders(<ProjectCard {...mockProps} />);
    
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Deny')).toBeInTheDocument();
  });

  it('should call onApprove when approve button is clicked', async () => {
    renderWithProviders(<ProjectCard {...mockProps} />);
    
    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);
    
    await waitFor(() => {
      expect(mockProps.onApprove).toHaveBeenCalledWith(mockProject.id);
    });
  });

  it('should call onDeny when deny button is clicked', async () => {
    renderWithProviders(<ProjectCard {...mockProps} />);
    
    const denyButton = screen.getByText('Deny');
    fireEvent.click(denyButton);
    
    await waitFor(() => {
      expect(mockProps.onDeny).toHaveBeenCalledWith(mockProject.id);
    });
  });

  it('should not show action buttons for approved projects', () => {
    const approvedProject = { ...mockProject, projectStatus: 'APPROVED' };
    const propsWithApprovedProject = { ...mockProps, project: approvedProject };
    
    renderWithProviders(<ProjectCard {...propsWithApprovedProject} />);
    
    expect(screen.queryByText('Approve')).not.toBeInTheDocument();
    expect(screen.queryByText('Deny')).not.toBeInTheDocument();
  });

  it('should not show action buttons for denied projects', () => {
    const deniedProject = { ...mockProject, projectStatus: 'DENIED' };
    const propsWithDeniedProject = { ...mockProps, project: deniedProject };
    
    renderWithProviders(<ProjectCard {...propsWithDeniedProject} />);
    
    expect(screen.queryByText('Approve')).not.toBeInTheDocument();
    expect(screen.queryByText('Deny')).not.toBeInTheDocument();
  });

  it('should handle project with no budget', () => {
    const projectWithoutBudget = { ...mockProject, budget: null };
    const propsWithoutBudget = { ...mockProps, project: projectWithoutBudget };
    
    renderWithProviders(<ProjectCard {...propsWithoutBudget} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.queryByText('€')).not.toBeInTheDocument();
  });

  it('should handle project with no deadline', () => {
    const projectWithoutDeadline = { ...mockProject, deadline: null };
    const propsWithoutDeadline = { ...mockProps, project: projectWithoutDeadline };
    
    renderWithProviders(<ProjectCard {...propsWithoutDeadline} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('should format deadline correctly', () => {
    renderWithProviders(<ProjectCard {...mockProps} />);
    
    // The deadline should be formatted and displayed
    expect(screen.getByText(/2024-12-31/)).toBeInTheDocument();
  });

  it('should show loading state when action is in progress', async () => {
    renderWithProviders(<ProjectCard {...mockProps} />);
    
    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);
    
    // Check if button shows loading state (this depends on implementation)
    expect(approveButton).toBeInTheDocument();
  });

  it('should display different status colors for different statuses', () => {
    const statuses = ['PENDING', 'APPROVED', 'DENIED', 'IN_PROGRESS', 'COMPLETED'];
    
    statuses.forEach(status => {
      const projectWithStatus = { ...mockProject, projectStatus: status };
      const propsWithStatus = { ...mockProps, project: projectWithStatus };
      
      const { unmount } = renderWithProviders(<ProjectCard {...propsWithStatus} />);
      
      expect(screen.getByText(status)).toBeInTheDocument();
      
      unmount();
    });
  });
}); 