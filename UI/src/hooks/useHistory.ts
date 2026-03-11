"use client";

import { useCallback, useMemo, useState } from "react";

type HistoryState<T> = { stack: T[]; index: number };

export function useHistory<T>(initial: T) {
  const [state, setState] = useState<HistoryState<T>>({ stack: [initial], index: 0 });

  const record = useCallback((next: T) => {
    setState((prev) => {
      const trimmed = prev.stack.slice(0, prev.index + 1);
      trimmed.push(next);
      return { stack: trimmed, index: prev.index + 1 };
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) => ({ ...prev, index: Math.max(0, prev.index - 1) }));
  }, []);

  const redo = useCallback(() => {
    setState((prev) => ({ ...prev, index: Math.min(prev.stack.length - 1, prev.index + 1) }));
  }, []);

  const canUndo = state.index > 0;
  const canRedo = state.index < state.stack.length - 1;
  const current = useMemo(() => state.stack[state.index], [state]);

  return { current, record, undo, redo, canUndo, canRedo, size: state.stack.length, index: state.index } as const;
}

