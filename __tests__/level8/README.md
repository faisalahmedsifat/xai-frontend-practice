# Level 8: Next.js Routing

## Learning Objectives

In this level, you'll learn:
- How to implement client-side navigation with Next.js
- How to use dynamic routes for task details
- How to implement route guards and redirects
- How to type route parameters and navigation functions
- How to use Next.js Link and useRouter

## Task Overview

Your task is to implement a task management application with Next.js routing:

1. Create a dashboard page that displays all tasks
2. Implement a task details page with dynamic routing
3. Add a settings page with theme and user preferences
4. Create route guards to protect certain routes
5. Implement proper typing for all routing-related code

## Requirements

### Dashboard Page
- Create a dashboard page at `/`
- Display a list of tasks with basic information
- Implement filters and sorting with URL query parameters
- Add navigation to task details and settings

### Task Details Page
- Create a dynamic route at `/tasks/[id]`
- Display full task details based on the route parameter
- Implement edit and delete functionality
- Add navigation back to the dashboard

### Settings Page
- Create a settings page at `/settings`
- Implement theme selection (light/dark)
- Add user preferences options
- Store settings in localStorage and sync across pages

### Route Guards & Redirects
- Implement a route guard to prevent access to non-existent tasks
- Add a redirect from `/home` to `/`
- Create a 404 page for invalid routes
- Add proper typing for all routing functionality

## Tips

- Use Next.js's `Link` component for client-side navigation
- Use `useRouter` hook to access route parameters and implement navigation
- Consider using TypeScript generics for route parameters
- Be careful with server-side rendering (SSR) when accessing browser APIs like localStorage
- Use proper TypeScript interfaces for all route parameters and navigation functions

## Tests

Run the tests for this level with:

```
npm run test:level8
```

All tests should pass when you've successfully implemented the routing.

## Example Usage

### Navigation with Link
```tsx
import Link from 'next/link';

const Navigation = () => (
  <nav>
    <Link href="/">Dashboard</Link>
    <Link href="/settings">Settings</Link>
    <Link href={`/tasks/${taskId}`}>Task Details</Link>
  </nav>
);
```

### Accessing Route Parameters
```tsx
import { useRouter } from 'next/router';

const TaskDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  // Fetch task using id parameter
  
  return (
    <div>
      <h1>Task Details: {id}</h1>
      {/* Task details */}
    </div>
  );
};
```

### Programmatic Navigation
```tsx
import { useRouter } from 'next/router';

const TaskActions = ({ task }) => {
  const router = useRouter();
  
  const handleDelete = async () => {
    await deleteTask(task.id);
    router.push('/');
  };
  
  return (
    <button onClick={handleDelete}>Delete</button>
  );
};
```

### Route Guards
```tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const ProtectedPage = () => {
  const router = useRouter();
  const isAuthenticated = useAuthStatus();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);
  
  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }
  
  return <div>Protected Content</div>;
};
``` 