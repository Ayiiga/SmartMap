import type { AstronomicalObject, ConstellationDefinition } from "./types";

/** Curated bright-star catalog with real HIP identifiers and coordinates (J2000). */
export const BRIGHT_STARS: AstronomicalObject[] = [
  { id: "hip-32349", name: "Sirius", type: "star", constellation: "Canis Major", raHours: 6.7525, decDeg: -16.7161, magnitude: -1.46, distanceLy: 8.6, catalogIds: ["HIP 32349", "HD 48915"], description: "Brightest star in the night sky; a binary star system.", offlineAvailable: true },
  { id: "hip-27989", name: "Canopus", type: "star", constellation: "Carina", raHours: 6.3992, decDeg: -52.6957, magnitude: -0.74, distanceLy: 310, catalogIds: ["HIP 27989"], description: "Second-brightest star in the night sky.", offlineAvailable: true },
  { id: "hip-69673", name: "Arcturus", type: "star", constellation: "Boötes", raHours: 14.261, decDeg: 19.1824, magnitude: -0.05, distanceLy: 37, catalogIds: ["HIP 69673"], description: "Red giant and one of the brightest stars in the northern sky.", offlineAvailable: true },
  { id: "hip-24608", name: "Rigel", type: "star", constellation: "Orion", raHours: 5.2423, decDeg: -8.2016, magnitude: 0.13, distanceLy: 860, catalogIds: ["HIP 24608"], description: "Blue supergiant marking Orion's left foot.", offlineAvailable: true },
  { id: "hip-24436", name: "Betelgeuse", type: "star", constellation: "Orion", raHours: 5.9195, decDeg: 7.4071, magnitude: 0.42, distanceLy: 550, catalogIds: ["HIP 24436"], description: "Red supergiant at Orion's right shoulder.", offlineAvailable: true },
  { id: "hip-37279", name: "Aldebaran", type: "star", constellation: "Taurus", raHours: 4.5987, decDeg: 16.5093, magnitude: 0.85, distanceLy: 65, catalogIds: ["HIP 37279", "HD 29139"], description: "Red giant star; the eye of Taurus.", offlineAvailable: true },
  { id: "hip-21421", name: "Elnath", type: "star", constellation: "Taurus", raHours: 5.4382, decDeg: 28.6074, magnitude: 1.65, distanceLy: 134, catalogIds: ["HIP 21421"], description: "Blue-white giant at the tip of Taurus's northern horn.", offlineAvailable: true },
  { id: "hip-16228", name: "HIP 16228", type: "star", constellation: "Taurus", raHours: 3.4789, decDeg: 24.1056, magnitude: 5.14, distanceLy: 148, catalogIds: ["HIP 16228"], description: "Catalog star in Taurus.", offlineAvailable: true },
  { id: "hip-65378", name: "Spica", type: "star", constellation: "Virgo", raHours: 13.4199, decDeg: -11.1613, magnitude: 0.97, distanceLy: 250, catalogIds: ["HIP 65378"], description: "Binary star system in Virgo.", offlineAvailable: true },
  { id: "hip-80763", name: "Antares", type: "star", constellation: "Scorpius", raHours: 16.4901, decDeg: -26.432, magnitude: 0.96, distanceLy: 550, catalogIds: ["HIP 80763"], description: "Red supergiant heart of Scorpius.", offlineAvailable: true },
  { id: "hip-91262", name: "Vega", type: "star", constellation: "Lyra", raHours: 18.6156, decDeg: 38.7837, magnitude: 0.03, distanceLy: 25, catalogIds: ["HIP 91262"], description: "Bright star in Lyra; historically used for photometric zero point.", offlineAvailable: true },
  { id: "hip-113368", name: "Deneb", type: "star", constellation: "Cygnus", raHours: 20.6905, decDeg: 45.2803, magnitude: 1.25, distanceLy: 2600, catalogIds: ["HIP 113368"], description: "Blue-white supergiant forming the tail of Cygnus.", offlineAvailable: true },
  { id: "hip-102098", name: "Altair", type: "star", constellation: "Aquila", raHours: 19.8464, decDeg: 8.8683, magnitude: 0.76, distanceLy: 17, catalogIds: ["HIP 102098"], description: "Fast-rotating A-type star in Aquila.", offlineAvailable: true },
  { id: "hip-11767", name: "Polaris", type: "star", constellation: "Ursa Minor", raHours: 2.5303, decDeg: 89.2641, magnitude: 1.98, distanceLy: 433, catalogIds: ["HIP 11767"], description: "Current north pole star.", offlineAvailable: true },
  { id: "hip-54061", name: "Regulus", type: "star", constellation: "Leo", raHours: 10.1395, decDeg: 11.9672, magnitude: 1.35, distanceLy: 79, catalogIds: ["HIP 54061"], description: "Brightest star in Leo.", offlineAvailable: true },
  { id: "hip-72607", name: "Castor", type: "star", constellation: "Gemini", raHours: 7.5766, decDeg: 31.8883, magnitude: 1.58, distanceLy: 51, catalogIds: ["HIP 72607"], description: "Multiple star system in Gemini.", offlineAvailable: true },
  { id: "hip-37826", name: "Pollux", type: "star", constellation: "Gemini", raHours: 7.7553, decDeg: 28.0262, magnitude: 1.14, distanceLy: 34, catalogIds: ["HIP 37826"], description: "Orange giant in Gemini.", offlineAvailable: true },
  { id: "hip-49669", name: "Procyon", type: "star", constellation: "Canis Minor", raHours: 7.655, decDeg: 5.2249, magnitude: 0.34, distanceLy: 11, catalogIds: ["HIP 49669"], description: "Bright star in Canis Minor.", offlineAvailable: true },
  { id: "hip-62434", name: "Mimosa", type: "star", constellation: "Crux", raHours: 12.7954, decDeg: -59.6888, magnitude: 1.25, distanceLy: 280, catalogIds: ["HIP 62434", "β Crucis"], description: "Blue giant in the Southern Cross.", offlineAvailable: true },
  { id: "hip-60718", name: "Acrux", type: "star", constellation: "Crux", raHours: 12.4433, decDeg: -63.0991, magnitude: 0.76, distanceLy: 320, catalogIds: ["HIP 60718", "α Crucis"], description: "Brightest star in Crux.", offlineAvailable: true },
];

