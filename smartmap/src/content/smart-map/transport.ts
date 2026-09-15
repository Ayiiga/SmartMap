import type { Place } from "@/types/smart-map";

export type TransportKind =
  | "bus_terminal"
  | "taxi_rank"
  | "trotro"
  | "airport"
  | "railway"
  | "ferry";

export interface TransportHub extends Place {
  transportKind: TransportKind;
}

export const TRANSPORT_HUBS: TransportHub[] = [
  {
    id: "gh-bus-circle",
    name: "Circle Bus Terminal",
    transportKind: "bus_terminal",
    category: "bus_station",
    coordinates: { lat: 5.574, lng: -0.215 },
    address: "Kwame Nkrumah Circle, Accra",
    city: "Accra",
    region: "Greater Accra",
    country: "Ghana",
    countryCode: "GH",
  },
  {
    id: "gh-taxi-airport",
    name: "Airport City Taxi Rank",
    transportKind: "taxi_rank",
    category: "bus_station",
    coordinates: { lat: 5.603, lng: -0.17 },
    address: "Airport City, Accra",
    city: "Accra",
    region: "Greater Accra",
    country: "Ghana",
    countryCode: "GH",
  },
  {
    id: "gh-trotro-kaneshie",
    name: "Kaneshie Tro-tro Station",
    transportKind: "trotro",
    category: "bus_station",
    coordinates: { lat: 5.565, lng: -0.235 },
    address: "Kaneshie, Accra",
    city: "Accra",
    region: "Greater Accra",
    country: "Ghana",
    countryCode: "GH",
  },
  {
    id: "gh-airport-kotoka",
    name: "Kotoka International Airport",
    transportKind: "airport",
    category: "airport",
    coordinates: { lat: 5.6052, lng: -0.1668 },
    address: "Airport Road, Accra",
    city: "Accra",
    region: "Greater Accra",
    country: "Ghana",
    countryCode: "GH",
    verified: "government",
  },
  {
    id: "gh-rail-accra",
    name: "Accra Railway Station",
    transportKind: "railway",
    category: "bus_station",
    coordinates: { lat: 5.545, lng: -0.208 },
    address: "Accra",
    city: "Accra",
    region: "Greater Accra",
    country: "Ghana",
    countryCode: "GH",
  },
  {
    id: "gh-ferry-tema",
    name: "Tema Ferry Terminal",
    transportKind: "ferry",
    category: "bus_station",
    coordinates: { lat: 5.63, lng: -0.01 },
    address: "Tema Harbour",
    city: "Tema",
    region: "Greater Accra",
    country: "Ghana",
    countryCode: "GH",
  },
];
