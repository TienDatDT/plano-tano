import { useState, useCallback } from "react";

export function useHistory<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture([state, ...future]);
    setState(previous);
  }, [past, state, future]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast([...past, state]);
    setFuture(newFuture);
    setState(next);
  }, [future, state, past]);

  const set = useCallback((newValues: T | ((prev: T) => T)) => {
    setState((current) => {
      const next = typeof newValues === "function" ? (newValues as any)(current) : newValues;
      
      // If the state is exactly the same, don't push to history
      if (JSON.stringify(current) === JSON.stringify(next)) return current;

      setPast((p) => [...p, current]);
      setFuture([]);
      return next;
    });
  }, []);

  const reset = useCallback((newInitialState: T) => {
    setState(newInitialState);
    setPast([]);
    setFuture([]);
  }, []);

  return {
    state,
    set,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
