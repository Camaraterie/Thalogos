import { useState, useEffect, useCallback } from 'react';

// A more advanced version of usePersistentState that includes undo/redo history.
function useVersionedState<T>(key: string, initialState: T): [
  T, // current state
  (newState: T) => void, // function to set state
  () => void, // undo
  () => void, // redo
  boolean, // canUndo
  boolean, // canRedo
  T | undefined // previous state
] {
  const [state, setState] = useState<{ history: T[]; currentIndex: number }>(() => {
    try {
      const storageValue = window.localStorage.getItem(key);
      if (storageValue) {
        const parsedState = JSON.parse(storageValue);
        // Basic validation
        if (Array.isArray(parsedState.history) && typeof parsedState.currentIndex === 'number') {
          return parsedState;
        }
      }
    } catch (error) {
      console.error("Error reading versioned state from localStorage", error);
    }
    // Return initial state if nothing in storage or if data is corrupt
    return { history: [initialState], currentIndex: 0 };
  });

  // Persist the entire state object (history and index) to localStorage.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Error writing versioned state to localStorage", error);
    }
  }, [key, state]);

  const currentState = state.history[state.currentIndex];
  const previousState = state.history[state.currentIndex - 1];

  const canUndo = state.currentIndex > 0;
  const canRedo = state.currentIndex < state.history.length - 1;

  // setState now needs to manage the history array.
  const set = useCallback((newState: T) => {
    // If the new state is the same as the current one, do nothing.
    if (newState === currentState) {
      return;
    }

    setState(prevState => {
      // If we've undone, and now we're setting a new state,
      // we should truncate the "future" history.
      const newHistory = prevState.history.slice(0, prevState.currentIndex + 1);
      newHistory.push(newState);
      
      return {
        history: newHistory,
        currentIndex: newHistory.length - 1
      };
    });
  }, [currentState]);

  const undo = useCallback(() => {
    if (canUndo) {
      setState(prevState => ({
        ...prevState,
        currentIndex: prevState.currentIndex - 1
      }));
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      setState(prevState => ({
        ...prevState,
        currentIndex: prevState.currentIndex + 1
      }));
    }
  }, [canRedo]);

  return [currentState, set, undo, redo, canUndo, canRedo, previousState];
}

export default useVersionedState;
