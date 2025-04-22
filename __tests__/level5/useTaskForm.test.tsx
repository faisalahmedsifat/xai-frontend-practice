import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook, act } from '@testing-library/react-hooks';
import { useTaskForm } from '@/hooks/useTaskForm';
import { TaskFormData } from '@/types';

// Test component that uses the useTaskForm hook
const TestComponent = () => {
  const { formData, errors, isValid, handleChange, handleSubmit, resetForm } = useTaskForm({
    onSubmit: (data) => {
      console.log('Form submitted:', data);
    },
    validate: (data) => {
      const errors: { title?: string } = {};
      if (!data.title) {
        errors.title = 'Title is required';
      } else if (data.title.length < 3) {
        errors.title = 'Title must be at least 3 characters';
      }
      return errors;
    }
  });
  
  return (
    <form 
      onSubmit={handleSubmit}
      data-testid="task-form"
      aria-label="Task form"
    >
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter task title"
        data-testid="title-input"
      />
      {errors.title && <span data-testid="title-error">{errors.title}</span>}
      <button 
        type="submit" 
        disabled={!isValid}
        data-testid="submit-button"
      >
        Add Task
      </button>
      <button 
        type="button" 
        onClick={resetForm}
        data-testid="reset-button"
      >
        Reset
      </button>
    </form>
  );
};

