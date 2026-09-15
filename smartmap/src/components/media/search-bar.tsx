"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Mic, MicOff, Clock, TrendingUp } from "lucide-react";
import { globalSearch, getSearchSuggestions } from "@/content/media";
import type { SearchFilter } from "@/content/media";
import { useMediaStore } from "@/stores/media-store";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/use-hydrated";
import { SpeechRecognizer } from "@/lib/speech";

interface GlobalSearchBarProps {
  className?: string;
  autoFocus?: boolean;
  onSubmit?: (query: string) => void;
}

export function GlobalSearchBar({ className, autoFocus, onSubmit }: GlobalSearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestions = getSearchSuggestions();
  const hydrated = useHydrated();
  const searchHistory = useMediaStore((s) => s.preferences.searchHistory ?? []);
  const addSearchHistory = useMediaStore((s) => s.addSearchHistory);
  const results = query.trim() ? globalSearch(query) : [];

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleVoice = useCallback(() => {
    const recognizer = new SpeechRecognizer();
    setListening(true);
    recognizer.start(
      (transcript) => {
        setQuery(transcript);
        setOpen(true);
        setListening(false);
      },
      () => setListening(false),
    );
  }, []);

  const submit = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    addSearchHistory(trimmed);
    setOpen(false);
    if (onSubmit) {
      onSubmit(trimmed);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-giga-muted" aria-hidden strokeWidth={2.25} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => e.key === "Enter" && query.trim() && submit(query)}
            placeholder="Search news, videos, TV, sports..."
            className="w-full rounded-2xl border-2 border-giga-border bg-white/90 py-4 pl-14 pr-4 text-base font-medium backdrop-blur-sm focus:border-gtv-purple focus:outline-none focus:ring-2 focus:ring-gtv-purple/20 dark:bg-giga-surface/90 min-h-[56px] shadow-sm"
            aria-label="Global search"
            {...(open ? { "aria-controls": "search-results" } : {})}
            autoComplete="off"
          />
        </div>
        <button
          onClick={handleVoice}
          className={cn(
            "touch-target flex items-center justify-center rounded-2xl border-2 px-4 min-h-[56px] min-w-[56px]",
            listening ? "border-gtv-red bg-gtv-red/10 text-gtv-red" : "border-giga-border hover:border-gtv-purple bg-white/90 shadow-sm",
          )}
          aria-label={listening ? "Listening" : "Voice search"}
        >
          {listening ? <MicOff className="h-6 w-6" strokeWidth={2.25} /> : <Mic className="h-6 w-6" strokeWidth={2.25} />}
        </button>
      </div>

      {open && (
        <div
          id="search-results"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-giga-border bg-white shadow-2xl dark:bg-giga-surface"
          role="listbox"
          aria-label="Search suggestions"
        >
          {query.trim() ? (
            results.length > 0 ? (
              results.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => submit(r.title)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gtv-purple/5 min-h-[48px]"
                >
                  <span className="rounded bg-gtv-purple/10 px-2 py-0.5 text-xs font-bold uppercase text-gtv-purple">{r.type}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{r.title}</p>
                    {r.subtitle && <p className="text-xs text-giga-muted">{r.subtitle}</p>}
                  </div>
                </button>
              ))
            ) : (
              <p className="px-4 py-6 text-center text-sm text-giga-muted">No results found</p>
            )
          ) : (
            <div className="p-3 space-y-4">
              {hydrated && searchHistory.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold uppercase text-giga-muted">
                    <Clock className="h-3.5 w-3.5" /> Recent searches
                  </p>
                  {searchHistory.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      onClick={() => { setQuery(s); submit(s); }}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-gtv-purple/5"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div>
                <p className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold uppercase text-giga-muted">
                  <TrendingUp className="h-3.5 w-3.5" /> Trending searches
                </p>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); submit(s); }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-gtv-purple/5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {query && (
            <button
              onClick={() => submit(query)}
              className="w-full border-t border-giga-border px-4 py-3 text-sm font-semibold text-gtv-purple hover:bg-gtv-purple/5"
            >
              Search for &quot;{query}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export const SEARCH_FILTERS: { id: SearchFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "article", label: "News" },
  { id: "video", label: "Videos" },
  { id: "tv", label: "TV" },
  { id: "radio", label: "Radio" },
  { id: "team", label: "Teams" },
  { id: "player", label: "Players" },
  { id: "country", label: "Countries" },
  { id: "competition", label: "Competitions" },
  { id: "topic", label: "Topics" },
];
