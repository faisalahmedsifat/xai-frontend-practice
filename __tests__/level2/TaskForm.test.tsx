import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../../src/components/level2/TaskForm';
import { Task } from '../../src/types';

describe('TaskForm Component', () => {
  const mockOnAddTask = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now() to return a consistent timestamp for testing
    jest.spyOn(Date, 'now').mockImplementation(() => 1600000000000);
  });
  
  it('should render a form with input and submit button', () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);
    
    // Form should be in document
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
    
    // Input should be in document
    const input = screen.getByPlaceholderText(/add a task/i);
    expect(input).toBeInTheDocument();
    
    // Submit button should be in document
    const submitButton = screen.getByRole('button', { name: /add/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });
  
  it('should update input value when typing', async () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);
    
    const input = screen.getByPlaceholderText(/add a task/i);
    await userEvent.type(input, 'Buy groceries');
    
    expect(input).toHaveValue('Buy groceries');
  });
  
  it('should submit the form and call onAddTask with correct data', async () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);
    
    // Type in the input
    const input = screen.getByPlaceholderText(/add a task/i);
    await userEvent.type(input, 'Buy groceries');
    
    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Check that onAddTask was called with the correct data
    expect(mockOnAddTask).toHaveBeenCalledTimes(1);
    expect(mockOnAddTask).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Buy groceries',
      completed: false,
    }));
    
    // The task should include an id and createdAt
    const calledTask = mockOnAddTask.mock.calls[0][0] as Task;
    expect(calledTask.id).toBeTruthy();
    expect(calledTask.createdAt).toBeInstanceOf(Date);
  });
  
  it('should clear the input after form submission', async () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);
    
    // Type in the input
    const input = screen.getByPlaceholderText(/add a task/i);
    await userEvent.type(input, 'Buy groceries');
    
    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Input should be cleared
    expect(input).toHaveValue('');
  });
  
  it('should not submit the form if the input is empty', async () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);
    
    // Submit the form without typing anything
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // onAddTask should not have been called
    expect(mockOnAddTask).not.toHaveBeenCalled();
  });
  
  it('should show validation error if the input is empty', async () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);
    
    // Submit the form without typing anything
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Error message should be in document
    const errorMessage = screen.getByText(/task title is required/i);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('error-message');
  });
  
  it('should remove validation error when typing starts', async () => {
    render(<TaskForm onAddTask={mockOnAddTask} />);
    
    // Submit the form without typing anything to trigger error
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Error message should be in document
    const errorMessage = screen.getByText(/task title is required/i);
    expect(errorMessage).toBeInTheDocument();
    
    // Type in the input
    const input = screen.getByPlaceholderText(/add a task/i);
    await userEvent.type(input, 'B');
    
    // Error message should no longer be in document
    expect(screen.queryByText(/task title is required/i)).not.toBeInTheDocument();
  });
  
  it('should have the proper TypeScript props', () => {
    // This is a compile-time test to ensure the component accepts the correct props
    // If TaskForm doesn't conform to TaskFormProps, TypeScript will show an error
    // Not an actual runtime test, but validates TypeScript implementation
    
    render(<TaskForm onAddTask={(task) => {
      // Type checking for the task parameter
      const id: string = task.id;
      const title: string = task.title;
      const completed: boolean = task.completed;
      const createdAt: Date = task.createdAt;
    }} />);
    
    // If no TypeScript error, this test passes
    expect(true).toBeTruthy();
  });
}); 