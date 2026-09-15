"use client";

import { useCallback, useRef } from "react";

/** Prevents duplicate form submissions during async auth requests. */
export function useSubmitGuard() {
  const inFlight = useRef(false);

  const guard = useCallback(async <T,>(operation: () => Promise<T>): Promise<T | null> => {
    if (inFlight.current) return null;
    inFlight.current = true;
    try {
      return await operation();
    } finally {
      inFlight.current = false;
    }
  }, []);

  return { guard, isSubmitting: inFlight };
}
