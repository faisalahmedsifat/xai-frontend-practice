# Level 9: Advanced State Management

## Learning Objectives

In this level, you'll learn:
- How to implement complex state shapes with TypeScript
- How to add undo/redo functionality to your application
- How to implement optimistic updates for a better user experience
- How to track and display task history
- How to properly type state changes and action creators

## Task Overview

Your task is to implement advanced state management patterns for a task management application:

1. Create a comprehensive state shape with proper TypeScript interfaces
2. Implement undo/redo functionality for task operations
3. Add optimistic updates for task actions
4. Create a task history feature that tracks all changes
5. Ensure all state management code is properly typed

## Requirements

### Complex State Shape
- Design a state structure that manages tasks, UI state, user preferences, and more
- Create comprehensive TypeScript interfaces for the state
- Implement proper type guards and type narrowing where needed
- Use TypeScript utility types (Partial, Pick, Omit, etc.) where appropriate

### Undo/Redo Functionality
- Implement a command pattern for tracking actions
- Create an action history stack for undo/redo operations
- Implement undo and redo functions
- Add UI controls for undoing and redoing actions
- Add proper TypeScript typing for all actions and commands

### Optimistic Updates
- Implement optimistic UI updates for task creation, editing, and deletion
- Add proper error handling for failed operations
- Create rollback mechanisms for when operations fail
- Ensure all optimistic update code is properly typed

### Task History
- Track the history of changes for each task
- Record who made changes and when
- Display task history in the UI
- Ensure the history feature has comprehensive TypeScript typing

## Tips

- Consider using TypeScript discriminated unions for action types
- Use the command pattern for implementing undo/redo
- Remember to handle edge cases like undo/redo limits
- Use TypeScript generics where appropriate to make your code reusable
- Consider using a state management library, but ensure you understand the core concepts first

## Tests

Run the tests for this level with:

```
npm run test:level9
```

All tests should pass when you've successfully implemented the advanced state management.

## Example Usage

### Complex State Shape with TypeScript
```tsx
// Example state shape with proper TypeScript typing
interface AppState {
  tasks: {
    byId: Record<string, Task>;
    allIds: string[];
    loading: boolean;
    error: string | null;
  };
  ui: {
    currentView: 'list' | 'grid';
    theme: 'light' | 'dark';
    selectedTaskId: string | null;
  };
  history: {
    past: Action[];
    future: Action[];
  };
}
```

### Undo/Redo Implementation
```tsx
// Action creator with undo capability
function updateTask(taskId: string, updates: Partial<Task>) {
  return (dispatch: Dispatch, getState: () => AppState) => {
    const originalTask = getState().tasks.byId[taskId];
    
    // Dispatch update action
    dispatch({
      type: 'UPDATE_TASK',
      payload: { taskId, updates }
    });
    
    // Record action for undo
    dispatch({
      type: 'RECORD_ACTION',
      payload: {
        action: 'UPDATE_TASK',
        undo: () => dispatch(restoreTask(taskId, originalTask))
      }
    });
  };
}

// Undo function
function undo() {
  return (dispatch: Dispatch, getState: () => AppState) => {
    const { past } = getState().history;
    
    if (past.length === 0) return;
    
    const lastAction = past[past.length - 1];
    
    // Execute the undo function
    lastAction.undo();
    
    // Update history
    dispatch({ type: 'UNDO' });
  };
}
```

### Optimistic Updates
```tsx
// Optimistic update for creating a task
function createTask(task: Omit<Task, 'id'>) {
  return async (dispatch: Dispatch) => {
    // Generate temporary ID
    const tempId = `temp-${Date.now()}`;
    
    // Optimistically add task
    dispatch({
      type: 'ADD_TASK',
      payload: { ...task, id: tempId }
    });
    
    try {
      // Actual API call
      const result = await api.createTask(task);
      
      // Update with real ID
      dispatch({
        type: 'UPDATE_TASK_ID',
        payload: { tempId, realId: result.id }
      });
    } catch (error) {
      // Rollback on error
      dispatch({
        type: 'REMOVE_TASK',
        payload: { id: tempId }
      });
      
      dispatch({
        type: 'SET_ERROR',
        payload: error.message
      });
    }
  };
}
```

### Task History
```tsx
// Recording task history
function recordTaskUpdate(taskId: string, changes: Partial<Task>) {
  return {
    type: 'RECORD_TASK_HISTORY',
    payload: {
      taskId,
      changes,
      timestamp: new Date().toISOString(),
      userId: getCurrentUserId()
    }
  };
}

// Component to display history
const TaskHistory: React.FC<{ taskId: string }> = ({ taskId }) => {
  const history = useSelector((state: AppState) => 
    state.tasks.byId[taskId]?.history || []
  );
  
  return (
    <div className="task-history">
      <h3>History</h3>
      <ul>
        {history.map((entry, index) => (
          <li key={index}>
            {entry.timestamp} - {entry.userId} changed {Object.keys(entry.changes).join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
};
``` 