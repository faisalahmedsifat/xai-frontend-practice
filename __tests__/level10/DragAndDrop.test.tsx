import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableTaskList } from '../../src/components/level10/DraggableTaskList';
import { KanbanBoard } from '../../src/components/level10/KanbanBoard';
import { Task, TaskStatus } from '../../src/types';

// Mock data for testing
const mockTasks: Task[] = [
  { id: 'task-1', title: 'Task 1', description: 'Description 1', status: 'pending', priority: 'high' },
  { id: 'task-2', title: 'Task 2', description: 'Description 2', status: 'in-progress', priority: 'medium' },
  { id: 'task-3', title: 'Task 3', description: 'Description 3', status: 'completed', priority: 'low' },
  { id: 'task-4', title: 'Task 4', description: 'Description 4', status: 'pending', priority: 'high' },
];

// Helper function to wrap components with DndProvider
const withDndProvider = (Component: React.ReactElement) => (
  <DndProvider backend={HTML5Backend}>
    {Component}
  </DndProvider>
);

// Mock move functions
const mockMoveTask = jest.fn();
const mockMoveTaskBetweenLists = jest.fn();

describe('Drag and Drop Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render draggable task items with proper attributes', () => {
    render(withDndProvider(
      <DraggableTaskList 
        tasks={mockTasks.filter(t => t.status === 'pending')} 
        listId="pending"
        moveTask={mockMoveTask}
        moveTaskBetweenLists={mockMoveTaskBetweenLists}
      />
    ));
    
    // Check that draggable tasks are rendered
    const taskItems = screen.getAllByTestId(/draggable-task-/);
    expect(taskItems).toHaveLength(2); // 2 pending tasks
    
    // Check for draggable attributes
    taskItems.forEach(item => {
      expect(item).toHaveAttribute('draggable', 'true');
    });
    
    // Check that task content is rendered
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 4')).toBeInTheDocument();
  });

  it('should handle drag start event and add appropriate classes', () => {
    render(withDndProvider(
      <DraggableTaskList 
        tasks={mockTasks.filter(t => t.status === 'pending')} 
        listId="pending"
        moveTask={mockMoveTask}
        moveTaskBetweenLists={mockMoveTaskBetweenLists}
      />
    ));
    
    // Get the first draggable task
    const taskItem = screen.getByTestId('draggable-task-task-1');
    
    // Simulate drag start
    fireEvent.dragStart(taskItem);
    
    // Check if it has the "dragging" class
    expect(taskItem).toHaveClass('dragging');
  });

  it('should handle drag end event and remove dragging classes', () => {
    render(withDndProvider(
      <DraggableTaskList 
        tasks={mockTasks.filter(t => t.status === 'pending')} 
        listId="pending"
        moveTask={mockMoveTask}
        moveTaskBetweenLists={mockMoveTaskBetweenLists}
      />
    ));
    
    // Get the first draggable task
    const taskItem = screen.getByTestId('draggable-task-task-1');
    
    // Simulate drag start
    fireEvent.dragStart(taskItem);
    
    // Check if it has the "dragging" class
    expect(taskItem).toHaveClass('dragging');
    
    // Simulate drag end
    fireEvent.dragEnd(taskItem);
    
    // Check if dragging class is removed
    expect(taskItem).not.toHaveClass('dragging');
  });

  it('should call moveTask when reordering within the same list', () => {
    render(withDndProvider(
      <DraggableTaskList 
        tasks={mockTasks.filter(t => t.status === 'pending')} 
        listId="pending"
        moveTask={mockMoveTask}
        moveTaskBetweenLists={mockMoveTaskBetweenLists}
      />
    ));
    
    // Get the draggable tasks
    const firstTask = screen.getByTestId('draggable-task-task-1');
    const secondTask = screen.getByTestId('draggable-task-task-4');
    
    // Setup drag data transfer
    const dataTransfer = { setData: jest.fn(), getData: jest.fn() };
    dataTransfer.getData.mockReturnValue(JSON.stringify({ 
      id: 'task-1', 
      index: 0, 
      listId: 'pending'
    }));
    
    // Simulate drag operations
    fireEvent.dragStart(firstTask, { dataTransfer });
    fireEvent.dragOver(secondTask);
    fireEvent.drop(secondTask, { dataTransfer });
    
    // Check if moveTask was called with correct parameters
    expect(mockMoveTask).toHaveBeenCalledWith('pending', 0, 1);
  });

  it('should render Kanban board with draggable columns', () => {
    render(withDndProvider(
      <KanbanBoard tasks={mockTasks} />
    ));
    
    // Check if all columns are rendered
    const columns = screen.getAllByTestId(/column-/);
    expect(columns).toHaveLength(3); // pending, in-progress, completed
    
    // Check for column titles
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    
    // Check that tasks are in the correct columns
    const pendingColumn = screen.getByTestId('column-pending');
    const inProgressColumn = screen.getByTestId('column-in-progress');
    const completedColumn = screen.getByTestId('column-completed');
    
    expect(pendingColumn).toHaveTextContent('Task 1');
    expect(pendingColumn).toHaveTextContent('Task 4');
    expect(inProgressColumn).toHaveTextContent('Task 2');
    expect(completedColumn).toHaveTextContent('Task 3');
  });

  it('should call moveTaskBetweenLists when moving between columns', () => {
    render(withDndProvider(
      <KanbanBoard 
        tasks={mockTasks}
        onMoveTaskBetweenLists={mockMoveTaskBetweenLists}
      />
    ));
    
    // Get a task and a different column
    const task = screen.getByTestId('draggable-task-task-1');
    const targetColumn = screen.getByTestId('column-in-progress');
    
    // Setup drag data transfer
    const dataTransfer = { setData: jest.fn(), getData: jest.fn() };
    dataTransfer.getData.mockReturnValue(JSON.stringify({ 
      id: 'task-1', 
      index: 0, 
      listId: 'pending'
    }));
    
    // Simulate drag operations
    fireEvent.dragStart(task, { dataTransfer });
    fireEvent.dragOver(targetColumn);
    fireEvent.drop(targetColumn, { dataTransfer });
    
    // Check if moveTaskBetweenLists was called correctly
    expect(mockMoveTaskBetweenLists).toHaveBeenCalledWith(
      'task-1', 
      'pending', 
      'in-progress', 
      0
    );
  });

  it('should have accessible drag and drop interface with proper ARIA attributes', () => {
    render(withDndProvider(
      <DraggableTaskList 
        tasks={mockTasks.filter(t => t.status === 'pending')} 
        listId="pending"
        moveTask={mockMoveTask}
        moveTaskBetweenLists={mockMoveTaskBetweenLists}
      />
    ));
    
    // Check for accessibility attributes
    const taskItems = screen.getAllByTestId(/draggable-task-/);
    
    taskItems.forEach(item => {
      expect(item).toHaveAttribute('aria-grabbed');
      expect(item).toHaveAttribute('aria-roledescription', 'draggable item');
      expect(item).toHaveAttribute('aria-describedby');
    });
    
    // Check for screen reader instructions
    expect(screen.getByText(/drag to reorder/i)).toBeInTheDocument();
  });

  it('should properly type DnD interfaces and components', () => {
    // This is primarily a compile-time TypeScript check
    
    // Test with explicit type declarations
    interface DragItem {
      id: string;
      index: number;
      listId: string;
      type: string;
    }
    
    // Render with type parameters to verify TypeScript compatibility
    render(withDndProvider(
      <KanbanBoard<DragItem> 
        tasks={mockTasks}
        itemType="TASK"
        onMoveTaskBetweenLists={mockMoveTaskBetweenLists}
      />
    ));
    
    // Check that the component renders without TypeScript errors
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
}); 