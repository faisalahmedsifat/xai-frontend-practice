export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface TaskFormData {
  title: string;
}

export interface TaskFormProps {
  onAddTask: (task: Task) => void;
}

export interface TaskFormErrors {
  title?: string;
} 