/**
 * Role-based access control for Smart Map enterprise surfaces.
 * Additive to existing auth — does not alter legacy profile roles.
 */

export type SmartMapRole =
  | "guest"
  | "user"
  | "business"
  | "moderator"
  | "agency"
  | "ngo"
  | "admin";

const ROLE_RANK: Record<SmartMapRole, number> = {
  guest: 0,
  user: 1,
  business: 2,
  moderator: 3,
  ngo: 4,
  agency: 5,
  admin: 6,
};

export function canAccess(
  role: SmartMapRole,
  minimum: SmartMapRole,
): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export function rolesForFeature(feature: "portal" | "command" | "enterprise" | "reviews_mod"): SmartMapRole[] {
  switch (feature) {
    case "portal":
      return ["business", "admin"];
    case "reviews_mod":
      return ["moderator", "admin"];
    case "command":
      return ["agency", "admin"];
    case "enterprise":
      return ["agency", "ngo", "admin"];
    default:
      return ["admin"];
  }
}
