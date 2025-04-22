import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskStatsChart } from '@/components/level10/TaskStatsChart';
import { BurndownChart } from '@/components/level10/BurndownChart';
import { PriorityDistribution } from '@/components/level10/PriorityDistribution';
import { Task } from '@/types';

// Mock recharts components
jest.mock('recharts', () => {
  const OriginalRechartsModule = jest.requireActual('recharts');
  
  return {
    ...OriginalRechartsModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: ({ children, data }: { children: React.ReactNode, data: any[] }) => (
      <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>{children}</div>
    ),
    LineChart: ({ children, data }: { children: React.ReactNode, data: any[] }) => (
      <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>{children}</div>
    ),
    PieChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="pie-chart">{children}</div>
    ),
    Bar: (props: any) => <div data-testid="bar" data-bar-props={JSON.stringify(props)} />,
    Line: (props: any) => <div data-testid="line" data-line-props={JSON.stringify(props)} />,
    Pie: (props: any) => <div data-testid="pie" data-pie-props={JSON.stringify(props)} />,
    XAxis: (props: any) => <div data-testid="x-axis" data-axis-props={JSON.stringify(props)} />,
    YAxis: (props: any) => <div data-testid="y-axis" data-axis-props={JSON.stringify(props)} />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
  };
});

// Mock tasks data
const mockTasks: Task[] = [
  { id: '1', title: 'Task 1', status: 'completed', priority: 'high', createdAt: '2023-01-01', completedAt: '2023-01-05' },
  { id: '2', title: 'Task 2', status: 'completed', priority: 'medium', createdAt: '2023-01-02', completedAt: '2023-01-07' },
  { id: '3', title: 'Task 3', status: 'pending', priority: 'high', createdAt: '2023-01-03' },
  { id: '4', title: 'Task 4', status: 'in-progress', priority: 'low', createdAt: '2023-01-04' },
  { id: '5', title: 'Task 5', status: 'pending', priority: 'medium', createdAt: '2023-01-05' },
];

