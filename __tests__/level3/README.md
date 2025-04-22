# Level 3: Component Composition

## Learning Objectives

In this level, you'll learn:
- How to break down UI into smaller, reusable components
- How to compose components together to build complex interfaces
- How to pass data and callbacks between parent and child components
- How to implement component interfaces with TypeScript
- How to implement filtering functionality

## Task Overview

Your task is to implement a complete task management interface with three components that work together:

1. `Task`: An individual task component that renders a single task item
2. `TaskList`: A component that renders a list of Task components
3. `TaskFilter`: A component that provides filtering options for tasks

## Requirements for Task Component

- Should render a single task with:
  - The task title
  - A checkbox to toggle completion status
  - A delete button
  - Formatted creation date
- Should apply visual styling based on the task's completion status
- Should call appropriate callbacks when:
  - The checkbox is toggled
  - The delete button is clicked
- Should implement proper accessibility attributes and keyboard navigation

## Requirements for TaskList Component

- Should render a list of Task components
- Should map over the provided tasks array and render a Task component for each
- Should pass the appropriate props to each Task component
- Should display a message when there are no tasks
- Should use proper list semantics with ul/li elements
- Should properly handle all callbacks from child Task components

## Requirements for TaskFilter Component

- Should render filter buttons for three states: "all", "active", and "completed"
- Should highlight the currently selected filter
- Should call a callback when a filter option is clicked
- Should display the count of tasks for each filter category
- Should have proper accessibility attributes and keyboard navigation
- Should style the selected filter to be visually distinct

## TypeScript Requirements

- Use the interfaces provided in `src/types/level3.ts`
- Ensure proper typing for all props and callbacks
- Use the TaskFilter type to correctly type the filter values

## Tips

- The TaskList component should be responsible for rendering the list structure
- The Task component should focus solely on rendering a single task item
- The TaskFilter component should be decoupled from the actual filtering logic
- When a user clicks a filter button, it should call the onFilterChange callback
- Pay attention to the types for each component's props
- Make sure to implement proper event delegation
- Keep your components focused on single responsibilities

## Tests

Run the tests for this level with:

```
npm run test:level3
```

All tests should pass when you've successfully implemented the components.

## Example Usage

```tsx
import React, { useState } from 'react';
import { Task, TaskFilter } from '../types';
import TaskList from './TaskList';
import TaskFilter from './TaskFilter';

const TaskApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Learn React', completed: false, createdAt: new Date() }
  ]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  
  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  const handleDelete = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all' filter
  });
  
  const counts = {
    all: tasks.length,
    active: tasks.filter(task => !task.completed).length,
    completed: tasks.filter(task => task.completed).length
  };
  
  return (
    <div>
      <h1>Task Manager</h1>
      <TaskFilter 
        currentFilter={filter} 
        onFilterChange={setFilter} 
        counts={counts} 
      />
      <TaskList 
        tasks={filteredTasks} 
        onToggleComplete={handleToggleComplete} 
        onDelete={handleDelete} 
      />
    </div>
  );
};
``` 