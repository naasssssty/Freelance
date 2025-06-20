import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer Component', () => {
  it('should render footer component', () => {
    render(<Footer />);
    
    const footerElement = screen.getByRole('contentinfo') || screen.getByText(/freelancerproject/i);
    expect(footerElement).toBeInTheDocument();
  });

  it('should display copyright information', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    const copyrightText = screen.getByText(new RegExp(currentYear.toString())) || 
                         screen.getByText(/©|copyright/i);
    
    expect(copyrightText).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    expect(() => render(<Footer />)).not.toThrow();
  });

  it('should have proper semantic structure', () => {
    render(<Footer />);
    
    const footer = document.querySelector('footer') || 
                  screen.getByRole('contentinfo', { hidden: true }) ||
                  document.querySelector('[role="contentinfo"]');
    
    expect(footer || screen.getByText(/freelancerproject/i)).toBeInTheDocument();
  });

  it('should contain company/project name', () => {
    render(<Footer />);
    
    const projectName = screen.getByText(/freelancerproject/i) || 
                       screen.getByText(/freelancer/i);
    
    expect(projectName).toBeInTheDocument();
  });
}); 