# Level 1: Basic Components and Event Handling

## Learning Objectives

In this level, you'll learn:
- How to create a functional React component with TypeScript
- How to use props with proper TypeScript interfaces
- How to implement and use state with the `useState` hook
- How to handle events in React components
- How to use conditional rendering
- How to implement proper accessibility attributes

## Task Overview

Your task is to implement a `ToggleButton` component that shows or hides text when clicked. 

A starter implementation has been provided in `src/components/ToggleButton.tsx`, but it's missing the core functionality. You'll need to:

1. Add state to track whether the button is toggled on or off
2. Implement a toggle function to update the state when the button is clicked
3. Display the text content only when the button is toggled on
4. Ensure proper styling is applied to the component
5. Make sure the component is accessible with appropriate ARIA attributes

## Requirements

- The component should accept and use all the props defined in the `ToggleButtonProps` interface
- The button should toggle the visibility of text when clicked
- The component should support an optional `initialVisible` prop to set the initial state
- The component should invoke an optional `onToggle` callback when the state changes
- The component should apply any custom CSS class passed via the `className` prop
- The button should have appropriate ARIA attributes (`aria-expanded`) for accessibility

## Tips

- Start by examining the `ToggleButtonProps` interface in `src/types/level1.ts`
- Use the `useState` hook to manage the visibility state
- Remember that state updates in React are asynchronous
- To conditionally render elements, use the `{condition && <element/>}` pattern
- Make sure to implement keyboard accessibility (Enter and Space keys should trigger the toggle)

## Tests

Run the tests for this level with:

```
npm run test:level1
```

All tests should pass when you've successfully implemented the component.

## Example Usage

```tsx
// Basic usage
<ToggleButton text="Hello World" />

// With initial visibility set to true
<ToggleButton text="Hello World" initialVisible={true} />

// With custom class name
<ToggleButton text="Hello World" className="custom-button" />

// With toggle callback
<ToggleButton 
  text="Hello World" 
  onToggle={(isVisible) => console.log(`Content is now ${isVisible ? 'visible' : 'hidden'}`)} 
/>
``` 