/** Curated Ghana map information for Phase 7 overlays / HUD. */
export const GHANA_MAP_INFO = {
  roadNames: [
    "Independence Avenue",
    "Liberation Road",
    "Spintex Road",
    "Ring Road Central",
    "N1 Highway",
    "Graphic Road",
  ],
  communities: ["Osu", "Labone", "Airport Residential", "Kaneshie", "Madina", "Tema Community 1"],
  rivers: ["Odaw River", "Densu River", "Sakumo Lagoon inlet"],
  lakes: ["Weija Lake", "Volta Lake (approach corridors)"],
  forestReserves: ["Achimota Forest Reserve", "Sacred Groves — Labadi"],
  nationalParks: ["Shai Hills Resource Reserve", "Kakum National Park (regional)"],
  districts: ["Accra Metropolitan", "La Dade-Kotopon", "Ledzokuku", "Tema Metropolitan"],
  regions: ["Greater Accra", "Eastern", "Central", "Ashanti"],
  defaultElevationM: 61,
  weatherLabel: "Partly cloudy · 31°C · Low flood risk",
} as const;
