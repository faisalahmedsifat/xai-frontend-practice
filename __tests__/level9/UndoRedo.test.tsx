import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskStateProvider, useTaskState } from '@/components/level9/TaskStateProvider';
import { TaskManager } from '@/components/level9/TaskManager';
import { AppState, Task } from '@/types';

// Mock initial state with tasks
const createTestState = (): AppState => ({
  tasks: {
    byId: {
      'task-1': {
        id: 'task-1',
        title: 'Original Task 1',
        description: 'Original description',
        status: 'pending',
        priority: 'high',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: []
      }
    },
    allIds: ['task-1'],
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

// Test component with undo/redo controls
const TestUndoRedoControls: React.FC = () => {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useTaskState();
  
  // Get the first task
  const task = state.tasks.byId['task-1'];
  
  // Function to update the task
  const updateTask = (updates: Partial<Task>) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        taskId: 'task-1',
        updates
      }
    });
  };
  
  // Function to delete the task
  const deleteTask = () => {
    dispatch({
      type: 'DELETE_TASK',
      payload: {
        taskId: 'task-1'
      }
    });
  };
  
  return (
    <div>
      {task ? (
        <div>
          <h2 data-testid="task-title">{task.title}</h2>
          <p data-testid="task-description">{task.description}</p>
          <p data-testid="task-status">{task.status}</p>
          
          <button 
            onClick={() => updateTask({ title: 'Updated Task 1' })}
            data-testid="update-title-btn"
          >
            Update Title
          </button>
          
          <button 
            onClick={() => updateTask({ description: 'Updated description' })}
            data-testid="update-description-btn"
          >
            Update Description
          </button>
          
          <button 
            onClick={() => updateTask({ status: 'completed' })}
            data-testid="complete-task-btn"
          >
            Complete Task
          </button>
          
          <button 
            onClick={deleteTask}
            data-testid="delete-task-btn"
          >
            Delete Task
          </button>
        </div>
      ) : (
        <p data-testid="no-task-message">No task found</p>
      )}
      
      <div className="undo-redo-controls">
        <button 
          onClick={undo} 
          disabled={!canUndo}
          data-testid="undo-btn"
        >
          Undo
        </button>
        
        <button 
          onClick={redo} 
          disabled={!canRedo}
          data-testid="redo-btn"
        >
          Redo
        </button>
        
        <span data-testid="can-undo">{String(canUndo)}</span>
        <span data-testid="can-redo">{String(canRedo)}</span>
        <span data-testid="past-length">{state.history.past.length}</span>
        <span data-testid="future-length">{state.history.future.length}</span>
      </div>
    </div>
  );
};

