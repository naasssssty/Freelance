import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectForm from '../ProjectForm';
import * as ClientServices from '../../services/ClientServices';

// Mock ClientServices
jest.mock('../../services/ClientServices');

// Mock window.alert
const originalAlert = window.alert;
beforeAll(() => {
    window.alert = jest.fn();
});

afterAll(() => {
    window.alert = originalAlert;
});

// Mock console.error
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
});

describe('ProjectForm', () => {
    const mockHandleFormClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render form with all fields', () => {
        render(<ProjectForm handleFormClose={mockHandleFormClose} />);

        expect(screen.getByText('New Project')).toBeInTheDocument();
        expect(screen.getByLabelText('Title:')).toBeInTheDocument();
        expect(screen.getByLabelText('Description:')).toBeInTheDocument();
        expect(screen.getByLabelText('Budget:')).toBeInTheDocument();
        expect(screen.getByLabelText('Deadline:')).toBeInTheDocument();
        expect(screen.getByText('Post Project')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should handle input changes', () => {
        render(<ProjectForm handleFormClose={mockHandleFormClose} />);

        const titleInput = screen.getByLabelText('Title:');
        const descriptionInput = screen.getByLabelText('Description:');
        const budgetInput = screen.getByLabelText('Budget:');
        const deadlineInput = screen.getByLabelText('Deadline:');

        fireEvent.change(titleInput, { target: { value: 'Test Project' } });
        fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
        fireEvent.change(budgetInput, { target: { value: '1000' } });
        fireEvent.change(deadlineInput, { target: { value: '2024-12-31' } });

        expect(titleInput.value).toBe('Test Project');
        expect(descriptionInput.value).toBe('Test Description');
        expect(budgetInput.value).toBe('1000');
        expect(deadlineInput.value).toBe('2024-12-31');
    });

    it('should handle successful form submission', async () => {
        ClientServices.handlePostProject.mockResolvedValue({ id: 1, title: 'Test Project' });

        render(<ProjectForm handleFormClose={mockHandleFormClose} />);

        // Fill out the form
        fireEvent.change(screen.getByLabelText('Title:'), { target: { value: 'Test Project' } });
        fireEvent.change(screen.getByLabelText('Description:'), { target: { value: 'Test Description' } });
        fireEvent.change(screen.getByLabelText('Budget:'), { target: { value: '1000' } });
        fireEvent.change(screen.getByLabelText('Deadline:'), { target: { value: '2024-12-31' } });

        // Submit the form
        fireEvent.click(screen.getByText('Post Project'));

        await waitFor(() => {
            expect(ClientServices.handlePostProject).toHaveBeenCalledWith({
                title: 'Test Project',
                description: 'Test Description',
                budget: '1000',
                deadline: '2024-12-31'
            });
            expect(window.alert).toHaveBeenCalledWith('Project posted successfully!');
            expect(mockHandleFormClose).toHaveBeenCalled();
        });
    });

    it('should handle form submission error', async () => {
        const error = new Error('Network error');
        ClientServices.handlePostProject.mockRejectedValue(error);

        render(<ProjectForm handleFormClose={mockHandleFormClose} />);

        // Fill out the form
        fireEvent.change(screen.getByLabelText('Title:'), { target: { value: 'Test Project' } });
        fireEvent.change(screen.getByLabelText('Description:'), { target: { value: 'Test Description' } });
        fireEvent.change(screen.getByLabelText('Budget:'), { target: { value: '1000' } });
        fireEvent.change(screen.getByLabelText('Deadline:'), { target: { value: '2024-12-31' } });

        // Submit the form
        fireEvent.click(screen.getByText('Post Project'));

        await waitFor(() => {
            expect(screen.getByText('Failed to post the project. Please try again.')).toBeInTheDocument();
            expect(console.error).toHaveBeenCalledWith('Error posting project:', error);
            expect(mockHandleFormClose).not.toHaveBeenCalled();
        });
    });

    it('should show loading state during submission', async () => {
        ClientServices.handlePostProject.mockImplementation(() => 
            new Promise(resolve => setTimeout(resolve, 100))
        );

        render(<ProjectForm handleFormClose={mockHandleFormClose} />);

        // Fill out the form
        fireEvent.change(screen.getByLabelText('Title:'), { target: { value: 'Test Project' } });
        fireEvent.change(screen.getByLabelText('Description:'), { target: { value: 'Test Description' } });
        fireEvent.change(screen.getByLabelText('Budget:'), { target: { value: '1000' } });
        fireEvent.change(screen.getByLabelText('Deadline:'), { target: { value: '2024-12-31' } });

        // Submit the form
        fireEvent.click(screen.getByText('Post Project'));

        expect(screen.getByText('Posting...')).toBeInTheDocument();
        expect(screen.getByText('Posting...')).toBeDisabled();

        await waitFor(() => {
            expect(screen.getByText('Post Project')).toBeInTheDocument();
        });
    });

    it('should handle cancel button click', () => {
        render(<ProjectForm handleFormClose={mockHandleFormClose} />);

        fireEvent.click(screen.getByText('Cancel'));

        expect(mockHandleFormClose).toHaveBeenCalled();
    });

    it('should have required attributes on form fields', () => {
        render(<ProjectForm handleFormClose={mockHandleFormClose} />);

        expect(screen.getByLabelText('Title:')).toHaveAttribute('required');
        expect(screen.getByLabelText('Description:')).toHaveAttribute('required');
        expect(screen.getByLabelText('Budget:')).toHaveAttribute('required');
        expect(screen.getByLabelText('Deadline:')).toHaveAttribute('required');
    });

    it('should have correct input types', () => {
        render(<ProjectForm handleFormClose={mockHandleFormClose} />);

        expect(screen.getByLabelText('Title:')).toHaveAttribute('type', 'text');
        expect(screen.getByLabelText('Budget:')).toHaveAttribute('type', 'number');
        expect(screen.getByLabelText('Deadline:')).toHaveAttribute('type', 'date');
    });

    it('should have correct placeholders', () => {
        render(<ProjectForm handleFormClose={mockHandleFormClose} />);

        expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
    });

    it('should clear error message when form is resubmitted', async () => {
        // First submission fails
        ClientServices.handlePostProject.mockRejectedValueOnce(new Error('Network error'));
        
        render(<ProjectForm handleFormClose={mockHandleFormClose} />);

        // Fill and submit form
        fireEvent.change(screen.getByLabelText('Title:'), { target: { value: 'Test Project' } });
        fireEvent.change(screen.getByLabelText('Description:'), { target: { value: 'Test Description' } });
        fireEvent.change(screen.getByLabelText('Budget:'), { target: { value: '1000' } });
        fireEvent.change(screen.getByLabelText('Deadline:'), { target: { value: '2024-12-31' } });
        
        fireEvent.click(screen.getByText('Post Project'));

        await waitFor(() => {
            expect(screen.getByText('Failed to post the project. Please try again.')).toBeInTheDocument();
        });

        // Second submission succeeds
        ClientServices.handlePostProject.mockResolvedValueOnce({ id: 1 });
        
        fireEvent.click(screen.getByText('Post Project'));

        await waitFor(() => {
            expect(screen.queryByText('Failed to post the project. Please try again.')).not.toBeInTheDocument();
        });
    });
});
