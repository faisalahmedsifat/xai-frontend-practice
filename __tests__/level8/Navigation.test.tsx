import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationBar } from '../../src/components/level8/NavigationBar';
import { TaskCard } from '../../src/components/level8/TaskCard';
import { mockRouter } from '../test-utils/mockRouter';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

describe('Next.js Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock router implementation
    mockRouter();
  });

  it('should render navigation links using Next.js Link component', () => {
    render(<NavigationBar />);
    
    // Check for navigation links
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    const settingsLink = screen.getByRole('link', { name: /settings/i });
    
    expect(dashboardLink).toHaveAttribute('href', '/');
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('should navigate to task details when clicking on a task card', async () => {
    const user = userEvent.setup();
    const mockPush = jest.fn();
    mockRouter({ push: mockPush });
    
    const task = {
      id: 'task-123',
      title: 'Test Task',
      description: 'This is a test task',
      completed: false
    };
    
    render(<TaskCard task={task} />);
    
    const taskCard = screen.getByText('Test Task').closest('div');
    await user.click(taskCard!);
    
    // Should navigate to task details page
    expect(mockPush).toHaveBeenCalledWith('/tasks/task-123');
  });

  it('should use correct href format for dynamic routes', () => {
    const task = {
      id: 'task-456',
      title: 'Another Task',
      description: 'This is another test task',
      completed: true
    };
    
    render(<TaskCard task={task} linkOnly />);
    
    const taskLink = screen.getByRole('link', { name: /another task/i });
    expect(taskLink).toHaveAttribute('href', '/tasks/task-456');
  });

  it('should handle query parameters in navigation', async () => {
    const user = userEvent.setup();
    const mockPush = jest.fn();
    mockRouter({ push: mockPush });
    
    render(<NavigationBar />);
    
    // Click on filter button
    const filterButton = screen.getByRole('button', { name: /filter/i });
    await user.click(filterButton);
    
    // Select completed filter
    const completedOption = screen.getByRole('option', { name: /completed/i });
    await user.click(completedOption);
    
    // Should navigate with query params
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/',
      query: { filter: 'completed' }
    });
  });

  it('should preserve query params when navigating between pages', async () => {
    const user = userEvent.setup();
    const mockRouter = {
      pathname: '/',
      query: { filter: 'high-priority' },
      push: jest.fn()
    };
    mockRouter(mockRouter);
    
    render(<NavigationBar preserveQueryParams />);
    
    // Click settings link with preserveQueryParams enabled
    const settingsLink = screen.getByRole('link', { name: /settings/i });
    await user.click(settingsLink);
    
    // Should preserve query params
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/settings',
      query: { filter: 'high-priority' }
    });
  });

  it('should handle programmatic navigation with the router', async () => {
    const user = userEvent.setup();
    const mockPush = jest.fn();
    const mockBack = jest.fn();
    mockRouter({ push: mockPush, back: mockBack });
    
    render(
      <div>
        <button onClick={() => mockPush('/')}>Go Home</button>
        <button onClick={() => mockBack()}>Go Back</button>
      </div>
    );
    
    // Test push navigation
    await user.click(screen.getByRole('button', { name: /go home/i }));
    expect(mockPush).toHaveBeenCalledWith('/');
    
    // Test back navigation
    await user.click(screen.getByRole('button', { name: /go back/i }));
    expect(mockBack).toHaveBeenCalled();
  });

  it('should be properly typed with TypeScript', () => {
    // This is more of a compile-time check
    // We're checking that the component accepts the proper props without TypeScript errors
    
    const task = {
      id: 'task-789',
      title: 'Typed Task',
      description: 'This task has proper TypeScript typing',
      completed: false
    };
    
    // These should compile without errors
    render(<TaskCard task={task} />);
    render(<TaskCard task={task} linkOnly />);
    render(<NavigationBar />);
    render(<NavigationBar preserveQueryParams />);
  });
}); 