export const PLANETS: AstronomicalObject[] = [
  { id: "sun", name: "Sun", type: "sun", magnitude: -26.7, distanceAu: 1, description: "Our star; positions calculated from ephemeris.", offlineAvailable: true, requiresLiveData: true },
  { id: "mercury", name: "Mercury", type: "planet", magnitude: -0.4, description: "Innermost planet.", offlineAvailable: true, requiresLiveData: true },
  { id: "venus", name: "Venus", type: "planet", magnitude: -4.4, description: "Brightest planet; often visible at dawn or dusk.", offlineAvailable: true, requiresLiveData: true },
  { id: "earth", name: "Earth", type: "planet", description: "Our home planet.", offlineAvailable: true },
  { id: "moon", name: "Moon", type: "moon", magnitude: -12.6, distanceKm: 384400, description: "Earth's natural satellite.", offlineAvailable: true, requiresLiveData: true },
  { id: "mars", name: "Mars", type: "planet", magnitude: -2.0, description: "The Red Planet.", offlineAvailable: true, requiresLiveData: true },
  { id: "jupiter", name: "Jupiter", type: "planet", magnitude: -2.7, description: "Largest planet in the Solar System.", offlineAvailable: true, requiresLiveData: true },
  { id: "saturn", name: "Saturn", type: "planet", magnitude: 0.5, description: "Ringed gas giant.", offlineAvailable: true, requiresLiveData: true },
  { id: "uranus", name: "Uranus", type: "planet", magnitude: 5.7, description: "Ice giant; usually requires binoculars.", offlineAvailable: true, requiresLiveData: true },
  { id: "neptune", name: "Neptune", type: "planet", magnitude: 7.8, description: "Outermost major planet.", offlineAvailable: true, requiresLiveData: true },
];

