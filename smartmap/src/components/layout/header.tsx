"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Zap,
  Trophy,
  Tv,
  Radio,
  Play,
  MonitorPlay,
  TrendingUp,
  Briefcase,
  Cpu,
  Film,
  Globe,
  MapPin,
  Users,
  User,
  Search,
  Menu,
  X,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { useOnlineStatus } from "@/components/providers/app-providers";
import { UserMenu } from "@/components/auth/user-menu";
import { BRAND } from "@/lib/brand";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/breaking", label: "Breaking", icon: Zap },
  { href: "/sports", label: "Sports", icon: Trophy },
  { href: "/world-cup-2026", label: "World Cup", icon: Trophy },
  { href: "/live-tv", label: "Live TV", icon: Tv },
  { href: "/watch", label: "Watch", icon: MonitorPlay },
  { href: "/live-radio", label: "Live Radio", icon: Radio },
  { href: "/videos", label: "Videos", icon: Play },
  { href: "/trending", label: "Trending", icon: TrendingUp },
  { href: "/business", label: "Business", icon: Briefcase },
  { href: "/technology", label: "Tech", icon: Cpu },
  { href: "/entertainment", label: "Entertainment", icon: Film },
  { href: "/africa", label: "Africa", icon: MapPin },
  { href: "/world", label: "World", icon: Globe },
  { href: "/community", label: "Community", icon: Users },
  { href: "/search", label: "Search", icon: Search },
  { href: "/profile", label: "Profile", icon: User },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-50 border-b border-giga-border bg-white/95 backdrop-blur-lg shadow-sm dark:bg-giga-surface/95 dark:border-giga-border-dark">
      <div className="mx-auto flex h-[4.25rem] sm:h-18 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gtv-purple to-gtv-cyan text-base sm:text-lg font-extrabold text-white shadow-md shadow-gtv-purple/25">
            GT
          </span>
          <div>
            <span className="font-display text-xl sm:text-2xl font-extrabold text-gradient leading-tight">{BRAND.name}</span>
            <p className="text-[11px] sm:text-xs text-giga-muted leading-tight max-w-[200px] font-medium">{BRAND.tagline}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex overflow-x-auto" aria-label="Main navigation">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors min-h-[44px] whitespace-nowrap",
                pathname === href || (href !== "/" && pathname.startsWith(href))
                  ? "bg-gtv-purple/10 text-gtv-purple"
                  : "text-giga-muted hover:bg-gtv-purple/5 hover:text-gtv-purple",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2.25} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <UserMenu />

          <ThemeToggle />

          <div className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm" aria-label={isOnline ? "Online" : "Offline mode"}>
            {isOnline ? <Wifi className="h-5 w-5 text-gtv-green" strokeWidth={2.25} /> : <WifiOff className="h-5 w-5 text-gtv-orange" strokeWidth={2.25} />}
          </div>

          <button
            className="touch-target flex items-center justify-center rounded-xl p-2.5 xl:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-7 w-7" strokeWidth={2.25} /> : <Menu className="h-7 w-7" strokeWidth={2.25} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-giga-border bg-white px-4 py-5 xl:hidden dark:bg-giga-surface max-h-[75vh] overflow-y-auto"
          aria-label="Mobile navigation"
        >
          <div className="grid grid-cols-2 gap-2">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base font-semibold min-h-[52px]",
                  pathname === href ? "bg-gtv-purple/10 text-gtv-purple" : "text-foreground/80",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={2.25} />
                {label}
              </Link>
            ))}
          </div>
        </motion.nav>
      )}
    </header>
  );
}
