import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withTaskSorting } from '../../src/components/level6/withTaskSorting';
import { Task } from '../../src/types';

// Mock basic task list component
const TaskList: React.FC<{ tasks: Task[] }> = ({ tasks }) => (
  <ul>
    {tasks.map(task => (
      <li key={task.id} data-testid={`task-${task.id}`}>
        {task.title} - Priority: {task.priority}
        {task.dueDate && ` - Due: ${task.dueDate.toISOString().split('T')[0]}`}
      </li>
    ))}
  </ul>
);

const mockTasks: Task[] = [
  { id: '1', title: 'Buy groceries', completed: false, priority: 'medium', dueDate: new Date(2023, 5, 15) },
  { id: '2', title: 'Finish report', completed: true, priority: 'high', dueDate: new Date(2023, 5, 10) },
  { id: '3', title: 'Call doctor', completed: false, priority: 'low', dueDate: new Date(2023, 5, 20) },
  { id: '4', title: 'Attend meeting', completed: false, priority: 'high', dueDate: new Date(2023, 4, 30) },
  { id: '5', title: 'Fix bug', completed: true, priority: 'medium', dueDate: new Date(2023, 6, 5) },
];

describe('withTaskSorting HOC', () => {
  it('should render the wrapped component with tasks in default order', () => {
    const SortableTaskList = withTaskSorting(TaskList);
    
    render(<SortableTaskList tasks={mockTasks} />);
    
    const taskElements = screen.getAllByRole('listitem');
    expect(taskElements).toHaveLength(5);
    expect(taskElements[0]).toHaveTextContent('Buy groceries');
    expect(taskElements[1]).toHaveTextContent('Finish report');
    expect(taskElements[2]).toHaveTextContent('Call doctor');
    expect(taskElements[3]).toHaveTextContent('Attend meeting');
    expect(taskElements[4]).toHaveTextContent('Fix bug');
  });
  
  it('should sort tasks alphabetically by title when requested', async () => {
    const user = userEvent.setup();
    const SortableTaskList = withTaskSorting(TaskList);
    
    render(<SortableTaskList tasks={mockTasks} />);
    
    // Find the sort dropdown and select "title"
    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.selectOptions(sortSelect, 'title');
    
    const taskElements = screen.getAllByRole('listitem');
    
    // Should be sorted alphabetically
    expect(taskElements[0]).toHaveTextContent('Attend meeting');
    expect(taskElements[1]).toHaveTextContent('Buy groceries');
    expect(taskElements[2]).toHaveTextContent('Call doctor');
    expect(taskElements[3]).toHaveTextContent('Finish report');
    expect(taskElements[4]).toHaveTextContent('Fix bug');
  });
  
  it('should sort tasks by priority when requested', async () => {
    const user = userEvent.setup();
    const SortableTaskList = withTaskSorting(TaskList);
    
    render(<SortableTaskList tasks={mockTasks} />);
    
    // Find the sort dropdown and select "priority"
    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.selectOptions(sortSelect, 'priority');
    
    const taskElements = screen.getAllByRole('listitem');
    
    // High priority tasks should be first
    expect(taskElements[0]).toHaveTextContent('high');
    expect(taskElements[1]).toHaveTextContent('high');
    // Then medium
    expect(taskElements[2]).toHaveTextContent('medium');
    expect(taskElements[3]).toHaveTextContent('medium');
    // Then low
    expect(taskElements[4]).toHaveTextContent('low');
  });
  
  it('should sort tasks by due date when requested', async () => {
    const user = userEvent.setup();
    const SortableTaskList = withTaskSorting(TaskList);
    
    render(<SortableTaskList tasks={mockTasks} />);
    
    // Find the sort dropdown and select "dueDate"
    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.selectOptions(sortSelect, 'dueDate');
    
    const taskElements = screen.getAllByRole('listitem');
    
    // Should be sorted by date (earliest first)
    expect(taskElements[0]).toHaveTextContent('2023-04-30'); // April 30
    expect(taskElements[1]).toHaveTextContent('2023-05-10'); // May 10
    expect(taskElements[2]).toHaveTextContent('2023-05-15'); // May 15
    expect(taskElements[3]).toHaveTextContent('2023-05-20'); // May 20
    expect(taskElements[4]).toHaveTextContent('2023-06-05'); // June 5
  });
  
  it('should reverse sort order when direction is changed', async () => {
    const user = userEvent.setup();
    const SortableTaskList = withTaskSorting(TaskList);
    
    render(<SortableTaskList tasks={mockTasks} />);
    
    // Set sort to title
    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.selectOptions(sortSelect, 'title');
    
    // Change direction to descending
    const directionButton = screen.getByRole('button', { name: /direction/i });
    await user.click(directionButton);
    
    const taskElements = screen.getAllByRole('listitem');
    
    // Should be sorted alphabetically in reverse
    expect(taskElements[0]).toHaveTextContent('Fix bug');
    expect(taskElements[1]).toHaveTextContent('Finish report');
    expect(taskElements[2]).toHaveTextContent('Call doctor');
    expect(taskElements[3]).toHaveTextContent('Buy groceries');
    expect(taskElements[4]).toHaveTextContent('Attend meeting');
  });
  
  it('should accept initial sort configuration through props', () => {
    const SortableTaskList = withTaskSorting(TaskList);
    
    render(
      <SortableTaskList 
        tasks={mockTasks} 
        initialSortBy="priority" 
        initialSortDirection="desc" 
      />
    );
    
    const taskElements = screen.getAllByRole('listitem');
    
    // Should be sorted by priority in descending order (high first)
    expect(taskElements[0]).toHaveTextContent('high');
    expect(taskElements[1]).toHaveTextContent('high');
    // Then medium
    expect(taskElements[2]).toHaveTextContent('medium');
    expect(taskElements[3]).toHaveTextContent('medium');
    // Then low
    expect(taskElements[4]).toHaveTextContent('low');
  });
  
  it('should allow custom sort options', () => {
    const SortableTaskList = withTaskSorting(TaskList);
    
    const customSortOptions = [
      { value: 'title', label: 'Task Name' },
      { value: 'custom', label: 'Custom Option' }
    ];
    
    render(
      <SortableTaskList 
        tasks={mockTasks} 
        sortOptions={customSortOptions}
      />
    );
    
    const sortSelect = screen.getByLabelText(/sort by/i);
    const options = Array.from(sortSelect.querySelectorAll('option'));
    
    expect(options).toHaveLength(2);
    expect(options[0].textContent).toBe('Task Name');
    expect(options[1].textContent).toBe('Custom Option');
  });
  
  it('should preserve the original component props', () => {
    // Create a component with additional props
    interface ExtendedTaskListProps {
      tasks: Task[];
      title?: string;
      showCompleted?: boolean;
    }
    
    const ExtendedTaskList: React.FC<ExtendedTaskListProps> = ({ 
      tasks, 
      title = 'Task List',
      showCompleted = true
    }) => (
      <div>
        <h2>{title}</h2>
        <ul>
          {tasks
            .filter(task => showCompleted || !task.completed)
            .map(task => (
              <li key={task.id} data-testid={`task-${task.id}`}>
                {task.title}
              </li>
            ))}
        </ul>
      </div>
    );
    
    // Apply the HOC
    const SortableExtendedTaskList = withTaskSorting(ExtendedTaskList);
    
    // Render with custom props
    render(
      <SortableExtendedTaskList
        tasks={mockTasks}
        title="My Custom List"
        showCompleted={false}
      />
    );
    
    // Title should be rendered
    expect(screen.getByText('My Custom List')).toBeInTheDocument();
    
    // Only incomplete tasks should be shown (3 out of 5)
    const taskElements = screen.getAllByRole('listitem');
    expect(taskElements).toHaveLength(3);
  });
}); 