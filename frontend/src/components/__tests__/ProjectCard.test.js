import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectCard from '../ProjectCard';

const mockProject = {
    id: 1,
    title: 'Test Project',
    description: 'This is a test project description',
    budget: 1000,
    deadline: '2024-12-31',
    client_username: 'testclient',
    projectStatus: 'PENDING',
    posted_at: '2024-01-01'
};

const mockDispatch = jest.fn();
const mockProjectsList = [mockProject];

describe('ProjectCard Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render project information correctly', () => {
        render(
            <ProjectCard
                project={mockProject}
                onApprove={jest.fn()}
                onDeny={jest.fn()}
                dispatch={mockDispatch}
                projectsList={mockProjectsList}
            />
        );

        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.getByText('This is a test project description')).toBeInTheDocument();
        expect(screen.getByText('testclient')).toBeInTheDocument();
        expect(screen.getByText('$1000')).toBeInTheDocument();
        expect(screen.getByText('2024-12-31')).toBeInTheDocument();
    });

    it('should display correct status badge', () => {
        render(
            <ProjectCard
                project={mockProject}
                onApprove={jest.fn()}
                onDeny={jest.fn()}
                dispatch={mockDispatch}
                projectsList={mockProjectsList}
            />
        );

        expect(screen.getByText('PENDING')).toBeInTheDocument();
        expect(screen.getByText('PENDING')).toHaveClass('status-pending');
    });

    it('should render approve and deny buttons for pending projects', () => {
        render(
            <ProjectCard
                project={mockProject}
                onApprove={jest.fn()}
                onDeny={jest.fn()}
                dispatch={mockDispatch}
                projectsList={mockProjectsList}
            />
        );

        expect(screen.getByText('Approve')).toBeInTheDocument();
        expect(screen.getByText('Deny')).toBeInTheDocument();
    });

    it('should call onApprove when approve button is clicked', async () => {
        const mockOnApprove = jest.fn();
        render(
            <ProjectCard
                project={mockProject}
                onApprove={mockOnApprove}
                onDeny={jest.fn()}
                dispatch={mockDispatch}
                projectsList={mockProjectsList}
            />
        );

        const approveButton = screen.getByText('Approve');
        fireEvent.click(approveButton);

        expect(mockOnApprove).toHaveBeenCalledWith(mockProject.id);
    });

    it('should call onDeny when deny button is clicked', async () => {
        const mockOnDeny = jest.fn();
        render(
            <ProjectCard
                project={mockProject}
                onApprove={jest.fn()}
                onDeny={mockOnDeny}
                dispatch={mockDispatch}
                projectsList={mockProjectsList}
            />
        );

        const denyButton = screen.getByText('Deny');
        fireEvent.click(denyButton);

        expect(mockOnDeny).toHaveBeenCalledWith(mockProject.id);
    });

    it('should not render action buttons for approved projects', () => {
        const approvedProject = { ...mockProject, projectStatus: 'APPROVED' };
        
        render(
            <ProjectCard
                project={approvedProject}
                onApprove={jest.fn()}
                onDeny={jest.fn()}
                dispatch={mockDispatch}
                projectsList={mockProjectsList}
            />
        );

        expect(screen.queryByText('Approve')).not.toBeInTheDocument();
        expect(screen.queryByText('Deny')).not.toBeInTheDocument();
    });

    it('should not render action buttons for denied projects', () => {
        const deniedProject = { ...mockProject, projectStatus: 'DENIED' };
        
        render(
            <ProjectCard
                project={deniedProject}
                onApprove={jest.fn()}
                onDeny={jest.fn()}
                dispatch={mockDispatch}
                projectsList={mockProjectsList}
            />
        );

        expect(screen.queryByText('Approve')).not.toBeInTheDocument();
        expect(screen.queryByText('Deny')).not.toBeInTheDocument();
    });

    it('should handle missing budget gracefully', () => {
        const projectWithoutBudget = { ...mockProject, budget: null };
        
        render(
            <ProjectCard
                project={projectWithoutBudget}
                onApprove={jest.fn()}
                onDeny={jest.fn()}
                dispatch={mockDispatch}
                projectsList={mockProjectsList}
            />
        );

        expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should handle missing deadline gracefully', () => {
        const projectWithoutDeadline = { ...mockProject, deadline: null };
        
        render(
            <ProjectCard
                project={projectWithoutDeadline}
                onApprove={jest.fn()}
                onDeny={jest.fn()}
                dispatch={mockDispatch}
                projectsList={mockProjectsList}
            />
        );

        expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
}); 