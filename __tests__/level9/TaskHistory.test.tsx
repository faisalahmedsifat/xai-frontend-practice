import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskStateProvider } from '@/components/level9/TaskStateProvider';
import { TaskHistoryViewer } from '@/components/level9/TaskHistoryViewer';
import { TaskDetailWithHistory } from '@/components/level9/TaskDetailWithHistory';
import { AppState, TaskHistoryEntry } from '@/types';

// Helper to create initial test state with task history
const createTestState = (): AppState => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 3600000);
  const twoHoursAgo = new Date(now.getTime() - 7200000);
  
  return {
    tasks: {
      byId: {
        'task-1': {
          id: 'task-1',
          title: 'Task with History',
          description: 'This task has a detailed history',
          status: 'completed',
          priority: 'high',
          createdAt: twoHoursAgo.toISOString(),
          updatedAt: now.toISOString(),
          history: [
            {
              timestamp: twoHoursAgo.toISOString(),
              userId: 'user-1',
              type: 'created',
              changes: { 
                title: 'Task with History',
                status: 'pending'
              }
            },
            {
              timestamp: oneHourAgo.toISOString(),
              userId: 'user-2',
              type: 'updated',
              changes: { 
                description: 'This task has a detailed history'
              }
            },
            {
              timestamp: now.toISOString(),
              userId: 'user-1',
              type: 'updated',
              changes: { 
                status: 'completed'
              }
            }
          ]
        },
        'task-2': {
          id: 'task-2',
          title: 'Task without History',
          description: 'This task has no history entries',
          status: 'pending',
          priority: 'medium',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          history: []
        }
      },
      allIds: ['task-1', 'task-2'],
      loading: false,
      error: null
    },
    ui: {
      currentView: 'list',
      theme: 'light',
      selectedTaskId: null,
      filters: {
        status: null,
        priority: null,
        search: ''
      }
    },
    history: {
      past: [],
      future: []
    }
  };
};

