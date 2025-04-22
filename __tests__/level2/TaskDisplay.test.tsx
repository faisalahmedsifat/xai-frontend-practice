import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskDisplay from '../../src/components/TaskDisplay';
import { Task } from '../../src/types';

describe('TaskDisplay Component', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Learn React',
      completed: false,
      createdAt: new Date('2023-01-01')
    },
    {
      id: '2',
      title: 'Build a task app',
      completed: true,
      createdAt: new Date('2023-01-02')
    },
    {
      id: '3',
      title: 'Write tests',
      completed: false,
      createdAt: new Date('2023-01-03')
    }
  ];
  
  it('should render a list of tasks', () => {
    render(<TaskDisplay tasks={mockTasks} />);
    
    // The component should render all tasks
    expect(screen.getByText('Learn React')).toBeInTheDocument();
    expect(screen.getByText('Build a task app')).toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });
  
  it('should display empty state when no tasks are provided', () => {
    render(<TaskDisplay tasks={[]} />);
    
    // Should show empty state message
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });
  
  it('should visually distinguish completed tasks', () => {
    render(<TaskDisplay tasks={mockTasks} />);
    
    // Completed task should have a specific class or styling
    const completedTaskElement = screen.getByText('Build a task app').closest('li');
    expect(completedTaskElement).toHaveClass('completed');
    
    // Incomplete tasks should not have the completed class
    const incompleteTaskElement = screen.getByText('Learn React').closest('li');
    expect(incompleteTaskElement).not.toHaveClass('completed');
  });
  
  it('should format task creation dates correctly', () => {
    render(<TaskDisplay tasks={mockTasks} />);
    
    // Check for date formatting
    expect(screen.getByText('Jan 1, 2023')).toBeInTheDocument();
    expect(screen.getByText('Jan 2, 2023')).toBeInTheDocument();
    expect(screen.getByText('Jan 3, 2023')).toBeInTheDocument();
  });
  
  it('should maintain task order from the provided array', () => {
    render(<TaskDisplay tasks={mockTasks} />);
    
    // Get all task elements in the document
    const taskElements = screen.getAllByRole('listitem');
    
    // Check that tasks are rendered in the correct order
    expect(taskElements[0]).toHaveTextContent('Learn React');
    expect(taskElements[1]).toHaveTextContent('Build a task app');
    expect(taskElements[2]).toHaveTextContent('Write tests');
  });
  
  it('should have proper semantic HTML structure', () => {
    render(<TaskDisplay tasks={mockTasks} />);
    
    // Should use a list for tasks
    const taskList = screen.getByRole('list');
    expect(taskList).toBeInTheDocument();
    expect(taskList.tagName).toBe('UL');
    
    // Each task should be a list item
    const taskItems = screen.getAllByRole('listitem');
    expect(taskItems).toHaveLength(3);
    taskItems.forEach(item => {
      expect(item.tagName).toBe('LI');
    });
  });
  
  it('should have proper accessibility attributes', () => {
    render(<TaskDisplay tasks={mockTasks} />);
    
    // The list should have an accessible label
    const taskList = screen.getByRole('list');
    expect(taskList).toHaveAttribute('aria-label', 'Task list');
    
    // Completed tasks should have an appropriate aria-checked attribute
    const completedTaskElement = screen.getByText('Build a task app').closest('li');
    expect(completedTaskElement).toHaveAttribute('aria-checked', 'true');
    
    // Incomplete tasks should have aria-checked="false"
    const incompleteTaskElement = screen.getByText('Learn React').closest('li');
    expect(incompleteTaskElement).toHaveAttribute('aria-checked', 'false');
  });
}); 