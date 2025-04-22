import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToggleButton from '../../src/components/ToggleButton';

describe('ToggleButton Component', () => {
  it('should render the button with the correct text hidden initially', () => {
    render(<ToggleButton text="Hello World" />);
    
    // Button should exist
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    
    // Text should be initially hidden
    expect(screen.queryByText('Hello World')).not.toBeInTheDocument();
  });
  
  it('should show text when button is clicked', async () => {
    render(<ToggleButton text="Hello World" />);
    
    // Initial state - text hidden
    expect(screen.queryByText('Hello World')).not.toBeInTheDocument();
    
    // Click the button
    const toggleButton = screen.getByRole('button');
    await userEvent.click(toggleButton);
    
    // Text should now be visible
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
  
  it('should hide text when button is clicked again', async () => {
    render(<ToggleButton text="Hello World" />);
    
    // Click to show
    const toggleButton = screen.getByRole('button');
    await userEvent.click(toggleButton);
    
    // Text should be visible
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    
    // Click again to hide
    await userEvent.click(toggleButton);
    
    // Text should be hidden again
    expect(screen.queryByText('Hello World')).not.toBeInTheDocument();
  });
  
  it('should apply custom className when provided', () => {
    render(<ToggleButton text="Hello World" className="custom-button" />);
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveClass('custom-button');
  });
  
  it('should show text initially when initialVisible is true', () => {
    render(<ToggleButton text="Hello World" initialVisible={true} />);
    
    // Text should be initially visible
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
  
  it('should call onToggle callback when toggle state changes', async () => {
    const mockOnToggle = jest.fn();
    render(<ToggleButton text="Hello World" onToggle={mockOnToggle} />);
    
    // Click the button
    const toggleButton = screen.getByRole('button');
    await userEvent.click(toggleButton);
    
    // onToggle should have been called with true
    expect(mockOnToggle).toHaveBeenCalledWith(true);
    
    // Click again
    await userEvent.click(toggleButton);
    
    // onToggle should have been called with false
    expect(mockOnToggle).toHaveBeenCalledWith(false);
    expect(mockOnToggle).toHaveBeenCalledTimes(2);
  });

  it('should toggle when pressing space or enter keys', async () => {
    render(<ToggleButton text="Hello World" />);
    
    const toggleButton = screen.getByRole('button');
    
    // Focus on the button
    toggleButton.focus();
    
    // Press Enter key
    fireEvent.keyDown(toggleButton, { key: 'Enter', code: 'Enter' });
    
    // Text should be visible
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    
    // Press Space key
    fireEvent.keyDown(toggleButton, { key: ' ', code: 'Space' });
    
    // Text should be hidden again
    expect(screen.queryByText('Hello World')).not.toBeInTheDocument();
  });
  
  it('should have appropriate ARIA attributes', () => {
    render(<ToggleButton text="Hello World" />);
    
    const toggleButton = screen.getByRole('button');
    
    // Button should have aria-expanded attribute
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    
    // Click the button
    fireEvent.click(toggleButton);
    
    // aria-expanded should now be true
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  });
}); 