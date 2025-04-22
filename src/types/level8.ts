import { Task } from './level2';

export interface RouteParams {
  id: string;
}

export interface TaskDetailParams {
  taskId: string;
}

export interface DashboardPageProps {
  tasks: Task[];
}

export interface TaskDetailPageProps {
  task: Task | null;
  isLoading: boolean;
  error: string | null;
}

export interface SettingsPageProps {
  settings: TaskSettings;
  onUpdateSettings: (settings: Partial<TaskSettings>) => void;
}

export interface TaskSettings {
  theme: 'light' | 'dark' | 'system';
  showCompletedTasks: boolean;
  defaultTaskView: 'list' | 'kanban';
  notificationsEnabled: boolean;
}

export interface ProtectedRouteProps {
  isAuthenticated: boolean;
  redirectPath: string;
} 