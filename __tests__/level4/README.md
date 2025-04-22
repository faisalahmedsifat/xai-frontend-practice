# Level 4: Context API

## Learning Objectives

In this level, you'll learn:
- How to use React's Context API to manage global state
- How to implement a reducer pattern for complex state management
- How to create, provide, and consume context in a React application
- How to properly type context and reducers with TypeScript
- How to abstract business logic from UI components

## Task Overview

Your task is to implement a global state management system using React's Context API and the reducer pattern. You'll need to create:

1. `TaskContext.tsx`: A context provider to manage task state across components
2. `TaskReducer.ts`: A reducer function to handle state updates
3. Make sure both are properly typed with TypeScript

This will allow any component in your app to access and modify the task state without prop drilling.

## Requirements for TaskContext

- Should create a context with a well-defined interface (`TaskContextValue`)
- Should implement a provider component that wraps children
- Should use the reducer to manage state
- Should accept optional initial tasks through props
- Should provide the following functionality to consumers:
  - Access to the current state (tasks and filter)
  - A method to add a new task
  - A method to delete a task
  - A method to toggle a task's completion status
  - A method to set the current filter
  - A method to clear all completed tasks
  - Access to the filtered tasks based on the current filter
- Should properly type all state and actions with TypeScript

## Requirements for TaskReducer

- Should implement a pure reducer function that takes state and action
- Should handle the following action types:
  - `ADD_TASK`: Add a new task to the state
  - `DELETE_TASK`: Remove a task by ID
  - `TOGGLE_TASK`: Toggle a task's completed status
  - `SET_FILTER`: Update the current filter
  - `CLEAR_COMPLETED`: Remove all completed tasks
- Should never mutate the existing state, always return a new state object
- Should maintain proper TypeScript typings for state and actions
- Should handle unexpected action types by returning the current state

## TypeScript Requirements

- Use the interfaces from `src/types/level4.ts`
- Define a proper type for your action objects using discriminated unions
- Ensure the context value is properly typed with `TaskContextValue`
- Type the reducer parameters and return value correctly
- Use TypeScript generics for the context if appropriate

## Tips

- Start by examining the type definitions in `types/level4.ts`
- The context value should include both state and action methods
- Use `useReducer` inside your context provider to manage state
- Make helper methods in your context to wrap dispatch calls
- Provide the computed filtered tasks as part of the context value
- Remember that reducers should be pure functions with no side effects
- Test your implementation by wrapping a test component with your provider

## Tests

Run the tests for this level with:

```
npm run test:level4
```

All tests should pass when you've successfully implemented the context and reducer.

## Example Usage

```tsx
import React, { useContext } from 'react';
import { TaskProvider, TaskContext } from '../context/TaskContext';

const TaskItem: React.FC<{ id: string }> = ({ id }) => {
  const { state, toggleTask, deleteTask } = useContext(TaskContext);
  const task = state.tasks.find(t => t.id === id);
  
  if (!task) return null;
  
  return (
    <li>
      <input 
        type="checkbox" 
        checked={task.completed} 
        onChange={() => toggleTask(id)} 
      />
      <span>{task.title}</span>
      <button onClick={() => deleteTask(id)}>Delete</button>
    </li>
  );
};

const TaskApp: React.FC = () => {
  const { state, addTask, setFilter, filteredTasks } = useContext(TaskContext);
  
  return (
    <div>
      <button onClick={() => addTask({ title: 'New Task' })}>
        Add Task
      </button>
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('active')}>Active</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
      </div>
      <ul>
        {filteredTasks.map(task => (
          <TaskItem key={task.id} id={task.id} />
        ))}
      </ul>
    </div>
  );
};

const App: React.FC = () => (
  <TaskProvider>
    <TaskApp />
  </TaskProvider>
);
``` 