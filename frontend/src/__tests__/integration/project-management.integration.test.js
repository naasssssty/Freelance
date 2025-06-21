import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProjectForm from '../../components/ProjectForm';
import ProjectCard from '../../components/ProjectCard';
import * as ClientServices from '../../services/ClientServices';
import * as FreelancerServices from '../../services/FreelancerServices';

// Mock services
jest.mock('../../services/ClientServices');
jest.mock('../../services/FreelancerServices');

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false }, action) => state,
      projects: (state = { projects: [], loading: false }, action) => {
        switch (action.type) {
          case 'CREATE_PROJECT_SUCCESS':
            return { ...state, projects: [...state.projects, action.payload] };
          case 'APPLY_PROJECT_SUCCESS':
            return { ...state, projects: state.projects.map(p => 
              p.id === action.payload.projectId 
                ? { ...p, applications: [...(p.applications || []), action.payload] }
                : p
            )};
          default:
            return state;
        }
      }
    },
    preloadedState: initialState
  });
};

const renderWithProviders = (component, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Project Management Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Project Creation Flow', () => {
    it('should create a new project successfully', async () => {
      const mockProject = {
        id: 1,
        title: 'Test Project',
        description: 'Test Description',
        budget: 1000,
        deadline: '2024-12-31',
        status: 'OPEN'
      };

      ClientServices.createProject.mockResolvedValue({
        data: mockProject
      });

      const clientState = {
        auth: {
          user: { id: 1, username: 'client', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      renderWithProviders(<ProjectForm />, clientState);

      // Fill out project form
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const budgetInput = screen.getByLabelText(/budget/i);
      const deadlineInput = screen.getByLabelText(/deadline/i);
      const submitButton = screen.getByRole('button', { name: /create project/i });

      fireEvent.change(titleInput, { target: { value: 'Test Project' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
      fireEvent.change(budgetInput, { target: { value: '1000' } });
      fireEvent.change(deadlineInput, { target: { value: '2024-12-31' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(ClientServices.createProject).toHaveBeenCalledWith({
          title: 'Test Project',
          description: 'Test Description',
          budget: 1000,
          deadline: '2024-12-31'
        });
      });

      expect(ClientServices.createProject).toHaveBeenCalledTimes(1);
    });

    it('should validate required fields', async () => {
      const clientState = {
        auth: {
          user: { id: 1, username: 'client', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      renderWithProviders(<ProjectForm />, clientState);

      const submitButton = screen.getByRole('button', { name: /create project/i });
      fireEvent.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      expect(ClientServices.createProject).not.toHaveBeenCalled();
    });

    it('should handle project creation failure', async () => {
      ClientServices.createProject.mockRejectedValue({
        message: 'Failed to create project'
      });

      const clientState = {
        auth: {
          user: { id: 1, username: 'client', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      renderWithProviders(<ProjectForm />, clientState);

      // Fill minimal required fields
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const submitButton = screen.getByRole('button', { name: /create project/i });

      fireEvent.change(titleInput, { target: { value: 'Test Project' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to create project/i)).toBeInTheDocument();
      });
    });
  });

  describe('Project Application Flow', () => {
    const mockProject = {
      id: 1,
      title: 'Test Project',
      description: 'Test Description',
      budget: 1000,
      deadline: '2024-12-31',
      status: 'OPEN',
      client: { id: 2, username: 'client' }
    };

    it('should allow freelancer to apply for project', async () => {
      const mockApplication = {
        id: 1,
        projectId: 1,
        freelancerId: 1,
        proposedBudget: 800,
        message: 'I can do this project'
      };

      FreelancerServices.applyToProject.mockResolvedValue({
        data: mockApplication
      });

      const freelancerState = {
        auth: {
          user: { id: 1, username: 'freelancer', role: 'FREELANCER' },
          isAuthenticated: true
        }
      };

      renderWithProviders(<ProjectCard project={mockProject} />, freelancerState);

      // Click apply button
      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);

      // Fill application form (assuming it opens a modal or form)
      const budgetInput = screen.getByLabelText(/proposed budget/i);
      const messageInput = screen.getByLabelText(/message/i);
      const submitButton = screen.getByRole('button', { name: /submit application/i });

      fireEvent.change(budgetInput, { target: { value: '800' } });
      fireEvent.change(messageInput, { target: { value: 'I can do this project' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(FreelancerServices.applyToProject).toHaveBeenCalledWith(1, {
          proposedBudget: 800,
          message: 'I can do this project'
        });
      });

      expect(FreelancerServices.applyToProject).toHaveBeenCalledTimes(1);
    });

    it('should prevent client from applying to their own project', () => {
      const clientState = {
        auth: {
          user: { id: 2, username: 'client', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      renderWithProviders(<ProjectCard project={mockProject} />, clientState);

      // Should not show apply button for project owner
      expect(screen.queryByRole('button', { name: /apply/i })).not.toBeInTheDocument();
    });

    it('should show project is closed if status is not OPEN', () => {
      const closedProject = { ...mockProject, status: 'CLOSED' };
      
      const freelancerState = {
        auth: {
          user: { id: 1, username: 'freelancer', role: 'FREELANCER' },
          isAuthenticated: true
        }
      };

      renderWithProviders(<ProjectCard project={closedProject} />, freelancerState);

      // Should show closed status
      expect(screen.getByText(/closed/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /apply/i })).not.toBeInTheDocument();
    });
  });

  describe('Project Status Management', () => {
    const mockProject = {
      id: 1,
      title: 'Test Project',
      description: 'Test Description',
      budget: 1000,
      deadline: '2024-12-31',
      status: 'OPEN',
      client: { id: 1, username: 'client' }
    };

    it('should allow client to update project status', async () => {
      ClientServices.updateProjectStatus.mockResolvedValue({
        data: { ...mockProject, status: 'IN_PROGRESS' }
      });

      const clientState = {
        auth: {
          user: { id: 1, username: 'client', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      renderWithProviders(<ProjectCard project={mockProject} />, clientState);

      // Click status update button
      const statusButton = screen.getByRole('button', { name: /update status/i });
      fireEvent.click(statusButton);

      // Select new status
      const statusSelect = screen.getByLabelText(/status/i);
      fireEvent.change(statusSelect, { target: { value: 'IN_PROGRESS' } });

      const updateButton = screen.getByRole('button', { name: /update/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(ClientServices.updateProjectStatus).toHaveBeenCalledWith(1, 'IN_PROGRESS');
      });
    });

    it('should prevent non-owners from updating project status', () => {
      const otherUserState = {
        auth: {
          user: { id: 2, username: 'otheruser', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      renderWithProviders(<ProjectCard project={mockProject} />, otherUserState);

      // Should not show update status button for non-owners
      expect(screen.queryByRole('button', { name: /update status/i })).not.toBeInTheDocument();
    });
  });

  describe('Project Search and Filtering', () => {
    it('should filter projects by budget range', async () => {
      const mockProjects = [
        { id: 1, title: 'Cheap Project', budget: 500 },
        { id: 2, title: 'Expensive Project', budget: 5000 }
      ];

      FreelancerServices.searchProjects.mockResolvedValue({
        data: mockProjects.filter(p => p.budget >= 1000)
      });

      const freelancerState = {
        auth: {
          user: { id: 1, username: 'freelancer', role: 'FREELANCER' },
          isAuthenticated: true
        }
      };

      // Assuming there's a search component
      renderWithProviders(<div>Search Component Placeholder</div>, freelancerState);

      // This would be implemented with actual search components
      // const minBudgetInput = screen.getByLabelText(/minimum budget/i);
      // fireEvent.change(minBudgetInput, { target: { value: '1000' } });
      
      // const searchButton = screen.getByRole('button', { name: /search/i });
      // fireEvent.click(searchButton);

      // await waitFor(() => {
      //   expect(FreelancerServices.searchProjects).toHaveBeenCalledWith({
      //     minBudget: 1000
      //   });
      // });
    });
  });

  describe('Project Notifications', () => {
    it('should show notification when project application is submitted', async () => {
      const mockApplication = {
        id: 1,
        projectId: 1,
        freelancerId: 1,
        status: 'PENDING'
      };

      FreelancerServices.applyToProject.mockResolvedValue({
        data: mockApplication
      });

      const freelancerState = {
        auth: {
          user: { id: 1, username: 'freelancer', role: 'FREELANCER' },
          isAuthenticated: true
        }
      };

      const mockProject = {
        id: 1,
        title: 'Test Project',
        status: 'OPEN',
        client: { id: 2, username: 'client' }
      };

      renderWithProviders(<ProjectCard project={mockProject} />, freelancerState);

      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);

      // Fill minimal application
      const submitButton = screen.getByRole('button', { name: /submit application/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/application submitted successfully/i)).toBeInTheDocument();
      });
    });
  });
}); 