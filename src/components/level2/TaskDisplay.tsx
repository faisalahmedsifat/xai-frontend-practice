import React from 'react';
import { Task } from '@/types';

/**
 * Component to display a list of tasks
 * 
 * This is a starter implementation for Level 2.
 * Your task is to implement the task display functionality.
 */
interface TaskDisplayProps {
  tasks: Task[];
}

const TaskDisplay: React.FC<TaskDisplayProps> = ({ tasks }) => {
  // TODO: Implement task display logic
  
  if (tasks.length === 0) {
    return <div className="empty-state">No tasks yet. Add a new task to get started.</div>;
  }
  
  return (
    <ul aria-label="Task list">
      {tasks.map(task => (
        <li 
          key={task.id}
          className={task.completed ? 'completed' : ''}
          aria-checked={task.completed ? 'true' : 'false'}
        >
          <div className="task-title">{task.title}</div>
          <div className="task-date">
            {/* TODO: Format the date properly */}
            {task.createdAt.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TaskDisplay; 