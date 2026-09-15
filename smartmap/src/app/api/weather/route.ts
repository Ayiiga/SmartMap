import { NextResponse } from "next/server";
import type { WeatherSnapshot } from "@/types/smart-map";

export const dynamic = "force-dynamic";

interface OpenMeteoCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  weather_code: number;
  uv_index?: number;
}

interface OpenMeteoHourly {
  precipitation_probability?: number[];
}

const WEATHER_CODES: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  61: "Rain",
  63: "Rain",
  65: "Heavy rain",
  80: "Rain showers",
  95: "Thunderstorm",
};

function mapWeather(code: number): string {
  return WEATHER_CODES[code] ?? "Variable";
}

function floodRisk(rainChance: number, condition: string): WeatherSnapshot["floodRisk"] {
  if (rainChance >= 75 || condition.toLowerCase().includes("heavy")) return "high";
  if (rainChance >= 45) return "moderate";
  return "low";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lng);
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,uv_index");
  url.searchParams.set("hourly", "precipitation_probability");
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "auto");

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ error: "Weather provider unavailable" }, { status: 502 });
    }

    const data = (await response.json()) as {
      current: OpenMeteoCurrent;
      hourly?: OpenMeteoHourly;
    };

    const rainChance = data.hourly?.precipitation_probability?.[0] ?? 20;
    const condition = mapWeather(data.current.weather_code);

    const snapshot: WeatherSnapshot = {
      tempC: Math.round(data.current.temperature_2m),
      condition,
      humidity: data.current.relative_humidity_2m,
      windKph: Math.round(data.current.wind_speed_10m),
      uvIndex: Math.round(data.current.uv_index ?? 5),
      aqi: 42,
      rainChance,
      floodRisk: floodRisk(rainChance, condition),
      heatAlert: data.current.temperature_2m >= 38,
    };

    return NextResponse.json({
      weather: snapshot,
      source: "open-meteo",
      coordinates: { lat: Number(lat), lng: Number(lng) },
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 502 });
  }
}
