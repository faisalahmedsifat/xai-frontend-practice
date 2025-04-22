import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskFilter from '../../src/components/TaskFilter';
import { TaskFilter as TaskFilterType } from '../../src/types';

describe('TaskFilter Component', () => {
  const mockOnFilterChange = jest.fn();
  const mockCounts = {
    all: 5,
    active: 3,
    completed: 2
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render filter buttons for all filter types', () => {
    render(
      <TaskFilter 
        currentFilter="all" 
        onFilterChange={mockOnFilterChange} 
        counts={mockCounts} 
      />
    );
    
    // Should have 3 filter buttons
    const allButton = screen.getByRole('button', { name: /all/i });
    const activeButton = screen.getByRole('button', { name: /active/i });
    const completedButton = screen.getByRole('button', { name: /completed/i });
    
    expect(allButton).toBeInTheDocument();
    expect(activeButton).toBeInTheDocument();
    expect(completedButton).toBeInTheDocument();
  });
  
  it('should highlight the currently selected filter', () => {
    render(
      <TaskFilter 
        currentFilter="active" 
        onFilterChange={mockOnFilterChange} 
        counts={mockCounts} 
      />
    );
    
    // Active button should have a selected class or aria-current
    const activeButton = screen.getByRole('button', { name: /active/i });
    expect(activeButton).toHaveClass('selected');
    
    // Other buttons should not have selected class
    const allButton = screen.getByRole('button', { name: /all/i });
    const completedButton = screen.getByRole('button', { name: /completed/i });
    
    expect(allButton).not.toHaveClass('selected');
    expect(completedButton).not.toHaveClass('selected');
  });
  
  it('should call onFilterChange when a filter button is clicked', async () => {
    render(
      <TaskFilter 
        currentFilter="all" 
        onFilterChange={mockOnFilterChange} 
        counts={mockCounts} 
      />
    );
    
    // Click the active filter button
    const activeButton = screen.getByRole('button', { name: /active/i });
    await userEvent.click(activeButton);
    
    // onFilterChange should be called with "active"
    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledWith('active');
    
    // Click the completed filter button
    const completedButton = screen.getByRole('button', { name: /completed/i });
    await userEvent.click(completedButton);
    
    // onFilterChange should be called with "completed"
    expect(mockOnFilterChange).toHaveBeenCalledTimes(2);
    expect(mockOnFilterChange).toHaveBeenCalledWith('completed');
  });
  
  it('should display task counts for each filter', () => {
    render(
      <TaskFilter 
        currentFilter="all" 
        onFilterChange={mockOnFilterChange} 
        counts={mockCounts} 
      />
    );
    
    // Each button should display its count
    expect(screen.getByText(/all \(5\)/i)).toBeInTheDocument();
    expect(screen.getByText(/active \(3\)/i)).toBeInTheDocument();
    expect(screen.getByText(/completed \(2\)/i)).toBeInTheDocument();
  });
  
  it('should be accessible with proper ARIA attributes', () => {
    render(
      <TaskFilter 
        currentFilter="all" 
        onFilterChange={mockOnFilterChange} 
        counts={mockCounts} 
      />
    );
    
    // Container should be a navigation element with an accessible name
    const filterNav = screen.getByRole('navigation');
    expect(filterNav).toBeInTheDocument();
    expect(filterNav).toHaveAttribute('aria-label', 'Task filters');
    
    // Selected button should have aria-current="true"
    const allButton = screen.getByRole('button', { name: /all/i });
    expect(allButton).toHaveAttribute('aria-current', 'true');
    
    // Non-selected buttons should have aria-current="false"
    const activeButton = screen.getByRole('button', { name: /active/i });
    const completedButton = screen.getByRole('button', { name: /completed/i });
    
    expect(activeButton).toHaveAttribute('aria-current', 'false');
    expect(completedButton).toHaveAttribute('aria-current', 'false');
  });
  
  it('should handle changing props correctly', () => {
    const { rerender } = render(
      <TaskFilter 
        currentFilter="all" 
        onFilterChange={mockOnFilterChange} 
        counts={mockCounts} 
      />
    );
    
    // Initial state - "all" should be selected
    const allButton = screen.getByRole('button', { name: /all/i });
    expect(allButton).toHaveClass('selected');
    
    // Update props to change selected filter
    rerender(
      <TaskFilter 
        currentFilter="completed" 
        onFilterChange={mockOnFilterChange} 
        counts={mockCounts} 
      />
    );
    
    // Now "completed" should be selected
    const completedButton = screen.getByRole('button', { name: /completed/i });
    expect(completedButton).toHaveClass('selected');
    expect(allButton).not.toHaveClass('selected');
    
    // Update counts
    const newCounts = {
      all: 6,
      active: 3,
      completed: 3
    };
    
    rerender(
      <TaskFilter 
        currentFilter="completed" 
        onFilterChange={mockOnFilterChange} 
        counts={newCounts} 
      />
    );
    
    // Counts should be updated
    expect(screen.getByText(/all \(6\)/i)).toBeInTheDocument();
    expect(screen.getByText(/completed \(3\)/i)).toBeInTheDocument();
  });
  
  it('should have all filter types in the component defined by TypeScript', () => {
    // This is a type-level test to ensure we're using the correct TypeScript types
    
    // We expect these values to be valid TaskFilterType values
    const filterTypes: TaskFilterType[] = ['all', 'active', 'completed'];
    
    // This is a compile-time test - if TaskFilterType doesn't include these values,
    // TypeScript would show an error
    
    // This render serves to validate the type definitions at compile time
    render(
      <TaskFilter 
        currentFilter={filterTypes[0]} 
        onFilterChange={(filter: TaskFilterType) => {
          // Type checking for filter parameter
          const validFilter: TaskFilterType = filter;
        }} 
        counts={mockCounts} 
      />
    );
    
    // If no TypeScript error, this test passes
    expect(true).toBeTruthy();
  });
}); 