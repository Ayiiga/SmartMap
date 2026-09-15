"use client";

import { useEffect, useState } from "react";
import { Download, Wifi } from "lucide-react";
import { isGhanaPackReady, warmGhanaTilePack } from "@/lib/offline/ghana-tile-pack";

export function OfflineReadyBadge() {
  const [ready, setReady] = useState(false);
  const [warming, setWarming] = useState(false);

  useEffect(() => {
    setReady(isGhanaPackReady());
    if (isGhanaPackReady()) return;

    setWarming(true);
    void warmGhanaTilePack().then(() => {
      setReady(isGhanaPackReady());
      setWarming(false);
    });
  }, []);

  if (!ready && !warming) return null;

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg"
      role="status"
    >
      {warming ? (
        <>
          <Download className="h-3.5 w-3.5 animate-pulse" />
          Caching Ashanti maps…
        </>
      ) : (
        <>
          <Wifi className="h-3.5 w-3.5" />
          Offline ready
        </>
      )}
    </div>
  );
}