describe('Data Visualization Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render task statistics chart with correct data structure', () => {
    render(<TaskStatsChart tasks={mockTasks} />);
    
    // Check for the chart components
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
    
    // Check that the correct data is passed to the chart
    const chartData = JSON.parse(screen.getByTestId('bar-chart').getAttribute('data-chart-data') || '[]');
    
    // Should have entries for different task statuses
    expect(chartData).toHaveLength(3); // completed, pending, in-progress
    
    // Check the data structure
    expect(chartData.find((d: any) => d.name === 'Completed').count).toBe(2);
    expect(chartData.find((d: any) => d.name === 'Pending').count).toBe(2);
    expect(chartData.find((d: any) => d.name === 'In Progress').count).toBe(1);
  });

  it('should render an interactive statistics chart with toggleable data series', async () => {
    const user = userEvent.setup();
    
    render(<TaskStatsChart tasks={mockTasks} interactive />);
    
    // Find toggle buttons
    const statusToggle = screen.getByRole('button', { name: /status/i });
    const priorityToggle = screen.getByRole('button', { name: /priority/i });
    
    // Initial chart should show status distribution
    let chartData = JSON.parse(screen.getByTestId('bar-chart').getAttribute('data-chart-data') || '[]');
    expect(chartData[0]).toHaveProperty('name'); // Status names like 'Completed'
    
    // Switch to priority view
    await user.click(priorityToggle);
    
    // Now chart should show priority distribution
    chartData = JSON.parse(screen.getByTestId('bar-chart').getAttribute('data-chart-data') || '[]');
    expect(chartData.some((d: any) => d.name === 'High')).toBe(true);
    expect(chartData.some((d: any) => d.name === 'Medium')).toBe(true);
    expect(chartData.some((d: any) => d.name === 'Low')).toBe(true);
    
    // Switch back to status view
    await user.click(statusToggle);
    
    // Check we're back to status distribution
    chartData = JSON.parse(screen.getByTestId('bar-chart').getAttribute('data-chart-data') || '[]');
    expect(chartData.some((d: any) => d.name === 'Completed')).toBe(true);
  });

  it('should render a burndown chart with projected and actual progress', () => {
    // Define sprint dates
    const sprintStart = '2023-01-01';
    const sprintEnd = '2023-01-15';
    
    render(
      <BurndownChart 
        tasks={mockTasks}
        sprintStart={sprintStart}
        sprintEnd={sprintEnd}
        totalPoints={20}
      />
    );
    
    // Check that the chart renders
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
    
    // Check for both lines - ideal and actual burndown
    const lineElements = screen.getAllByTestId('line');
    expect(lineElements).toHaveLength(2);
    
    // Check that the chart data includes all dates in the sprint
    const chartData = JSON.parse(screen.getByTestId('line-chart').getAttribute('data-chart-data') || '[]');
    expect(chartData.length).toBeGreaterThan(0);
    expect(chartData[0].date).toBe('2023-01-01');
    expect(chartData[chartData.length - 1].date).toBe('2023-01-15');
    
    // Check for ideal burndown line properties
    const idealLineProps = JSON.parse(lineElements[0].getAttribute('data-line-props') || '{}');
    expect(idealLineProps.name).toBe('Ideal Burndown');
    expect(idealLineProps.stroke).toBeDefined();
    
    // Check for actual burndown line properties
    const actualLineProps = JSON.parse(lineElements[1].getAttribute('data-line-props') || '{}');
    expect(actualLineProps.name).toBe('Actual Burndown');
    expect(actualLineProps.stroke).toBeDefined();
  });

  it('should render a priority distribution pie chart', () => {
    render(<PriorityDistribution tasks={mockTasks} />);
    
    // Check for the pie chart
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
    
    // Check for the legend
    expect(screen.getByTestId('legend')).toBeInTheDocument();
    
    // Check the pie component props
    const pieProps = JSON.parse(screen.getByTestId('pie').getAttribute('data-pie-props') || '{}');
    expect(pieProps.data).toBeDefined();
    expect(pieProps.dataKey).toBe('value');
    
    // Check for correct legend entries
    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
    expect(screen.getByText(/low/i)).toBeInTheDocument();
  });

  it('should make charts responsive to viewport changes', () => {
    render(
      <div>
        <TaskStatsChart tasks={mockTasks} />
        <BurndownChart tasks={mockTasks} sprintStart="2023-01-01" sprintEnd="2023-01-15" totalPoints={20} />
        <PriorityDistribution tasks={mockTasks} />
      </div>
    );
    
    // Check for responsive containers
    const responsiveContainers = screen.getAllByTestId('responsive-container');
    expect(responsiveContainers).toHaveLength(3);
    
    // Check for width and height props
    responsiveContainers.forEach(container => {
      expect(container).toBeInTheDocument();
    });
  });

  it('should handle empty task arrays gracefully', () => {
    render(
      <div>
        <TaskStatsChart tasks={[]} />
        <BurndownChart tasks={[]} sprintStart="2023-01-01" sprintEnd="2023-01-15" totalPoints={20} />
        <PriorityDistribution tasks={[]} />
      </div>
    );
    
    // All charts should still render without errors
    expect(screen.getAllByTestId(/chart/)).toHaveLength(3);
    
    // Check for empty state messages
    expect(screen.getByText(/no tasks to display/i)).toBeInTheDocument();
  });

  it('should provide accessible charts with proper ARIA attributes', () => {
    render(<TaskStatsChart tasks={mockTasks} />);
    
    // Check for title and description
    expect(screen.getByText(/task statistics/i)).toBeInTheDocument();
    expect(screen.getByText(/distribution of tasks/i)).toBeInTheDocument();
    
    // Check the chart container has appropriate role
    const chartContainer = screen.getByTestId('bar-chart').closest('div');
    expect(chartContainer).toHaveAttribute('role', 'img');
    expect(chartContainer).toHaveAttribute('aria-label');
  });

  it('should properly type all visualization components', () => {
    // This is primarily a compile-time TypeScript check
    
    // Test with explicitly typed props
    type ChartDataPoint = {
      name: string;
      count: number;
      color: string;
    };
    
    // Render with explicit generics to check TypeScript compatibility
    render(
      <TaskStatsChart<ChartDataPoint> 
        tasks={mockTasks}
        dataKey="count"
        nameKey="name"
        colorKey="color"
      />
    );
    
    // Check that the component renders without TypeScript errors
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
}); 