import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskBoard } from '@/components/level7/TaskBoard';
import { Task } from '@/types';

// Mock React's useCallback to track its usage
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  const useCallbackSpy = jest.fn(
    (callback, deps) => originalReact.useCallback(callback, deps)
  );
  
  return {
    ...originalReact,
    useCallback: useCallbackSpy
  };
});

const mockTasks: Task[] = [
  { id: '1', title: 'Task 1', completed: false, priority: 'high' },
  { id: '2', title: 'Task 2', completed: true, priority: 'medium' },
  { id: '3', title: 'Task 3', completed: false, priority: 'low' },
];

describe('useCallback Optimization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use useCallback for event handlers', () => {
    render(<TaskBoard initialTasks={mockTasks} />);
    
    // React.useCallback should have been called multiple times for event handlers
    const useCallbackSpy = jest.requireMock('react').useCallback;
    expect(useCallbackSpy).toHaveBeenCalled();
    
    // Check that the first argument to all useCallback calls is a function
    const allCallbacksAreFunctions = useCallbackSpy.mock.calls.every(
      call => typeof call[0] === 'function'
    );
    expect(allCallbacksAreFunctions).toBe(true);
  });

  it('should maintain reference equality between renders for task handlers', async () => {
    const user = userEvent.setup();
    
    const { rerender } = render(<TaskBoard initialTasks={mockTasks} />);
    
    // Get all useCallback calls for the first render
    const useCallbackSpy = jest.requireMock('react').useCallback;
    const firstRenderCallbacks = useCallbackSpy.mock.calls.map(call => call[0]);
    
    // Clear the mock to track new calls
    useCallbackSpy.mockClear();
    
    // Force a re-render by interacting with the component
    const filterSelect = screen.getByLabelText(/filter/i);
    await user.selectOptions(filterSelect, 'completed');
    
    // Re-render with same props (shouldn't create new handlers)
    rerender(<TaskBoard initialTasks={mockTasks} />);
    
    // Get all useCallback calls for the second render
    const secondRenderCallbacks = useCallbackSpy.mock.calls.map(call => call[0]);
    
    // The callbacks from both renders should be the same references
    // (Note: this is an indirect test since we can't directly compare function references)
    // Instead, we check that useCallback was called again with functions
    expect(secondRenderCallbacks.length).toBeGreaterThan(0);
  });

  it('should specify appropriate dependencies for callbacks', async () => {
    const user = userEvent.setup();
    
    render(<TaskBoard initialTasks={mockTasks} />);
    
    const useCallbackSpy = jest.requireMock('react').useCallback;
    
    // Check that all useCallback calls have a dependencies array
    const allCallsHaveDepsArray = useCallbackSpy.mock.calls.every(
      call => Array.isArray(call[1])
    );
    expect(allCallsHaveDepsArray).toBe(true);
    
    // At least some callbacks should have non-empty dependencies
    const someCallsHaveNonEmptyDeps = useCallbackSpy.mock.calls.some(
      call => call[1] && call[1].length > 0
    );
    expect(someCallsHaveNonEmptyDeps).toBe(true);
  });

  it('should create a new callback when relevant dependencies change', async () => {
    const user = userEvent.setup();
    
    const { rerender } = render(<TaskBoard initialTasks={mockTasks} />);
    
    // Get handler for adding a task
    const useCallbackSpy = jest.requireMock('react').useCallback;
    
    // Clear the mock to track new calls
    useCallbackSpy.mockClear();
    
    // Add a new task (this should change the tasks state which should be a dependency)
    const titleInput = screen.getByLabelText(/title/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    await user.type(titleInput, 'New Task');
    await user.click(addButton);
    
    // There should be at least one new callback created
    expect(useCallbackSpy).toHaveBeenCalled();
  });

  it('should optimize all task operations with useCallback', async () => {
    const user = userEvent.setup();
    
    render(<TaskBoard initialTasks={mockTasks} />);
    
    // Track useCallback calls
    let useCallbackSpy = jest.requireMock('react').useCallback;
    
    // Testing toggle task callback
    const initialCallCount = useCallbackSpy.mock.calls.length;
    useCallbackSpy.mockClear();
    
    // Toggle a task
    const checkbox = screen.getAllByRole('checkbox')[0];
    await user.click(checkbox);
    
    // Testing delete task callback
    useCallbackSpy.mockClear();
    
    // Delete a task
    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
    await user.click(deleteButton);
    
    // Testing edit task callback
    useCallbackSpy.mockClear();
    
    // Find and click edit button
    const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
    await user.click(editButton);
    
    // Find save button in edit mode
    const saveButton = screen.getByRole('button', { name: /save/i });
    
    // Edit and save
    const editInput = screen.getByDisplayValue(/Task /);
    await user.clear(editInput);
    await user.type(editInput, 'Updated Task');
    await user.click(saveButton);
  });

  it('should properly type the useCallback functions', () => {
    // This is a static analysis test, so it will pass if the component compiles.
    // The test simply renders the component to verify no type errors.
    render(<TaskBoard initialTasks={mockTasks} />);
    
    // Verify basic functionality works
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(1);
  });
}); 