describe('Undo/Redo Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should track actions in history and allow undoing', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <TestUndoRedoControls />
      </TaskStateProvider>
    );
    
    // Initial state check
    expect(screen.getByTestId('task-title')).toHaveTextContent('Original Task 1');
    expect(screen.getByTestId('can-undo')).toHaveTextContent('false');
    
    // Update the task title
    await user.click(screen.getByTestId('update-title-btn'));
    
    // Check that the title updated
    expect(screen.getByTestId('task-title')).toHaveTextContent('Updated Task 1');
    
    // Check that we can now undo
    expect(screen.getByTestId('can-undo')).toHaveTextContent('true');
    expect(screen.getByTestId('past-length')).toHaveTextContent('1');
    
    // Undo the title update
    await user.click(screen.getByTestId('undo-btn'));
    
    // Check that title is back to original
    expect(screen.getByTestId('task-title')).toHaveTextContent('Original Task 1');
    
    // Can't undo anymore (back to initial state)
    expect(screen.getByTestId('can-undo')).toHaveTextContent('false');
  });

  it('should allow redoing undone actions', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <TestUndoRedoControls />
      </TaskStateProvider>
    );
    
    // Update the task status
    await user.click(screen.getByTestId('complete-task-btn'));
    
    // Check that status updated
    expect(screen.getByTestId('task-status')).toHaveTextContent('completed');
    
    // Undo the status update
    await user.click(screen.getByTestId('undo-btn'));
    
    // Check that status is back to original
    expect(screen.getByTestId('task-status')).toHaveTextContent('pending');
    
    // Check that we can now redo
    expect(screen.getByTestId('can-redo')).toHaveTextContent('true');
    expect(screen.getByTestId('future-length')).toHaveTextContent('1');
    
    // Redo the status update
    await user.click(screen.getByTestId('redo-btn'));
    
    // Check that status is completed again
    expect(screen.getByTestId('task-status')).toHaveTextContent('completed');
    
    // Can't redo anymore
    expect(screen.getByTestId('can-redo')).toHaveTextContent('false');
    expect(screen.getByTestId('future-length')).toHaveTextContent('0');
  });

  it('should clear redo history when a new action is performed after undo', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <TestUndoRedoControls />
      </TaskStateProvider>
    );
    
    // Update title and description
    await user.click(screen.getByTestId('update-title-btn'));
    await user.click(screen.getByTestId('update-description-btn'));
    
    // Check updates
    expect(screen.getByTestId('task-title')).toHaveTextContent('Updated Task 1');
    expect(screen.getByTestId('task-description')).toHaveTextContent('Updated description');
    
    // Undo twice to get back to initial state
    await user.click(screen.getByTestId('undo-btn'));
    await user.click(screen.getByTestId('undo-btn'));
    
    // Should have redo available
    expect(screen.getByTestId('can-redo')).toHaveTextContent('true');
    expect(screen.getByTestId('future-length')).toHaveTextContent('2');
    
    // Make a new change
    await user.click(screen.getByTestId('complete-task-btn'));
    
    // Redo history should be cleared
    expect(screen.getByTestId('can-redo')).toHaveTextContent('false');
    expect(screen.getByTestId('future-length')).toHaveTextContent('0');
  });

  it('should handle complex sequences of actions, undos, and redos', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <TestUndoRedoControls />
      </TaskStateProvider>
    );
    
    // Action 1: Update title
    await user.click(screen.getByTestId('update-title-btn'));
    expect(screen.getByTestId('task-title')).toHaveTextContent('Updated Task 1');
    
    // Action 2: Update description
    await user.click(screen.getByTestId('update-description-btn'));
    expect(screen.getByTestId('task-description')).toHaveTextContent('Updated description');
    
    // Action 3: Complete task
    await user.click(screen.getByTestId('complete-task-btn'));
    expect(screen.getByTestId('task-status')).toHaveTextContent('completed');
    
    // Undo Action 3
    await user.click(screen.getByTestId('undo-btn'));
    expect(screen.getByTestId('task-status')).toHaveTextContent('pending');
    
    // Undo Action 2
    await user.click(screen.getByTestId('undo-btn'));
    expect(screen.getByTestId('task-description')).toHaveTextContent('Original description');
    
    // Redo Action 2
    await user.click(screen.getByTestId('redo-btn'));
    expect(screen.getByTestId('task-description')).toHaveTextContent('Updated description');
    
    // New Action 4: Delete task (should clear redo history)
    await user.click(screen.getByTestId('delete-task-btn'));
    expect(screen.getByTestId('no-task-message')).toBeInTheDocument();
    
    // Undo delete
    await user.click(screen.getByTestId('undo-btn'));
    expect(screen.getByTestId('task-title')).toBeInTheDocument();
    expect(screen.getByTestId('task-title')).toHaveTextContent('Updated Task 1');
  });

  it('should provide UI controls that reflect the ability to undo/redo', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <TestUndoRedoControls />
      </TaskStateProvider>
    );
    
    // Initially undo is disabled
    expect(screen.getByTestId('undo-btn')).toBeDisabled();
    expect(screen.getByTestId('redo-btn')).toBeDisabled();
    
    // Perform an action
    await user.click(screen.getByTestId('update-title-btn'));
    
    // Now undo should be enabled, redo still disabled
    expect(screen.getByTestId('undo-btn')).not.toBeDisabled();
    expect(screen.getByTestId('redo-btn')).toBeDisabled();
    
    // Undo the action
    await user.click(screen.getByTestId('undo-btn'));
    
    // Now undo disabled, redo enabled
    expect(screen.getByTestId('undo-btn')).toBeDisabled();
    expect(screen.getByTestId('redo-btn')).not.toBeDisabled();
  });

  it('should properly type all actions and commands in the history', () => {
    // This is primarily a compile-time TypeScript check
    // We'll render the TaskManager component which uses the undo/redo functionality
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <TaskManager />
      </TaskStateProvider>
    );
    
    // If this renders without TypeScript errors, the types are correct
    expect(screen.getByText(/Task Manager/i)).toBeInTheDocument();
  });
}); 