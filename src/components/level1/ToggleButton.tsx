'use client';
import React from 'react';
import { ToggleButtonProps } from '../../types';
import {useState} from 'react'

/**
 * A button that toggles content visibility when clicked.
 * 
 * This is a starter implementation for Level 1.
 * Your task is to implement the toggle functionality.
 */
const ToggleButton: React.FC<ToggleButtonProps> = ({ 
  text,
  className = '',
  initialVisible = false,
  onToggle
}) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  
  // TODO: Implement a toggle function that updates the visibility state
  // and calls the onToggle callback if provided
  function handleToggle(){
    const visibility = !isVisible;
    setIsVisible(visibility);
    if (onToggle) onToggle(visibility)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>){
    if (e.key === ' ' || e.key === 'Enter'){
      handleToggle();
    }
  }
  
  return (
    <div className="toggle-container">
      <button 
        className={`toggle-button ${className}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isVisible}
        // TODO: Add aria-expanded attribute based on visibility state
      >
        Toggle
      </button>
      
      {/* TODO: Conditionally render the text based on visibility state */}
      {isVisible && <div className="toggle-content">{text}</div>}
    </div>
  );
};

export default ToggleButton; 