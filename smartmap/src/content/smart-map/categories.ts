import type { PlaceCategory } from "@/types/smart-map";

export interface PlaceCategoryMeta {
  id: PlaceCategory;
  label: string;
  emoji: string;
  color: string;
  keywords: string[];
}

export const PLACE_CATEGORIES: PlaceCategoryMeta[] = [
  { id: "police", label: "Police", emoji: "🚓", color: "#0F4C81", keywords: ["police", "security"] },
  { id: "fire", label: "Fire Service", emoji: "🚒", color: "#DC2626", keywords: ["fire", "rescue"] },
  { id: "ambulance", label: "Ambulance", emoji: "🚑", color: "#DC2626", keywords: ["ambulance", "ems"] },
  { id: "hospital", label: "Hospitals", emoji: "🏥", color: "#0E9F6E", keywords: ["hospital", "clinic"] },
  { id: "clinic", label: "Clinics", emoji: "🩺", color: "#0E9F6E", keywords: ["clinic", "health"] },
  { id: "pharmacy", label: "Pharmacies", emoji: "🏪", color: "#0E9F6E", keywords: ["pharmacy", "chemist"] },
  { id: "school", label: "Schools", emoji: "🏫", color: "#0F4C81", keywords: ["school"] },
  { id: "university", label: "Universities", emoji: "🎓", color: "#0F4C81", keywords: ["university", "campus"] },
  { id: "hostel", label: "Hostels", emoji: "🏠", color: "#F59E0B", keywords: ["hostel"] },
  { id: "hotel", label: "Hotels", emoji: "🏨", color: "#F59E0B", keywords: ["hotel"] },
  { id: "restaurant", label: "Restaurants", emoji: "🍴", color: "#F59E0B", keywords: ["restaurant", "food"] },
  { id: "bank", label: "Banks", emoji: "🏦", color: "#0F4C81", keywords: ["bank"] },
  { id: "atm", label: "ATMs", emoji: "🏧", color: "#0F4C81", keywords: ["atm", "cash"] },
  { id: "fuel", label: "Fuel Stations", emoji: "⛽", color: "#F59E0B", keywords: ["fuel", "petrol"] },
  { id: "market", label: "Markets", emoji: "🛍", color: "#0E9F6E", keywords: ["market"] },
  { id: "bus_station", label: "Bus Stations", emoji: "🚏", color: "#0F4C81", keywords: ["bus", "tro-tro"] },
  { id: "airport", label: "Airports", emoji: "✈", color: "#0F4C81", keywords: ["airport"] },
  { id: "church", label: "Churches", emoji: "⛪", color: "#64748b", keywords: ["church"] },
  { id: "mosque", label: "Mosques", emoji: "🕌", color: "#64748b", keywords: ["mosque"] },
  { id: "government", label: "Government", emoji: "🏛", color: "#0F4C81", keywords: ["government", "ministry"] },
  { id: "passport", label: "Passport Office", emoji: "🪪", color: "#0F4C81", keywords: ["passport"] },
  { id: "dvla", label: "DVLA", emoji: "🚗", color: "#0F4C81", keywords: ["dvla", "license"] },
  { id: "court", label: "Courts", emoji: "⚖", color: "#0F4C81", keywords: ["court"] },
  { id: "attraction", label: "Attractions", emoji: "🏖", color: "#0E9F6E", keywords: ["tourist", "attraction"] },
  { id: "park", label: "Parks", emoji: "🌳", color: "#0E9F6E", keywords: ["park", "garden"] },
  { id: "shelter", label: "Safe shelters", emoji: "🏕", color: "#F59E0B", keywords: ["shelter", "safe"] },
  { id: "disaster_center", label: "Disaster centers", emoji: "🆘", color: "#DC2626", keywords: ["disaster", "nadmo"] },
  { id: "toilet", label: "Public Toilets", emoji: "🚻", color: "#64748b", keywords: ["toilet", "washroom"] },
  { id: "ev_charger", label: "EV Chargers", emoji: "⚡", color: "#0E9F6E", keywords: ["ev", "charger"] },
];

export function getCategoryMeta(id: PlaceCategory): PlaceCategoryMeta {
  return PLACE_CATEGORIES.find((c) => c.id === id) ?? PLACE_CATEGORIES[0];
}
