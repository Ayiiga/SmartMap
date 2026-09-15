"use client";

import { useEffect } from "react";
import { registerGlobalErrorHandlers } from "@/lib/monitoring/logger";

export function MonitoringProvider() {
  useEffect(() => {
    registerGlobalErrorHandlers();
  }, []);

  return null;
}
