/**
 * Accessibility helpers for Smart Map.
 */

export type A11yPrefs = {
  largeText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
};

export const DEFAULT_A11Y: A11yPrefs = {
  largeText: false,
  highContrast: false,
  reduceMotion: false,
};

export function applyA11yPrefs(prefs: A11yPrefs): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("sm-a11y-large-text", prefs.largeText);
  root.classList.toggle("sm-a11y-high-contrast", prefs.highContrast);
  root.classList.toggle("sm-a11y-reduce-motion", prefs.reduceMotion);
}