export const DEEP_SKY_OBJECTS: AstronomicalObject[] = [
  { id: "m31", name: "Andromeda Galaxy", type: "galaxy", constellation: "Andromeda", raHours: 0.712, decDeg: 41.269, magnitude: 3.4, distanceLy: 2500000, catalogIds: ["M31", "NGC 224"], description: "Nearest major galaxy to the Milky Way.", offlineAvailable: true },
  { id: "m42", name: "Orion Nebula", type: "nebula", constellation: "Orion", raHours: 5.588, decDeg: -5.391, magnitude: 4.0, distanceLy: 1344, catalogIds: ["M42", "NGC 1976"], description: "Bright star-forming region in Orion's sword.", offlineAvailable: true },
  { id: "m45", name: "Pleiades", type: "cluster", constellation: "Taurus", raHours: 3.786, decDeg: 24.117, magnitude: 1.6, distanceLy: 444, catalogIds: ["M45"], description: "Open star cluster also known as the Seven Sisters.", offlineAvailable: true },
  { id: "m13", name: "Hercules Globular Cluster", type: "cluster", constellation: "Hercules", raHours: 16.695, decDeg: 36.46, magnitude: 5.8, distanceLy: 22200, catalogIds: ["M13", "NGC 6205"], description: "Bright globular cluster in Hercules.", offlineAvailable: true },
  { id: "m57", name: "Ring Nebula", type: "nebula", constellation: "Lyra", raHours: 18.887, decDeg: 33.029, magnitude: 8.8, distanceLy: 2300, catalogIds: ["M57", "NGC 6720"], description: "Planetary nebula in Lyra.", offlineAvailable: true },
  { id: "m1", name: "Crab Nebula", type: "nebula", constellation: "Taurus", raHours: 5.575, decDeg: 22.017, magnitude: 8.4, distanceLy: 6500, catalogIds: ["M1", "NGC 1952"], description: "Supernova remnant in Taurus.", offlineAvailable: true },
];

