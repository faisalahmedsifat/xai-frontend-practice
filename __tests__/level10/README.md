# Level 10: Integration & Advanced Features

## Learning Objectives

In this level, you'll learn:
- How to implement drag and drop for tasks using React DnD
- How to create data visualizations for task statistics
- How to implement virtualized lists for performance
- How to add keyboard shortcuts and accessibility features
- How to create a theme switcher with proper TypeScript typing
- How to integrate and type third-party libraries correctly

## Task Overview

Your task is to implement advanced features for a task management application:

1. Create a drag and drop interface for reordering tasks
2. Implement data visualizations for task statistics
3. Use virtualized lists for rendering large task collections
4. Add keyboard shortcuts and accessibility features
5. Create a theme switcher with dark and light modes
6. Ensure all features have proper TypeScript typing

## Requirements

### Drag and Drop
- Implement drag and drop for tasks using React DnD
- Allow reordering tasks within a list
- Allow moving tasks between different lists (e.g., between different status columns)
- Add visual feedback during dragging
- Implement proper TypeScript interfaces for drag sources and drop targets

### Data Visualization
- Create charts to visualize task completion statistics
- Implement a burndown chart for tracking progress
- Add task distribution visualization by priority and status
- Make visualizations responsive and interactive
- Use proper TypeScript typing for all visualization components

### Virtualized Lists
- Implement virtualized rendering for large task lists
- Ensure smooth scrolling performance with hundreds of tasks
- Maintain proper keyboard navigation in virtualized lists
- Add proper loading states for delayed content
- Type all virtualization components correctly

### Keyboard Shortcuts & Accessibility
- Add keyboard shortcuts for common actions (add, edit, delete tasks)
- Implement focus management for forms and interactive elements
- Ensure proper ARIA attributes for all components
- Add screen reader announcements for dynamic content changes
- Type all keyboard and accessibility features properly

### Theme Switcher
- Create a theme switcher between light and dark modes
- Implement a comprehensive theme object with TypeScript
- Use CSS variables or styled-components theming
- Persist theme preference
- Ensure all components respond correctly to theme changes

## Tips

- Use established libraries like React DnD for drag and drop
- Consider recharts, Victory, or D3 for data visualization
- Use react-window or react-virtualized for virtualized lists
- Use useContext for theme implementation
- Test all features with keyboard-only navigation
- Create comprehensive TypeScript interfaces for all features

## Tests

Run the tests for this level with:

```
npm run test:level10
```

All tests should pass when you've successfully implemented the advanced features.

## Example Usage

### Drag and Drop Example
```tsx
import { useDrag, useDrop } from 'react-dnd';

const TaskItem: React.FC<TaskItemProps> = ({ task, index, moveTask }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'TASK',
    hover: (item: { id: string; index: number }) => {
      if (item.index !== index) {
        moveTask(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div 
      ref={(node) => drag(drop(node))} 
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {task.title}
    </div>
  );
};
```

### Data Visualization Example
```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const TaskStatistics: React.FC<TaskStatisticsProps> = ({ tasks }) => {
  const data = [
    { name: 'Completed', count: tasks.filter(t => t.status === 'completed').length },
    { name: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length },
    { name: 'Pending', count: tasks.filter(t => t.status === 'pending').length },
  ];

  return (
    <BarChart width={500} height={300} data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" fill="#8884d8" />
    </BarChart>
  );
};
```

### Virtualized List Example
```tsx
import { FixedSizeList } from 'react-window';

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <TaskItem task={tasks[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={500}
      width={400}
      itemCount={tasks.length}
      itemSize={50}
    >
      {Row}
    </FixedSizeList>
  );
};
```

### Keyboard Shortcuts Example
```tsx
import { useHotkeys } from 'react-hotkeys-hook';

const TaskBoard: React.FC = () => {
  const { addTask, deleteTask } = useTaskActions();
  
  // Add task with Ctrl+A
  useHotkeys('ctrl+a', (event) => {
    event.preventDefault();
    addTask({ title: 'New Task', status: 'pending' });
  });
  
  // Delete selected task with Delete key
  useHotkeys('delete', (event) => {
    if (selectedTaskId) {
      event.preventDefault();
      deleteTask(selectedTaskId);
    }
  });

  return (
    <div>
      <h1>Task Board</h1>
      {/* Task board content */}
    </div>
  );
};
```

### Theme Switcher Example
```tsx
import { createContext, useContext, useState } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: 'light',
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`app-container ${theme}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
``` 