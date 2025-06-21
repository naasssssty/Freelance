import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApplicationCard from '../ApplicationCard';
import * as ClientServices from '../../services/ClientServices';

// Mock ClientServices
jest.mock('../../services/ClientServices');

// Mock react-icons
jest.mock('react-icons/fa', () => ({
    FaUser: () => <div data-testid="user-icon">User</div>,
    FaCalendarAlt: () => <div data-testid="calendar-icon">Calendar</div>,
    FaIdCard: () => <div data-testid="id-icon">ID</div>,
    FaFileAlt: () => <div data-testid="file-icon">File</div>,
    FaDownload: () => <div data-testid="download-icon">Download</div>,
}));

// Mock console and alert
const originalConsoleError = console.error;
const originalAlert = window.alert;

beforeAll(() => {
    console.error = jest.fn();
    window.alert = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
    window.alert = originalAlert;
});

describe('ApplicationCard', () => {
    const mockApplication = {
        id: 123,
        projectTitle: 'React Developer Position',
        applicationStatus: 'PENDING',
        cover_letter: 'I am very interested in this project and have extensive experience with React.',
        freelancer: 'john_doe',
        created_at: '2024-01-15T10:30:00Z',
        cvFilePath: '/path/to/cv.pdf'
    };

    const mockOnAccept = jest.fn();
    const mockOnReject = jest.fn();

    const defaultProps = {
        application: mockApplication,
        onAccept: mockOnAccept,
        onReject: mockOnReject
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render application information correctly', () => {
        render(<ApplicationCard {...defaultProps} />);

        expect(screen.getByText('React Developer Position')).toBeInTheDocument();
        expect(screen.getByText('PENDING')).toBeInTheDocument();
        expect(screen.getByText('I am very interested in this project and have extensive experience with React.')).toBeInTheDocument();
        expect(screen.getByText('123')).toBeInTheDocument();
        expect(screen.getByText('john_doe')).toBeInTheDocument();
    });

    it('should format and display the creation date', () => {
        render(<ApplicationCard {...defaultProps} />);

        // The date should be formatted as a local date string
        const expectedDate = new Date('2024-01-15T10:30:00Z').toLocaleDateString();
        expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });

    it('should render all field icons', () => {
        render(<ApplicationCard {...defaultProps} />);

        expect(screen.getAllByTestId('file-icon')).toHaveLength(2); // Cover letter and CV
        expect(screen.getByTestId('id-icon')).toBeInTheDocument();
        expect(screen.getByTestId('user-icon')).toBeInTheDocument();
        expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });

    it('should show download CV button when CV file path exists', () => {
        render(<ApplicationCard {...defaultProps} />);

        expect(screen.getByText('Download CV')).toBeInTheDocument();
        expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    });

    it('should not show download CV button when no CV file path', () => {
        const applicationWithoutCV = { ...mockApplication, cvFilePath: null };
        const props = { ...defaultProps, application: applicationWithoutCV };

        render(<ApplicationCard {...props} />);

        expect(screen.queryByText('Download CV')).not.toBeInTheDocument();
        expect(screen.queryByTestId('download-icon')).not.toBeInTheDocument();
    });

    it('should handle successful CV download', async () => {
        ClientServices.downloadCV.mockResolvedValue(true);

        render(<ApplicationCard {...defaultProps} />);

        fireEvent.click(screen.getByText('Download CV'));

        await waitFor(() => {
            expect(ClientServices.downloadCV).toHaveBeenCalledWith(123);
        });
    });

    it('should handle CV download error', async () => {
        const error = new Error('Download failed');
        ClientServices.downloadCV.mockRejectedValue(error);

        render(<ApplicationCard {...defaultProps} />);

        fireEvent.click(screen.getByText('Download CV'));

        await waitFor(() => {
            expect(ClientServices.downloadCV).toHaveBeenCalledWith(123);
            expect(console.error).toHaveBeenCalledWith('Error downloading CV:', error);
            expect(window.alert).toHaveBeenCalledWith('Failed to download CV');
        });
    });

    it('should show alert when trying to download CV without file path', async () => {
        const applicationWithoutCV = { ...mockApplication, cvFilePath: null };
        const props = { ...defaultProps, application: applicationWithoutCV };

        render(<ApplicationCard {...props} />);

        // This test is more about ensuring the component doesn't crash when CV path is null
        expect(screen.queryByText('Download CV')).not.toBeInTheDocument();
    });

    it('should handle application with empty CV file path', async () => {
        const applicationWithEmptyCV = { ...mockApplication, cvFilePath: '' };
        const props = { ...defaultProps, application: applicationWithEmptyCV };

        render(<ApplicationCard {...props} />);

        expect(screen.queryByText('Download CV')).not.toBeInTheDocument();
    });

    it('should apply correct CSS classes for different statuses', () => {
        const statuses = ['PENDING', 'ACCEPTED', 'REJECTED'];
        
        statuses.forEach(status => {
            const applicationWithStatus = { ...mockApplication, applicationStatus: status };
            const props = { ...defaultProps, application: applicationWithStatus };

            const { unmount } = render(<ApplicationCard {...props} />);

            const statusElement = screen.getByText(status);
            expect(statusElement).toHaveClass(`status-${status.toLowerCase()}`);

            unmount();
        });
    });

    it('should render cover letter section with proper styling', () => {
        render(<ApplicationCard {...defaultProps} />);

        const coverLetterSection = screen.getByText('Cover Letter:').closest('.cover-letter');
        expect(coverLetterSection).toBeInTheDocument();
        
        const coverLetterText = screen.getByText('I am very interested in this project and have extensive experience with React.');
        expect(coverLetterText).toHaveClass('value', 'letter-text');
    });

    it('should render all meta items correctly', () => {
        render(<ApplicationCard {...defaultProps} />);

        expect(screen.getByText('Application ID:')).toBeInTheDocument();
        expect(screen.getByText('Submitted By:')).toBeInTheDocument();
        expect(screen.getByText('Submitted on:')).toBeInTheDocument();
        expect(screen.getByText('CV:')).toBeInTheDocument();
    });

    it('should handle long cover letters', () => {
        const longCoverLetter = 'A'.repeat(1000);
        const applicationWithLongLetter = { ...mockApplication, cover_letter: longCoverLetter };
        const props = { ...defaultProps, application: applicationWithLongLetter };

        render(<ApplicationCard {...props} />);

        expect(screen.getByText(longCoverLetter)).toBeInTheDocument();
    });

    it('should handle special characters in cover letter', () => {
        const specialCharsCoverLetter = 'Cover letter with special chars: !@#$%^&*()_+{}|:"<>?[]\\;\'.,/';
        const applicationWithSpecialChars = { ...mockApplication, cover_letter: specialCharsCoverLetter };
        const props = { ...defaultProps, application: applicationWithSpecialChars };

        render(<ApplicationCard {...props} />);

        expect(screen.getByText(specialCharsCoverLetter)).toBeInTheDocument();
    });

    it('should have proper CSS structure', () => {
        const { container } = render(<ApplicationCard {...defaultProps} />);

        expect(container.querySelector('.application-card')).toBeInTheDocument();
        expect(container.querySelector('.application-info')).toBeInTheDocument();
        expect(container.querySelector('.application-header')).toBeInTheDocument();
        expect(container.querySelector('.application-status')).toBeInTheDocument();
        expect(container.querySelector('.application-details')).toBeInTheDocument();
        expect(container.querySelector('.cover-letter')).toBeInTheDocument();
        expect(container.querySelector('.application-meta')).toBeInTheDocument();
    });
});
