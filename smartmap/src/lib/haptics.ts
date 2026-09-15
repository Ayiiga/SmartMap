/** Light haptic tap for primary actions (Android / iOS where supported). */
export function hapticTap(): void {
  if (typeof navigator === "undefined") return;
  try {
    navigator.vibrate?.(12);
  } catch {
    // Vibration API unavailable
  }
}