export const CONSTELLATIONS: ConstellationDefinition[] = [
  {
    id: "orion",
    name: "Orion",
    abbreviation: "Ori",
    lines: [
      ["hip-26727", "hip-26311"],
      ["hip-26311", "hip-25930"],
      ["hip-25930", "hip-24436"],
      ["hip-24436", "hip-24608"],
      ["hip-26727", "hip-27913"],
      ["hip-27913", "hip-28614"],
      ["hip-28614", "hip-29038"],
    ],
  },
  {
    id: "taurus",
    name: "Taurus",
    abbreviation: "Tau",
    lines: [
      ["hip-21421", "hip-25428"],
      ["hip-25428", "hip-26451"],
      ["hip-26451", "hip-37279"],
      ["hip-37279", "hip-21421"],
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    abbreviation: "Gem",
    lines: [
      ["hip-37826", "hip-34693"],
      ["hip-34693", "hip-32246"],
      ["hip-32246", "hip-30883"],
      ["hip-30883", "hip-37826"],
      ["hip-37826", "hip-72607"],
    ],
  },
  {
    id: "leo",
    name: "Leo",
    abbreviation: "Leo",
    lines: [
      ["hip-54061", "hip-57632"],
      ["hip-57632", "hip-54879"],
      ["hip-54879", "hip-49669"],
    ],
  },
  {
    id: "ursa-major",
    name: "Ursa Major",
    abbreviation: "UMa",
    lines: [
      ["hip-54061", "hip-59774"],
      ["hip-59774", "hip-62956"],
      ["hip-62956", "hip-65378"],
    ],
  },
];

/** Additional line endpoint stars referenced by constellation lines */
const EXTRA_LINE_STARS: AstronomicalObject[] = [
  { id: "hip-26727", name: "Mintaka", type: "star", constellation: "Orion", raHours: 5.5334, decDeg: -0.2991, magnitude: 2.23, catalogIds: ["HIP 26727"], offlineAvailable: true },
  { id: "hip-26311", name: "Alnilam", type: "star", constellation: "Orion", raHours: 5.6033, decDeg: -1.2019, magnitude: 1.69, catalogIds: ["HIP 26311"], offlineAvailable: true },
  { id: "hip-25930", name: "Alnitak", type: "star", constellation: "Orion", raHours: 5.6793, decDeg: -1.9426, magnitude: 1.74, catalogIds: ["HIP 25930"], offlineAvailable: true },
  { id: "hip-27913", name: "Bellatrix", type: "star", constellation: "Orion", raHours: 5.4189, decDeg: 6.3497, magnitude: 1.64, catalogIds: ["HIP 27913"], offlineAvailable: true },
  { id: "hip-28614", name: "Saiph", type: "star", constellation: "Orion", raHours: 5.7959, decDeg: -9.6696, magnitude: 2.07, catalogIds: ["HIP 28614"], offlineAvailable: true },
  { id: "hip-29038", name: "Hatysa", type: "star", constellation: "Orion", raHours: 5.9195, decDeg: -9.6696, magnitude: 2.75, catalogIds: ["HIP 29038"], offlineAvailable: true },
  { id: "hip-25428", name: "ζ Tauri", type: "star", constellation: "Taurus", raHours: 5.627, decDeg: 21.142, magnitude: 3.0, catalogIds: ["HIP 25428"], offlineAvailable: true },
  { id: "hip-26451", name: "Elnath", type: "star", constellation: "Taurus", raHours: 5.4382, decDeg: 28.6074, magnitude: 1.65, catalogIds: ["HIP 26451"], offlineAvailable: true },
  { id: "hip-34693", name: "Alhena", type: "star", constellation: "Gemini", raHours: 6.6283, decDeg: 16.3992, magnitude: 1.93, catalogIds: ["HIP 34693"], offlineAvailable: true },
  { id: "hip-32246", name: "Mebsuta", type: "star", constellation: "Gemini", raHours: 6.7328, decDeg: 25.1311, magnitude: 3.06, catalogIds: ["HIP 32246"], offlineAvailable: true },
  { id: "hip-30883", name: "Tejat", type: "star", constellation: "Gemini", raHours: 6.7328, decDeg: 22.5136, magnitude: 2.88, catalogIds: ["HIP 30883"], offlineAvailable: true },
  { id: "hip-57632", name: "Denebola", type: "star", constellation: "Leo", raHours: 11.8177, decDeg: 14.5721, magnitude: 2.14, catalogIds: ["HIP 57632"], offlineAvailable: true },
  { id: "hip-54879", name: "Algieba", type: "star", constellation: "Leo", raHours: 10.3329, decDeg: 19.8415, magnitude: 2.28, catalogIds: ["HIP 54879"], offlineAvailable: true },
  { id: "hip-59774", name: "Megrez", type: "star", constellation: "Ursa Major", raHours: 12.9004, decDeg: 57.0326, magnitude: 3.32, catalogIds: ["HIP 59774"], offlineAvailable: true },
  { id: "hip-62956", name: "Phecda", type: "star", constellation: "Ursa Major", raHours: 11.8972, decDeg: 53.6948, magnitude: 2.44, catalogIds: ["HIP 62956"], offlineAvailable: true },
];

export const ALL_CATALOG_OBJECTS: AstronomicalObject[] = [
  ...BRIGHT_STARS,
  ...EXTRA_LINE_STARS.filter((s) => !BRIGHT_STARS.some((b) => b.id === s.id)),
  ...PLANETS,
  ...DEEP_SKY_OBJECTS,
  ...CONSTELLATIONS.map((c) => ({
    id: c.id,
    name: c.name,
    type: "constellation" as const,
    aliases: [c.abbreviation],
    description: `${c.name} constellation.`,
    offlineAvailable: true,
  })),
];

export function getCatalogObjectById(id: string): AstronomicalObject | undefined {
  return ALL_CATALOG_OBJECTS.find((o) => o.id === id || o.catalogIds?.some((c) => c.toLowerCase() === id.toLowerCase()));
}

export function getStarById(id: string): AstronomicalObject | undefined {
  return ALL_CATALOG_OBJECTS.find((o) => o.id === id && o.type === "star");
}
