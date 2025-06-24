import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectCard from '../ProjectCard';

// Mock console.error
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
});

describe('ProjectCard', () => {
const mockProject = {
    id: 1,
    title: 'Test Project',
    description: 'This is a test project description',
    budget: 1000,
    client_username: 'testclient',
        projectStatus: 'PENDING'
};

    const mockOnApprove = jest.fn();
    const mockOnDeny = jest.fn();
const mockDispatch = jest.fn();
const mockProjectsList = [mockProject];

    const defaultProps = {
        project: mockProject,
        onApprove: mockOnApprove,
        onDeny: mockOnDeny,
        dispatch: mockDispatch,
        projectsList: mockProjectsList
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render project information correctly', () => {
        render(<ProjectCard {...defaultProps} />);

        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.getByText('This is a test project description')).toBeInTheDocument();
        expect(screen.getByText('$1000')).toBeInTheDocument();
        expect(screen.getByText('testclient')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument(); // ID
        expect(screen.getByText('PENDING')).toBeInTheDocument();
    });

    it('should show approve and deny buttons for pending projects', () => {
        render(<ProjectCard {...defaultProps} />);

        expect(screen.getByText('Approve')).toBeInTheDocument();
        expect(screen.getByText('Deny')).toBeInTheDocument();
    });

    it('should not show action buttons for non-pending projects', () => {
        const approvedProject = { ...mockProject, projectStatus: 'APPROVED' };
        const props = { ...defaultProps, project: approvedProject };

        render(<ProjectCard {...props} />);

        expect(screen.queryByText('Approve')).not.toBeInTheDocument();
        expect(screen.queryByText('Deny')).not.toBeInTheDocument();
    });

    it('should handle approve action', async () => {
        mockOnApprove.mockResolvedValue();

        render(<ProjectCard {...defaultProps} />);

        fireEvent.click(screen.getByText('Approve'));

        await waitFor(() => {
            expect(mockOnApprove).toHaveBeenCalledWith(1);
            expect(mockDispatch).toHaveBeenCalledWith({
                type: "SET_PROJECTS_LIST",
                payload: [{ ...mockProject, projectStatus: "APPROVED" }]
            });
        });
    });

    it('should handle deny action', async () => {
        mockOnDeny.mockResolvedValue();

        render(<ProjectCard {...defaultProps} />);

        fireEvent.click(screen.getByText('Deny'));

        await waitFor(() => {
            expect(mockOnDeny).toHaveBeenCalledWith(1);
            expect(mockDispatch).toHaveBeenCalledWith({
                type: "SET_PROJECTS_LIST",
                payload: [{ ...mockProject, projectStatus: "DENIED" }]
            });
        });
    });

    it('should show processing state during actions', async () => {
        mockOnApprove.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        render(<ProjectCard {...defaultProps} />);

        fireEvent.click(screen.getByText('Approve'));

        const processingButtons = screen.getAllByText('Processing...');
        expect(processingButtons).toHaveLength(2); // Both buttons show Processing...
        expect(processingButtons[0]).toBeDisabled();
        expect(processingButtons[1]).toBeDisabled();

        await waitFor(() => {
            expect(screen.getByText('Approve')).toBeInTheDocument();
        });
    });

    it('should handle approve action error', async () => {
        const error = new Error('Approval failed');
        mockOnApprove.mockRejectedValue(error);

        render(<ProjectCard {...defaultProps} />);

        fireEvent.click(screen.getByText('Approve'));

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('Project approve failed:', error);
        });
    });

    it('should handle deny action error', async () => {
        const error = new Error('Denial failed');
        mockOnDeny.mockRejectedValue(error);

        render(<ProjectCard {...defaultProps} />);

        fireEvent.click(screen.getByText('Deny'));

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('Project deny failed:', error);
        });
    });

    it('should apply correct CSS classes for status', () => {
        const { rerender } = render(<ProjectCard {...defaultProps} />);

        expect(screen.getByText('PENDING')).toHaveClass('status-badge', 'pending');

        const approvedProject = { ...mockProject, projectStatus: 'APPROVED' };
        rerender(<ProjectCard {...defaultProps} project={approvedProject} />);

        expect(screen.getByText('APPROVED')).toHaveClass('status-badge', 'approved');
    });

    it('should disable buttons during processing', async () => {
        mockOnApprove.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        render(<ProjectCard {...defaultProps} />);

        fireEvent.click(screen.getByText('Approve'));

        const processingButtons = screen.getAllByText('Processing...');
        expect(processingButtons).toHaveLength(2); // Both buttons show Processing...
        expect(processingButtons[0]).toBeDisabled();
        expect(processingButtons[1]).toBeDisabled();

        await waitFor(() => {
            expect(screen.getByText('Approve')).not.toBeDisabled();
        });
    });

    it('should handle multiple projects in list correctly', async () => {
        const secondProject = { ...mockProject, id: 2, title: 'Second Project' };
        const projectsList = [mockProject, secondProject];
        const props = { ...defaultProps, projectsList };

        mockOnApprove.mockResolvedValue();

        render(<ProjectCard {...props} />);

        fireEvent.click(screen.getByText('Approve'));

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith({
                type: "SET_PROJECTS_LIST",
                payload: [
                    { ...mockProject, projectStatus: "APPROVED" },
                    secondProject
                ]
            });
        });
    });

    it('should render all project details labels', () => {
        render(<ProjectCard {...defaultProps} />);

        expect(screen.getByText('ID:')).toBeInTheDocument();
        expect(screen.getByText('Description:')).toBeInTheDocument();
        expect(screen.getByText('Budget:')).toBeInTheDocument();
        expect(screen.getByText('Client:')).toBeInTheDocument();
    });
}); 
