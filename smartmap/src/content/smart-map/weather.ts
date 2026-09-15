import type { WeatherSnapshot } from "@/types/smart-map";

export const ACCRA_WEATHER: WeatherSnapshot = {
  tempC: 29,
  condition: "Partly cloudy",
  humidity: 78,
  windKph: 14,
  uvIndex: 8,
  aqi: 62,
  rainChance: 45,
  floodRisk: "moderate",
  heatAlert: false,
};

export function weatherAdvice(w: WeatherSnapshot): string {
  if (w.floodRisk === "high") return "High flood risk — avoid underpasses and low-lying roads.";
  if (w.heatAlert) return "Heat alert — stay hydrated and limit midday outdoor travel.";
  if (w.rainChance >= 60) return "Rain likely — allow extra time and prefer well-lit routes.";
  if (w.aqi > 100) return "Air quality is elevated — sensitive travelers should limit outdoor exposure.";
  return "Conditions look favorable for travel. Stay alert for community alerts.";
}
