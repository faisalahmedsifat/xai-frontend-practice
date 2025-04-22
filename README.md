# TaskFlow: Progressive React/TypeScript Challenge

TaskFlow is a progressive learning challenge designed to help you build and refine your React and TypeScript skills through a series of increasingly complex tasks. The project is structured into 10 skill levels, each focusing on specific React concepts and patterns.

## Project Structure

The project is organized into levels, each with its own set of tests and requirements:

```
/
├── __tests__/            # Test files organized by level
│   ├── level1/           # Basic Components and Event Handling
│   ├── level2/           # State Management & Forms
│   ├── level3/           # Component Composition
│   ├── level4/           # Context API
│   ├── level5/           # Custom Hooks
│   ├── level6/           # Advanced Component Patterns
│   ├── level7/           # Performance Optimization
│   ├── level8/           # Next.js Routing
│   ├── level9/           # Advanced State Management
│   └── level10/          # Integration & Advanced Features
│
├── src/
│   ├── components/       # React components
│   ├── context/          # Context providers
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Next.js pages
│   ├── types/            # TypeScript interfaces
│   └── utils/            # Utility functions
│
├── jest.config.mjs       # Jest configuration
├── jest.setup.js         # Jest setup file
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies and scripts
```

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start with Level 1:
   - Read the README.md file in `__tests__/level1/`
   - Implement the required components
   - Run the tests for Level 1:
     ```
     npm run test:level1
     ```
4. Progress through each level in order

## Skill Levels

### Level 1: Basic Components and Event Handling
- Implement a `ToggleButton` component
- Learn about React components, props, state, and event handling
- Understand TypeScript typing for props and events

### Level 2: State Management & Forms
- Create form components with validation
- Display tasks with proper styling
- Learn about controlled inputs and form submission

### Level 3: Component Composition
- Break UI into smaller, reusable components
- Implement component composition
- Create filtering functionality

### Level 4: Context API
- Implement global state with React Context
- Create reducers for state management
- Type context providers and consumers

### Level 5: Custom Hooks
- Extract reusable logic into custom hooks
- Create hooks for forms, filtering, and local storage
- Apply TypeScript generics to make hooks flexible

### Level 6: Advanced Component Patterns
- Implement compound components
- Use render props pattern
- Create higher-order components
- Apply TypeScript generics to advanced patterns

### Level 7: Performance Optimization
- Optimize rendering with React.memo
- Use useCallback for event handlers
- Apply useMemo for expensive calculations
- Implement code splitting with React.lazy

### Level 8: Next.js Routing
- Implement page routing
- Create dynamic routes
- Add route guards and redirects
- Type route parameters

### Level 9: Advanced State Management
- Implement complex state shapes
- Create undo/redo functionality
- Add optimistic updates
- Track task history

### Level 10: Integration & Advanced Features
- Implement drag and drop
- Create data visualizations
- Build virtualized lists
- Add keyboard shortcuts
- Create a theme switcher

## Learning Approach

Each level builds upon the previous ones, gradually introducing more complex concepts. The tests for each level clearly define what you need to implement. Read the README.md file in each level's directory for detailed requirements and learning objectives.

Start with Level 1 and only move to the next level once you've passed all tests. This structured approach ensures you build a solid foundation before tackling more advanced topics.

## Running Tests

You can run tests for a specific level using:

```
npm run test:level1
npm run test:level2
# ...and so on
```

To run all tests:

```
npm test
```

## TypeScript

This project uses TypeScript to provide type safety. Each level includes TypeScript interfaces in the `src/types` directory. These interfaces define the shape of your components, props, and state, helping you catch errors during development.

## Development

You can start the Next.js development server to see your components in action:

```
npm run dev
```

This will start the server at http://localhost:3000.

Happy coding!
