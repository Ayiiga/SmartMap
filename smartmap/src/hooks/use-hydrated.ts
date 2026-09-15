"use client";

import { useEffect, useState } from "react";

/** True after the client has mounted — use before reading localStorage/persisted state. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
