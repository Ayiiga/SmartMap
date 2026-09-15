"use client";

import { useOnlineStatus } from "@/lib/hooks/use-online-status";
import type { RouteSource } from "@/lib/navigation/use-route-planner";

interface RouteSourceIndicatorProps {
  source: RouteSource;
  routeCount: number;
  loading?: boolean;
}

export function RouteSourceIndicator({ source, routeCount, loading }: RouteSourceIndicatorProps) {
  const online = useOnlineStatus();

  if (loading || routeCount === 0) return null;

  const isLive = online && source === "osrm";

  return (
    <p
      className={`rounded-full px-3 py-1 text-center text-[11px] font-bold ${
        isLive
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-amber-500/15 text-amber-400"
      }`}
      role="status"
    >
      {isLive
        ? `Live road routing · ${routeCount} route${routeCount > 1 ? "s" : ""}`
        : `Offline routing · cached route${routeCount > 1 ? "s" : ""}`}
    </p>
  );
}
