"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Home,
  ExternalLink,
  Globe,
  PanelLeftClose,
  PanelLeft,
  Tv,
  Film,
  Heart,
} from "lucide-react";
import { getAllWatchableChannels, getTvStationById, getMovieChannelById } from "@/content/media";
import { useMediaStore } from "@/stores/media-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ChannelBrowserProps {
  initialChannelId?: string;
  initialUrl?: string;
}

export function ChannelBrowser({ initialChannelId, initialUrl }: ChannelBrowserProps) {
  const channels = getAllWatchableChannels();
  const addRecentChannel = useMediaStore((s) => s.addRecentChannel);
  const toggleFavoriteTv = useMediaStore((s) => s.toggleFavoriteTv);
  const favoriteTv = useMediaStore((s) => s.preferences.favoriteTvStations);
  const recentIds = useMediaStore((s) => s.preferences.recentChannels ?? []);

  const initial = initialChannelId
    ? channels.find((c) => c.id === initialChannelId)
    : undefined;

  const [currentUrl, setCurrentUrl] = useState(initial?.url ?? initialUrl ?? channels[0]?.url ?? "");
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [activeChannelId, setActiveChannelId] = useState(initial?.id ?? "");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [history, setHistory] = useState<string[]>([currentUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigate = useCallback((url: string, channelId?: string) => {
    setCurrentUrl(url);
    setInputUrl(url);
    setIframeBlocked(false);
    if (channelId) {
      setActiveChannelId(channelId);
      addRecentChannel(channelId);
    }
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(url);
      return next;
    });
    setHistoryIndex((i) => i + 1);
  }, [addRecentChannel, historyIndex]);

  useEffect(() => {
    if (initialChannelId && initial) {
      addRecentChannel(initialChannelId);
    }
  }, [initialChannelId, initial, addRecentChannel]);

  const goBack = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      setCurrentUrl(history[idx]);
      setInputUrl(history[idx]);
      setIframeBlocked(false);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      setCurrentUrl(history[idx]);
      setInputUrl(history[idx]);
      setIframeBlocked(false);
    }
  };

  const reload = () => {
    setIframeBlocked(false);
    iframeRef.current?.contentWindow?.location.reload();
  };

  const submitUrl = () => {
    let url = inputUrl.trim();
    if (!url.startsWith("http")) url = `https://${url}`;
    navigate(url);
  };

  const selectChannel = (ch: (typeof channels)[0]) => {
    navigate(ch.url, ch.id);
  };

  const activeChannel = channels.find((c) => c.id === activeChannelId);
  const recentChannels = recentIds
    .map((id) => channels.find((c) => c.id === id))
    .filter(Boolean) as typeof channels;

  const categories = [...new Set(channels.map((c) => c.category))];

  return (
    <div className="flex h-[calc(100vh-4.25rem)] flex-col bg-gtv-deep">
      {/* Browser toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-gtv-deep/95 px-3 py-3 sm:px-4 backdrop-blur-lg">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="touch-target flex items-center justify-center rounded-xl p-2.5 text-white/80 hover:bg-white/10 lg:hidden"
          aria-label={sidebarOpen ? "Hide channels" : "Show channels"}
        >
          {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
        </button>

        <div className="flex items-center gap-1">
          <button onClick={goBack} disabled={historyIndex <= 0} className="touch-target rounded-xl p-2.5 text-white/80 hover:bg-white/10 disabled:opacity-30" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button onClick={goForward} disabled={historyIndex >= history.length - 1} className="touch-target rounded-xl p-2.5 text-white/80 hover:bg-white/10 disabled:opacity-30" aria-label="Forward">
            <ArrowRight className="h-5 w-5" />
          </button>
          <button onClick={reload} className="touch-target rounded-xl p-2.5 text-white/80 hover:bg-white/10" aria-label="Reload">
            <RotateCcw className="h-5 w-5" />
          </button>
          <Link href="/watch" className="touch-target rounded-xl p-2.5 text-white/80 hover:bg-white/10" aria-label="Browser home">
            <Home className="h-5 w-5" />
          </Link>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5">
          <Globe className="h-5 w-5 shrink-0 text-gtv-cyan" />
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitUrl()}
            className="min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-white/50 focus:outline-none"
            placeholder="Enter URL or pick a channel..."
            aria-label="Browser address bar"
          />
          <button onClick={submitUrl} className="shrink-0 rounded-lg bg-gtv-purple px-3 py-1.5 text-sm font-bold text-white hover:bg-gtv-purple/90">
            Go
          </button>
        </div>

        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="touch-target flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden sm:inline">Open tab</span>
        </a>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Channel sidebar */}
        <aside
          className={cn(
            "flex w-full flex-col border-r border-white/10 bg-gtv-deep/80 overflow-y-auto transition-all lg:w-72 xl:w-80",
            sidebarOpen ? "absolute inset-y-0 left-0 z-40 top-[8.5rem] lg:relative lg:top-0" : "hidden lg:flex",
          )}
        >
          <div className="p-4">
            <h2 className="font-display text-lg font-extrabold text-white">GigaTrend Browser</h2>
            <p className="mt-1 text-sm text-white/60">Watch official TV & movie channels</p>
          </div>

          {recentChannels.length > 0 && (
            <div className="px-4 pb-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gtv-gold">Recent</p>
              <div className="space-y-1">
                {recentChannels.slice(0, 5).map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => selectChannel(ch)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors min-h-[48px]",
                      activeChannelId === ch.id ? "bg-gtv-purple text-white" : "text-white/80 hover:bg-white/10",
                    )}
                  >
                    <span className="text-xl">{ch.logo}</span>
                    <span className="truncate">{ch.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {categories.map((cat) => {
            const items = channels.filter((c) => c.category === cat);
            return (
              <div key={cat} className="px-4 pb-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gtv-cyan">
                  {cat.includes("Movie") ? <Film className="h-3.5 w-3.5" /> : <Tv className="h-3.5 w-3.5" />}
                  {cat}
                </p>
                <div className="space-y-1">
                  {items.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => selectChannel(ch)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors min-h-[48px]",
                        activeChannelId === ch.id ? "bg-gtv-purple text-white" : "text-white/80 hover:bg-white/10",
                      )}
                    >
                      <span className="text-xl">{ch.logo}</span>
                      <span className="truncate flex-1">{ch.name}</span>
                      {ch.type === "movie" && <Film className="h-4 w-4 shrink-0 opacity-60" />}
                      {favoriteTv.includes(ch.id) && <Heart className="h-4 w-4 shrink-0 fill-gtv-red text-gtv-red" />}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </aside>

        {/* Main viewer */}
        <div className="relative flex min-w-0 flex-1 flex-col bg-black">
          {activeChannel && (
            <div className="flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl">{activeChannel.logo}</span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-white">{activeChannel.name}</p>
                  <p className="truncate text-xs text-white/60">{activeChannel.category}</p>
                </div>
              </div>
              <button
                onClick={() => toggleFavoriteTv(activeChannel.id)}
                className={cn(
                  "touch-target rounded-xl p-2.5",
                  favoriteTv.includes(activeChannel.id) ? "text-gtv-red" : "text-white/60 hover:text-white",
                )}
                aria-label="Favourite channel"
              >
                <Heart className={cn("h-5 w-5", favoriteTv.includes(activeChannel.id) && "fill-current")} />
              </button>
            </div>
          )}

          {iframeBlocked ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
              <div className="rounded-3xl bg-white/10 p-6">
                <Globe className="mx-auto h-16 w-16 text-gtv-cyan" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white">Channel opened externally</h3>
                <p className="mt-2 max-w-md text-base text-white/70">
                  Some broadcasters restrict in-app embedding. Open the official source in a new tab to watch securely.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <a href={currentUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="gap-2">
                    <ExternalLink className="h-5 w-5" /> Watch on Official Site
                  </Button>
                </a>
                <Button variant="outline" size="lg" onClick={() => setIframeBlocked(false)} className="border-white/30 text-white hover:bg-white/10">
                  Try again in browser
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={currentUrl}
              title={activeChannel?.name ?? "GigaTrend TV Browser"}
              className="h-full w-full flex-1 border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              onError={() => setIframeBlocked(true)}
            />
          )}

          <p className="border-t border-white/10 bg-black/60 px-4 py-2 text-center text-xs text-white/50">
            Official sources only · {getTvStationById(activeChannelId)?.officialSource ?? getMovieChannelById(activeChannelId)?.officialSource ?? "Browse securely"}
          </p>
        </div>
      </div>

      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close channel list"
        />
      )}
    </div>
  );
}
