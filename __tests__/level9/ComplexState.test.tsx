import React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskStateProvider, useTaskState } from '../../src/components/level9/TaskStateProvider';
import { Task, AppState, TaskPriority, TaskStatus } from '../../src/types';

// Test component that consumes the complex state
const TestStateConsumer: React.FC = () => {
  const { state } = useTaskState();
  
  // Extract some values from the state to check typing and structure
  const taskCount = state.tasks.allIds.length;
  const pendingTasks = state.tasks.allIds.filter(id => {
    const task = state.tasks.byId[id];
    return task.status === 'pending';
  }).length;
  
  const currentTheme = state.ui.theme;
  const isPastEmpty = state.history.past.length === 0;
  
  return (
    <div>
      <div data-testid="task-count">{taskCount}</div>
      <div data-testid="pending-tasks">{pendingTasks}</div>
      <div data-testid="current-theme">{currentTheme}</div>
      <div data-testid="is-past-empty">{String(isPastEmpty)}</div>
      <div data-testid="state-shape-valid">true</div>
    </div>
  );
};

// Helper to create initial test state
const createTestState = (): AppState => ({
  tasks: {
    byId: {
      'task-1': {
        id: 'task-1',
        title: 'Task 1',
        description: 'Description for task 1',
        status: 'completed',
        priority: 'high',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [
          {
            timestamp: new Date().toISOString(),
            userId: 'user-1',
            type: 'created',
            changes: { title: 'Task 1' }
          }
        ]
      },
      'task-2': {
        id: 'task-2',
        title: 'Task 2',
        description: 'Description for task 2',
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: []
      }
    },
    allIds: ['task-1', 'task-2'],
    loading: false,
    error: null
  },
  ui: {
    currentView: 'list',
    theme: 'light',
    selectedTaskId: null,
    filters: {
      status: null,
      priority: null,
      search: ''
    }
  },
  history: {
    past: [],
    future: []
  }
});

describe('Complex State Shape with TypeScript', () => {
  it('should implement a comprehensive state shape with proper structure', () => {
    const initialState = createTestState();
    
    render(
      <TaskStateProvider initialState={initialState}>
        <TestStateConsumer />
      </TaskStateProvider>
    );
    
    expect(screen.getByTestId('state-shape-valid')).toHaveTextContent('true');
    expect(screen.getByTestId('task-count')).toHaveTextContent('2');
    expect(screen.getByTestId('pending-tasks')).toHaveTextContent('1');
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(screen.getByTestId('is-past-empty')).toHaveTextContent('true');
  });

  it('should use TypeScript utility types for state manipulation', () => {
    // This is primarily a compile-time test to check TypeScript utility types
    
    // Create a helper component that demonstrates type manipulation
    const TypeUtilityDemo: React.FC = () => {
      const { state, dispatch } = useTaskState();
      
      // Function that uses TypeScript utility types
      const updateTaskPartially = (taskId: string, updates: Partial<Task>) => {
        dispatch({
          type: 'UPDATE_TASK',
          payload: { taskId, updates }
        });
      };
      
      // Function that uses Pick utility type
      const createTaskWithRequiredFields = (taskData: Pick<Task, 'title' | 'priority'>) => {
        const taskDefaults: Omit<Task, 'id' | 'title' | 'priority'> = {
          description: '',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: []
        };
        
        dispatch({
          type: 'CREATE_TASK',
          payload: {
            ...taskDefaults,
            ...taskData,
            id: `task-${Date.now()}`
          }
        });
      };
      
      return (
        <div>
          <button onClick={() => updateTaskPartially('task-1', { title: 'Updated Title' })}>
            Update Task
          </button>
          <button onClick={() => createTaskWithRequiredFields({ 
            title: 'New Task', 
            priority: 'high' 
          })}>
            Create Task
          </button>
        </div>
      );
    };
    
    // If this renders without errors, the TypeScript utility types are working
    render(
      <TaskStateProvider initialState={createTestState()}>
        <TypeUtilityDemo />
      </TaskStateProvider>
    );
    
    // Just check that the buttons rendered
    expect(screen.getByText('Update Task')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('should implement proper type guards and type narrowing', () => {
    // This is mainly a compile-time test, but we can check some runtime behavior
    
    // Component that demonstrates type guards and narrowing
    const TypeGuardDemo: React.FC = () => {
      const { state } = useTaskState();
      
      // Function with type guard for task priority
      const isPriorityHigh = (priority: unknown): priority is TaskPriority => {
        return typeof priority === 'string' && ['high', 'medium', 'low'].includes(priority as string);
      };
      
      // Count high priority tasks using the type guard
      const highPriorityCount = state.tasks.allIds.reduce((count, id) => {
        const task = state.tasks.byId[id];
        if (isPriorityHigh(task.priority) && task.priority === 'high') {
          return count + 1;
        }
        return count;
      }, 0);
      
      // Function with type narrowing for task status
      const getStatusLabel = (status: TaskStatus): string => {
        switch (status) {
          case 'completed':
            return 'Completed';
          case 'pending':
            return 'In Progress';
          case 'cancelled':
            return 'Cancelled';
          default:
            // TypeScript should catch if all cases aren't handled
            const exhaustiveCheck: never = status;
            return exhaustiveCheck;
        }
      };
      
      return (
        <div>
          <div data-testid="high-priority-count">{highPriorityCount}</div>
          <div data-testid="completed-status">{getStatusLabel('completed')}</div>
          <div data-testid="pending-status">{getStatusLabel('pending')}</div>
        </div>
      );
    };
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <TypeGuardDemo />
      </TaskStateProvider>
    );
    
    // One task has high priority in our test state
    expect(screen.getByTestId('high-priority-count')).toHaveTextContent('1');
    expect(screen.getByTestId('completed-status')).toHaveTextContent('Completed');
    expect(screen.getByTestId('pending-status')).toHaveTextContent('In Progress');
  });

  it('should use discriminated unions for actions', () => {
    // This is mainly a compile-time test for TypeScript
    
    // Component that demonstrates discriminated union actions
    const ActionDemo: React.FC = () => {
      const { dispatch } = useTaskState();
      
      // These action creators demonstrate discriminated unions
      const createTask = (title: string) => {
        dispatch({
          type: 'CREATE_TASK',
          payload: {
            id: `task-${Date.now()}`,
            title,
            description: '',
            status: 'pending',
            priority: 'medium',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            history: []
          }
        });
      };
      
      const deleteTask = (taskId: string) => {
        dispatch({
          type: 'DELETE_TASK',
          payload: { taskId }
        });
      };
      
      const setTheme = (theme: 'light' | 'dark') => {
        dispatch({
          type: 'SET_THEME',
          payload: { theme }
        });
      };
      
      return (
        <div>
          <button onClick={() => createTask('New Task')}>Create</button>
          <button onClick={() => deleteTask('task-1')}>Delete</button>
          <button onClick={() => setTheme('dark')}>Set Theme</button>
        </div>
      );
    };
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <ActionDemo />
      </TaskStateProvider>
    );
    
    // Just verify the component renders without errors
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Set Theme')).toBeInTheDocument();
  });
}); 