import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Projects from '../../pages/Projects';
import ProjectDetails from '../../pages/ProjectDetails';
import * as projectService from '../../services/projectService';

// Mock the project service
jest.mock('../../services/projectService');

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false }, action) => {
        switch (action.type) {
          case 'auth/login':
            return { user: action.payload, isAuthenticated: true };
          default:
            return state;
        }
      },
      projects: (state = { projects: [], currentProject: null }, action) => {
        switch (action.type) {
          case 'projects/setProjects':
            return { ...state, projects: action.payload };
          case 'projects/setCurrentProject':
            return { ...state, currentProject: action.payload };
          case 'projects/addProject':
            return { ...state, projects: [...state.projects, action.payload] };
          case 'projects/updateProject':
            return {
              ...state,
              projects: state.projects.map(p => 
                p.id === action.payload.id ? action.payload : p
              )
            };
          default:
            return state;
        }
      }
    },
    preloadedState: initialState
  });
};

const renderWithProviders = (component, { initialState = {} } = {}) => {
  const store = createMockStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    ),
    store
  };
};

describe('Project Management Integration Tests', () => {
  const mockClient = {
    id: 1,
    username: 'client1',
    email: 'client@example.com',
    role: 'CLIENT'
  };

  const mockFreelancer = {
    id: 2,
    username: 'freelancer1',
    email: 'freelancer@example.com',
    role: 'FREELANCER'
  };

  const mockProjects = [
    {
      id: 1,
      title: 'Website Development',
      description: 'Build a modern website',
      budget: 5000,
      status: 'OPEN',
      client: mockClient,
      createdAt: '2024-01-15T10:00:00Z',
      deadline: '2024-03-15T23:59:59Z',
      skills: ['React', 'Node.js', 'MongoDB']
    },
    {
      id: 2,
      title: 'Mobile App Design',
      description: 'Design a mobile application',
      budget: 3000,
      status: 'IN_PROGRESS',
      client: mockClient,
      freelancer: mockFreelancer,
      createdAt: '2024-01-10T10:00:00Z',
      deadline: '2024-02-28T23:59:59Z',
      skills: ['UI/UX', 'Figma', 'Mobile Design']
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock project service methods
    projectService.getAllProjects.mockResolvedValue({ data: mockProjects });
    projectService.getProjectById.mockResolvedValue({ data: mockProjects[0] });
    projectService.createProject.mockResolvedValue({
      data: {
        id: 3,
        title: 'New Project',
        description: 'Test project',
        budget: 2000,
        status: 'OPEN',
        client: mockClient,
        createdAt: new Date().toISOString(),
        skills: ['JavaScript']
      }
    });
    projectService.updateProject.mockResolvedValue({
      data: { ...mockProjects[0], status: 'IN_PROGRESS' }
    });
    projectService.deleteProject.mockResolvedValue({ data: { success: true } });
  });

  describe('Project Listing Integration', () => {
    it('should load and display all projects on component mount', async () => {
      const initialState = {
        auth: { user: mockClient, isAuthenticated: true }
      };

      renderWithProviders(<Projects />, { initialState });

      // Wait for projects to load
      await waitFor(() => {
        expect(projectService.getAllProjects).toHaveBeenCalled();
      });

      // Check if projects are displayed
      await waitFor(() => {
        expect(screen.getByText('Website Development')).toBeInTheDocument();
        expect(screen.getByText('Mobile App Design')).toBeInTheDocument();
      });
    });

    it('should filter projects by status', async () => {
      const initialState = {
        auth: { user: mockClient, isAuthenticated: true }
      };

      renderWithProviders(<Projects />, { initialState });

      await waitFor(() => {
        expect(screen.getByText('Website Development')).toBeInTheDocument();
      });

      // Filter by status
      const statusFilter = screen.getByRole('combobox', { name: /status/i });
      fireEvent.change(statusFilter, { target: { value: 'OPEN' } });

      // Should show only open projects
      await waitFor(() => {
        expect(screen.getByText('Website Development')).toBeInTheDocument();
        expect(screen.queryByText('Mobile App Design')).not.toBeInTheDocument();
      });
    });

    it('should search projects by title or skills', async () => {
      const initialState = {
        auth: { user: mockClient, isAuthenticated: true }
      };

      renderWithProviders(<Projects />, { initialState });

      await waitFor(() => {
        expect(screen.getByText('Website Development')).toBeInTheDocument();
      });

      // Search for projects
      const searchInput = screen.getByPlaceholderText(/search projects/i);
      fireEvent.change(searchInput, { target: { value: 'React' } });

      // Should show only projects matching search
      await waitFor(() => {
        expect(screen.getByText('Website Development')).toBeInTheDocument();
        expect(screen.queryByText('Mobile App Design')).not.toBeInTheDocument();
      });
    });
  });

  describe('Project Creation Integration', () => {
    it('should create a new project with complete workflow', async () => {
      const initialState = {
        auth: { user: mockClient, isAuthenticated: true }
      };

      renderWithProviders(<Projects />, { initialState });

      // Click create project button
      const createButton = screen.getByRole('button', { name: /create new project/i });
      fireEvent.click(createButton);

      // Fill in project form
      await waitFor(() => {
        expect(screen.getByLabelText(/project title/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/project title/i), {
        target: { value: 'New Project' }
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Test project description' }
      });
      fireEvent.change(screen.getByLabelText(/budget/i), {
        target: { value: '2000' }
      });

      // Add skills
      const skillsInput = screen.getByLabelText(/skills/i);
      fireEvent.change(skillsInput, { target: { value: 'JavaScript' } });
      fireEvent.keyDown(skillsInput, { key: 'Enter' });

      // Set deadline
      const deadlineInput = screen.getByLabelText(/deadline/i);
      fireEvent.change(deadlineInput, { target: { value: '2024-06-01' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create project/i });
      fireEvent.click(submitButton);

      // Wait for project creation
      await waitFor(() => {
        expect(projectService.createProject).toHaveBeenCalledWith({
          title: 'New Project',
          description: 'Test project description',
          budget: 2000,
          skills: ['JavaScript'],
          deadline: '2024-06-01',
          clientId: mockClient.id
        });
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/project created successfully/i)).toBeInTheDocument();
      });
    });

    it('should validate project form before submission', async () => {
      const initialState = {
        auth: { user: mockClient, isAuthenticated: true }
      };

      renderWithProviders(<Projects />, { initialState });

      const createButton = screen.getByRole('button', { name: /create new project/i });
      fireEvent.click(createButton);

      // Try to submit empty form
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /create project/i });
        fireEvent.click(submitButton);
      });

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/description is required/i)).toBeInTheDocument();
        expect(screen.getByText(/budget is required/i)).toBeInTheDocument();
      });

      // Should not call create service
      expect(projectService.createProject).not.toHaveBeenCalled();
    });
  });

  describe('Project Details Integration', () => {
    it('should load and display project details', async () => {
      const initialState = {
        auth: { user: mockClient, isAuthenticated: true }
      };

      // Mock useParams to return project ID
      jest.doMock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useParams: () => ({ id: '1' })
      }));

      renderWithProviders(<ProjectDetails />, { initialState });

      // Wait for project details to load
      await waitFor(() => {
        expect(projectService.getProjectById).toHaveBeenCalledWith('1');
      });

      // Check if project details are displayed
      await waitFor(() => {
        expect(screen.getByText('Website Development')).toBeInTheDocument();
        expect(screen.getByText('Build a modern website')).toBeInTheDocument();
        expect(screen.getByText('$5,000')).toBeInTheDocument();
      });
    });

    it('should handle project status updates', async () => {
      const initialState = {
        auth: { user: mockFreelancer, isAuthenticated: true }
      };

      jest.doMock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useParams: () => ({ id: '1' })
      }));

      renderWithProviders(<ProjectDetails />, { initialState });

      await waitFor(() => {
        expect(screen.getByText('Website Development')).toBeInTheDocument();
      });

      // Update project status
      const statusSelect = screen.getByRole('combobox', { name: /status/i });
      fireEvent.change(statusSelect, { target: { value: 'IN_PROGRESS' } });

      const updateButton = screen.getByRole('button', { name: /update status/i });
      fireEvent.click(updateButton);

      // Wait for status update
      await waitFor(() => {
        expect(projectService.updateProject).toHaveBeenCalledWith('1', {
          status: 'IN_PROGRESS'
        });
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/project updated successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Project Application Integration', () => {
    it('should allow freelancers to apply to projects', async () => {
      const initialState = {
        auth: { user: mockFreelancer, isAuthenticated: true }
      };

      projectService.applyToProject = jest.fn().mockResolvedValue({
        data: { success: true, message: 'Application submitted' }
      });

      jest.doMock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useParams: () => ({ id: '1' })
      }));

      renderWithProviders(<ProjectDetails />, { initialState });

      await waitFor(() => {
        expect(screen.getByText('Website Development')).toBeInTheDocument();
      });

      // Find and click apply button
      const applyButton = screen.getByRole('button', { name: /apply to project/i });
      fireEvent.click(applyButton);

      // Fill application form
      await waitFor(() => {
        expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/cover letter/i), {
        target: { value: 'I am interested in this project...' }
      });

      fireEvent.change(screen.getByLabelText(/proposed budget/i), {
        target: { value: '4500' }
      });

      // Submit application
      const submitAppButton = screen.getByRole('button', { name: /submit application/i });
      fireEvent.click(submitAppButton);

      // Wait for application submission
      await waitFor(() => {
        expect(projectService.applyToProject).toHaveBeenCalledWith('1', {
          coverLetter: 'I am interested in this project...',
          proposedBudget: 4500,
          freelancerId: mockFreelancer.id
        });
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/application submitted successfully/i)).toBeInTheDocument();
      });
    });

    it('should prevent duplicate applications', async () => {
      const initialState = {
        auth: { user: mockFreelancer, isAuthenticated: true }
      };

      // Mock project with existing application
      const projectWithApplication = {
        ...mockProjects[0],
        applications: [{ freelancerId: mockFreelancer.id }]
      };

      projectService.getProjectById.mockResolvedValue({ data: projectWithApplication });

      jest.doMock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useParams: () => ({ id: '1' })
      }));

      renderWithProviders(<ProjectDetails />, { initialState });

      await waitFor(() => {
        expect(screen.getByText('Website Development')).toBeInTheDocument();
      });

      // Should show already applied message instead of apply button
      expect(screen.getByText(/you have already applied/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /apply to project/i })).not.toBeInTheDocument();
    });
  });

  describe('Project Deletion Integration', () => {
    it('should allow project owners to delete projects', async () => {
      const initialState = {
        auth: { user: mockClient, isAuthenticated: true }
      };

      renderWithProviders(<Projects />, { initialState });

      await waitFor(() => {
        expect(screen.getByText('Website Development')).toBeInTheDocument();
      });

      // Find and click delete button
      const deleteButton = screen.getByRole('button', { name: /delete project/i });
      fireEvent.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmButton);

      // Wait for deletion
      await waitFor(() => {
        expect(projectService.deleteProject).toHaveBeenCalledWith('1');
      });

      // Should show success message and remove project from list
      await waitFor(() => {
        expect(screen.getByText(/project deleted successfully/i)).toBeInTheDocument();
        expect(screen.queryByText('Website Development')).not.toBeInTheDocument();
      });
    });
  });
}); 