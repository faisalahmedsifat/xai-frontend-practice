# Level 5: Custom Hooks

## Learning Objectives

In this level, you'll learn:
- How to create and use custom React hooks
- How to abstract complex logic from components
- How to create reusable stateful logic
- How to properly type custom hooks with TypeScript
- How to test custom hooks

## Task Overview

Your task is to implement three custom hooks that encapsulate common functionality:

1. `useTaskForm`: A hook for managing form state, validation, and submission
2. `useTaskFilter`: A hook for filtering tasks by status
3. `useLocalStorage`: A hook for persisting and retrieving data from localStorage

These hooks will make your components cleaner by extracting logic into reusable functions.

## Requirements for useTaskForm

- Should manage form data state for task creation
- Should validate form data and track validation errors
- Should provide handlers for form changes and submission
- Should call an onSubmit callback when the form is valid and submitted
- Should track whether the form is currently valid
- Should provide a reset method to clear the form
- Should accept optional initial data and validation function
- Should properly type all inputs and outputs with TypeScript

## Requirements for useTaskFilter

- Should manage the current filter state
- Should provide a method to update the filter
- Should filter tasks according to the current filter setting
- Should calculate and provide counts for all filter categories
- Should properly type all inputs and outputs with TypeScript

## Requirements for useLocalStorage

- Should persist and retrieve data from localStorage
- Should work with any data type (objects, arrays, primitives)
- Should synchronize state with localStorage
- Should handle localStorage errors gracefully
- Should work like useState, returning the current value and a setter
- Should be strongly typed with TypeScript generics
- Should accept optional serialization/deserialization functions
- Should work with functional state updates

## TypeScript Requirements

- Use the interfaces from `src/types/level5.ts`
- Implement proper generic typing for useLocalStorage
- Ensure proper typing for all hook parameters and return values
- Type all callback functions and event handlers correctly

## Tips

- Start by examining the type definitions in `types/level5.ts`
- The useTaskForm hook should provide similar functionality to a form library
- The useTaskFilter hook can build on the filtering logic from previous levels
- The useLocalStorage hook should handle JSON serialization internally
- Remember to handle edge cases like parsing errors in localStorage
- Test your hooks by creating components that use them
- Use TypeScript generics to make your hooks flexible

## Tests

Run the tests for this level with:

```
npm run test:level5
```

All tests should pass when you've successfully implemented the hooks.

## Example Usage

### useTaskForm

```tsx
const TaskFormComponent: React.FC = () => {
  const { formData, errors, isValid, handleChange, handleSubmit, resetForm } = useTaskForm({
    onSubmit: (data) => {
      console.log('Form submitted:', data);
    },
    validate: (data) => {
      const errors: { title?: string } = {};
      if (!data.title) {
        errors.title = 'Title is required';
      }
      return errors;
    }
  });
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Task title"
      />
      {errors.title && <span>{errors.title}</span>}
      <button type="submit" disabled={!isValid}>Add Task</button>
    </form>
  );
};
```

### useTaskFilter

```tsx
const TaskFilterComponent: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const { filter, setFilter, filteredTasks, counts } = useTaskFilter(tasks);
  
  return (
    <div>
      <div>
        <button onClick={() => setFilter('all')}>
          All ({counts.all})
        </button>
        <button onClick={() => setFilter('active')}>
          Active ({counts.active})
        </button>
        <button onClick={() => setFilter('completed')}>
          Completed ({counts.completed})
        </button>
      </div>
      <ul>
        {filteredTasks.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
};
```

### useLocalStorage

```tsx
const PersistentCounter: React.FC = () => {
  const [count, setCount] = useLocalStorage({
    key: 'counter',
    initialValue: 0
  });
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
};
``` 