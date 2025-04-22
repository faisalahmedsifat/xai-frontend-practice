import { Task } from './level2';
import { TaskAction } from './level4';

export interface HistoryEntry {
  state: AdvancedTaskState;
  action: TaskAction;
  timestamp: number;
}

export interface AdvancedTaskState {
  tasks: Task[];
  categories: TaskCategory[];
  tags: string[];
  selectedTask: string | null;
  selectedCategory: string | null;
  selectedTags: string[];
  view: 'list' | 'kanban' | 'calendar';
  sortBy: keyof Task;
  sortDirection: 'asc' | 'desc';
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
}

export interface TaskTag {
  id: string;
  name: string;
}

export interface TaskWithDetails extends Task {
  description: string;
  categoryId: string | null;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
}

export interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface OptimisticUpdateOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  rollbackAction: TaskAction;
} 