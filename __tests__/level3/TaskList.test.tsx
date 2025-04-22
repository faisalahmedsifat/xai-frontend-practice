import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskList from '@/components/level3/TaskList';
import { Task as TaskType } from '@/types';

describe('TaskList Component', () => {
  const mockTasks: TaskType[] = [
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
  
  const mockOnDelete = jest.fn();
  const mockOnToggleComplete = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render a list of Task components', () => {
    render(
      <TaskList 
        tasks={mockTasks} 
        onDelete={mockOnDelete} 
        onToggleComplete={mockOnToggleComplete} 
      />
    );
    
    // All task titles should be displayed
    expect(screen.getByText('Learn React')).toBeInTheDocument();
    expect(screen.getByText('Build a task app')).toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
    
    // Should have 3 list items
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
    
    // Should have 3 checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    
    // Should have 3 delete buttons
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons).toHaveLength(3);
  });
  
  it('should display a message when no tasks are provided', () => {
    render(
      <TaskList 
        tasks={[]} 
        onDelete={mockOnDelete} 
        onToggleComplete={mockOnToggleComplete} 
      />
    );
    
    // Should display an empty state message
    expect(screen.getByText(/no tasks available/i)).toBeInTheDocument();
    
    // Should not have any list items
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
  
  it('should call onDelete when a task delete button is clicked', async () => {
    render(
      <TaskList 
        tasks={mockTasks} 
        onDelete={mockOnDelete} 
        onToggleComplete={mockOnToggleComplete} 
      />
    );
    
    // Get all delete buttons
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    
    // Click the delete button for the first task
    await userEvent.click(deleteButtons[0]);
    
    // onDelete should be called with the task ID
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });
  
  it('should call onToggleComplete when a task checkbox is clicked', async () => {
    render(
      <TaskList 
        tasks={mockTasks} 
        onDelete={mockOnDelete} 
        onToggleComplete={mockOnToggleComplete} 
      />
    );
    
    // Get all checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    
    // Click the checkbox for the second task
    await userEvent.click(checkboxes[1]);
    
    // onToggleComplete should be called with the task ID
    expect(mockOnToggleComplete).toHaveBeenCalledTimes(1);
    expect(mockOnToggleComplete).toHaveBeenCalledWith('2');
  });
  
  it('should properly render tasks with their completion status', () => {
    render(
      <TaskList 
        tasks={mockTasks} 
        onDelete={mockOnDelete} 
        onToggleComplete={mockOnToggleComplete} 
      />
    );
    
    // Get all checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    
    // The second task should be checked (completed)
    expect(checkboxes[1]).toBeChecked();
    
    // The first and third tasks should not be checked
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });
  
  it('should have proper semantic HTML structure', () => {
    render(
      <TaskList 
        tasks={mockTasks} 
        onDelete={mockOnDelete} 
        onToggleComplete={mockOnToggleComplete} 
      />
    );
    
    // Should use a list for tasks
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list.tagName).toBe('UL');
    
    // Each task should be wrapped in a list item
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
    listItems.forEach(item => {
      expect(item.tagName).toBe('LI');
    });
  });
  
  it('should properly pass props to individual Task components', () => {
    render(
      <TaskList 
        tasks={mockTasks} 
        onDelete={mockOnDelete} 
        onToggleComplete={mockOnToggleComplete} 
      />
    );
    
    // Get all checkboxes and delete buttons
    const checkboxes = screen.getAllByRole('checkbox');
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    
    // Check the structure of each task
    for (let i = 0; i < mockTasks.length; i++) {
      // Each task should have its title displayed
      expect(screen.getByText(mockTasks[i].title)).toBeInTheDocument();
      
      // Each task should have a checkbox
      expect(checkboxes[i]).toBeInTheDocument();
      
      // Each task should have a delete button
      expect(deleteButtons[i]).toBeInTheDocument();
      
      // The checkbox should reflect the task's completed status
      expect(checkboxes[i].checked).toBe(mockTasks[i].completed);
    }
  });
}); 