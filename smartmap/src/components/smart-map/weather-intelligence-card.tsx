"use client";

import { useEffect, useState } from "react";
import { CloudSun, RefreshCw } from "lucide-react";
import { formatRelativeTime } from "@/lib/geo/accuracy";
import { useMapStore } from "@/stores/map-store";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";
import type { WeatherSnapshot } from "@/types/smart-map";

interface WeatherData {
  weather: WeatherSnapshot;
  fetchedAt: string;
  source: string;
}

type LoadState = "idle" | "loading" | "success" | "error";

export function WeatherIntelligenceCard() {
  const userLocation = useMapStore((s) => s.userLocation);
  const permission = useMapStore((s) => s.locationPermission);
  const online = useOnlineStatus();
  const [data, setData] = useState<WeatherData | null>(null);
  const [state, setState] = useState<LoadState>("idle");

  const load = () => {
    if (!userLocation || !online) return;
    setState("loading");
    void fetch(`/api/weather?lat=${userLocation.lat}&lng=${userLocation.lng}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Weather unavailable");
        const json = (await res.json()) as WeatherData & { source?: string; fetchedAt?: string };
        setData({
          weather: json.weather,
          fetchedAt: json.fetchedAt ?? new Date().toISOString(),
          source: json.source ?? "open-meteo",
        });
        setState("success");
      })
      .catch(() => setState("error"));
  };

  useEffect(() => {
    if (!userLocation || permission !== "granted") return;
    const timer = setTimeout(load, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation?.lat, userLocation?.lng, permission, online]);

  if (!userLocation || permission !== "granted") return null;

  return (
    <section className="rounded-2xl border border-white/30 bg-white/95 p-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1220]/95">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CloudSun className="h-4 w-4 text-[#0F5B8D]" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Current weather
          </p>
        </div>
        {state === "success" && data && (
          <span className="text-2xl font-bold">{data.weather.tempC}°</span>
        )}
      </div>

      {state === "loading" && <p className="mt-2 text-sm text-slate-500">Loading weather…</p>}

      {state === "error" && (
        <div className="mt-2">
          <p className="text-sm text-slate-500">Weather data is temporarily unavailable.</p>
          <button
            type="button"
            onClick={load}
            className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold text-[#0F5B8D]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {state === "success" && data && (
        <>
          <p className="mt-1 text-sm font-semibold">{data.weather.condition}</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <dt className="text-slate-500">Rain chance</dt>
              <dd className="font-semibold">{data.weather.rainChance}%</dd>
            </div>
            <div>
              <dt className="text-slate-500">Wind</dt>
              <dd className="font-semibold">{data.weather.windKph} km/h</dd>
            </div>
            <div>
              <dt className="text-slate-500">Humidity</dt>
              <dd className="font-semibold">{data.weather.humidity}%</dd>
            </div>
            <div>
              <dt className="text-slate-500">UV index</dt>
              <dd className="font-semibold">{data.weather.uvIndex}</dd>
            </div>
          </dl>
          {data.weather.heatAlert && (
            <p className="mt-2 rounded-lg bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
              Heat advisory — stay hydrated
            </p>
          )}
          {data.weather.floodRisk !== "low" && (
            <p className="mt-2 rounded-lg bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-200">
              Flood risk: {data.weather.floodRisk}
            </p>
          )}
          <p className="mt-2 text-[10px] text-slate-400">
            Source: Open-Meteo · Updated {formatRelativeTime(new Date(data.fetchedAt).getTime())}
          </p>
        </>
      )}
    </section>
  );
}
