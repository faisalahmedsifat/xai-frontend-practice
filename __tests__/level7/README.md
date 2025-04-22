# Level 7: Performance Optimization

## Learning Objectives

In this level, you'll learn:
- How to prevent unnecessary re-renders with React.memo
- How to optimize event handlers with useCallback
- How to memoize expensive calculations with useMemo
- How to implement code splitting with React.lazy and Suspense
- How to properly type all performance optimizations with TypeScript

## Task Overview

Your task is to optimize a task dashboard that suffers from performance issues. You'll need to:

1. Implement React.memo to prevent unnecessary re-renders of TaskItem components
2. Use useCallback for event handlers to maintain referential equality
3. Apply useMemo for expensive calculations like task filtering and statistics
4. Implement code splitting for dashboard sections using React.lazy and Suspense
5. Ensure all optimizations have proper TypeScript typing

## Requirements

### React.memo
- Optimize `TaskItem` component with React.memo
- Implement a proper comparison function to check only relevant props
- Add proper TypeScript typing for the memoized component

### useCallback
- Implement useCallback for all event handlers (task toggle, delete, edit)
- Properly handle dependencies array
- Ensure proper TypeScript typing for callback functions

### useMemo
- Create a useMemo hook for expensive task filtering operations
- Implement useMemo for calculating task statistics
- Use proper dependency arrays to control when recalculations happen
- Add complete TypeScript typing

### Code Splitting
- Implement React.lazy for loading dashboard sections (TaskBoard, Statistics, Settings)
- Create a Suspense boundary with appropriate fallback UI
- Add error boundaries to handle loading failures
- Ensure proper TypeScript typing for lazy-loaded components

## Tips

- Use the React DevTools Profiler to identify unnecessary re-renders
- Be careful with the dependencies array in useCallback and useMemo
- Remember that React.memo accepts a custom comparison function as a second parameter
- For code splitting, consider the user experience of loading states
- Ensure TypeScript types are maintained across all optimizations

## Tests

Run the tests for this level with:

```
npm run test:level7
```

All tests should pass when you've successfully implemented the optimizations.

## Example Usage

### React.memo Example
```tsx
// Before optimization
const TaskItem: React.FC<TaskItemProps> = (props) => {
  // Component implementation
};

// After optimization
const TaskItem: React.FC<TaskItemProps> = React.memo((props) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.title === nextProps.title && 
         prevProps.completed === nextProps.completed;
});
```

### useCallback Example
```tsx
// Before optimization
const handleTaskToggle = (id: string) => {
  toggleTask(id);
};

// After optimization
const handleTaskToggle = useCallback((id: string) => {
  toggleTask(id);
}, [toggleTask]);
```

### useMemo Example
```tsx
// Before optimization
const filteredTasks = tasks.filter(task => task.priority === selectedPriority);

// After optimization
const filteredTasks = useMemo(() => {
  return tasks.filter(task => task.priority === selectedPriority);
}, [tasks, selectedPriority]);
```

### Code Splitting Example
```tsx
// Before optimization
import { TaskBoard } from './TaskBoard';
import { Statistics } from './Statistics';

// After optimization
const TaskBoard = React.lazy(() => import('./TaskBoard'));
const Statistics = React.lazy(() => import('./Statistics'));

const Dashboard: React.FC = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <TaskBoard />
    <Statistics />
  </Suspense>
);
``` 