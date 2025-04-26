# Level 2: State Management & Forms

## Learning Objectives

In this level, you'll learn:
- How to create and handle forms in React
- How to implement form validation
- How to manage complex state with TypeScript
- How to lift state up in a component hierarchy
- How to use controlled input components

## Task Overview

Your task is to implement two related components:

1. `TaskForm`: A form component to create new tasks
2. `TaskDisplay`: A component to display a list of tasks

These components will work together - the form will add tasks, and the display will show them.
<!-- something -->

## Requirements for TaskForm Component

- The component should render a form with a text input and submit button
- The input should be a controlled component (value managed by React state)
- Form validation should:
  - Prevent submission if the input is empty
  - Display an error message when validation fails
  - Clear the error when the user starts typing again
- On submission, the form should:
  - Call an `onAddTask` callback with a new task object
  - Clear the input field
  - Properly prevent the default form submission behavior
- The task object created should include:
  - A unique ID (you can use `Date.now()` or `Math.random()`)
  - The title from the input
  - A `completed` property set to `false`
  - A `createdAt` property with the current date

## Requirements for TaskDisplay Component

- The component should render a list of tasks
- Each task should display:
  - The task title
  - The creation date in a user-friendly format
  - Visual indication of completion status
- Tasks should use proper semantic HTML (like `<ul>` and `<li>`)
- The component should handle empty state gracefully with a message
- Completed tasks should be visually distinct
- The component should have proper accessibility attributes

## TypeScript Requirements

- All components should use the interfaces defined in `src/types/level2.ts`
- The component props should be properly typed
- The state should be properly typed
- Event handlers should use appropriate TypeScript event types

## Tips

- Examine the `Task`, `TaskFormData`, and `TaskFormProps` interfaces in the types folder
- Use controlled inputs with `value` and `onChange` props
- Remember to track form errors in your component state
- Format dates using `toLocaleDateString()` or a similar method
- Make sure your components are properly accessible

## Tests

Run the tests for this level with:

```
npm run test:level2
```

All tests should pass when you've successfully implemented the components.

## Example Usage

```tsx
import React, { useState } from 'react';
import { Task } from '../types';
import TaskForm from './TaskForm';
import TaskDisplay from './TaskDisplay';

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const handleAddTask = (task: Task) => {
    setTasks([...tasks, task]);
  };
  
  return (
    <div>
      <h1>Task Manager</h1>
      <TaskForm onAddTask={handleAddTask} />
      <TaskDisplay tasks={tasks} />
    </div>
  );
}; 