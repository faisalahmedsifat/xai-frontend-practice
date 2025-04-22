import { taskReducer } from '../../src/context/TaskReducer';
import { TaskState, TaskAction } from '../../src/types';
import { Task } from '../../src/types';

describe('TaskReducer', () => {
  const mockTask1: Task = {
    id: '1',
    title: 'Learn React',
    completed: false,
    createdAt: new Date('2023-01-01')
  };
  
  const mockTask2: Task = {
    id: '2',
    title: 'Build a task app',
    completed: true,
    createdAt: new Date('2023-01-02')
  };
  
  const initialState: TaskState = {
    tasks: [mockTask1, mockTask2],
    filter: 'all'
  };
  
  it('should add a task when ADD_TASK action is dispatched', () => {
    const newTask: Task = {
      id: '3',
      title: 'Write tests',
      completed: false,
      createdAt: new Date('2023-01-03')
    };
    
    const action: TaskAction = {
      type: 'ADD_TASK',
      payload: newTask
    };
    
    const newState = taskReducer(initialState, action);
    
    // Should add the new task to the tasks array
    expect(newState.tasks).toHaveLength(3);
    expect(newState.tasks).toContainEqual(newTask);
    
    // Should preserve the existing tasks
    expect(newState.tasks).toContainEqual(mockTask1);
    expect(newState.tasks).toContainEqual(mockTask2);
    
    // Should not modify the filter
    expect(newState.filter).toBe('all');
  });
  
  it('should delete a task when DELETE_TASK action is dispatched', () => {
    const action: TaskAction = {
      type: 'DELETE_TASK',
      payload: '1' // ID of the task to delete
    };
    
    const newState = taskReducer(initialState, action);
    
    // Should remove the task with the given ID
    expect(newState.tasks).toHaveLength(1);
    expect(newState.tasks).not.toContainEqual(mockTask1);
    expect(newState.tasks).toContainEqual(mockTask2);
    
    // Should not modify the filter
    expect(newState.filter).toBe('all');
  });
  
  it('should toggle a task when TOGGLE_TASK action is dispatched', () => {
    const action: TaskAction = {
      type: 'TOGGLE_TASK',
      payload: '1' // ID of the task to toggle
    };
    
    const newState = taskReducer(initialState, action);
    
    // Should toggle the completed status of the task with the given ID
    expect(newState.tasks).toHaveLength(2);
    
    // First task should now be completed
    const toggledTask = newState.tasks.find(task => task.id === '1');
    expect(toggledTask).toBeDefined();
    expect(toggledTask?.completed).toBe(true);
    
    // Second task should remain unchanged
    const unchangedTask = newState.tasks.find(task => task.id === '2');
    expect(unchangedTask).toBeDefined();
    expect(unchangedTask?.completed).toBe(true);
    
    // Should not modify the filter
    expect(newState.filter).toBe('all');
  });
  
  it('should set filter when SET_FILTER action is dispatched', () => {
    const action: TaskAction = {
      type: 'SET_FILTER',
      payload: 'active'
    };
    
    const newState = taskReducer(initialState, action);
    
    // Filter should be updated
    expect(newState.filter).toBe('active');
    
    // Tasks should remain unchanged
    expect(newState.tasks).toHaveLength(2);
    expect(newState.tasks).toContainEqual(mockTask1);
    expect(newState.tasks).toContainEqual(mockTask2);
  });
  
  it('should clear completed tasks when CLEAR_COMPLETED action is dispatched', () => {
    const action: TaskAction = {
      type: 'CLEAR_COMPLETED'
    };
    
    const newState = taskReducer(initialState, action);
    
    // Should remove all completed tasks
    expect(newState.tasks).toHaveLength(1);
    expect(newState.tasks).toContainEqual(mockTask1);
    expect(newState.tasks).not.toContainEqual(mockTask2);
    
    // Should not modify the filter
    expect(newState.filter).toBe('all');
  });
  
  it('should return the current state for unknown action types', () => {
    // @ts-ignore - Testing with an invalid action type
    const action: TaskAction = {
      type: 'UNKNOWN_ACTION'
    };
    
    const newState = taskReducer(initialState, action);
    
    // State should remain unchanged
    expect(newState).toEqual(initialState);
  });
  
  it('should handle an empty initial state', () => {
    const emptyState: TaskState = {
      tasks: [],
      filter: 'all'
    };
    
    const action: TaskAction = {
      type: 'SET_FILTER',
      payload: 'completed'
    };
    
    const newState = taskReducer(emptyState, action);
    
    // Filter should be updated
    expect(newState.filter).toBe('completed');
    
    // Tasks should remain empty
    expect(newState.tasks).toHaveLength(0);
  });
  
  it('should not modify the original state', () => {
    const originalState = { ...initialState };
    
    const action: TaskAction = {
      type: 'DELETE_TASK',
      payload: '1'
    };
    
    taskReducer(initialState, action);
    
    // Original state should remain unchanged
    expect(initialState).toEqual(originalState);
  });
}); 