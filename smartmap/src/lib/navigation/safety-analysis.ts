import type { Coordinates } from "@/types/smart-map";
import type {
  AdvancedTravelMode,
  RoutePreference,
  SafetyHazardKind,
  SafetyWarning,
} from "@/lib/navigation/types";

const WARNING_COPY: Record<
  SafetyHazardKind,
  { label: string; message: string; severity: SafetyWarning["severity"] }
> = {
  accident: {
    label: "⚠️ Accident ahead",
    message: "Accident-prone corridor ahead — reduce speed and keep distance.",
    severity: "high",
  },
  flood: {
    label: "⚠️ Flood risk ahead",
    message: "Flood-prone road segment ahead — prefer elevated alternatives if raining.",
    severity: "high",
  },
  poor_condition: {
    label: "⚠️ Poor road conditions",
    message: "Uneven or damaged road surface reported along this stretch.",
    severity: "medium",
  },
  construction: {
    label: "⚠️ Construction ahead",
    message: "Road construction may cause delays and lane closures.",
    severity: "medium",
  },
  dangerous_curve: {
    label: "⚠️ Sharp bend ahead",
    message: "Dangerous curve ahead — slow down before the bend.",
    severity: "medium",
  },
  steep_hill: {
    label: "⚠️ Steep hill",
    message: "Steep gradient ahead — use a lower gear if driving or riding.",
    severity: "medium",
  },
  high_crime: {
    label: "⚠️ Higher-risk area",
    message: "Public safety reports indicate elevated risk — stay on main roads.",
    severity: "high",
  },
  wildlife: {
    label: "⚠️ Wildlife crossing",
    message: "Wildlife crossing zone — watch both shoulders.",
    severity: "low",
  },
  school_zone: {
    label: "⚠️ School zone",
    message: "School zone ahead — observe speed limits and crossings.",
    severity: "medium",
  },
  heavy_traffic: {
    label: "⚠️ Heavy traffic",
    message: "Heavy traffic ahead — expect slower progress.",
    severity: "medium",
  },
  road_closed: {
    label: "⚠️ Road closed",
    message: "A segment may be closed — an alternate corridor is preferred.",
    severity: "high",
  },
  bridge: {
    label: "⚠️ Bridge ahead",
    message: "Bridge crossing ahead — watch for crosswinds and narrow lanes.",
    severity: "low",
  },
  slippery: {
    label: "⚠️ Slippery road",
    message: "Slippery surface risk — reduce speed in wet conditions.",
    severity: "medium",
  },
};

const HAZARD_SEQUENCE: SafetyHazardKind[] = [
  "school_zone",
  "heavy_traffic",
  "dangerous_curve",
  "construction",
  "flood",
  "accident",
  "steep_hill",
  "poor_condition",
  "bridge",
  "wildlife",
  "high_crime",
  "slippery",
  "road_closed",
];

function hashSeed(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function analyzeRouteSafety(input: {
  distanceKm: number;
  polyline: Coordinates[];
  preference: RoutePreference;
  mode: AdvancedTravelMode;
  seed?: number;
}): SafetyWarning[] {
  const { distanceKm, preference, mode, seed = 1 } = input;
  const count = Math.min(
    6,
    Math.max(1, Math.floor(distanceKm / 4) + (preference === "safest" ? 0 : 1)),
  );

  const warnings: SafetyWarning[] = [];
  for (let i = 0; i < count; i++) {
    const roll = hashSeed(seed * 17 + i * 3.1);
    let kind = HAZARD_SEQUENCE[Math.floor(roll * HAZARD_SEQUENCE.length)];

    // Preference & mode bias
    if (preference === "safest" && (kind === "high_crime" || kind === "accident")) {
      kind = "school_zone";
    }
    if (mode === "walking" && kind === "heavy_traffic") kind = "school_zone";
    if (preference === "fastest" && i === 0) kind = "heavy_traffic";

    const meta = WARNING_COPY[kind];
    const distanceAlongKm = Number(
      Math.min(distanceKm * 0.95, Math.max(0.3, distanceKm * ((i + 1) / (count + 1)))).toFixed(1),
    );

    warnings.push({
      id: `warn-${kind}-${i}`,
      kind,
      label: meta.label,
      severity: meta.severity,
      distanceAlongKm,
      message: meta.message,
    });
  }

  // Deduplicate by kind, keep earliest along route
  const seen = new Set<SafetyHazardKind>();
  return warnings
    .sort((a, b) => a.distanceAlongKm - b.distanceAlongKm)
    .filter((w) => {
      if (seen.has(w.kind)) return false;
      seen.add(w.kind);
      return true;
    });
}

export function warningVoiceLine(warning: SafetyWarning): string {
  switch (warning.kind) {
    case "heavy_traffic":
      return "Traffic ahead.";
    case "flood":
      return "Flood risk ahead.";
    case "accident":
      return "Accident-prone area ahead.";
    case "construction":
      return "Construction ahead.";
    case "dangerous_curve":
      return "Sharp bend ahead.";
    case "bridge":
      return "Bridge ahead.";
    case "slippery":
      return "Slippery road ahead.";
    case "road_closed":
      return "Road may be closed ahead.";
    case "school_zone":
      return "School zone ahead.";
    default:
      return warning.message;
  }
}
