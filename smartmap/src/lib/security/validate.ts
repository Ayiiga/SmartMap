/**
 * Shared input validation helpers for Smart Map APIs and forms.
 */

export function sanitizeText(input: unknown, max = 500): string {
  if (typeof input !== "string") return "";
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}

export function isValidPhone(input: string): boolean {
  return /^\+?[0-9\s()-]{7,20}$/.test(input.trim());
}

export function isValidCoord(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
