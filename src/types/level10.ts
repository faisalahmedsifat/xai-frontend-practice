import { ReactNode } from 'react';
import { Task } from './level2';
import { TaskWithDetails } from './level9';

export interface DragItem {
  id: string;
  type: string;
  index: number;
}

export interface DragSourceProps {
  id: string;
  type: string;
  index: number;
  children: ReactNode;
}

export interface DropTargetProps {
  accept: string[];
  onDrop: (item: DragItem, targetIndex: number) => void;
  children: ReactNode;
}

export interface TaskStatisticsChartProps {
  tasks: Task[];
  period: 'day' | 'week' | 'month' | 'year';
  type: 'bar' | 'line' | 'pie';
}

export interface VirtualizedListProps {
  items: TaskWithDetails[];
  height: number;
  itemHeight: number;
  renderItem: (item: TaskWithDetails, index: number) => ReactNode;
}

export interface KeyboardShortcutProps {
  shortcut: string | string[];
  callback: (event: KeyboardEvent) => void;
  disabled?: boolean;
}

export interface ThemeSwitcherProps {
  theme: 'light' | 'dark' | 'system';
  onChange: (theme: 'light' | 'dark' | 'system') => void;
} 