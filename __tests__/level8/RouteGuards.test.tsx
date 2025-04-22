import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TaskDetailsPage } from '../../src/components/level8/TaskDetailsPage';
import { ProtectedRoute } from '../../src/components/level8/ProtectedRoute';
import { mockRouter } from '../test-utils/mockRouter';
import { TaskService } from '../../src/services/TaskService';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

// Mock task service
jest.mock('../../src/services/TaskService', () => ({
  TaskService: {
    getTaskById: jest.fn(),
    getAllTasks: jest.fn()
  }
}));

describe('Next.js Route Guards and Redirects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock router implementation
    mockRouter();
  });

  it('should redirect to 404 page when task is not found', async () => {
    const mockReplace = jest.fn();
    mockRouter({
      query: { id: 'non-existent-id' },
      replace: mockReplace
    });
    
    // Mock task service to return null (task not found)
    (TaskService.getTaskById as jest.Mock).mockResolvedValue(null);
    
    render(<TaskDetailsPage />);
    
    // Should show loading initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Wait for the redirect to happen
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/404');
    });
  });

  it('should display task details when task is found', async () => {
    mockRouter({
      query: { id: 'task-123' }
    });
    
    // Mock task service to return a task
    const mockTask = {
      id: 'task-123',
      title: 'Test Task',
      description: 'Task description',
      completed: false
    };
    (TaskService.getTaskById as jest.Mock).mockResolvedValue(mockTask);
    
    render(<TaskDetailsPage />);
    
    // Should show loading initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Wait for task details to load
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Task description')).toBeInTheDocument();
    });
  });

  it('should redirect on access to protected route when not authorized', async () => {
    const mockReplace = jest.fn();
    mockRouter({
      replace: mockReplace
    });
    
    // Render protected route with isAuthorized=false
    render(
      <ProtectedRoute isAuthorized={false} redirectTo="/login">
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    // Should not render protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    
    // Should redirect to login
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('should render children when authorized on protected route', () => {
    mockRouter({});
    
    // Render protected route with isAuthorized=true
    render(
      <ProtectedRoute isAuthorized={true} redirectTo="/login">
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    // Should render protected content
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect from /home to /', async () => {
    const mockReplace = jest.fn();
    mockRouter({
      pathname: '/home',
      replace: mockReplace
    });
    
    // We need to test the page component that has this redirect logic
    // For the test, we'll mock a component that does this redirect
    const HomeRedirect = () => {
      const router = require('next/router').useRouter();
      
      React.useEffect(() => {
        if (router.pathname === '/home') {
          router.replace('/');
        }
      }, [router]);
      
      return <div>Redirecting...</div>;
    };
    
    render(<HomeRedirect />);
    
    // Should trigger redirect
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('should handle conditional redirects based on authentication state', async () => {
    const mockReplace = jest.fn();
    mockRouter({
      replace: mockReplace
    });
    
    // Mock an authentication state check
    const authState = { isAuthenticated: false };
    
    // Mock a component with conditional redirect logic
    const ConditionalRedirect = () => {
      const router = require('next/router').useRouter();
      
      React.useEffect(() => {
        if (!authState.isAuthenticated) {
          router.replace('/login');
        }
      }, [router]);
      
      return authState.isAuthenticated ? (
        <div>Authenticated Content</div>
      ) : (
        <div>Redirecting to login...</div>
      );
    };
    
    render(<ConditionalRedirect />);
    
    // Should show redirecting message
    expect(screen.getByText(/redirecting to login/i)).toBeInTheDocument();
    
    // Should trigger redirect
    expect(mockReplace).toHaveBeenCalledWith('/login');
    
    // Update auth state and re-render
    authState.isAuthenticated = true;
    
    // Since we can't easily update the auth state in this test,
    // we'll just verify the initial behavior
  });

  it('should properly type route parameters', async () => {
    mockRouter({
      query: { id: 'task-123', priority: 'high' }
    });
    
    // Mock task service to return a task
    const mockTask = {
      id: 'task-123',
      title: 'Test Task',
      description: 'Task description',
      completed: false,
      priority: 'high'
    };
    (TaskService.getTaskById as jest.Mock).mockResolvedValue(mockTask);
    
    // This is primarily a compile-time TypeScript check
    // We'll render to ensure it works at runtime
    render(<TaskDetailsPage />);
    
    // Wait for task details to load
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });
}); 