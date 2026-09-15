import { AFRICA_COUNTRY_CODES, COUNTRIES, LAUNCH_COUNTRY } from "@/content/smart-map/countries";

export interface AfricaCountryReadyProfile {
  code: string;
  name: string;
  flag: string;
  currency: string;
  emergencyReady: boolean;
  languagesReady: boolean;
  servicesReady: boolean;
  mapLayerReady: boolean;
  status: "live" | "pilot" | "planned";
}

const CURRENCY: Record<string, string> = {
  GH: "GHS",
  NG: "NGN",
  KE: "KES",
  ZA: "ZAR",
  EG: "EGP",
  ET: "ETB",
  TZ: "TZS",
  UG: "UGX",
  RW: "RWF",
  CI: "XOF",
  SN: "XOF",
  MA: "MAD",
};

export function buildAfricaExpansionCatalog(): AfricaCountryReadyProfile[] {
  const live = COUNTRIES.filter((c) => c.code !== "GH-EXPAND").map((c) => ({
    code: c.code,
    name: c.name,
    flag: c.flag,
    currency: CURRENCY[c.code] ?? "Local",
    emergencyReady: true,
    languagesReady: c.languages.length > 0,
    servicesReady: c.code === LAUNCH_COUNTRY.code,
    mapLayerReady: true,
    status: c.code === LAUNCH_COUNTRY.code ? ("live" as const) : ("pilot" as const),
  }));

  const planned = AFRICA_COUNTRY_CODES.map((c) => ({
    code: c.code,
    name: c.name,
    flag: c.flag,
    currency: "Local",
    emergencyReady: false,
    languagesReady: false,
    servicesReady: false,
    mapLayerReady: false,
    status: "planned" as const,
  }));

  return [...live, ...planned];
}

export interface EnterpriseIncident {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  lat: number;
  lng: number;
  status: "open" | "monitoring" | "resolved";
}

export const SAMPLE_INCIDENTS: EnterpriseIncident[] = [
  {
    id: "inc-1",
    title: "Flood corridor — Spintex",
    severity: "high",
    lat: 5.63,
    lng: -0.1,
    status: "monitoring",
  },
  {
    id: "inc-2",
    title: "Traffic collision — Circle",
    severity: "medium",
    lat: 5.575,
    lng: -0.214,
    status: "open",
  },
  {
    id: "inc-3",
    title: "Power outage cluster — East Legon",
    severity: "low",
    lat: 5.635,
    lng: -0.15,
    status: "resolved",
  },
];

export function computeSafetyScore(incidents: EnterpriseIncident[]): number {
  const openWeight = incidents
    .filter((i) => i.status !== "resolved")
    .reduce((sum, i) => {
      const w = { low: 2, medium: 5, high: 10, critical: 18 }[i.severity];
      return sum + w;
    }, 0);
  return Math.max(40, Math.min(98, 96 - openWeight));
}

export function optimizeRouteHint(from: string, to: string): string {
  return `Optimized corridor from ${from} to ${to}: prefer arterial roads, avoid unresolved high-severity incident clusters, and keep emergency waypoints within 3 km.`;
}
