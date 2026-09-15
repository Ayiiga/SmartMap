"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudSun, CloudRain, Sun } from "lucide-react";
import { useMapStore } from "@/stores/map-store";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";

type WeatherState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ok"; tempC: number; condition: string; city: string };

function weatherIcon(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower")) return CloudRain;
  if (c.includes("clear") || c.includes("mainly clear")) return Sun;
  if (c.includes("cloud") || c.includes("overcast") || c.includes("fog")) return Cloud;
  return CloudSun;
}

function formatTemp(temp: unknown): number | null {
  const n = typeof temp === "number" ? temp : Number(temp);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function HomeWeatherWidget() {
  const userLocation = useMapStore((s) => s.userLocation);
  const resolvedAddress = useMapStore((s) => s.resolvedAddress);
  const online = useOnlineStatus();
  const [state, setState] = useState<WeatherState>({ status: "loading" });

  useEffect(() => {
    const lat = userLocation?.lat ?? 5.6037;
    const lng = userLocation?.lng ?? -0.187;
    const city = resolvedAddress?.city || resolvedAddress?.label?.split(",")[0] || "Accra";

    if (!online) {
      setState({ status: "error" });
      return;
    }

    setState({ status: "loading" });
    void fetch(`/api/weather?lat=${lat}&lng=${lng}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("unavailable");
        const data = (await res.json()) as { weather?: { tempC?: number; condition?: string } };
        const tempC = formatTemp(data.weather?.tempC);
        const condition = data.weather?.condition?.trim() || "Partly Cloudy";
        if (tempC == null) throw new Error("invalid");
        setState({ status: "ok", tempC, condition, city });
      })
      .catch(() => setState({ status: "error" }));
  }, [userLocation?.lat, userLocation?.lng, resolvedAddress?.city, resolvedAddress?.label, online]);

  const Icon = state.status === "ok" ? weatherIcon(state.condition) : CloudSun;

  return (
    <div
      className="pointer-events-auto absolute left-4 z-20 rounded-2xl border border-[#1E293B] bg-[#141C2F]/90 p-3 shadow-lg backdrop-blur-md"
      style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
      role="status"
      aria-label="Current weather"
    >
      {state.status === "loading" && (
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-pulse rounded-full bg-[#1E293B]" />
          <div className="space-y-1">
            <div className="h-4 w-20 animate-pulse rounded bg-[#1E293B]" />
            <div className="h-3 w-16 animate-pulse rounded bg-[#1E293B]/70" />
          </div>
        </div>
      )}
      {state.status === "error" && (
        <div className="flex items-center gap-2 text-[#94A3B8]">
          <Icon className="h-5 w-5 shrink-0" aria-hidden />
          <p className="text-sm">Weather unavailable</p>
        </div>
      )}
      {state.status === "ok" && (
        <div className="flex items-center gap-2.5">
          <Icon className="h-6 w-6 shrink-0 text-[#60A5FA]" aria-hidden />
          <div>
            <p className="text-lg font-semibold leading-tight text-[#F8FAFC]">
              {state.tempC}°C · {state.condition}
            </p>
            <p className="text-sm text-[#94A3B8]">{state.city}</p>
          </div>
        </div>
      )}
    </div>
  );
}
