import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskStateProvider } from '@/components/level9/TaskStateProvider';
import { OptimisticTaskList } from '@/components/level9/OptimisticTaskList';
import { TaskService } from '@/services/TaskService';
import { AppState } from '@/types';

// Mock the task service
jest.mock('@/services/TaskService', () => ({
  TaskService: {
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    getAllTasks: jest.fn()
  }
}));

// Mock initial state
const createTestState = (): AppState => ({
  tasks: {
    byId: {
      'task-1': {
        id: 'task-1',
        title: 'Existing Task 1',
        description: 'Description for task 1',
        status: 'pending',
        priority: 'high',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: []
      },
      'task-2': {
        id: 'task-2',
        title: 'Existing Task 2',
        description: 'Description for task 2',
        status: 'completed',
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

describe('Optimistic Updates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default successful implementation for task service
    (TaskService.createTask as jest.Mock).mockResolvedValue({
      id: 'server-id',
      title: 'New Task',
      status: 'pending'
    });
    
    (TaskService.updateTask as jest.Mock).mockResolvedValue({
      id: 'task-1',
      title: 'Updated Task',
      status: 'completed'
    });
    
    (TaskService.deleteTask as jest.Mock).mockResolvedValue(true);
  });

  it('should optimistically add a new task before the server response', async () => {
    const user = userEvent.setup();
    
    // Mock the server response with a delay
    (TaskService.createTask as jest.Mock).mockImplementation(async (task) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        ...task,
        id: 'server-id'
      };
    });
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <OptimisticTaskList />
      </TaskStateProvider>
    );
    
    // Initial tasks
    expect(screen.getAllByTestId(/task-item/)).toHaveLength(2);
    
    // Add a new task
    await user.type(screen.getByLabelText(/task title/i), 'New Task');
    await user.click(screen.getByRole('button', { name: /add task/i }));
    
    // Task should appear immediately (optimistic update)
    expect(screen.getAllByTestId(/task-item/)).toHaveLength(3);
    expect(screen.getByText('New Task')).toBeInTheDocument();
    
    // The task ID should be temporary
    const tempTask = screen.getByText('New Task').closest('[data-testid^="task-item"]');
    expect(tempTask).toHaveAttribute('data-testid', expect.stringMatching(/task-item-temp-/));
    
    // Wait for the server response
    await waitFor(() => {
      // Service should have been called
      expect(TaskService.createTask).toHaveBeenCalled();
      
      // Should have updated the ID to the server ID
      const updatedTask = screen.getByText('New Task').closest('[data-testid^="task-item"]');
      expect(updatedTask).toHaveAttribute('data-testid', 'task-item-server-id');
    });
  });

  it('should handle errors when creating a task and rollback optimistic updates', async () => {
    const user = userEvent.setup();
    
    // Mock the server to return an error
    (TaskService.createTask as jest.Mock).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      throw new Error('Network error');
    });
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <OptimisticTaskList />
      </TaskStateProvider>
    );
    
    // Initial tasks
    expect(screen.getAllByTestId(/task-item/)).toHaveLength(2);
    
    // Add a new task
    await user.type(screen.getByLabelText(/task title/i), 'New Task');
    await user.click(screen.getByRole('button', { name: /add task/i }));
    
    // Task should appear immediately (optimistic update)
    expect(screen.getAllByTestId(/task-item/)).toHaveLength(3);
    
    // Wait for the error and rollback
    await waitFor(() => {
      // Error message should be displayed
      expect(screen.getByText(/error.*task/i)).toBeInTheDocument();
      
      // The optimistic task should have been removed
      expect(screen.getAllByTestId(/task-item/)).toHaveLength(2);
      expect(screen.queryByText('New Task')).not.toBeInTheDocument();
    });
  });

  it('should optimistically update task status before server response', async () => {
    const user = userEvent.setup();
    
    // Mock the server response with a delay
    (TaskService.updateTask as jest.Mock).mockImplementation(async (taskId, updates) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        id: taskId,
        ...updates
      };
    });
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <OptimisticTaskList />
      </TaskStateProvider>
    );
    
    // Find the first task
    const task1 = screen.getByTestId('task-item-task-1');
    
    // Check initial status
    expect(task1).toHaveTextContent(/pending/i);
    
    // Find and click the complete button
    const completeButton = within(task1).getByRole('button', { name: /complete/i });
    await user.click(completeButton);
    
    // Status should update immediately (optimistic)
    expect(task1).toHaveTextContent(/completed/i);
    
    // There should be a pending indicator
    expect(task1).toHaveAttribute('data-loading', 'true');
    
    // Wait for the server response
    await waitFor(() => {
      expect(TaskService.updateTask).toHaveBeenCalledWith('task-1', {
        status: 'completed'
      });
      
      // Loading indicator should be gone
      expect(task1).toHaveAttribute('data-loading', 'false');
    });
  });

  it('should optimistically delete a task and handle errors', async () => {
    const user = userEvent.setup();
    
    // First test successful deletion
    (TaskService.deleteTask as jest.Mock).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    });
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <OptimisticTaskList />
      </TaskStateProvider>
    );
    
    // Initial tasks
    expect(screen.getAllByTestId(/task-item/)).toHaveLength(2);
    
    // Delete the first task
    const deleteButton = within(screen.getByTestId('task-item-task-1')).getByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    
    // Task should disappear immediately (optimistic)
    expect(screen.queryByTestId('task-item-task-1')).not.toBeInTheDocument();
    expect(screen.getAllByTestId(/task-item/)).toHaveLength(1);
    
    // Wait for the server response
    await waitFor(() => {
      expect(TaskService.deleteTask).toHaveBeenCalledWith('task-1');
    });
    
    // Now test failed deletion with rollback
    jest.clearAllMocks();
    
    // Mock the server to return an error
    (TaskService.deleteTask as jest.Mock).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      throw new Error('Network error');
    });
    
    // Re-render with fresh state
    const { rerender } = render(
      <TaskStateProvider initialState={createTestState()}>
        <OptimisticTaskList />
      </TaskStateProvider>
    );
    
    // Delete the first task
    const deleteButton2 = within(screen.getByTestId('task-item-task-1')).getByRole('button', { name: /delete/i });
    await user.click(deleteButton2);
    
    // Task should disappear immediately (optimistic)
    expect(screen.queryByTestId('task-item-task-1')).not.toBeInTheDocument();
    
    // Wait for the error and rollback
    await waitFor(() => {
      // Error message should be displayed
      expect(screen.getByText(/error.*delete/i)).toBeInTheDocument();
      
      // The task should be restored
      expect(screen.getByTestId('task-item-task-1')).toBeInTheDocument();
    });
  });

  it('should properly handle the loading and error states', async () => {
    const user = userEvent.setup();
    
    // Mock a slow server response
    (TaskService.updateTask as jest.Mock).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return { id: 'task-1', status: 'completed' };
    });
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <OptimisticTaskList />
      </TaskStateProvider>
    );
    
    // Check initial state
    expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    expect(screen.getByTestId('error-message')).toHaveTextContent('');
    
    // Update a task
    const completeButton = within(screen.getByTestId('task-item-task-1')).getByRole('button', { name: /complete/i });
    await user.click(completeButton);
    
    // Loading state should be true
    expect(screen.getByTestId('loading-state')).toHaveTextContent('true');
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    });
    
    // Now test error handling
    jest.clearAllMocks();
    
    // Mock an error response
    (TaskService.updateTask as jest.Mock).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      throw new Error('Failed to update task');
    });
    
    // Try to update another task
    const completeButton2 = within(screen.getByTestId('task-item-task-2')).getByRole('button', { name: /uncomplete/i });
    await user.click(completeButton2);
    
    // Wait for error
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to update task');
    });
    
    // Clear error message
    const clearErrorButton = screen.getByRole('button', { name: /clear error/i });
    await user.click(clearErrorButton);
    
    // Error should be cleared
    expect(screen.getByTestId('error-message')).toHaveTextContent('');
  });

  it('should ensure optimistic updates are properly typed', () => {
    // This is primarily a TypeScript compile-time check
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <OptimisticTaskList />
      </TaskStateProvider>
    );
    
    // Check that component renders without TypeScript errors
    expect(screen.getByText(/task list/i)).toBeInTheDocument();
  });
});

// Helper function for testing within elements
function within(element: HTMLElement) {
  return {
    getByRole: (role: string, options?: any) => 
      element.querySelector(`[role="${role}"]`) as HTMLElement,
    getByText: (text: string | RegExp) => {
      const regex = text instanceof RegExp ? text : new RegExp(text);
      return Array.from(element.querySelectorAll('*'))
        .find(el => regex.test(el.textContent || '')) as HTMLElement;
    }
  };
} 