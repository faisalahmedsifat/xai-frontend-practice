import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '@/components/level10/TaskForm';
import { TaskDetail } from '@/components/level10/TaskDetail';
import { TaskList } from '@/components/level10/TaskList';
import { TaskApp } from '@/components/level10/TaskApp';
import { Task } from '@/types';

// Add jest-axe custom matchers
expect.extend(toHaveNoViolations);

// Sample tasks for testing
const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the project',
    status: 'pending',
    priority: 'high',
    createdAt: new Date(2023, 0, 1).toISOString()
  },
  {
    id: 'task-2',
    title: 'Fix accessibility issues',
    description: 'Ensure all components meet WCAG 2.1 AA standards',
    status: 'in-progress',
    priority: 'high',
    createdAt: new Date(2023, 0, 2).toISOString()
  },
  {
    id: 'task-3',
    title: 'Code review',
    description: 'Review pull requests from team members',
    status: 'completed',
    priority: 'medium',
    createdAt: new Date(2023, 0, 3).toISOString()
  }
];

describe('Accessibility Audits', () => {
  it('should have no accessibility violations in TaskForm', async () => {
    const { container } = render(<TaskForm onSubmit={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in TaskDetail', async () => {
    const { container } = render(
      <TaskDetail 
        task={sampleTasks[0]} 
        onEdit={() => {}} 
        onDelete={() => {}} 
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in TaskList', async () => {
    const { container } = render(
      <TaskList 
        tasks={sampleTasks} 
        onTaskSelect={() => {}} 
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations in entire TaskApp', async () => {
    const { container } = render(<TaskApp initialTasks={sampleTasks} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper keyboard navigation through task list', async () => {
    const user = userEvent.setup();
    render(<TaskList tasks={sampleTasks} onTaskSelect={() => {}} />);
    
    // Find the first task item
    const firstTaskItem = screen.getByText('Complete project documentation').closest('li');
    
    // Tab to focus on the first task
    await user.tab();
    expect(document.activeElement).toBe(firstTaskItem);
    
    // Tab to move to the next task
    await user.tab();
    const secondTaskItem = screen.getByText('Fix accessibility issues').closest('li');
    expect(document.activeElement).toBe(secondTaskItem);
  });

  it('should have proper ARIA attributes on task items', () => {
    render(<TaskList tasks={sampleTasks} onTaskSelect={() => {}} />);
    
    // Check that tasks have appropriate roles
    const taskItems = screen.getAllByRole('listitem');
    expect(taskItems).toHaveLength(3);
    
    // Check for aria-labels
    const highPriorityTasks = screen.getAllByLabelText(/high priority/i);
    expect(highPriorityTasks).toHaveLength(2);
    
    // Check for aria-selected
    const taskItem = screen.getByText('Complete project documentation').closest('li');
    expect(taskItem).toHaveAttribute('aria-selected', 'false');
  });

  it('should have properly labeled form controls', () => {
    render(<TaskForm onSubmit={() => {}} />);
    
    // Check for explicit labels on form fields
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    
    // Check that submit button has accessible name
    const submitButton = screen.getByRole('button', { name: /create|add|submit/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should have proper contrast ratios for text elements', async () => {
    // This test specifically checks for contrast ratio violations
    const { container } = render(<TaskApp initialTasks={sampleTasks} />);
    
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
    
    expect(results).toHaveNoViolations();
  });

  it('should have proper focus indicators for interactive elements', async () => {
    const user = userEvent.setup();
    render(<TaskApp initialTasks={sampleTasks} />);
    
    // Tab to focus on the first interactive element
    await user.tab();
    
    // Get the focused element
    const focusedElement = document.activeElement;
    
    // Check that the focused element has a visible focus indicator
    // This is a common CSS check, we're verifying it's being applied
    // We can't test CSS directly, but we can check for focus-related attributes
    expect(focusedElement).not.toBe(document.body); // Something should be focused
    expect(focusedElement).toHaveAttribute('tabindex');
  });

  it('should provide error messages for form validation', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={() => {}} />);
    
    // Try to submit the form without filling required fields
    const submitButton = screen.getByRole('button', { name: /create|add|submit/i });
    await user.click(submitButton);
    
    // Check for accessible error messages
    const errorMessages = screen.getAllByRole('alert');
    expect(errorMessages.length).toBeGreaterThan(0);
    
    // Error message should be associated with the form field
    const titleInput = screen.getByLabelText(/title/i);
    expect(titleInput).toHaveAttribute('aria-invalid', 'true');
    expect(titleInput).toHaveAttribute('aria-errormessage');
  });

  it('should announce dynamic content changes', async () => {
    // Mock the implementation of status announcer
    const mockAnnounce = jest.fn();
    jest.spyOn(React, 'useEffect').mockImplementation((effect) => {
      effect();
      return () => {};
    });
    
    // Create a wrapper component with mock announcer
    const StatusAnnouncerMock = ({ children }: { children: React.ReactNode }) => {
      React.useEffect(() => {
        // Set up mock implementation for status announcer
        window.announce = mockAnnounce;
      }, []);
      
      return <>{children}</>;
    };
    
    const user = userEvent.setup();
    
    render(
      <StatusAnnouncerMock>
        <TaskApp initialTasks={sampleTasks} />
      </StatusAnnouncerMock>
    );
    
    // Trigger an action that should announce a status change
    const completeButton = screen.getByLabelText(/mark as complete/i);
    await user.click(completeButton);
    
    // Verify that the announce function was called
    expect(mockAnnounce).toHaveBeenCalledWith(expect.stringContaining('completed'));
  });

  it('should handle screen reader announcements for drag operations', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskApp 
        initialTasks={sampleTasks} 
        enableDragAndDrop 
      />
    );
    
    // Find a draggable task item
    const taskItem = screen.getByText('Complete project documentation').closest('[draggable="true"]');
    
    // Check for proper ARIA attributes for drag and drop
    expect(taskItem).toHaveAttribute('aria-grabbed', 'false');
    
    // Start drag operation
    await user.hover(taskItem!);
    fireEvent.dragStart(taskItem!);
    
    // After drag starts, aria-grabbed should be true
    expect(taskItem).toHaveAttribute('aria-grabbed', 'true');
    
    // During drag, there should be a live region announcing drag status
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent(/dragging/i);
  });

  it('should provide alternative methods for operations requiring fine motor skills', () => {
    render(
      <TaskApp 
        initialTasks={sampleTasks} 
        enableAccessibilityFeatures
      />
    );
    
    // Check for keyboard shortcuts to perform common actions
    const keyboardShortcutsSection = screen.getByText(/keyboard shortcuts/i);
    expect(keyboardShortcutsSection).toBeInTheDocument();
    
    // Verify keyboard shortcuts are documented
    expect(screen.getByText(/press n to add a new task/i)).toBeInTheDocument();
    expect(screen.getByText(/press e to edit selected task/i)).toBeInTheDocument();
    expect(screen.getByText(/press delete to remove task/i)).toBeInTheDocument();
    
    // Check for toggle to enable/disable animations for users with vestibular disorders
    const animationToggle = screen.getByLabelText(/reduce motion/i);
    expect(animationToggle).toBeInTheDocument();
  });
}); 