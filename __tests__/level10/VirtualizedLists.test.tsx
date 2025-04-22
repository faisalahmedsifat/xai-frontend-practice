import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VirtualizedTaskList } from '@/components/level10/VirtualizedTaskList';
import { VirtualizedKanbanBoard } from '@/components/level10/VirtualizedKanbanBoard';
import { Task } from '@/types';

// Mock react-window components
jest.mock('react-window', () => {
  return {
    FixedSizeList: ({ height, width, itemCount, itemSize, children, onItemsRendered }: any) => {
      // Simulate the virtualization behavior by only rendering a subset of items
      const visibleStartIndex = 0;
      const visibleStopIndex = Math.min(itemCount - 1, Math.floor(height / itemSize) - 1);
      
      // Call onItemsRendered to simulate scroll events
      onItemsRendered?.({
        overscanStartIndex: Math.max(0, visibleStartIndex - 1),
        overscanStopIndex: Math.min(itemCount - 1, visibleStopIndex + 1),
        visibleStartIndex,
        visibleStopIndex
      });
      
      // Render only visible items
      const items = [];
      for (let i = visibleStartIndex; i <= visibleStopIndex; i++) {
        items.push(children({ index: i, style: { height: itemSize, width } }));
      }
      
      return (
        <div 
          data-testid="virtualized-list"
          data-height={height}
          data-width={width}
          data-item-count={itemCount}
          data-item-size={itemSize}
        >
          {items}
        </div>
      );
    },
    areEqual: jest.fn((prevProps, nextProps) => {
      return prevProps.task.id === nextProps.task.id && 
             prevProps.style === nextProps.style;
    })
  };
});

// Generate a large number of mock tasks
const generateMockTasks = (count: number): Task[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `task-${i + 1}`,
    title: `Task ${i + 1}`,
    description: `Description for task ${i + 1}`,
    status: i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'in-progress' : 'pending',
    priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
    createdAt: new Date(2023, 0, i + 1).toISOString()
  }));
};

const mockTasks = generateMockTasks(500);

describe('Virtualized Lists', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render virtualized task list with FixedSizeList', () => {
    render(<VirtualizedTaskList tasks={mockTasks} />);
    
    // Check if virtualized list is used
    const virtualizedList = screen.getByTestId('virtualized-list');
    expect(virtualizedList).toBeInTheDocument();
    
    // Check virtualized list props
    expect(virtualizedList).toHaveAttribute('data-item-count', '500');
    expect(virtualizedList).toHaveAttribute('data-height');
    expect(virtualizedList).toHaveAttribute('data-width');
    
    // Check that only a subset of tasks is rendered (not all 500)
    const taskItems = screen.getAllByTestId(/task-item/);
    expect(taskItems.length).toBeLessThan(500);
    
    // Verify some visible task content
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('should handle task selection in virtualized list', async () => {
    const user = userEvent.setup();
    const handleTaskSelect = jest.fn();
    
    render(
      <VirtualizedTaskList 
        tasks={mockTasks} 
        onTaskSelect={handleTaskSelect}
      />
    );
    
    // Select a task
    const firstTaskItem = screen.getByText('Task 1').closest('[data-testid^="task-item"]');
    await user.click(firstTaskItem!);
    
    // Check if selection handler was called with the task
    expect(handleTaskSelect).toHaveBeenCalledWith('task-1');
    
    // Selected task should have selected class
    expect(firstTaskItem).toHaveClass('selected');
  });

  it('should optimize performance with memoized row components', () => {
    // We need to spy on the memoization function
    const areEqualSpy = jest.spyOn(require('react-window'), 'areEqual');
    
    render(<VirtualizedTaskList tasks={mockTasks} />);
    
    // Verify areEqual is used for optimization
    expect(areEqualSpy).toHaveBeenCalled();
  });

  it('should render virtualized kanban board for large datasets', () => {
    render(<VirtualizedKanbanBoard tasks={mockTasks} />);
    
    // Should render three columns (pending, in-progress, completed)
    const columns = screen.getAllByTestId(/column-/);
    expect(columns).toHaveLength(3);
    
    // Each column should have its own virtualized list
    const virtualizedLists = screen.getAllByTestId('virtualized-list');
    expect(virtualizedLists).toHaveLength(3);
    
    // Check column headings
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should handle keyboard navigation in virtualized list', () => {
    render(<VirtualizedTaskList tasks={mockTasks} enableKeyboardNavigation />);
    
    // Get the first task item
    const firstTaskItem = screen.getByText('Task 1').closest('[data-testid^="task-item"]');
    
    // Focus on the first task
    firstTaskItem?.focus();
    expect(document.activeElement).toBe(firstTaskItem);
    
    // Press down arrow key to move to next task
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    
    // Second task should now be focused
    const secondTaskItem = screen.getByText('Task 2').closest('[data-testid^="task-item"]');
    expect(document.activeElement).toBe(secondTaskItem);
  });

  it('should handle loading states for delayed content', async () => {
    // Create a wrapper component that simulates loading
    const LoadingTaskList = () => {
      const [loading, setLoading] = React.useState(true);
      const [tasks, setTasks] = React.useState<Task[]>([]);
      
      React.useEffect(() => {
        // Simulate loading delay
        const timeout = setTimeout(() => {
          setTasks(mockTasks);
          setLoading(false);
        }, 100);
        
        return () => clearTimeout(timeout);
      }, []);
      
      if (loading) {
        return <div data-testid="loading-indicator">Loading tasks...</div>;
      }
      
      return <VirtualizedTaskList tasks={tasks} />;
    };
    
    render(<LoadingTaskList />);
    
    // Loading indicator should be visible initially
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    
    // After loading, virtualized list should be rendered
    await screen.findByTestId('virtualized-list');
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });

  it('should support task filtering while maintaining virtualization', async () => {
    const user = userEvent.setup();
    
    render(<VirtualizedTaskList tasks={mockTasks} enableFiltering />);
    
    // All tasks should be initially displayed (but virtualized)
    const virtualizedList = screen.getByTestId('virtualized-list');
    expect(virtualizedList).toHaveAttribute('data-item-count', '500');
    
    // Use the filter dropdown to show only high priority tasks
    const filterSelect = screen.getByLabelText(/filter by priority/i);
    await user.selectOptions(filterSelect, 'high');
    
    // Check that the list now only contains high priority tasks
    // About 1/3 of the 500 tasks should be high priority
    const expectedHighPriorityCount = Math.floor(mockTasks.length / 3);
    expect(virtualizedList).toHaveAttribute('data-item-count', expectedHighPriorityCount.toString());
  });

  it('should maintain proper TypeScript typing with generics for virtualized components', () => {
    // This is primarily a compile-time check for TypeScript
    
    interface CustomTask extends Task {
      assignee?: string;
      points?: number;
    }
    
    const customTasks: CustomTask[] = mockTasks.slice(0, 10).map(task => ({
      ...task,
      assignee: 'User',
      points: 5
    }));
    
    // Render with typed generic parameters to verify TypeScript compatibility
    render(
      <VirtualizedTaskList<CustomTask>
        tasks={customTasks}
        itemKey="id"
        renderItem={({ item, style, index }) => (
          <div style={style} data-testid={`custom-task-${item.id}`}>
            {item.title} - {item.assignee} ({item.points} pts)
          </div>
        )}
      />
    );
    
    // Check that custom rendering works with typed generics
    expect(screen.getByText(/User \(5 pts\)/)).toBeInTheDocument();
  });
}); 