import { ReactNode } from 'react';
import { Task } from './level2';
import { TaskFilter } from './level3';

export interface MemoizedTaskListProps {
  tasks: Task[];
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export interface MemoizedTaskProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export interface TaskEventHandlers {
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onPin: (id: string) => void;
}

export interface ExpensiveCalculationProps {
  tasks: Task[];
  filter: TaskFilter;
}

export interface LazyLoadedComponentProps {
  children?: ReactNode;
}

export interface TasksListingProps {
  tasks: Task[];
  isLoading?: boolean;
} 