describe('useTaskForm Hook', () => {
  it('should initialize with empty form data and no errors', () => {
    const mockOnSubmit = jest.fn();
    
    const { result } = renderHook(() => useTaskForm({
      onSubmit: mockOnSubmit
    }));
    
    // Initial form data should be empty
    expect(result.current.formData).toEqual({ title: '' });
    
    // No errors initially
    expect(result.current.errors).toEqual({});
    
    // Form should be invalid initially (empty required field)
    expect(result.current.isValid).toBe(false);
  });
  
  it('should initialize with provided initial data', () => {
    const mockOnSubmit = jest.fn();
    const initialData: TaskFormData = { title: 'Initial task' };
    
    const { result } = renderHook(() => useTaskForm({
      onSubmit: mockOnSubmit,
      initialData
    }));
    
    // Form data should match initialData
    expect(result.current.formData).toEqual(initialData);
    
    // Form should be valid with initial data
    expect(result.current.isValid).toBe(true);
  });
  
  it('should update form data on handleChange', () => {
    const mockOnSubmit = jest.fn();
    
    const { result } = renderHook(() => useTaskForm({
      onSubmit: mockOnSubmit
    }));
    
    // Initial form data
    expect(result.current.formData).toEqual({ title: '' });
    
    // Simulate input change
    act(() => {
      result.current.handleChange({
        target: { name: 'title', value: 'New Task' }
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    // Form data should be updated
    expect(result.current.formData).toEqual({ title: 'New Task' });
    
    // Form should be valid now
    expect(result.current.isValid).toBe(true);
  });
  
  it('should validate form data with the provided validate function', () => {
    const mockOnSubmit = jest.fn();
    
    const { result } = renderHook(() => useTaskForm({
      onSubmit: mockOnSubmit,
      validate: (data) => {
        const errors: { title?: string } = {};
        if (!data.title) {
          errors.title = 'Title is required';
        } else if (data.title.length < 3) {
          errors.title = 'Title must be at least 3 characters';
        }
        return errors;
      }
    }));
    
    // Initial validation (empty title)
    expect(result.current.errors).toEqual({ title: 'Title is required' });
    expect(result.current.isValid).toBe(false);
    
    // Simulate input change (too short)
    act(() => {
      result.current.handleChange({
        target: { name: 'title', value: 'AB' }
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    // Should have validation error for short title
    expect(result.current.errors).toEqual({ title: 'Title must be at least 3 characters' });
    expect(result.current.isValid).toBe(false);
    
    // Simulate valid input change
    act(() => {
      result.current.handleChange({
        target: { name: 'title', value: 'New Task' }
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    // Should be valid now
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });
  
  it('should call onSubmit with form data on handleSubmit', () => {
    const mockOnSubmit = jest.fn();
    
    const { result } = renderHook(() => useTaskForm({
      onSubmit: mockOnSubmit,
      initialData: { title: 'Test Task' }
    }));
    
    // Mock the submit event
    const mockPreventDefault = jest.fn();
    const mockEvent = {
      preventDefault: mockPreventDefault
    } as unknown as React.FormEvent<HTMLFormElement>;
    
    // Call handleSubmit
    act(() => {
      result.current.handleSubmit(mockEvent);
    });
    
    // preventDefault should be called
    expect(mockPreventDefault).toHaveBeenCalled();
    
    // onSubmit should be called with form data
    expect(mockOnSubmit).toHaveBeenCalledWith({ title: 'Test Task' });
  });
  
  it('should not call onSubmit if form is invalid', () => {
    const mockOnSubmit = jest.fn();
    
    const { result } = renderHook(() => useTaskForm({
      onSubmit: mockOnSubmit,
      validate: (data) => {
        const errors: { title?: string } = {};
        if (!data.title) {
          errors.title = 'Title is required';
        }
        return errors;
      }
    }));
    
    // Mock the submit event
    const mockPreventDefault = jest.fn();
    const mockEvent = {
      preventDefault: mockPreventDefault
    } as unknown as React.FormEvent<HTMLFormElement>;
    
    // Call handleSubmit
    act(() => {
      result.current.handleSubmit(mockEvent);
    });
    
    // preventDefault should still be called
    expect(mockPreventDefault).toHaveBeenCalled();
    
    // onSubmit should not be called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  it('should reset form data and errors on resetForm', () => {
    const mockOnSubmit = jest.fn();
    
    const { result } = renderHook(() => useTaskForm({
      onSubmit: mockOnSubmit,
      validate: (data) => {
        const errors: { title?: string } = {};
        if (!data.title) {
          errors.title = 'Title is required';
        }
        return errors;
      }
    }));
    
    // Set some form data
    act(() => {
      result.current.handleChange({
        target: { name: 'title', value: 'Test Task' }
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    // Form data should be updated
    expect(result.current.formData).toEqual({ title: 'Test Task' });
    expect(result.current.errors).toEqual({});
    
    // Reset the form
    act(() => {
      result.current.resetForm();
    });
    
    // Form should be reset to initial state
    expect(result.current.formData).toEqual({ title: '' });
    expect(result.current.errors).toEqual({ title: 'Title is required' });
  });
  
  it('should integrate correctly with a React component', async () => {
    const mockOnSubmit = jest.fn();
    
    // Render the test component
    render(<TestComponent />);
    
    // Get form elements
    const form = screen.getByTestId('task-form');
    const titleInput = screen.getByTestId('title-input');
    const submitButton = screen.getByTestId('submit-button');
    const resetButton = screen.getByTestId('reset-button');
    
    // Submit button should be disabled initially
    expect(submitButton).toBeDisabled();
    
    // Type in the title input
    await userEvent.type(titleInput, 'New Task');
    
    // Submit button should be enabled now
    expect(submitButton).toBeEnabled();
    
    // Click the reset button
    await userEvent.click(resetButton);
    
    // Input should be cleared and submit button disabled again
    expect(titleInput).toHaveValue('');
    expect(submitButton).toBeDisabled();
    
    // Type a valid title again
    await userEvent.type(titleInput, 'Another Task');
    
    // Submit the form
    fireEvent.submit(form);
    
    // Input should be cleared after submission
    expect(titleInput).toHaveValue('');
  });
  
  it('should correctly type the hook return value', () => {
    // This is a compile-time test to verify TypeScript types
    
    const { result } = renderHook(() => useTaskForm({
      onSubmit: (data: TaskFormData) => {
        // Type checking for data parameter
        const title: string = data.title;
      }
    }));
    
    // Type assertions for the hook's return value
    const formData: TaskFormData = result.current.formData;
    const errors: { title?: string } = result.current.errors;
    const isValid: boolean = result.current.isValid;
    const handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void = result.current.handleChange;
    const handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void = result.current.handleSubmit;
    const resetForm: () => void = result.current.resetForm;
    
    // If no TypeScript errors, this test passes
    expect(true).toBeTruthy();
  });
}); 