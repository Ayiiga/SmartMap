import type { CommunityReport, ReportType } from "@/types/smart-map";

export const REPORT_TYPES: {
  id: ReportType;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { id: "crime", label: "Crime", emoji: "🚨", color: "#DC2626" },
  { id: "accident", label: "Accident", emoji: "💥", color: "#F59E0B" },
  { id: "fire", label: "Fire", emoji: "🔥", color: "#DC2626" },
  { id: "flood", label: "Flood", emoji: "🌊", color: "#0F4C81" },
  { id: "power_outage", label: "Power Outage", emoji: "💡", color: "#F59E0B" },
  { id: "water_outage", label: "Water Outage", emoji: "💧", color: "#0F4C81" },
  { id: "road_damage", label: "Road Damage", emoji: "🛣️", color: "#64748b" },
  { id: "missing_person", label: "Missing Person", emoji: "👤", color: "#DC2626" },
  { id: "unsafe_area", label: "Unsafe Area", emoji: "⚠️", color: "#F59E0B" },
  { id: "environmental", label: "Environmental Hazard", emoji: "🌿", color: "#0E9F6E" },
];

export const SAMPLE_REPORTS: CommunityReport[] = [
  {
    id: "rpt-1",
    type: "flood",
    title: "Flooding on Spintex Road",
    description: "Heavy rain has flooded the underpass near Sakumono. Vehicles stuck.",
    coordinates: { lat: 5.63, lng: -0.1 },
    city: "Accra",
    countryCode: "GH",
    status: "verified",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    mediaCount: 2,
    aiSummary: "Verified flood hazard on Spintex corridor; expect major delays.",
  },
  {
    id: "rpt-2",
    type: "accident",
    title: "Minor collision at Circle",
    description: "Two cars collided near Kwame Nkrumah Circle. Lane partially blocked.",
    coordinates: { lat: 5.575, lng: -0.214 },
    city: "Accra",
    countryCode: "GH",
    status: "verifying",
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    mediaCount: 1,
    aiSummary: "Traffic impact likely for 30–60 minutes while scene clears.",
  },
  {
    id: "rpt-3",
    type: "power_outage",
    title: "Outage in East Legon",
    description: "No power since 6pm across several streets in East Legon.",
    coordinates: { lat: 5.635, lng: -0.15 },
    city: "Accra",
    countryCode: "GH",
    status: "submitted",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    aiSummary: "Community-reported outage; awaiting utility confirmation.",
  },
  {
    id: "rpt-4",
    type: "road_damage",
    title: "Deep pothole on Ring Road",
    description: "Large pothole near 37 Hospital junction damaging vehicles.",
    coordinates: { lat: 5.585, lng: -0.178 },
    city: "Accra",
    countryCode: "GH",
    status: "verified",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    mediaCount: 3,
    aiSummary: "Road hazard confirmed; drivers should reduce speed.",
  },
  {
    id: "rpt-5",
    type: "unsafe_area",
    title: "Poor lighting after dusk",
    description: "Street lights out along a stretch near Nima market. Feels unsafe at night.",
    coordinates: { lat: 5.588, lng: -0.198 },
    city: "Accra",
    countryCode: "GH",
    status: "verified",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    aiSummary: "Lighting issue may increase personal safety risk after dark.",
  },
];
