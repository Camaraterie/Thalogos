import { useState, useEffect } from 'react';

// A custom hook to keep state in sync with localStorage.
// It's generic, so it can store any type of data (string, object, etc.)
function usePersistentState<T>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // 1. Initialize state. We try to get the value from localStorage first.
  const [state, setState] = useState<T>(() => {
    try {
      const storageValue = window.localStorage.getItem(key);
      // If a value is found in localStorage, parse it and use it.
      if (storageValue) {
        return JSON.parse(storageValue);
      }
    } catch (error) {
      // If parsing fails, log the error and fall back to the initial state.
      console.error("Error reading from localStorage", error);
    }
    // Otherwise, use the initial state provided.
    return initialState;
  });

  // 2. Use an effect to update localStorage whenever the state changes.
  useEffect(() => {
    try {
      // Convert the state to a JSON string and save it.
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [key, state]); // This effect runs every time 'key' or 'state' changes.

  return [state, setState];
}

export default usePersistentState;
