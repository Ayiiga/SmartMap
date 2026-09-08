"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bookmark,
  Crosshair,
  Layers,
  Navigation,
  Search,
} from "lucide-react";
import { SmartMapLogo } from "@/components/smart-map/logo";
import { useMapStore } from "@/stores/map-store";
import { useLiveLocation } from "@/lib/geo/use-live-location";
import { cn } from "@/lib/utils";

interface SmartMapTopBarProps {
  onLayersClick?: () => void;
  onSearchClick?: () => void;
}

const NAV_LINKS = [
  { href: "/", label: "Explore" },
  { href: "/navigate", label: "Navigate" },
  { href: "/search", label: "Discover" },
] as const;

export function SmartMapTopBar({ onLayersClick, onSearchClick }: SmartMapTopBarProps) {
  const pathname = usePathname() ?? "/";
  const setFollowUser = useMapStore((s) => s.setFollowUser);
  const countryCode = useMapStore((s) => s.countryCode);
  const { requestLocation } = useLiveLocation(false);

  const utilityItems = [
    {
      id: "locate",
      label: "My Location",
      icon: Crosshair,
      onClick: () => {
        void requestLocation();
        setFollowUser(true);
      },
    },
    {
      id: "layers",
      label: "Layers",
      icon: Layers,
      onClick: onLayersClick,
    },
    {
      id: "directions",
      label: "Directions",
      icon: Navigation,
      href: "/navigate",
      active: pathname.startsWith("/navigate"),
    },
    {
      id: "saved",
      label: "Saved",
      icon: Bookmark,
      href: "/favorites",
      active: pathname.startsWith("/favorites"),
    },
  ];

  return (
    <header
      className="pointer-events-auto absolute inset-x-0 top-0 z-40 border-b border-white/10 bg-[#0A0E23]/92 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-2 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <SmartMapLogo size="sm" />
          <div className="hidden min-w-0 sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-extrabold text-white">Smart Map</span>
              <span className="rounded-md bg-amber-400/90 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#0A0E23]">
                PWA
              </span>
            </div>
            <div className="mt-0.5 flex gap-2 text-[10px] font-medium text-slate-400">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "hover:text-white",
                    pathname === href || (href !== "/" && pathname.startsWith(href))
                      ? "text-[#3B82F6]"
                      : "",
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </Link>

        {/* Search */}
        <Link
          href="/search"
          onClick={onSearchClick}
          className="mx-auto flex min-h-[44px] max-w-xl flex-1 items-center gap-2 rounded-full border border-white/12 bg-[#12182F]/90 px-4 py-2 shadow-inner"
        >
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate text-sm text-slate-400">
            Search places, towns, landmarks, or addresses…
          </span>
        </Link>

        {/* Utility icons */}
        <div className="hidden items-center gap-0.5 md:flex">
          {utilityItems.map(({ id, label, icon: Icon, onClick, href, active }) =>
            href ? (
              <Link
                key={id}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[9px] font-semibold transition-colors",
                  active
                    ? "bg-[#3B82F6]/20 text-[#60A5FA]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
                title={label}
              >
                <Icon className="h-4 w-4" />
                <span className="max-w-[4rem] truncate">{label}</span>
              </Link>
            ) : (
              <button
                key={id}
                type="button"
                onClick={onClick}
                className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[9px] font-semibold text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                title={label}
              >
                <Icon className="h-4 w-4" />
                <span className="max-w-[4rem] truncate">{label}</span>
              </button>
            ),
          )}
        </div>

        {/* Country + notifications */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#12182F] px-2 py-1.5 text-xs font-bold text-white"
            aria-label="Country"
          >
            <span>{countryCode === "GH" ? "🇬🇭" : "🌍"}</span>
            <span className="hidden sm:inline">{countryCode === "GH" ? "Ghana" : countryCode}</span>
          </button>
          <button
            type="button"
            className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
