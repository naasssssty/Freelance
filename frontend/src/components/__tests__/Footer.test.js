import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
    it('should render footer with copyright text', () => {
        render(<Footer />);
        
        expect(screen.getByText('© 2025 Freelance Platform')).toBeInTheDocument();
    });

    it('should render all footer links', () => {
        render(<Footer />);
        
        expect(screen.getByText('Terms')).toBeInTheDocument();
        expect(screen.getByText('Privacy')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('should have correct href attributes for links', () => {
        render(<Footer />);
        
        expect(screen.getByText('Terms')).toHaveAttribute('href', '#terms');
        expect(screen.getByText('Privacy')).toHaveAttribute('href', '#privacy');
        expect(screen.getByText('Contact')).toHaveAttribute('href', '#contact');
    });

    it('should have proper CSS classes', () => {
        const { container } = render(<Footer />);
        
        expect(container.querySelector('.footer-content')).toBeInTheDocument();
        expect(container.querySelector('.footer-links')).toBeInTheDocument();
    });

    it('should render as a static component without errors', () => {
        const { container } = render(<Footer />);
        
        expect(container.firstChild).toHaveClass('footer-content');
    });
});
