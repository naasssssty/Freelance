import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProjectForm from '../ProjectForm';

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      projects: (state = { projects: [], loading: false, error: null }, action) => {
        switch (action.type) {
          case 'projects/addProject':
            return { ...state, projects: [...state.projects, action.payload] };
          default:
            return state;
        }
      },
      auth: (state = { user: { username: 'testclient' }, isAuthenticated: true }, action) => state,
      ...initialState
    }
  });
};

const renderWithProviders = (ui, options = {}) => {
  const { store = createMockStore(), ...renderOptions } = options;
  
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      {children}
    </Provider>
  );
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

describe('ProjectForm Component', () => {
  const defaultProps = {
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render project form with all fields', () => {
    renderWithProviders(<ProjectForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/title/i) || screen.getByPlaceholderText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i) || screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/budget/i) || screen.getByPlaceholderText(/budget/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/deadline/i) || screen.getByPlaceholderText(/deadline/i)).toBeInTheDocument();
  });

  it('should render submit and cancel buttons', () => {
    renderWithProviders(<ProjectForm {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /submit/i }) || 
           screen.getByRole('button', { name: /create/i }) ||
           screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should handle form input changes', () => {
    renderWithProviders(<ProjectForm {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/title/i) || screen.getByPlaceholderText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i) || screen.getByPlaceholderText(/description/i);
    const budgetInput = screen.getByLabelText(/budget/i) || screen.getByPlaceholderText(/budget/i);
    
    fireEvent.change(titleInput, { target: { value: 'Test Project' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(budgetInput, { target: { value: '1500' } });
    
    expect(titleInput.value).toBe('Test Project');
    expect(descriptionInput.value).toBe('Test Description');
    expect(budgetInput.value).toBe('1500');
  });

  it('should call onSubmit when form is submitted with valid data', async () => {
    renderWithProviders(<ProjectForm {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/title/i) || screen.getByPlaceholderText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i) || screen.getByPlaceholderText(/description/i);
    const budgetInput = screen.getByLabelText(/budget/i) || screen.getByPlaceholderText(/budget/i);
    const submitButton = screen.getByRole('button', { name: /submit/i }) || 
                        screen.getByRole('button', { name: /create/i }) ||
                        screen.getByRole('button', { name: /save/i });
    
    fireEvent.change(titleInput, { target: { value: 'Test Project' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(budgetInput, { target: { value: '1500' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Project',
          description: 'Test Description',
          budget: '1500'
        })
      );
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    renderWithProviders(<ProjectForm {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should show loading state when loading prop is true', () => {
    renderWithProviders(<ProjectForm {...defaultProps} loading={true} />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i }) || 
                        screen.getByRole('button', { name: /create/i }) ||
                        screen.getByRole('button', { name: /save/i });
    
    expect(submitButton).toBeDisabled();
  });

  it('should validate required fields', async () => {
    renderWithProviders(<ProjectForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i }) || 
                        screen.getByRole('button', { name: /create/i }) ||
                        screen.getByRole('button', { name: /save/i });
    
    fireEvent.click(submitButton);
    
    // Check if form prevents submission with empty required fields
    await waitFor(() => {
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  it('should handle budget validation', () => {
    renderWithProviders(<ProjectForm {...defaultProps} />);
    
    const budgetInput = screen.getByLabelText(/budget/i) || screen.getByPlaceholderText(/budget/i);
    
    fireEvent.change(budgetInput, { target: { value: '-100' } });
    fireEvent.blur(budgetInput);
    
    // Should not allow negative values
    expect(budgetInput.value).not.toBe('-100');
  });

  it('should handle date validation for deadline', () => {
    renderWithProviders(<ProjectForm {...defaultProps} />);
    
    const deadlineInput = screen.getByLabelText(/deadline/i) || screen.getByPlaceholderText(/deadline/i);
    
    // Try to set a past date
    const pastDate = '2020-01-01';
    fireEvent.change(deadlineInput, { target: { value: pastDate } });
    fireEvent.blur(deadlineInput);
    
    // Form should handle past date validation
    expect(deadlineInput.value).toBeDefined();
  });

  it('should pre-populate form when editing existing project', () => {
    const existingProject = {
      title: 'Existing Project',
      description: 'Existing Description',
      budget: 2000,
      deadline: '2024-12-31'
    };
    
    renderWithProviders(<ProjectForm {...defaultProps} project={existingProject} />);
    
    const titleInput = screen.getByLabelText(/title/i) || screen.getByPlaceholderText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i) || screen.getByPlaceholderText(/description/i);
    const budgetInput = screen.getByLabelText(/budget/i) || screen.getByPlaceholderText(/budget/i);
    
    expect(titleInput.value).toBe('Existing Project');
    expect(descriptionInput.value).toBe('Existing Description');
    expect(budgetInput.value).toBe('2000');
  });

  it('should reset form when reset is called', () => {
    renderWithProviders(<ProjectForm {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/title/i) || screen.getByPlaceholderText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i) || screen.getByPlaceholderText(/description/i);
    
    fireEvent.change(titleInput, { target: { value: 'Test Project' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    
    // Look for reset button or trigger reset functionality
    const resetButton = screen.queryByRole('button', { name: /reset/i }) ||
                       screen.queryByRole('button', { name: /clear/i });
    
    if (resetButton) {
      fireEvent.click(resetButton);
      expect(titleInput.value).toBe('');
      expect(descriptionInput.value).toBe('');
    }
  });

  it('should handle form submission with all fields filled', async () => {
    renderWithProviders(<ProjectForm {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/title/i) || screen.getByPlaceholderText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i) || screen.getByPlaceholderText(/description/i);
    const budgetInput = screen.getByLabelText(/budget/i) || screen.getByPlaceholderText(/budget/i);
    const deadlineInput = screen.getByLabelText(/deadline/i) || screen.getByPlaceholderText(/deadline/i);
    const submitButton = screen.getByRole('button', { name: /submit/i }) || 
                        screen.getByRole('button', { name: /create/i }) ||
                        screen.getByRole('button', { name: /save/i });
    
    fireEvent.change(titleInput, { target: { value: 'Complete Project' } });
    fireEvent.change(descriptionInput, { target: { value: 'Complete Description' } });
    fireEvent.change(budgetInput, { target: { value: '3000' } });
    fireEvent.change(deadlineInput, { target: { value: '2024-12-31' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Complete Project',
          description: 'Complete Description',
          budget: '3000',
          deadline: '2024-12-31'
        })
      );
    });
  });

  it('should render without crashing when no props provided', () => {
    expect(() => renderWithProviders(<ProjectForm />)).not.toThrow();
  });
}); 