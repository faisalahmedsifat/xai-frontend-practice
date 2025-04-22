import React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskStatistics } from '@/components/level6/TaskStatistics';
import { Task } from '@/types';

const mockTasks: Task[] = [
  { id: '1', title: 'Task 1', completed: false, priority: 'high', dueDate: new Date(2023, 5, 15) },
  { id: '2', title: 'Task 2', completed: true, priority: 'medium', dueDate: new Date(2023, 5, 10) },
  { id: '3', title: 'Task 3', completed: false, priority: 'low', dueDate: new Date(2023, 5, 20) },
  { id: '4', title: 'Task 4', completed: true, priority: 'high', dueDate: new Date(2023, 4, 30) },
  { id: '5', title: 'Task 5', completed: false, priority: 'medium', dueDate: new Date(2023, 6, 5) },
];

describe('TaskStatistics Render Props Component', () => {
  it('should provide completion statistics through render props', () => {
    render(
      <TaskStatistics tasks={mockTasks}>
        {(stats) => (
          <div>
            <div data-testid="completed-count">{stats.completedCount}</div>
            <div data-testid="completion-percentage">{stats.completionPercentage}%</div>
          </div>
        )}
      </TaskStatistics>
    );

    // 2 out of 5 tasks are completed
    expect(screen.getByTestId('completed-count')).toHaveTextContent('2');
    expect(screen.getByTestId('completion-percentage')).toHaveTextContent('40%');
  });

  it('should provide priority distribution statistics', () => {
    render(
      <TaskStatistics tasks={mockTasks}>
        {(stats) => (
          <div>
            <div data-testid="high-priority-count">{stats.priorityDistribution.high}</div>
            <div data-testid="medium-priority-count">{stats.priorityDistribution.medium}</div>
            <div data-testid="low-priority-count">{stats.priorityDistribution.low}</div>
          </div>
        )}
      </TaskStatistics>
    );

    expect(screen.getByTestId('high-priority-count')).toHaveTextContent('2');
    expect(screen.getByTestId('medium-priority-count')).toHaveTextContent('2');
    expect(screen.getByTestId('low-priority-count')).toHaveTextContent('1');
  });

  it('should provide due date statistics', () => {
    // Mock current date to a fixed value for consistent testing
    jest.useFakeTimers().setSystemTime(new Date(2023, 5, 12));

    render(
      <TaskStatistics tasks={mockTasks}>
        {(stats) => (
          <div>
            <div data-testid="overdue-count">{stats.overdueCount}</div>
            <div data-testid="due-this-week">{stats.dueThisWeek}</div>
            <div data-testid="due-next-week">{stats.dueNextWeek}</div>
          </div>
        )}
      </TaskStatistics>
    );

    // Task 2 and 4 are overdue
    expect(screen.getByTestId('overdue-count')).toHaveTextContent('2');
    
    // Clean up
    jest.useRealTimers();
  });

  it('should handle empty tasks array', () => {
    render(
      <TaskStatistics tasks={[]}>
        {(stats) => (
          <div>
            <div data-testid="total-count">{stats.totalCount}</div>
            <div data-testid="completed-count">{stats.completedCount}</div>
            <div data-testid="completion-percentage">{stats.completionPercentage}%</div>
          </div>
        )}
      </TaskStatistics>
    );

    expect(screen.getByTestId('total-count')).toHaveTextContent('0');
    expect(screen.getByTestId('completed-count')).toHaveTextContent('0');
    expect(screen.getByTestId('completion-percentage')).toHaveTextContent('0%');
  });

  it('should provide completion trend data', () => {
    render(
      <TaskStatistics tasks={mockTasks}>
        {(stats) => (
          <div>
            <div data-testid="has-trend-data">{String(Array.isArray(stats.completionTrend))}</div>
            <div data-testid="trend-data-length">{stats.completionTrend.length}</div>
          </div>
        )}
      </TaskStatistics>
    );

    expect(screen.getByTestId('has-trend-data')).toHaveTextContent('true');
    // Should have data for the last 7 days by default
    expect(screen.getByTestId('trend-data-length')).toHaveTextContent('7');
  });

  it('should support custom render function as a prop', () => {
    render(
      <TaskStatistics 
        tasks={mockTasks}
        render={(stats) => (
          <div>
            <h2>Custom Render Function</h2>
            <div data-testid="total-tasks">{stats.totalCount} total tasks</div>
          </div>
        )}
      />
    );

    expect(screen.getByText('Custom Render Function')).toBeInTheDocument();
    expect(screen.getByTestId('total-tasks')).toHaveTextContent('5 total tasks');
  });

  it('should update statistics when tasks change', () => {
    const { rerender } = render(
      <TaskStatistics tasks={mockTasks}>
        {(stats) => (
          <div>
            <div data-testid="total-count">{stats.totalCount}</div>
            <div data-testid="completed-count">{stats.completedCount}</div>
          </div>
        )}
      </TaskStatistics>
    );

    expect(screen.getByTestId('total-count')).toHaveTextContent('5');
    expect(screen.getByTestId('completed-count')).toHaveTextContent('2');

    // Add a completed task
    const updatedTasks = [
      ...mockTasks,
      { id: '6', title: 'Task 6', completed: true, priority: 'high' }
    ];

    rerender(
      <TaskStatistics tasks={updatedTasks}>
        {(stats) => (
          <div>
            <div data-testid="total-count">{stats.totalCount}</div>
            <div data-testid="completed-count">{stats.completedCount}</div>
          </div>
        )}
      </TaskStatistics>
    );

    expect(screen.getByTestId('total-count')).toHaveTextContent('6');
    expect(screen.getByTestId('completed-count')).toHaveTextContent('3');
  });
}); 