import { ReactNode } from 'react';
import { Task, TaskFormData } from './level2';
import { TaskFilter } from './level3';

export type TaskAction = 
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'SET_FILTER'; payload: TaskFilter }
  | { type: 'CLEAR_COMPLETED' };

export interface TaskState {
  tasks: Task[];
  filter: TaskFilter;
}

export interface TaskContextValue {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  addTask: (formData: TaskFormData) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setFilter: (filter: TaskFilter) => void;
  clearCompleted: () => void;
  filteredTasks: Task[];
}

export interface TaskProviderProps {
  children: ReactNode;
  initialTasks?: Task[];
} 