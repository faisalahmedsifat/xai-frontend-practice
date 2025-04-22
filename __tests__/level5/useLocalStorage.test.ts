import { renderHook, act } from '@testing-library/react-hooks';
import { useLocalStorage } from '../../src/hooks/useLocalStorage';

describe('useLocalStorage Hook', () => {
  // Mock localStorage
  let mockStorage: { [key: string]: string } = {};
  
  beforeEach(() => {
    // Clear mock storage before each test
    mockStorage = {};
    
    // Mock localStorage methods
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      mockStorage[key] = value.toString();
    });
    
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      return mockStorage[key] || null;
    });
    
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete mockStorage[key];
    });
  });
  
  afterEach(() => {
    // Restore mocks
    jest.restoreAllMocks();
  });
  
  it('should initialize with the value from localStorage if it exists', () => {
    // Pre-populate localStorage
    mockStorage['testKey'] = JSON.stringify({ test: 'value' });
    
    const { result } = renderHook(() => useLocalStorage({
      key: 'testKey',
      initialValue: { default: 'value' }
    }));
    
    // Should have initialized with the value from localStorage
    expect(result.current[0]).toEqual({ test: 'value' });
  });
  
  it('should initialize with the initialValue if localStorage is empty', () => {
    const initialValue = { default: 'value' };
    
    const { result } = renderHook(() => useLocalStorage({
      key: 'testKey',
      initialValue
    }));
    
    // Should have initialized with the initialValue
    expect(result.current[0]).toEqual(initialValue);
    
    // Should have set the initialValue in localStorage
    expect(JSON.parse(mockStorage['testKey'])).toEqual(initialValue);
  });
  
  it('should update localStorage when the value changes', () => {
    const { result } = renderHook(() => useLocalStorage({
      key: 'testKey',
      initialValue: { count: 0 }
    }));
    
    // Initial state
    expect(result.current[0]).toEqual({ count: 0 });
    
    // Update the value
    act(() => {
      result.current[1]({ count: 1 });
    });
    
    // State should be updated
    expect(result.current[0]).toEqual({ count: 1 });
    
    // localStorage should be updated
    expect(JSON.parse(mockStorage['testKey'])).toEqual({ count: 1 });
  });
  
  it('should support functional updates', () => {
    const { result } = renderHook(() => useLocalStorage({
      key: 'testKey',
      initialValue: { count: 0 }
    }));
    
    // Update using a function
    act(() => {
      result.current[1]((prevValue) => ({ 
        count: prevValue.count + 1 
      }));
    });
    
    // State should be updated
    expect(result.current[0]).toEqual({ count: 1 });
    
    // localStorage should be updated
    expect(JSON.parse(mockStorage['testKey'])).toEqual({ count: 1 });
    
    // Another functional update
    act(() => {
      result.current[1]((prevValue) => ({ 
        count: prevValue.count + 1 
      }));
    });
    
    // State should be updated again
    expect(result.current[0]).toEqual({ count: 2 });
    
    // localStorage should be updated again
    expect(JSON.parse(mockStorage['testKey'])).toEqual({ count: 2 });
  });
  
  it('should handle parsing errors gracefully', () => {
    // Set invalid JSON in localStorage
    mockStorage['testKey'] = 'invalid json';
    
    const initialValue = { default: 'value' };
    
    const { result } = renderHook(() => useLocalStorage({
      key: 'testKey',
      initialValue
    }));
    
    // Should fallback to initialValue on parsing error
    expect(result.current[0]).toEqual(initialValue);
    
    // Should have corrected localStorage with the initialValue
    expect(JSON.parse(mockStorage['testKey'])).toEqual(initialValue);
  });
  
  it('should use custom serializer and deserializer when provided', () => {
    const customSerialize = jest.fn((value: Date) => value.toISOString());
    const customDeserialize = jest.fn((value: string) => new Date(value));
    
    const initialDate = new Date('2023-01-01');
    
    // Set up hook with custom serializer/deserializer
    const { result } = renderHook(() => useLocalStorage({
      key: 'dateKey',
      initialValue: initialDate,
      serialize: customSerialize,
      deserialize: customDeserialize
    }));
    
    // Initial state should be the date
    expect(result.current[0]).toEqual(initialDate);
    
    // Serializer should have been called
    expect(customSerialize).toHaveBeenCalledWith(initialDate);
    
    // Update the value
    const newDate = new Date('2023-02-01');
    act(() => {
      result.current[1](newDate);
    });
    
    // State should be updated
    expect(result.current[0]).toEqual(newDate);
    
    // Serializer should have been called with the new value
    expect(customSerialize).toHaveBeenCalledWith(newDate);
    
    // Simulate component remount to test deserializer
    const { result: remountResult } = renderHook(() => useLocalStorage({
      key: 'dateKey',
      initialValue: initialDate,
      serialize: customSerialize,
      deserialize: customDeserialize
    }));
    
    // Deserializer should have been called with the stored value
    expect(customDeserialize).toHaveBeenCalled();
    
    // State should be initialized from localStorage
    expect(remountResult.current[0]).toEqual(newDate);
  });
  
  it('should handle different data types correctly', () => {
    // Test with a string
    const { result: stringResult } = renderHook(() => useLocalStorage({
      key: 'stringKey',
      initialValue: 'test string'
    }));
    
    expect(stringResult.current[0]).toBe('test string');
    
    // Test with a number
    const { result: numberResult } = renderHook(() => useLocalStorage({
      key: 'numberKey',
      initialValue: 42
    }));
    
    expect(numberResult.current[0]).toBe(42);
    
    // Test with an array
    const { result: arrayResult } = renderHook(() => useLocalStorage({
      key: 'arrayKey',
      initialValue: [1, 2, 3]
    }));
    
    expect(arrayResult.current[0]).toEqual([1, 2, 3]);
    
    // Test with a boolean
    const { result: boolResult } = renderHook(() => useLocalStorage({
      key: 'boolKey',
      initialValue: true
    }));
    
    expect(boolResult.current[0]).toBe(true);
  });
  
  it('should have proper TypeScript generic typing', () => {
    // This is a compile-time test to verify TypeScript generics
    
    // String type
    const { result: stringResult } = renderHook(() => useLocalStorage({
      key: 'stringKey',
      initialValue: 'test string'
    }));
    
    const stringValue: string = stringResult.current[0];
    const setStringValue: React.Dispatch<React.SetStateAction<string>> = stringResult.current[1];
    
    // Number type
    const { result: numberResult } = renderHook(() => useLocalStorage({
      key: 'numberKey',
      initialValue: 42
    }));
    
    const numberValue: number = numberResult.current[0];
    const setNumberValue: React.Dispatch<React.SetStateAction<number>> = numberResult.current[1];
    
    // Object type
    const { result: objectResult } = renderHook(() => useLocalStorage<{ name: string; age: number }>({
      key: 'objectKey',
      initialValue: { name: 'John', age: 30 }
    }));
    
    const objectValue: { name: string; age: number } = objectResult.current[0];
    const setObjectValue: React.Dispatch<React.SetStateAction<{ name: string; age: number }>> = objectResult.current[1];
    
    // If no TypeScript errors, this test passes
    expect(true).toBeTruthy();
  });
}); 