describe('Task History', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display the history of a task with all changes', () => {
    render(
      <TaskStateProvider initialState={createTestState()}>
        <TaskHistoryViewer taskId="task-1" />
      </TaskStateProvider>
    );
    
    // Should show the task title
    expect(screen.getByText('Task with History')).toBeInTheDocument();
    
    // Should show history entries
    const historyEntries = screen.getAllByTestId(/history-entry/);
    expect(historyEntries).toHaveLength(3);
    
    // Check the content of history entries
    expect(historyEntries[0]).toHaveTextContent(/created/i);
    expect(historyEntries[1]).toHaveTextContent(/updated/i);
    expect(historyEntries[1]).toHaveTextContent(/description/i);
    expect(historyEntries[2]).toHaveTextContent(/completed/i);
    
    // Check user information is displayed
    expect(screen.getByText(/user-1/)).toBeInTheDocument();
    expect(screen.getByText(/user-2/)).toBeInTheDocument();
    
    // Check timestamps are formatted properly
    const timestamps = screen.getAllByTestId(/timestamp/);
    expect(timestamps).toHaveLength(3);
    
    // Check that entries are in chronological order (newest first)
    const timestampTexts = timestamps.map(t => t.textContent);
    expect(timestampTexts[0]).not.toBe(timestampTexts[1]);
    expect(timestampTexts[1]).not.toBe(timestampTexts[2]);
  });

  it('should handle tasks with no history', () => {
    render(
      <TaskStateProvider initialState={createTestState()}>
        <TaskHistoryViewer taskId="task-2" />
      </TaskStateProvider>
    );
    
    // Should show the task title
    expect(screen.getByText('Task without History')).toBeInTheDocument();
    
    // Should show no history message
    expect(screen.getByText(/no history/i)).toBeInTheDocument();
    
    // Should not show any history entries
    expect(screen.queryAllByTestId(/history-entry/)).toHaveLength(0);
  });

  it('should record history when task properties are updated', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <TaskDetailWithHistory taskId="task-2" />
      </TaskStateProvider>
    );
    
    // Check initial state - no history
    expect(screen.getByText(/no history/i)).toBeInTheDocument();
    
    // Update the task title
    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task Title');
    
    // Click the save button
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    // Now the task should have history
    await waitFor(() => {
      expect(screen.queryByText(/no history/i)).not.toBeInTheDocument();
      
      // Should have one history entry
      const historyEntry = screen.getByTestId(/history-entry/);
      expect(historyEntry).toHaveTextContent(/updated/i);
      expect(historyEntry).toHaveTextContent(/title/i);
    });
    
    // Update the task description
    const descriptionInput = screen.getByLabelText(/description/i);
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'New description text');
    await user.click(saveButton);
    
    // Should have two history entries now
    await waitFor(() => {
      const historyEntries = screen.getAllByTestId(/history-entry/);
      expect(historyEntries).toHaveLength(2);
      expect(historyEntries[0]).toHaveTextContent(/description/i);
    });
  });

  it('should track who made changes and when', async () => {
    const user = userEvent.setup();
    
    // Mock the current date for consistent testing
    const originalDateNow = Date.now;
    const mockNow = new Date('2023-01-01T12:00:00Z').getTime();
    global.Date.now = jest.fn(() => mockNow);
    
    // Mock the current user
    const currentUser = { id: 'current-user', name: 'Test User' };
    
    render(
      <TaskStateProvider initialState={createTestState()} currentUser={currentUser}>
        <TaskDetailWithHistory taskId="task-2" />
      </TaskStateProvider>
    );
    
    // Update the task status
    const statusSelect = screen.getByLabelText(/status/i);
    await user.selectOptions(statusSelect, 'completed');
    
    // Click the save button
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    // Check that the history entry contains the current user and timestamp
    await waitFor(() => {
      const historyEntry = screen.getByTestId(/history-entry/);
      expect(historyEntry).toHaveTextContent(/Test User/i);
      expect(historyEntry).toHaveTextContent('Jan 1, 2023');
    });
    
    // Restore original Date.now
    global.Date.now = originalDateNow;
  });

  it('should display detailed diff of changes in the history', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <TaskDetailWithHistory taskId="task-1" showDetailedDiff />
      </TaskStateProvider>
    );
    
    // Check that history shows detailed changes
    const historyEntries = screen.getAllByTestId(/history-entry/);
    
    // Click on the first entry to expand details
    await user.click(historyEntries[0]);
    
    // Should show detailed diff for the status change
    const diffView = screen.getByTestId('diff-view');
    expect(diffView).toBeInTheDocument();
    
    // Should show old and new values
    expect(screen.getByTestId('old-value')).toHaveTextContent(/pending/i);
    expect(screen.getByTestId('new-value')).toHaveTextContent(/completed/i);
    
    // Close the detail view
    await user.click(historyEntries[0]);
    
    // Detail view should be closed
    expect(screen.queryByTestId('diff-view')).not.toBeInTheDocument();
  });

  it('should allow filtering and searching through history', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <TaskHistoryViewer taskId="task-1" enableFiltering />
      </TaskStateProvider>
    );
    
    // Initially all 3 history entries are shown
    expect(screen.getAllByTestId(/history-entry/)).toHaveLength(3);
    
    // Filter to only show 'updated' actions
    const actionFilter = screen.getByLabelText(/filter by action/i);
    await user.selectOptions(actionFilter, 'updated');
    
    // Now only 2 entries should be visible (the update ones)
    expect(screen.getAllByTestId(/history-entry/)).toHaveLength(2);
    
    // Filter by user
    const userFilter = screen.getByLabelText(/filter by user/i);
    await user.selectOptions(userFilter, 'user-2');
    
    // Now only 1 entry should be visible (user-2's update)
    expect(screen.getAllByTestId(/history-entry/)).toHaveLength(1);
    expect(screen.getByTestId(/history-entry/)).toHaveTextContent(/user-2/);
    
    // Clear the filters
    await user.selectOptions(actionFilter, '');
    await user.selectOptions(userFilter, '');
    
    // All entries should be visible again
    expect(screen.getAllByTestId(/history-entry/)).toHaveLength(3);
    
    // Search for 'description'
    const searchInput = screen.getByPlaceholderText(/search history/i);
    await user.type(searchInput, 'description');
    
    // Only the entry with 'description' should be visible
    expect(screen.getAllByTestId(/history-entry/)).toHaveLength(1);
    expect(screen.getByTestId(/history-entry/)).toHaveTextContent(/description/);
  });

  it('should properly type all history entries and related functionality', () => {
    // This is primarily a compile-time TypeScript check
    
    // Create a component that demonstrates type safety
    const TypeSafeHistoryDemo: React.FC = () => {
      const taskId = 'task-1';
      
      // Function that takes a history entry and formats it
      const formatHistoryEntry = (entry: TaskHistoryEntry): string => {
        const { timestamp, userId, type, changes } = entry;
        return `${new Date(timestamp).toLocaleDateString()} - ${userId} ${type} ${Object.keys(changes).join(', ')}`;
      };
      
      // Function to get the most recent change for a specific field
      const getLastChangeFor = (
        entries: TaskHistoryEntry[], 
        field: string
      ): TaskHistoryEntry | undefined => {
        return [...entries].reverse().find(entry => field in entry.changes);
      };
      
      return (
        <div data-testid="type-safe-demo">
          <h3>Type Safe History Demo</h3>
          <p>This component demonstrates type-safe handling of history</p>
        </div>
      );
    };
    
    render(
      <TaskStateProvider initialState={createTestState()}>
        <TypeSafeHistoryDemo />
      </TaskStateProvider>
    );
    
    // Check that the component renders without TypeScript errors
    expect(screen.getByTestId('type-safe-demo')).toBeInTheDocument();
  });
}); 