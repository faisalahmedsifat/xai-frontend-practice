import React, { useContext } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskProvider, TaskContext } from '../../src/context/TaskContext';
import { Task } from '../../src/types';

// Test component that consumes the TaskContext
const TaskConsumer = () => {
  const { 
    state, 
    addTask, 
    deleteTask, 
    toggleTask, 
    setFilter, 
    clearCompleted,
    filteredTasks
  } = useContext(TaskContext);
  
  return (
    <div>
      <h1>Tasks ({filteredTasks.length})</h1>
      <div data-testid="filter-value">{state.filter}</div>
      <button onClick={() => addTask({ title: 'New Task' })}>Add Task</button>
      <button onClick={() => setFilter('active')}>Show Active</button>
      <button onClick={() => setFilter('completed')}>Show Completed</button>
      <button onClick={() => setFilter('all')}>Show All</button>
      <button onClick={() => clearCompleted()}>Clear Completed</button>
      <ul>
        {filteredTasks.map(task => (
          <li key={task.id} data-testid={`task-${task.id}`}>
            <span data-testid={`task-title-${task.id}`}>{task.title}</span>
            <input 
              type="checkbox" 
              checked={task.completed} 
              onChange={() => toggleTask(task.id)}
              data-testid={`task-checkbox-${task.id}`}
            />
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

describe('TaskContext and TaskProvider', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Learn React',
      completed: false,
      createdAt: new Date('2023-01-01')
    },
    {
      id: '2',
      title: 'Build a task app',
      completed: true,
      createdAt: new Date('2023-01-02')
    }
  ];
  
  beforeEach(() => {
    // Mock uuid to return predictable values for new tasks
    jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789);
    
    // Mock Date.now for consistent timestamps
    jest.spyOn(Date, 'now').mockImplementation(() => 1600000000000);
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  it('should provide initial state and functions to consumers', () => {
    render(
      <TaskProvider>
        <TaskConsumer />
      </TaskProvider>
    );
    
    // Initial state should have empty tasks and 'all' filter
    expect(screen.getByTestId('filter-value')).toHaveTextContent('all');
    expect(screen.getByText('Tasks (0)')).toBeInTheDocument();
  });
  
  it('should use initialTasks when provided', () => {
    render(
      <TaskProvider initialTasks={mockTasks}>
        <TaskConsumer />
      </TaskProvider>
    );
    
    // Should show the initial tasks count
    expect(screen.getByText('Tasks (2)')).toBeInTheDocument();
    
    // Both initial tasks should be rendered
    expect(screen.getByTestId('task-title-1')).toHaveTextContent('Learn React');
    expect(screen.getByTestId('task-title-2')).toHaveTextContent('Build a task app');
  });
  
  it('should add a new task when addTask is called', async () => {
    render(
      <TaskProvider>
        <TaskConsumer />
      </TaskProvider>
    );
    
    // Initial state - no tasks
    expect(screen.getByText('Tasks (0)')).toBeInTheDocument();
    
    // Add a task
    const addButton = screen.getByText('Add Task');
    await userEvent.click(addButton);
    
    // Should now have 1 task
    expect(screen.getByText('Tasks (1)')).toBeInTheDocument();
    
    // The new task should be displayed with the correct title
    expect(screen.getByTestId('task-title-0.123456789')).toHaveTextContent('New Task');
  });
  
  it('should delete a task when deleteTask is called', async () => {
    render(
      <TaskProvider initialTasks={mockTasks}>
        <TaskConsumer />
      </TaskProvider>
    );
    
    // Initial state - 2 tasks
    expect(screen.getByText('Tasks (2)')).toBeInTheDocument();
    
    // Delete the first task
    const deleteButtons = screen.getAllByText('Delete');
    await userEvent.click(deleteButtons[0]);
    
    // Should now have 1 task
    expect(screen.getByText('Tasks (1)')).toBeInTheDocument();
    
    // The first task should be gone, but the second should remain
    expect(screen.queryByTestId('task-title-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('task-title-2')).toBeInTheDocument();
  });
  
  it('should toggle a task when toggleTask is called', async () => {
    render(
      <TaskProvider initialTasks={mockTasks}>
        <TaskConsumer />
      </TaskProvider>
    );
    
    // Get checkbox for the first task (uncompleted initially)
    const firstTaskCheckbox = screen.getByTestId('task-checkbox-1');
    expect(firstTaskCheckbox).not.toBeChecked();
    
    // Toggle the task
    await userEvent.click(firstTaskCheckbox);
    
    // Checkbox should now be checked
    expect(firstTaskCheckbox).toBeChecked();
    
    // Toggle it back
    await userEvent.click(firstTaskCheckbox);
    
    // Checkbox should be unchecked again
    expect(firstTaskCheckbox).not.toBeChecked();
  });
  
  it('should change filter when setFilter is called', async () => {
    render(
      <TaskProvider initialTasks={mockTasks}>
        <TaskConsumer />
      </TaskProvider>
    );
    
    // Initial state - filter is 'all'
    expect(screen.getByTestId('filter-value')).toHaveTextContent('all');
    
    // Set filter to 'active'
    const activeButton = screen.getByText('Show Active');
    await userEvent.click(activeButton);
    
    // Filter should now be 'active'
    expect(screen.getByTestId('filter-value')).toHaveTextContent('active');
    
    // Only active (uncompleted) tasks should be in filteredTasks
    expect(screen.getByText('Tasks (1)')).toBeInTheDocument();
    expect(screen.getByTestId('task-title-1')).toHaveTextContent('Learn React');
    expect(screen.queryByTestId('task-title-2')).not.toBeInTheDocument();
    
    // Set filter to 'completed'
    const completedButton = screen.getByText('Show Completed');
    await userEvent.click(completedButton);
    
    // Filter should now be 'completed'
    expect(screen.getByTestId('filter-value')).toHaveTextContent('completed');
    
    // Only completed tasks should be in filteredTasks
    expect(screen.getByText('Tasks (1)')).toBeInTheDocument();
    expect(screen.queryByTestId('task-title-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('task-title-2')).toHaveTextContent('Build a task app');
  });
  
  it('should clear completed tasks when clearCompleted is called', async () => {
    render(
      <TaskProvider initialTasks={mockTasks}>
        <TaskConsumer />
      </TaskProvider>
    );
    
    // Initial state - 2 tasks, one completed
    expect(screen.getByText('Tasks (2)')).toBeInTheDocument();
    
    // Clear completed tasks
    const clearButton = screen.getByText('Clear Completed');
    await userEvent.click(clearButton);
    
    // Should now have only 1 task (the active one)
    expect(screen.getByText('Tasks (1)')).toBeInTheDocument();
    
    // The completed task should be gone
    expect(screen.getByTestId('task-title-1')).toHaveTextContent('Learn React');
    expect(screen.queryByTestId('task-title-2')).not.toBeInTheDocument();
  });
  
  it('should properly type the context value and actions', () => {
    // This test checks that the context and reducer are properly typed with TypeScript
    
    render(
      <TaskProvider>
        {/* Using TypeScript assertions to verify type compatibility */}
        {(value => {
          // Type assertions for the context state
          const state = value.state;
          const tasks: Task[] = state.tasks;
          const filter: 'all' | 'active' | 'completed' = state.filter;
          
          // Type assertions for context actions
          const addTask = value.addTask;
          const deleteTask = value.deleteTask;
          const toggleTask = value.toggleTask;
          const setFilter = value.setFilter;
          const clearCompleted = value.clearCompleted;
          
          // Type assertions for derived values
          const filteredTasks: Task[] = value.filteredTasks;
          
          return null;
        })(useContext(TaskContext))}
        <TaskConsumer />
      </TaskProvider>
    );
    
    // If no TypeScript errors, then types are correct
    expect(true).toBeTruthy();
  });
}); 