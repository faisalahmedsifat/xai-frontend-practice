# Level 6: Advanced Component Patterns

## Learning Objectives

In this level, you'll learn:
- How to implement compound components pattern
- How to use render props for flexible component behavior
- How to create higher-order components (HOCs) for code reuse
- How to use TypeScript generics with advanced component patterns
- How to create flexible and reusable component architectures

## Task Overview

Your task is to implement several advanced component patterns for task management:

1. A compound component for task categories using React Context
2. A render props pattern for task statistics visualization
3. A higher-order component for task sorting

## Requirements

### Compound Components
- Implement a `TaskCategory` component that uses the compound component pattern
- Create subcomponents (`TaskCategory.Title`, `TaskCategory.List`, `TaskCategory.Footer`) that work together
- Use React Context to share state between the parent component and its children
- Implement proper TypeScript interfaces for all components

### Render Props
- Create a `TaskStatistics` component that uses the render props pattern
- The component should calculate statistics about tasks (completion percentages, due dates, etc.)
- It should accept a render function as a child or prop that determines how to display the statistics
- Use TypeScript to properly type the render function and statistics data

### Higher-Order Components
- Create a `withTaskSorting` HOC that adds sorting capabilities to any task list component
- The HOC should allow sorting by different criteria (date, priority, alphabetical)
- Implement proper TypeScript generics for the HOC

## Tips

- For compound components, use React.createContext to share state
- For render props, focus on separation of logic and presentation
- For HOCs, use TypeScript generics to preserve the wrapped component's props
- Make sure all components are properly typed with TypeScript
- Remember that HOCs should follow the naming convention `with[Feature]`

## Tests

Run the tests for this level with:

```
npm run test:level6
```

All tests should pass when you've successfully implemented the components.

## Example Usage

### Compound Components Example
```tsx
<TaskCategory id="urgent">
  <TaskCategory.Title>Urgent Tasks</TaskCategory.Title>
  <TaskCategory.List tasks={urgentTasks} />
  <TaskCategory.Footer>
    <TaskCategory.Count />
  </TaskCategory.Footer>
</TaskCategory>
```

### Render Props Example
```tsx
<TaskStatistics tasks={tasks}>
  {(stats) => (
    <div>
      <p>Completed: {stats.completedPercentage}%</p>
      <p>Overdue: {stats.overdueCount}</p>
    </div>
  )}
</TaskStatistics>
```

### HOC Example
```tsx
const SortableTaskList = withTaskSorting(TaskList);

<SortableTaskList 
  tasks={tasks} 
  sortBy="dueDate" 
  sortDirection="asc" 
/>
``` 