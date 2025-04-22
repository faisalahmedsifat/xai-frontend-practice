import React from 'react';
import { Task } from '@/types';

/**
 * Component for adding new tasks
 * 
 * This is a starter implementation for Level 2.
 * Your task is to implement the form validation and submission.
 */
interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  // TODO: Implement form state using useState
  // TODO: Implement validation logic
  // TODO: Implement form submission handler
  
  return (
    <form className="task-form">
      <div className="form-group">
        <label htmlFor="taskTitle">Task</label>
        <input 
          type="text"
          id="taskTitle"
          name="title"
          placeholder="Enter a task..."
          // TODO: Add value, onChange, and other necessary props
        />
        {/* TODO: Add error message display when validation fails */}
      </div>
      
      <div className="form-group">
        <label htmlFor="taskCompleted">
          <input 
            type="checkbox"
            id="taskCompleted"
            name="completed"
            // TODO: Add checked, onChange, and other necessary props
          />
          Completed
        </label>
      </div>
      
      <button 
        type="submit"
        className="submit-button"
        // TODO: Add onClick handler
      >
        Add Task
      </button>
    </form>
  );
};

export default TaskForm; 