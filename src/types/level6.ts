import { ReactNode } from 'react';
import { Task } from './level2';

// Compound Component Pattern
export interface TaskCategoryProps {
  children: ReactNode;
}

export interface TaskCategoryItemProps {
  category: string;
  icon?: ReactNode;
}

export interface TaskCategoryContextValue {
  activeCategory: string | null;
  setActiveCategory: (category: string) => void;
}

// Render Props Pattern
export interface TaskStatisticsProps<T = any> {
  tasks: Task[];
  render: (stats: TaskStatistics) => ReactNode;
}

export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  completionRate: number;
  averageTasksPerDay: number;
}

// Higher-Order Component Pattern
export interface TaskSortConfig {
  key: keyof Task;
  direction: 'asc' | 'desc';
}

export type SortableComponentProps = {
  tasks: Task[];
} & Record<string, any>;

export interface WithSortableTasksProps extends SortableComponentProps {
  sortConfig: TaskSortConfig;
  onSortChange: (key: keyof Task) => void;
} 