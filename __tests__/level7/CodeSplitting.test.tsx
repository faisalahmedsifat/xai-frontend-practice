import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskApp } from '../../src/components/level7/TaskApp';

// Mock the lazy-loaded components to simulate code splitting
jest.mock('../../src/components/level7/TaskDashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="task-dashboard">Task Dashboard Content</div>
}));

jest.mock('../../src/components/level7/Statistics', () => ({
  __esModule: true,
  default: () => <div data-testid="statistics">Statistics Content</div>
}));

jest.mock('../../src/components/level7/Settings', () => ({
  __esModule: true,
  default: () => <div data-testid="settings">Settings Content</div>
}));

// Mock React.lazy to track its usage and simulate lazy loading
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  let shouldFail = false;
  
  return {
    ...originalReact,
    lazy: jest.fn((importFn) => {
      // Create a component that will be loaded after a delay
      return function LazyLoadedComponent(props: any) {
        const [Component, setComponent] = originalReact.useState<React.ComponentType<any> | null>(null);
        const [error, setError] = originalReact.useState<Error | null>(null);
        
        originalReact.useEffect(() => {
          if (shouldFail) {
            setError(new Error('Failed to load component'));
            return;
          }
          
          let isMounted = true;
          importFn()
            .then((module: any) => {
              // Simulate network delay
              setTimeout(() => {
                if (isMounted) {
                  setComponent(() => module.default || module);
                }
              }, 100);
            })
            .catch((err: Error) => {
              if (isMounted) {
                setError(err);
              }
            });
          
          return () => {
            isMounted = false;
          };
        }, []);
        
        if (error) {
          throw error;
        }
        
        return Component ? <Component {...props} /> : null;
      };
    }),
    // Need to expose a way to control loading failures for tests
    __setLazyLoadShouldFail: (fail: boolean) => {
      shouldFail = fail;
    }
  };
});

describe('Code Splitting with React.lazy and Suspense', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the failure flag before each test
    (React as any).__setLazyLoadShouldFail(false);
  });

  it('should use React.lazy for loading components', () => {
    render(<TaskApp />);
    
    // The lazy function should have been called for code splitting
    expect(React.lazy).toHaveBeenCalled();
  });

  it('should show a loading indicator while components are being loaded', async () => {
    render(<TaskApp />);
    
    // Should initially show a loading indicator
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Dashboard should be visible now
    expect(screen.getByTestId('task-dashboard')).toBeInTheDocument();
  });

  it('should load different components when navigating', async () => {
    const user = userEvent.setup();
    
    render(<TaskApp />);
    
    // Wait for initial component to load
    await waitFor(() => {
      expect(screen.getByTestId('task-dashboard')).toBeInTheDocument();
    });
    
    // Navigate to Statistics
    const statsLink = screen.getByRole('link', { name: /statistics/i });
    await user.click(statsLink);
    
    // Should show loading indicator again
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    
    // Wait for statistics to load
    await waitFor(() => {
      expect(screen.getByTestId('statistics')).toBeInTheDocument();
    });
    
    // Dashboard should not be visible anymore
    expect(screen.queryByTestId('task-dashboard')).not.toBeInTheDocument();
  });

  it('should handle errors when components fail to load', async () => {
    // Set the lazy loading to fail
    (React as any).__setLazyLoadShouldFail(true);
    
    render(<TaskApp />);
    
    // Wait for error boundary to catch the error
    await waitFor(() => {
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
    
    // Should show error message
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    
    // Should provide a retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should properly implement Suspense with fallback UI', () => {
    // Direct test of the Suspense implementation
    const { container } = render(<TaskApp />);
    
    // Check that a Suspense component exists in the rendered output
    const hasSuspense = React.Suspense.name in container;
    
    // Indirect test: check for loading indicator which should be the fallback
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('should implement code splitting for all major sections', async () => {
    const user = userEvent.setup();
    
    render(<TaskApp />);
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByTestId('task-dashboard')).toBeInTheDocument();
    });
    
    // Navigate to Settings
    const settingsLink = screen.getByRole('link', { name: /settings/i });
    await user.click(settingsLink);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByTestId('settings')).toBeInTheDocument();
    });
    
    // Navigate to Statistics
    const statsLink = screen.getByRole('link', { name: /statistics/i });
    await user.click(statsLink);
    
    // Wait for statistics to load
    await waitFor(() => {
      expect(screen.getByTestId('statistics')).toBeInTheDocument();
    });
    
    // React.lazy should have been called at least 3 times (one for each section)
    expect((React.lazy as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it('should type lazy-loaded components correctly', async () => {
    // This is primarily a TypeScript test that's checked at compile time
    // At runtime, we just verify the components render without errors
    
    render(<TaskApp />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByTestId('task-dashboard')).toBeInTheDocument();
    });
  });
}); 