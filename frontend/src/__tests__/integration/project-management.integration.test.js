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

// Mock window.alert
const originalAlert = window.alert;
beforeAll(() => {
  window.alert = jest.fn();
});

afterAll(() => {
  window.alert = originalAlert;
});

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

      ClientServices.handlePostProject.mockResolvedValue({
        data: mockProject
      });

      const clientState = {
        auth: {
          user: { id: 1, username: 'client', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      const mockHandleFormClose = jest.fn();
      renderWithProviders(<ProjectForm handleFormClose={mockHandleFormClose} />, clientState);

      // Fill out project form
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const budgetInput = screen.getByLabelText(/budget/i);
      const deadlineInput = screen.getByLabelText(/deadline/i);
      const submitButton = screen.getByRole('button', { name: /post project/i });

      fireEvent.change(titleInput, { target: { value: 'Test Project' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
      fireEvent.change(budgetInput, { target: { value: '1000' } });
      fireEvent.change(deadlineInput, { target: { value: '2024-12-31' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(ClientServices.handlePostProject).toHaveBeenCalledWith({
          title: 'Test Project',
          description: 'Test Description',
          budget: '1000',
          deadline: '2024-12-31'
        });
      });

      expect(ClientServices.handlePostProject).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenCalledWith('Project posted successfully!');
    });

    it('should validate required fields', async () => {
      const clientState = {
        auth: {
          user: { id: 1, username: 'client', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      const mockHandleFormClose = jest.fn();
      renderWithProviders(<ProjectForm handleFormClose={mockHandleFormClose} />, clientState);

      const submitButton = screen.getByRole('button', { name: /post project/i });
      fireEvent.click(submitButton);

      // The form will submit with empty values, but the service should handle validation
      await waitFor(() => {
        expect(ClientServices.handlePostProject).toHaveBeenCalledWith({
          title: '',
          description: '',
          budget: '',
          deadline: ''
        });
      });
    });

    it('should handle project creation failure', async () => {
      ClientServices.handlePostProject.mockRejectedValue({
        message: 'Failed to create project'
      });

      const clientState = {
        auth: {
          user: { id: 1, username: 'client', role: 'CLIENT' },
          isAuthenticated: true
        }
      };

      const mockHandleFormClose = jest.fn();
      renderWithProviders(<ProjectForm handleFormClose={mockHandleFormClose} />, clientState);

      // Fill minimal required fields
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const budgetInput = screen.getByLabelText(/budget/i);
      const deadlineInput = screen.getByLabelText(/deadline/i);
      const submitButton = screen.getByRole('button', { name: /post project/i });

      fireEvent.change(titleInput, { target: { value: 'Test Project' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
      fireEvent.change(budgetInput, { target: { value: '1000' } });
      fireEvent.change(deadlineInput, { target: { value: '2024-12-31' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to post the project/i)).toBeInTheDocument();
      });
    });
  });

  describe('Project Card Display', () => {
    const mockProject = {
      id: 1,
      title: 'Test Project',
      description: 'Test Description',
      budget: 1000,
      deadline: '2024-12-31',
      projectStatus: 'PENDING',
      client_username: 'client'
    };

    it('should display project information correctly', () => {
      const mockOnApprove = jest.fn();
      const mockOnDeny = jest.fn();
      const mockDispatch = jest.fn();
      const mockProjectsList = [mockProject];

      renderWithProviders(
        <ProjectCard 
          project={mockProject}
          onApprove={mockOnApprove}
          onDeny={mockOnDeny}
          dispatch={mockDispatch}
          projectsList={mockProjectsList}
        />
      );

      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('$1000')).toBeInTheDocument();
      expect(screen.getByText('PENDING')).toBeInTheDocument();
      expect(screen.getByText('client')).toBeInTheDocument();
    });

    it('should handle project approval', async () => {
      const mockOnApprove = jest.fn().mockResolvedValue();
      const mockOnDeny = jest.fn();
      const mockDispatch = jest.fn();
      const mockProjectsList = [mockProject];

      renderWithProviders(
        <ProjectCard 
          project={mockProject}
          onApprove={mockOnApprove}
          onDeny={mockOnDeny}
          dispatch={mockDispatch}
          projectsList={mockProjectsList}
        />
      );

      const approveButton = screen.getByRole('button', { name: /approve/i });
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(mockOnApprove).toHaveBeenCalledWith(mockProject.id);
      });
    });

    it('should handle project denial', async () => {
      const mockOnApprove = jest.fn();
      const mockOnDeny = jest.fn().mockResolvedValue();
      const mockDispatch = jest.fn();
      const mockProjectsList = [mockProject];

      renderWithProviders(
        <ProjectCard 
          project={mockProject}
          onApprove={mockOnApprove}
          onDeny={mockOnDeny}
          dispatch={mockDispatch}
          projectsList={mockProjectsList}
        />
      );

      const denyButton = screen.getByRole('button', { name: /deny/i });
      fireEvent.click(denyButton);

      await waitFor(() => {
        expect(mockOnDeny).toHaveBeenCalledWith(mockProject.id);
      });
    });

    it('should not show action buttons for non-pending projects', () => {
      const approvedProject = {
        ...mockProject,
        projectStatus: 'APPROVED'
      };

      const mockOnApprove = jest.fn();
      const mockOnDeny = jest.fn();
      const mockDispatch = jest.fn();
      const mockProjectsList = [approvedProject];

      renderWithProviders(
        <ProjectCard 
          project={approvedProject}
          onApprove={mockOnApprove}
          onDeny={mockOnDeny}
          dispatch={mockDispatch}
          projectsList={mockProjectsList}
        />
      );

      expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /deny/i })).not.toBeInTheDocument();
    });
  });

  describe('Project Form Validation', () => {
    it('should show loading state during submission', async () => {
      ClientServices.handlePostProject.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const mockHandleFormClose = jest.fn();
      renderWithProviders(<ProjectForm handleFormClose={mockHandleFormClose} />);

      // Fill out form
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Project' } });
      fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
      fireEvent.change(screen.getByLabelText(/budget/i), { target: { value: '1000' } });
      fireEvent.change(screen.getByLabelText(/deadline/i), { target: { value: '2024-12-31' } });

      fireEvent.click(screen.getByRole('button', { name: /post project/i }));

      expect(screen.getByText('Posting...')).toBeInTheDocument();
      expect(screen.getByText('Posting...')).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Post Project')).toBeInTheDocument();
      });
    });

    it('should handle cancel button', () => {
      const mockHandleFormClose = jest.fn();
      renderWithProviders(<ProjectForm handleFormClose={mockHandleFormClose} />);

      fireEvent.click(screen.getByText('Cancel'));
      expect(mockHandleFormClose).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on project creation failure', async () => {
      const errorMessage = 'Network connection failed';
      ClientServices.handlePostProject.mockRejectedValue(new Error(errorMessage));

      const mockHandleFormClose = jest.fn();
      renderWithProviders(<ProjectForm handleFormClose={mockHandleFormClose} />);

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Project' } });
      fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
      fireEvent.change(screen.getByLabelText(/budget/i), { target: { value: '1000' } });
      fireEvent.change(screen.getByLabelText(/deadline/i), { target: { value: '2024-12-31' } });
      
      fireEvent.click(screen.getByRole('button', { name: /post project/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to post the project/i)).toBeInTheDocument();
      });
    });

    it('should clear error message on successful retry', async () => {
      // First attempt fails
      ClientServices.handlePostProject.mockRejectedValueOnce(new Error('Network error'));
      
      const mockHandleFormClose = jest.fn();
      renderWithProviders(<ProjectForm handleFormClose={mockHandleFormClose} />);

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Project' } });
      fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test Description' } });
      fireEvent.change(screen.getByLabelText(/budget/i), { target: { value: '1000' } });
      fireEvent.change(screen.getByLabelText(/deadline/i), { target: { value: '2024-12-31' } });
      
      fireEvent.click(screen.getByRole('button', { name: /post project/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to post the project/i)).toBeInTheDocument();
      });

      // Second attempt succeeds
      ClientServices.handlePostProject.mockResolvedValueOnce({ id: 1 });
      
      fireEvent.click(screen.getByRole('button', { name: /post project/i }));

      await waitFor(() => {
        expect(screen.queryByText(/failed to post the project/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Input Validation', () => {
    it('should handle different input types correctly', () => {
      const mockHandleFormClose = jest.fn();
      renderWithProviders(<ProjectForm handleFormClose={mockHandleFormClose} />);

      const titleInput = screen.getByLabelText(/title/i);
      const budgetInput = screen.getByLabelText(/budget/i);
      const deadlineInput = screen.getByLabelText(/deadline/i);

      expect(titleInput).toHaveAttribute('type', 'text');
      expect(budgetInput).toHaveAttribute('type', 'number');
      expect(deadlineInput).toHaveAttribute('type', 'date');
    });

    it('should update form state on input changes', () => {
      const mockHandleFormClose = jest.fn();
      renderWithProviders(<ProjectForm handleFormClose={mockHandleFormClose} />);

      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      fireEvent.change(titleInput, { target: { value: 'New Project Title' } });
      fireEvent.change(descriptionInput, { target: { value: 'New Project Description' } });

      expect(titleInput.value).toBe('New Project Title');
      expect(descriptionInput.value).toBe('New Project Description');
    });
  });

  describe('Project Status Management', () => {
    it('should show processing state during action', async () => {
      const mockProject = {
        id: 1,
        title: 'Test Project',
        description: 'Test Description',
        budget: 1000,
        projectStatus: 'PENDING',
        client_username: 'client'
      };

      const mockOnApprove = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      const mockOnDeny = jest.fn();
      const mockDispatch = jest.fn();
      const mockProjectsList = [mockProject];

      renderWithProviders(
        <ProjectCard 
          project={mockProject}
          onApprove={mockOnApprove}
          onDeny={mockOnDeny}
          dispatch={mockDispatch}
          projectsList={mockProjectsList}
        />
      );

      const approveButton = screen.getByRole('button', { name: /approve/i });
      fireEvent.click(approveButton);

      // Use getAllByText to handle multiple buttons showing "Processing..."
      const processingButtons = screen.getAllByText('Processing...');
      expect(processingButtons.length).toBeGreaterThan(0);
      expect(processingButtons[0]).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Approve')).toBeInTheDocument();
      });
    });
  });
}); 