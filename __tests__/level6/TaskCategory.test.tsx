import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCategory } from '../../src/components/level6/TaskCategory';
import { Task } from '../../src/types';

const mockTasks: Task[] = [
  { id: '1', title: 'Task 1', completed: false, priority: 'high' },
  { id: '2', title: 'Task 2', completed: true, priority: 'medium' },
  { id: '3', title: 'Task 3', completed: false, priority: 'low' },
];

describe('TaskCategory Compound Component', () => {
  it('should render the TaskCategory with its subcomponents', () => {
    render(
      <TaskCategory id="test-category">
        <TaskCategory.Title>Test Category</TaskCategory.Title>
        <TaskCategory.List tasks={mockTasks} />
        <TaskCategory.Footer>
          <TaskCategory.Count />
        </TaskCategory.Footer>
      </TaskCategory>
    );

    // Check title is rendered
    expect(screen.getByText('Test Category')).toBeInTheDocument();

    // Check tasks are rendered
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();

    // Check count is rendered (3 tasks)
    expect(screen.getByText('3 tasks')).toBeInTheDocument();
  });

  it('should share context between parent and children components', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskCategory id="expandable">
        <TaskCategory.Title>Expandable Category</TaskCategory.Title>
        <TaskCategory.List tasks={mockTasks} />
        <TaskCategory.ToggleButton />
      </TaskCategory>
    );

    // Check initially expanded
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    
    // Find and click the toggle button
    const toggleButton = screen.getByRole('button', { name: /toggle/i });
    await user.click(toggleButton);
    
    // Tasks should be hidden
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    
    // Click again to expand
    await user.click(toggleButton);
    
    // Tasks should be visible again
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('should apply custom styling when provided', () => {
    render(
      <TaskCategory id="custom-style" className="custom-category">
        <TaskCategory.Title className="custom-title">Styled Category</TaskCategory.Title>
        <TaskCategory.List tasks={mockTasks} className="custom-list" />
      </TaskCategory>
    );

    const categoryElement = screen.getByTestId('category-custom-style');
    const titleElement = screen.getByText('Styled Category');
    const listElement = screen.getByRole('list');

    expect(categoryElement).toHaveClass('custom-category');
    expect(titleElement).toHaveClass('custom-title');
    expect(listElement).toHaveClass('custom-list');
  });

  it('should filter tasks when filterPredicate is provided', () => {
    render(
      <TaskCategory id="filtered" filterPredicate={(task) => task.completed}>
        <TaskCategory.Title>Completed Tasks</TaskCategory.Title>
        <TaskCategory.List tasks={mockTasks} />
        <TaskCategory.Footer>
          <TaskCategory.Count />
        </TaskCategory.Footer>
      </TaskCategory>
    );

    // Only the completed task should be visible
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.queryByText('Task 3')).not.toBeInTheDocument();
    
    // Count should reflect the filtered tasks
    expect(screen.getByText('1 task')).toBeInTheDocument();
  });

  it('should throw error if subcomponents are used outside of TaskCategory', () => {
    // Mock console.error to avoid React error logs in test output
    const originalError = console.error;
    console.error = jest.fn();

    // Wrapper to catch the expected error
    const renderOutsideContext = () => {
      render(<TaskCategory.Title>Outside Title</TaskCategory.Title>);
    };

    // Should throw an error with appropriate message
    expect(renderOutsideContext).toThrow(/must be used within a TaskCategory/);

    // Restore console.error
    console.error = originalError;
  });

  it('should properly handle empty tasks array', () => {
    render(
      <TaskCategory id="empty">
        <TaskCategory.Title>Empty Category</TaskCategory.Title>
        <TaskCategory.List tasks={[]} />
        <TaskCategory.Footer>
          <TaskCategory.Count />
          <TaskCategory.EmptyMessage>No tasks available</TaskCategory.EmptyMessage>
        </TaskCategory.Footer>
      </TaskCategory>
    );

    // Empty message should be displayed
    expect(screen.getByText('No tasks available')).toBeInTheDocument();
    
    // Count should show 0 tasks
    expect(screen.getByText('0 tasks')).toBeInTheDocument();
  });
}); 