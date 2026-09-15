"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { searchAstronomicalObjects } from "@/lib/spacecam/astronomy/search";
import { useSpaceCamStore } from "@/lib/spacecam/spacecam-store";
import { useObserverContext } from "@/lib/spacecam/hooks/use-observer-context";
import { cn } from "@/lib/utils";

export function SearchPanel() {
  const searchOpen = useSpaceCamStore((s) => s.searchOpen);
  const setSearchOpen = useSpaceCamStore((s) => s.setSearchOpen);
  const setSelectedObject = useSpaceCamStore((s) => s.setSelectedObject);
  const observer = useObserverContext();
  const [query, setQuery] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const results = query.length >= 1 ? searchAstronomicalObjects(query, observer) : [];

  if (!searchOpen) return null;

  return (
    <div className="pointer-events-auto absolute inset-x-3 top-16 z-40 mx-auto max-w-lg rounded-3xl border border-white/20 bg-slate-950/95 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-white/10 p-3">
        <Search className="h-5 w-5 shrink-0 text-cyan-300" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Moon, Jupiter, Orion, HIP 16228…"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          autoFocus
          aria-label="Search astronomical objects"
        />
        <button
          type="button"
          onClick={() => setSearchOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10"
          aria-label="Close search"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {!isOnline && (
        <p className="border-b border-white/10 px-3 py-2 text-[10px] font-bold text-amber-300">
          Offline — searching cached catalog only
        </p>
      )}

      <ul className="max-h-64 overflow-y-auto p-2">
        {results.length === 0 && query.length >= 1 && (
          <li className="px-3 py-4 text-center text-sm text-slate-400">No objects found</li>
        )}
        {results.map((result) => (
          <li key={result.id}>
            <button
              type="button"
              onClick={() => {
                setSelectedObject(result);
                setSearchOpen(false);
              }}
              className="flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-white/5"
            >
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{result.name}</p>
                <p className="text-xs text-slate-400">
                  {result.type}
                  {result.constellation ? ` · ${result.constellation}` : ""}
                  {result.magnitude != null ? ` · Mag ${result.magnitude.toFixed(1)}` : ""}
                </p>
                {result.description && (
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{result.description}</p>
                )}
              </div>
              {result.visibility && (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                    result.visibility.isAboveHorizon
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-slate-700/50 text-slate-400",
                  )}
                >
                  {result.visibility.label}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
