/**
 * Ghana Ashanti Region turn-by-turn preview steps for voice navigation.
 * Does not alter route-engine logic — supplements route preview UI.
 */

export const BEDOMASE_COORDINATES = { lat: 6.958492, lng: -1.500275 } as const;

export interface GhanaRoutePreview {
  id: string;
  label: string;
  fromLabel: string;
  toLabel: string;
  previewSteps: string[];
}

/** Ofinso – Juansa Rd corridor (Bedomase area demo route). */
export const OFINSO_JUANSA_ROUTE: GhanaRoutePreview = {
  id: "ofinso-juansa-rd",
  label: "Ofinso - Juansa Rd",
  fromLabel: "Bedomase, Sekyere South",
  toLabel: "Ofinso - Juansa Rd",
  previewSteps: [
    "Head south on Ofinso - Juansa Rd",
    "Continue for 1.4 km",
    "Turn left toward Agona",
    "Continue straight for 800 m",
    "Arrive at Ofinso - Juansa Rd",
  ],
};

export function matchesGhanaRoute(
  fromLabel: string | undefined,
  toLabel: string | undefined,
): GhanaRoutePreview | null {
  const to = (toLabel ?? "").toLowerCase();
  const from = (fromLabel ?? "").toLowerCase();
  if (to.includes("ofinso") && (to.includes("juansa") || to.includes("juansa rd"))) {
    return OFINSO_JUANSA_ROUTE;
  }
  if (from.includes("bedomase") && to.includes("ofinso")) {
    return OFINSO_JUANSA_ROUTE;
  }
  return null;
}

export function resolveRoutePreviewSteps(
  engineSteps: string[],
  fromLabel?: string,
  toLabel?: string,
): string[] {
  const ghana = matchesGhanaRoute(fromLabel, toLabel);
  if (ghana) return ghana.previewSteps;
  return engineSteps;
}
