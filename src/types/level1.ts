export interface ToggleButtonProps {
  /**
   * The text to display when the button is toggled on
   */
  text: string;
  
  /**
   * Optional custom class names to apply to the button element
   */
  className?: string;
  
  /**
   * Optional initial state of the toggle button
   * @default false
   */
  initialVisible?: boolean;
  
  /**
   * Optional callback function that is called when the toggle state changes
   */
  onToggle?: (isVisible: boolean) => void;
} 