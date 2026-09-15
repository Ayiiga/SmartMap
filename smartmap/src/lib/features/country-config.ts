import { AFRICA_COUNTRY_CODES, COUNTRIES, getCountry, LAUNCH_COUNTRY } from "@/content/smart-map/countries";
import type { CountryProfile } from "@/types/smart-map";

/**
 * Phase 3 multi-country configuration system.
 * Phase 1 uses Ghana launch profile; expansion profiles stay available offline.
 */

export interface CountryConfig {
  profile: CountryProfile;
  enabled: boolean;
  launchMarket: boolean;
  emergencyReady: boolean;
}

export function listCountryConfigs(): CountryConfig[] {
  const live = COUNTRIES.filter((c) => c.code !== "GH-EXPAND").map((profile) => ({
    profile,
    enabled: profile.code === LAUNCH_COUNTRY.code,
    launchMarket: profile.code === LAUNCH_COUNTRY.code,
    emergencyReady: Boolean(profile.emergency.police && profile.emergency.ambulance),
  }));

  const expansion = AFRICA_COUNTRY_CODES.map((c) => ({
    profile: {
      code: c.code,
      name: c.name,
      flag: c.flag,
      capital: "TBD",
      languages: ["Official local languages"],
      emergency: { police: "112", fire: "112", ambulance: "112", general: "112" },
      center: LAUNCH_COUNTRY.center,
      zoom: 6,
    } satisfies CountryProfile,
    enabled: false,
    launchMarket: false,
    emergencyReady: false,
  }));

  return [...live, ...expansion];
}

export function resolveActiveCountry(code?: string): CountryProfile {
  return getCountry(code || LAUNCH_COUNTRY.code);
}
