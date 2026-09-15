"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";

export function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div
      className="pointer-events-auto rounded-2xl border border-amber-500/30 bg-[#141C2F]/95 p-3 shadow-lg backdrop-blur"
      role="alert"
    >
      <div className="flex items-start gap-2">
        <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-400">
            Offline mode
          </p>
          <p className="text-sm text-[#94A3B8]">
            You&apos;re offline. Showing your last available map and location data.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#1E5EB8] px-3 py-2 text-xs font-bold text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry connection
          </button>
        </div>
      </div>
    </div>
  );
}
