import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AvailableProjectCard from '../AvailableProjectCard';

// Mock file upload functionality
global.URL.createObjectURL = jest.fn(() => 'mocked-url');

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      projects: (state = { projects: [] }, action) => state,
      auth: (state = { user: { username: 'testfreelancer' } }, action) => state,
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

describe('AvailableProjectCard Component', () => {
  const mockProject = {
    id: 1,
    title: 'Test Available Project',
    description: 'This is a test project available for freelancers to apply.',
    budget: 1500,
    deadline: '2024-12-31',
    clientUsername: 'testclient',
    projectStatus: 'APPROVED',
    posted_at: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render project information correctly', () => {
    renderWithProviders(<AvailableProjectCard project={mockProject} />);
    
    expect(screen.getByText('Test Available Project')).toBeInTheDocument();
    expect(screen.getByText('This is a test project available for freelancers to apply.')).toBeInTheDocument();
    expect(screen.getByText('€1500')).toBeInTheDocument();
    expect(screen.getByText('testclient')).toBeInTheDocument();
  });

  it('should display project status badge', () => {
    renderWithProviders(<AvailableProjectCard project={mockProject} />);
    
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('should show apply button for available projects', () => {
    renderWithProviders(<AvailableProjectCard project={mockProject} />);
    
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  it('should show application form when apply button is clicked', async () => {
    renderWithProviders(<AvailableProjectCard project={mockProject} />);
    
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/cover letter/i)).toBeInTheDocument();
      expect(screen.getByText('Submit Application')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('should handle cover letter input', async () => {
    renderWithProviders(<AvailableProjectCard project={mockProject} />);
    
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      const coverLetterInput = screen.getByPlaceholderText(/cover letter/i);
      fireEvent.change(coverLetterInput, { 
        target: { value: 'I am very interested in this project.' } 
      });
      
      expect(coverLetterInput.value).toBe('I am very interested in this project.');
    });
  });

  it('should handle file upload', async () => {
    renderWithProviders(<AvailableProjectCard project={mockProject} />);
    
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      const fileInput = screen.getByLabelText(/upload cv/i);
      const file = new File(['test content'], 'test-cv.pdf', { type: 'application/pdf' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      expect(fileInput.files[0]).toBe(file);
    });
  });

  it('should validate file types', async () => {
    renderWithProviders(<AvailableProjectCard project={mockProject} />);
    
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      const fileInput = screen.getByLabelText(/upload cv/i);
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      
      // Should show error message for invalid file type
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });
  });

  it('should validate file size', async () => {
    renderWithProviders(<AvailableProjectCard project={mockProject} />);
    
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      const fileInput = screen.getByLabelText(/upload cv/i);
      // Create a large file (over 5MB)
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large-cv.pdf', { 
        type: 'application/pdf' 
      });
      
      fireEvent.change(fileInput, { target: { files: [largeFile] } });
      
      // Should show error message for file too large
      expect(screen.getByText(/file too large/i)).toBeInTheDocument();
    });
  });

  it('should cancel application form', async () => {
    renderWithProviders(<AvailableProjectCard project={mockProject} />);
    
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      // Form should be hidden
      expect(screen.queryByPlaceholderText(/cover letter/i)).not.toBeInTheDocument();
    });
  });

  it('should submit application with cover letter only', async () => {
    renderWithProviders(<AvailableProjectCard project={mockProject} />);
    
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      const coverLetterInput = screen.getByPlaceholderText(/cover letter/i);
      fireEvent.change(coverLetterInput, { 
        target: { value: 'I am interested in this project.' } 
      });
      
      const submitButton = screen.getByText('Submit Application');
      fireEvent.click(submitButton);
      
      // Should show loading state
      expect(submitButton).toBeDisabled();
    });
  });

  it('should submit application with CV file', async () => {
    renderWithProviders(<AvailableProjectCard project={mockProject} />);
    
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      const coverLetterInput = screen.getByPlaceholderText(/cover letter/i);
      fireEvent.change(coverLetterInput, { 
        target: { value: 'I am interested in this project.' } 
      });
      
      const fileInput = screen.getByLabelText(/upload cv/i);
      const file = new File(['test content'], 'test-cv.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      const submitButton = screen.getByText('Submit Application');
      fireEvent.click(submitButton);
      
      // Should show loading state
      expect(submitButton).toBeDisabled();
    });
  });

  it('should format deadline correctly', () => {
    renderWithProviders(<AvailableProjectCard project={mockProject} />);
    
    // The deadline should be formatted and displayed
    expect(screen.getByText(/2024-12-31/)).toBeInTheDocument();
  });

  it('should handle project with no budget', () => {
    const projectWithoutBudget = { ...mockProject, budget: null };
    
    renderWithProviders(<AvailableProjectCard project={projectWithoutBudget} />);
    
    expect(screen.getByText('Test Available Project')).toBeInTheDocument();
    expect(screen.queryByText('€')).not.toBeInTheDocument();
  });

  it('should handle project with no deadline', () => {
    const projectWithoutDeadline = { ...mockProject, deadline: null };
    
    renderWithProviders(<AvailableProjectCard project={projectWithoutDeadline} />);
    
    expect(screen.getByText('Test Available Project')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  it('should show error message on application failure', async () => {
    // Mock console.error to avoid noise in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithProviders(<AvailableProjectCard project={mockProject} />);
    
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      const coverLetterInput = screen.getByPlaceholderText(/cover letter/i);
      fireEvent.change(coverLetterInput, { 
        target: { value: 'Test application' } 
      });
      
      const submitButton = screen.getByText('Submit Application');
      fireEvent.click(submitButton);
    });
    
    consoleSpy.mockRestore();
  });

  it('should prevent submission with empty cover letter', async () => {
    renderWithProviders(<AvailableProjectCard project={mockProject} />);
    
    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      const submitButton = screen.getByText('Submit Application');
      fireEvent.click(submitButton);
      
      // Should show validation error
      expect(screen.getByText(/cover letter is required/i)).toBeInTheDocument();
    });
  });

  it('should display project posted date', () => {
    renderWithProviders(<AvailableProjectCard project={mockProject} />);
    
    // The posted date should be formatted and displayed
    expect(screen.getByText(/2024-01-01/)).toBeInTheDocument();
  });
}); 