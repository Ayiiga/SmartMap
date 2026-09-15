import type { RadioStation } from "@/types/media";

export const RADIO_STATIONS: RadioStation[] = [
  { id: "peace", name: "Peace FM", country: "Ghana", genre: "News & Talk", streamUrl: "https://www.peacefmonline.com/live", logo: "📻" },
  { id: "joy", name: "Joy 99.7 FM", country: "Ghana", genre: "News & Music", streamUrl: "https://www.myjoyonline.com/radio", logo: "🎙️" },
  { id: "wazobia", name: "Wazobia FM", country: "Nigeria", genre: "Talk & Entertainment", streamUrl: "https://www.wazobiafm.com/live", logo: "📻" },
  { id: "cool", name: "Cool FM Lagos", country: "Nigeria", genre: "Music", streamUrl: "https://www.coolfm.ng/live", logo: "🎵" },
  { id: "citizen-radio", name: "Citizen Radio", country: "Kenya", genre: "News", streamUrl: "https://www.citizentv.co.ke/radio", logo: "🇰🇪" },
  { id: "capital", name: "Capital FM Kenya", country: "Kenya", genre: "Music & Talk", streamUrl: "https://www.capitalfm.co.ke/live", logo: "📻" },
  { id: "metro", name: "Metro FM", country: "South Africa", genre: "Urban Music", streamUrl: "https://www.metrofm.co.za", logo: "🎶" },
  { id: "702", name: "702 Talk Radio", country: "South Africa", genre: "News & Talk", streamUrl: "https://www.702.co.za", logo: "🎙️" },
  { id: "bbc-world", name: "BBC World Service", country: "International", genre: "World News", streamUrl: "https://www.bbc.co.uk/sounds/play/live:bbc_world_service", logo: "🌐" },
  { id: "voanews", name: "VOA Africa", country: "International", genre: "News", streamUrl: "https://www.voaafrica.com", logo: "🌍" },
];

export const RADIO_COUNTRIES = ["Ghana", "Nigeria", "Kenya", "South Africa", "International"] as const;

export function getRadioByCountry(country: string): RadioStation[] {
  return RADIO_STATIONS.filter((s) => s.country === country);
}
