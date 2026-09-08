"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/smart-map/bottom-nav";
import { useLiveLocation } from "@/lib/geo/use-live-location";

const MAP_FULLSCREEN = new Set(["/", "/navigate", "/spacecam"]);
const HIDE_BOTTOM_NAV = new Set(["/", "/navigate"]);
const AUTH_ROUTES = new Set(["/login", "/register", "/auth/auth-code-error"]);

function LiveLocationBootstrap() {
  useLiveLocation(true);
  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fullscreen = MAP_FULLSCREEN.has(pathname ?? "/");
  const hideBottomNav = HIDE_BOTTOM_NAV.has(pathname ?? "/");
  const authRoute = AUTH_ROUTES.has(pathname ?? "") || (pathname ?? "").startsWith("/auth/");

  return (
    <div
      className={
        fullscreen
          ? "relative h-[100dvh] w-full overflow-hidden"
          : authRoute
            ? "min-h-[100dvh]"
            : "min-h-[100dvh] pb-24"
      }
    >
      <LiveLocationBootstrap />
      {children}
      {!authRoute && !hideBottomNav && <BottomNav />}
    </div>
  );
}
