import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Task from '@/components/level3/Task';
import { Task as TaskType } from '@/types';

describe('Task Component', () => {
  const mockTask: TaskType = {
    id: '1',
    title: 'Learn React',
    completed: false,
    createdAt: new Date('2023-01-01')
  };
  
  const mockOnDelete = jest.fn();
  const mockOnToggleComplete = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render a task with correct details', () => {
    render(
      <Task 
        task={mockTask} 
        onDelete={mockOnDelete} 
        onToggleComplete={mockOnToggleComplete} 
      />
    );
    
    // Task title should be displayed
    expect(screen.getByText('Learn React')).toBeInTheDocument();
    
    // Created date should be formatted correctly
    expect(screen.getByText(/jan 1, 2023/i)).toBeInTheDocument();
    
    // Checkbox should be unchecked initially
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    
    // Delete button should be present
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
  });
  
  it('should show a checked checkbox for completed tasks', () => {
    const completedTask: TaskType = {
      ...mockTask,
      completed: true
    };
    
    render(
      <Task 
        task={completedTask} 
        onDelete={mockOnDelete} 
        onToggleComplete={mockOnToggleComplete} 
      />
    );
    
    // Checkbox should be checked
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
    
    // Task should have the completed class
    const taskElement = screen.getByText('Learn React').closest('li');
    expect(taskElement).toHaveClass('completed');
  });
  
  it('should call onToggleComplete when checkbox is clicked', async () => {
    render(
      <Task 
        task={mockTask} 
        onDelete={mockOnDelete} 
        onToggleComplete={mockOnToggleComplete} 
      />
    );
    
    // Click the checkbox
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);
    
    // onToggleComplete should be called with the task ID
    expect(mockOnToggleComplete).toHaveBeenCalledTimes(1);
    expect(mockOnToggleComplete).toHaveBeenCalledWith('1');
  });
  
  it('should call onDelete when delete button is clicked', async () => {
    render(
      <Task 
        task={mockTask} 
        onDelete={mockOnDelete} 
        onToggleComplete={mockOnToggleComplete} 
      />
    );
    
    // Click the delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    // onDelete should be called with the task ID
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });
  
  it('should have appropriate ARIA attributes', () => {
    render(
      <Task 
        task={mockTask} 
        onDelete={mockOnDelete} 
        onToggleComplete={mockOnToggleComplete} 
      />
    );
    
    // Task should have correct role
    const taskElement = screen.getByText('Learn React').closest('li');
    expect(taskElement).toHaveAttribute('role', 'listitem');
    
    // Checkbox should have proper aria-label
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Mark task as complete');
    
    // Delete button should have proper aria-label
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toHaveAttribute('aria-label', 'Delete task');
  });
  
  it('should apply visual styling based on completion status', () => {
    render(
      <Task 
        task={mockTask} 
        onDelete={mockOnDelete} 
        onToggleComplete={mockOnToggleComplete} 
      />
    );
    
    // Task should not have the completed class initially
    const taskElement = screen.getByText('Learn React').closest('li');
    expect(taskElement).not.toHaveClass('completed');
    
    // Toggle the task to completed
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Task should now have the completed class
    expect(mockOnToggleComplete).toHaveBeenCalledWith('1');
  });
}); 