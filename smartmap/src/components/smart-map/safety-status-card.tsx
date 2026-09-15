"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { formatRelativeTime } from "@/lib/geo/accuracy";
import { useMapStore } from "@/stores/map-store";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";

type SafetyLevel = "clear" | "advisory" | "warning" | "critical" | "unknown";

interface SafetyStatus {
  level: SafetyLevel;
  message: string;
  lastChecked: number;
  source: string;
}

const LEVEL_STYLES: Record<SafetyLevel, { dot: string; bg: string; text: string }> = {
  clear: { dot: "🟢", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-800 dark:text-emerald-200" },
  advisory: { dot: "🟡", bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-800 dark:text-amber-200" },
  warning: { dot: "🟠", bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-800 dark:text-orange-200" },
  critical: { dot: "🔴", bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-800 dark:text-red-200" },
  unknown: { dot: "🔵", bg: "bg-slate-50 dark:bg-slate-900/30", text: "text-slate-700 dark:text-slate-300" },
};

export function SafetyStatusCard() {
  const reports = useMapStore((s) => s.reports);
  const online = useOnlineStatus();
  const [status, setStatus] = useState<SafetyStatus>({
    level: "clear",
    message: "No active major hazards detected",
    lastChecked: Date.now(),
    source: "Smart Map safety monitor",
  });

  useEffect(() => {
    const verified = reports.filter((r) => r.status === "verified" || r.status === "verifying");
    const now = Date.now();
    if (!online) {
      setStatus({
        level: "unknown",
        message: "Safety status unavailable offline — showing last check",
        lastChecked: now,
        source: "Cached",
      });
      return;
    }
    if (verified.length > 0) {
      const highSeverity = new Set(["fire", "flood", "crime", "accident", "missing_person"]);
      setStatus({
        level: verified.some((r) => highSeverity.has(r.type)) ? "warning" : "advisory",
        message: `${verified.length} community alert${verified.length > 1 ? "s" : ""} in your area`,
        lastChecked: now,
        source: "Community reports",
      });
    } else {
      setStatus({
        level: "clear",
        message: "No active major hazards detected",
        lastChecked: now,
        source: "Smart Map safety monitor",
      });
    }
  }, [reports, online]);

  const style = LEVEL_STYLES[status.level];

  return (
    <section
      className={`rounded-2xl border border-white/30 p-4 shadow-lg backdrop-blur-xl dark:border-white/10 ${style.bg}`}
    >
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 shrink-0 text-[#0F5B8D]" />
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Safety status
        </p>
      </div>
      <p className={`mt-2 text-sm font-bold ${style.text}`}>
        <span aria-hidden>{style.dot}</span> {status.message}
      </p>
      <p className="mt-1 text-[11px] text-slate-500">
        Last checked: {formatRelativeTime(status.lastChecked)} · Source: {status.source}
      </p>
    </section>
  );
}
