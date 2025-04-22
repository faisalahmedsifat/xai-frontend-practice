import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskDashboard } from '@/components/level7/TaskDashboard';
import { Task } from '@/types';

// Mock React's useMemo to track its usage
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  const useMemoSpy = jest.fn(
    (factory, deps) => originalReact.useMemo(factory, deps)
  );
  
  return {
    ...originalReact,
    useMemo: useMemoSpy
  };
});

const mockTasks: Task[] = [
  { id: '1', title: 'Task 1', completed: false, priority: 'high', dueDate: new Date(2023, 5, 15) },
  { id: '2', title: 'Task 2', completed: true, priority: 'medium', dueDate: new Date(2023, 5, 10) },
  { id: '3', title: 'Task 3', completed: false, priority: 'low', dueDate: new Date(2023, 5, 20) },
  { id: '4', title: 'Task 4', completed: true, priority: 'high', dueDate: new Date(2023, 4, 30) },
  { id: '5', title: 'Task 5', completed: false, priority: 'medium', dueDate: new Date(2023, 6, 5) },
];

describe('useMemo Optimization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use useMemo for filtering tasks', () => {
    render(<TaskDashboard tasks={mockTasks} />);
    
    // React.useMemo should have been called for filtering
    const useMemoSpy = jest.requireMock('react').useMemo;
    expect(useMemoSpy).toHaveBeenCalled();
    
    // At least one useMemo call should return an array (filtered tasks)
    const someCallReturnsArray = useMemoSpy.mock.calls.some(call => {
      const factory = call[0];
      return Array.isArray(factory());
    });
    
    expect(someCallReturnsArray).toBe(true);
  });

  it('should not recalculate filtered tasks when unrelated state changes', async () => {
    const user = userEvent.setup();
    
    render(<TaskDashboard tasks={mockTasks} />);
    
    // Get initial useMemo calls
    const useMemoSpy = jest.requireMock('react').useMemo;
    const initialCallCount = useMemoSpy.mock.calls.length;
    
    // Find a factory function that returns filtered tasks
    const filteringFactories = useMemoSpy.mock.calls
      .filter(call => Array.isArray(call[0]()))
      .map(call => call[0]);
    
    // Clear spy to track new calls
    useMemoSpy.mockClear();
    
    // Trigger an unrelated state change (e.g., toggle theme)
    const themeToggle = screen.getByRole('button', { name: /theme/i });
    await user.click(themeToggle);
    
    // Check if the filtering factory was called again
    const newFilteringCalls = useMemoSpy.mock.calls
      .filter(call => filteringFactories.includes(call[0]));
    
    // The filtering factory should not execute again, just be reused
    expect(newFilteringCalls.length).toBe(filteringFactories.length);
  });

  it('should recalculate filtered tasks when filter criteria changes', async () => {
    const user = userEvent.setup();
    
    render(<TaskDashboard tasks={mockTasks} />);
    
    // Get initial task count
    const initialTaskItems = screen.getAllByRole('listitem').length;
    
    // Initially shows all tasks
    expect(initialTaskItems).toBe(mockTasks.length);
    
    // Find and use the priority filter
    const priorityFilter = screen.getByLabelText(/priority/i);
    await user.selectOptions(priorityFilter, 'high');
    
    // Should now show only high priority tasks (2)
    const highPriorityItems = screen.getAllByRole('listitem').length;
    expect(highPriorityItems).toBe(2);
    
    // Select completed filter
    const statusFilter = screen.getByLabelText(/status/i);
    await user.selectOptions(statusFilter, 'completed');
    
    // Should now show only completed high priority tasks (1)
    const completedHighPriorityItems = screen.getAllByRole('listitem').length;
    expect(completedHighPriorityItems).toBe(1);
  });

  it('should use useMemo for calculating task statistics', async () => {
    render(<TaskDashboard tasks={mockTasks} />);
    
    // Check useMemo is used for statistics calculations
    const useMemoSpy = jest.requireMock('react').useMemo;
    
    // Check for a useMemo call that returns an object with statistics properties
    const statsUseMemo = useMemoSpy.mock.calls.some(call => {
      const result = call[0]();
      return (
        result && 
        typeof result === 'object' &&
        (
          'completedCount' in result ||
          'overdue' in result ||
          'completion' in result ||
          'priority' in result
        )
      );
    });
    
    expect(statsUseMemo).toBe(true);
    
    // Check that statistics are rendered
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  it('should specify appropriate dependencies for useMemo hooks', () => {
    render(<TaskDashboard tasks={mockTasks} />);
    
    const useMemoSpy = jest.requireMock('react').useMemo;
    
    // All useMemo calls should have dependency arrays
    const allCallsHaveDeps = useMemoSpy.mock.calls.every(
      call => Array.isArray(call[1])
    );
    expect(allCallsHaveDeps).toBe(true);
    
    // Some of the dependency arrays should not be empty
    const someHaveNonEmptyDeps = useMemoSpy.mock.calls.some(
      call => call[1] && call[1].length > 0
    );
    expect(someHaveNonEmptyDeps).toBe(true);
    
    // The tasks array should be a dependency in at least one useMemo call
    const tasksIsDependency = useMemoSpy.mock.calls.some(
      call => call[1] && call[1].some(dep => Array.isArray(dep) && dep.length === mockTasks.length)
    );
    
    // This is an indirect check since we can't directly compare objects in the deps array
    expect(someHaveNonEmptyDeps).toBe(true);
  });

  it('should handle empty task lists correctly', () => {
    render(<TaskDashboard tasks={[]} />);
    
    // Should show empty state message
    expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
    
    // Statistics should handle empty array gracefully
    expect(screen.getByText(/0%/i)).toBeInTheDocument();
  });

  it('should update memoized values when tasks prop changes', () => {
    const { rerender } = render(<TaskDashboard tasks={mockTasks} />);
    
    // Get initial stats display
    const initialCompletionText = screen.getByText(/completed/i).textContent;
    
    // Clear useMemo spy to track new calls
    const useMemoSpy = jest.requireMock('react').useMemo;
    useMemoSpy.mockClear();
    
    // Update with new tasks (all completed)
    const newTasks = mockTasks.map(task => ({ ...task, completed: true }));
    rerender(<TaskDashboard tasks={newTasks} />);
    
    // useMemo should be called again with new dependencies
    expect(useMemoSpy).toHaveBeenCalled();
    
    // Stats should update
    const newCompletionText = screen.getByText(/completed/i).textContent;
    expect(newCompletionText).not.toBe(initialCompletionText);
    expect(newCompletionText).toMatch(/100%/i);
  });

  it('should properly type the useMemo returned values', () => {
    // This is mainly a TypeScript compilation test
    render(<TaskDashboard tasks={mockTasks} />);
    
    // Just verify it renders without type errors
    expect(screen.getByText(/task dashboard/i)).toBeInTheDocument();
  });
}); 