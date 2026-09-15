"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/smart-map/bottom-nav";
import { OfflineBanner } from "@/components/smart-map/offline-banner";
import { AddToHomeScreenPrompt } from "@/components/smart-map/a2hs-prompt";
import { useLiveLocation } from "@/lib/geo/use-live-location";

const MAP_FULLSCREEN = new Set(["/", "/navigate", "/spacecam"]);
const HIDE_BOTTOM_NAV = new Set<string>([]);
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
      {!authRoute && !fullscreen && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <OfflineBanner />
        </div>
      )}
      {children}
      {!authRoute && <AddToHomeScreenPrompt />}
      {!authRoute && !hideBottomNav && <BottomNav />}
    </div>
  );
}
