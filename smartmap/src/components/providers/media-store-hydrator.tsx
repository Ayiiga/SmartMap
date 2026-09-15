"use client";

import { useEffect } from "react";
import { useMediaStore } from "@/stores/media-store";

/** Rehydrates persisted media preferences after mount to avoid SSR mismatches. */
export function MediaStoreHydrator() {
  useEffect(() => {
    void useMediaStore.persist.rehydrate();
  }, []);
  return null;
}
