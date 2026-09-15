"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Loader2, Mic, Search as SearchIcon } from "lucide-react";
import type { GeoSearchResult } from "@/lib/geo/types";
import { cn } from "@/lib/utils";

interface PlaceAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: GeoSearchResult) => void;
  placeholder?: string;
  voiceEnabled?: boolean;
  className?: string;
  /** Inline style without outer border — for route input cards */
  minimal?: boolean;
}

export function PlaceAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Search anywhere in the world…",
  voiceEnabled = true,
  className,
  minimal = false,
}: PlaceAutocompleteProps) {
  const listId = useId();
  const [results, setResults] = useState<GeoSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [listening, setListening] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      startTransition(() => {
        void (async () => {
          try {
            const res = await fetch(`/api/geo/search?q=${encodeURIComponent(q)}&limit=8`, {
              signal: controller.signal,
              cache: "no-store",
            });
            const data = (await res.json()) as { results?: GeoSearchResult[] };
            setResults(data.results ?? []);
            setOpen(true);
          } catch {
            if (!controller.signal.aborted) setResults([]);
          }
        })();
      });
    }, 280);
    return () => {
      window.clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [value]);

  function startVoice() {
    // Web Speech API (Chrome / Safari / Android PWA)
    const w = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        start: () => void;
        onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        start: () => void;
        onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
      };
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) onChange(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex items-center gap-2",
          minimal
            ? "bg-transparent"
            : "rounded-2xl border border-sm-border bg-white px-3 py-2.5 dark:border-white/10 dark:bg-black/20",
        )}
      >
        {!minimal && <SearchIcon className="h-4 w-4 shrink-0 text-sm-primary" />}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
          aria-autocomplete="list"
          aria-controls={listId}
          autoComplete="off"
        />
        {pending && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        {voiceEnabled && !minimal && (
          <button
            type="button"
            onClick={startVoice}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-xl",
              listening ? "bg-sm-emerald text-white" : "bg-slate-100 dark:bg-white/10",
            )}
            aria-label="Voice search"
          >
            <Mic className="h-4 w-4" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <ul
          id={listId}
          className="absolute z-40 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-sm-border bg-white shadow-xl dark:border-white/10 dark:bg-sm-primary-deep"
        >
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                className="w-full px-3 py-2.5 text-left text-sm hover:bg-sm-primary/5"
                onClick={() => {
                  onSelect(result);
                  onChange(result.name);
                  setOpen(false);
                }}
              >
                <span className="font-semibold">{result.name}</span>
                <span className="mt-0.5 block text-xs text-slate-500 line-clamp-2">{result.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
