import { Task, TaskFormData, TaskFormErrors } from './level2';
import { TaskFilter } from './level3';

export interface UseTaskFormResult {
  formData: TaskFormData;
  errors: TaskFormErrors;
  isValid: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  resetForm: () => void;
}

export interface UseTaskFormOptions {
  onSubmit: (data: TaskFormData) => void;
  initialData?: TaskFormData;
  validate?: (data: TaskFormData) => TaskFormErrors;
}

export interface UseTaskFilterResult {
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
  filteredTasks: Task[];
  counts: {
    all: number;
    active: number;
    completed: number;
  };
}

export interface UseLocalStorageOptions<T> {
  key: string;
  initialValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
} 