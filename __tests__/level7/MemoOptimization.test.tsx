import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from '../../src/components/level7/TaskItem';
import { TaskList } from '../../src/components/level7/TaskList';
import { Task } from '../../src/types';

// Mock for React.memo to track render counts
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    memo: (component: any, areEqual?: any) => {
      const memoized = originalReact.memo(component, areEqual);
      memoized.displayName = `memo(${component.displayName || component.name || 'Component'})`;
      return memoized;
    }
  };
});

const mockTasks: Task[] = [
  { id: '1', title: 'Task 1', completed: false, priority: 'high' },
  { id: '2', title: 'Task 2', completed: true, priority: 'medium' },
  { id: '3', title: 'Task 3', completed: false, priority: 'low' },
];

describe('React.memo Optimization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use React.memo to optimize TaskItem component', () => {
    // Verify TaskItem is wrapped with React.memo
    expect(TaskItem.displayName).toMatch(/^memo/);
  });

  it('should prevent re-renders when parent re-renders but props don\'t change', async () => {
    const user = userEvent.setup();
    const handleToggle = jest.fn();
    const handleDelete = jest.fn();
    
    // Create a component that will force re-renders
    const TestWrapper: React.FC = () => {
      const [counter, setCounter] = React.useState(0);
      return (
        <div>
          <button onClick={() => setCounter(c => c + 1)}>Force Update</button>
          <div data-testid="counter">{counter}</div>
          <TaskItem 
            task={mockTasks[0]} 
            onToggle={handleToggle} 
            onDelete={handleDelete} 
          />
        </div>
      );
    };
    
    // Spy on component render method
    const renderSpy = jest.spyOn(React, 'createElement');
    
    render(<TestWrapper />);
    
    // Capture current call count
    const initialRenderCount = renderSpy.mock.calls.filter(
      call => call[0] === TaskItem
    ).length;
    
    // Force parent re-render
    await user.click(screen.getByText('Force Update'));
    
    // Check counter increased
    expect(screen.getByTestId('counter')).toHaveTextContent('1');
    
    // Capture new call count
    const newRenderCount = renderSpy.mock.calls.filter(
      call => call[0] === TaskItem
    ).length;
    
    // TaskItem should not have re-rendered because props didn't change
    expect(newRenderCount).toBe(initialRenderCount);
  });

  it('should re-render when relevant props change', async () => {
    const user = userEvent.setup();
    const handleToggle = jest.fn();
    const handleDelete = jest.fn();
    
    // Create a component that will change TaskItem props
    const TestWrapperWithChanges: React.FC = () => {
      const [task, setTask] = React.useState(mockTasks[0]);
      
      const toggleComplete = () => {
        setTask({
          ...task,
          completed: !task.completed
        });
      };
      
      return (
        <div>
          <button onClick={toggleComplete}>Toggle Complete</button>
          <div data-testid="completed">{String(task.completed)}</div>
          <TaskItem 
            task={task} 
            onToggle={handleToggle} 
            onDelete={handleDelete} 
          />
        </div>
      );
    };
    
    // Spy on component render method
    const renderSpy = jest.spyOn(React, 'createElement');
    
    render(<TestWrapperWithChanges />);
    
    // Capture current call count
    const initialRenderCount = renderSpy.mock.calls.filter(
      call => call[0] === TaskItem
    ).length;
    
    // Change a prop
    await user.click(screen.getByText('Toggle Complete'));
    
    // Verify state changed
    expect(screen.getByTestId('completed')).toHaveTextContent('true');
    
    // Capture new call count
    const newRenderCount = renderSpy.mock.calls.filter(
      call => call[0] === TaskItem
    ).length;
    
    // TaskItem should have re-rendered because a relevant prop changed
    expect(newRenderCount).toBeGreaterThan(initialRenderCount);
  });

  it('should implement a custom comparison function that ignores irrelevant prop changes', async () => {
    const user = userEvent.setup();
    const handleToggle = jest.fn();
    const handleDelete = jest.fn();
    
    // Create a component that changes only non-essential props
    const TestWrapperWithIrrelevantChanges: React.FC = () => {
      const [timestamp, setTimestamp] = React.useState(Date.now());
      
      const updateTimestamp = () => {
        setTimestamp(Date.now());
      };
      
      return (
        <div>
          <button onClick={updateTimestamp}>Update Timestamp</button>
          <div data-testid="timestamp">{timestamp}</div>
          <TaskItem 
            task={mockTasks[0]} 
            onToggle={handleToggle} 
            onDelete={handleDelete}
            timestamp={timestamp} // This prop shouldn't trigger re-render
          />
        </div>
      );
    };
    
    // Spy on component render method
    const renderSpy = jest.spyOn(React, 'createElement');
    
    render(<TestWrapperWithIrrelevantChanges />);
    
    // Capture current call count
    const initialRenderCount = renderSpy.mock.calls.filter(
      call => call[0] === TaskItem
    ).length;
    
    // Update timestamp
    await user.click(screen.getByText('Update Timestamp'));
    
    // Verify timestamp changed
    const newTimestamp = screen.getByTestId('timestamp').textContent;
    expect(newTimestamp).not.toBe(String(Date.now()));
    
    // Capture new call count
    const newRenderCount = renderSpy.mock.calls.filter(
      call => call[0] === TaskItem
    ).length;
    
    // TaskItem should not have re-rendered because the comparison function
    // should ignore changes to the timestamp prop
    expect(newRenderCount).toBe(initialRenderCount);
  });

  it('should optimize TaskList to prevent re-renders of unchanged TaskItems', async () => {
    const user = userEvent.setup();
    const handleToggle = jest.fn((id) => {
      // Mock toggling the task
      const taskIndex = mockTasks.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        const task = mockTasks[taskIndex];
        mockTasks[taskIndex] = {
          ...task,
          completed: !task.completed
        };
      }
    });
    const handleDelete = jest.fn();
    
    // Create a mutable copy for the test
    const tasks = [...mockTasks];
    
    // Create a wrapper component
    const TestTaskList: React.FC = () => {
      const [, forceUpdate] = React.useState({});
      
      return (
        <div>
          <button onClick={() => forceUpdate({})}>Force Update</button>
          <TaskList 
            tasks={tasks} 
            onToggle={(id) => {
              handleToggle(id);
              forceUpdate({});
            }} 
            onDelete={handleDelete} 
          />
        </div>
      );
    };
    
    // Spy on TaskItem createElement calls
    const renderSpy = jest.spyOn(React, 'createElement');
    
    render(<TestTaskList />);
    
    // Get all task checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    
    // Toggle the second task
    await user.click(checkboxes[1]);
    
    // Count re-renders - only the changed item should re-render
    const taskItemRenders = renderSpy.mock.calls.filter(
      call => call[0] === TaskItem
    ).length;
    
    // Initial render (3 items) + 1 re-render for the changed item
    expect(taskItemRenders).toBeLessThan(6); // Should be 4 or less
    
    // Force parent update
    await user.click(screen.getByText('Force Update'));
    
    // Count renders again
    const newTaskItemRenders = renderSpy.mock.calls.filter(
      call => call[0] === TaskItem
    ).length;
    
    // Should not have re-rendered all items
    expect(newTaskItemRenders).toBeLessThan(taskItemRenders + 3);
  });
}); 