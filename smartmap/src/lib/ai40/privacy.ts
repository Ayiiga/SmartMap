import type { PrivacyConsent, PrivacyConsentKey, TrustedSource } from "@/lib/ai40/types";

export const DEFAULT_CONSENTS: PrivacyConsent[] = [
  {
    key: "location",
    granted: false,
    purpose: "GPS positioning for navigation, nearby places, and route planning.",
  },
  {
    key: "motion_sensors",
    granted: false,
    purpose: "Detect sudden stops or impacts to improve safety alerts (optional).",
  },
  {
    key: "calendar",
    granted: false,
    purpose: "Suggest departure times for planned trips (optional).",
  },
  {
    key: "weather_providers",
    granted: false,
    purpose: "Fetch weather and hazard forecasts for your route.",
  },
  {
    key: "government_alerts",
    granted: false,
    purpose: "Receive official emergency and disaster alerts.",
  },
  {
    key: "traffic_feeds",
    granted: false,
    purpose: "Access public traffic data for congestion and incidents.",
  },
  {
    key: "community_reports",
    granted: false,
    purpose: "Show verified community safety reports near your route.",
  },
  {
    key: "web_intelligence",
    granted: false,
    purpose: "Summarize trusted public sources relevant to your travel.",
  },
  {
    key: "bluetooth",
    granted: false,
    purpose: "Optional connectivity for vehicle or wearable integrations.",
  },
  {
    key: "camera",
    granted: false,
    purpose: "Scan QR codes or capture road conditions only when you request it.",
  },
  {
    key: "microphone",
    granted: false,
    purpose: "Voice navigation and hands-free AI assistant commands.",
  },
  {
    key: "location_sharing",
    granted: false,
    purpose: "Share live location with emergency contacts during SOS.",
  },
];

export const TRUSTED_SOURCES: TrustedSource[] = [
  {
    id: "open-meteo",
    name: "Open-Meteo Weather",
    type: "weather",
    url: "https://open-meteo.com",
    requiresConsent: "weather_providers",
  },
  {
    id: "gh-met",
    name: "Ghana Meteorological Agency",
    type: "government",
    url: "https://www.meteo.gov.gh",
    requiresConsent: "government_alerts",
  },
  {
    id: "nadmo",
    name: "NADMO Ghana",
    type: "government",
    url: "https://nadmo.gov.gh",
    requiresConsent: "government_alerts",
  },
  {
    id: "osm-traffic",
    name: "OpenStreetMap Traffic",
    type: "traffic",
    url: "https://www.openstreetmap.org",
    requiresConsent: "traffic_feeds",
  },
];

export function hasConsent(
  consents: PrivacyConsent[],
  key: PrivacyConsentKey,
): boolean {
  return consents.find((c) => c.key === key)?.granted ?? false;
}

export function grantConsent(
  consents: PrivacyConsent[],
  key: PrivacyConsentKey,
): PrivacyConsent[] {
  return consents.map((c) =>
    c.key === key ? { ...c, granted: true, grantedAt: new Date().toISOString() } : c,
  );
}

export function revokeConsent(
  consents: PrivacyConsent[],
  key: PrivacyConsentKey,
): PrivacyConsent[] {
  return consents.map((c) =>
    c.key === key ? { ...c, granted: false, grantedAt: undefined } : c,
  );
}

export function revokeAllConsents(consents: PrivacyConsent[]): PrivacyConsent[] {
  return consents.map((c) => ({ ...c, granted: false, grantedAt: undefined }));
}

export function enabledSources(consents: PrivacyConsent[]): TrustedSource[] {
  return TRUSTED_SOURCES.filter((s) => hasConsent(consents, s.requiresConsent));
}
