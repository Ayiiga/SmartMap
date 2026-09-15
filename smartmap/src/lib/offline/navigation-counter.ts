const NAV_COUNT_KEY = "smart-map-successful-nav-count";
const A2HS_DISMISSED_KEY = "smart-map-a2hs-dismissed";

export function readSuccessfulNavigationCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(localStorage.getItem(NAV_COUNT_KEY) ?? "0") || 0;
  } catch {
    return 0;
  }
}

export function recordSuccessfulNavigation(): number {
  const next = readSuccessfulNavigationCount() + 1;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(NAV_COUNT_KEY, String(next));
    } catch {
      // ignore
    }
  }
  return next;
}

export function shouldShowA2hsPrompt(): boolean {
  if (typeof window === "undefined") return false;
  if (readSuccessfulNavigationCount() < 2) return false;
  try {
    return localStorage.getItem(A2HS_DISMISSED_KEY) !== "true";
  } catch {
    return true;
  }
}

export function dismissA2hsPrompt(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(A2HS_DISMISSED_KEY, "true");
  } catch {
    // ignore
  }
}
