# GPS & Global Navigation Hotfix

## Changes

- Real device GPS via `watchPosition` (no Accra placeholder fallback on denial)
- Blue **You are here** marker with accuracy pulse + continuous follow
- Reverse geocode (Nominatim) for address / city / district / region / country
- Permission denied UX with retry + pick-on-map
- From → To navigation with Current / Home / Work / Pick on Map / worldwide search
- Global search via `/api/geo/search` (Nominatim; not Ghana-limited)
- Live nearby emergency POIs via `/api/geo/nearby` (Overpass around live GPS)
- Route options: fastest / shortest / safest + multi-mode ETAs + AI safety warnings
- Map layer toggles on home + navigate

## APIs

| Route | Purpose |
| --- | --- |
| `GET /api/geo/search?q=` | Worldwide geocoding / autocomplete |
| `GET /api/geo/reverse?lat=&lng=` | Reverse geocode |
| `GET /api/geo/nearby?lat=&lng=` | Emergency POIs near live GPS |

## Validation

- Unit tests cover coordinate validation, address parsing, and worldwide distance/ETA
- Existing auth/profile/feature-flag flows unchanged
- Phase 7 flag remains independent; Phase 1 `/navigate` upgraded in-place

## Notes

- Nominatim/Overpass are free providers (rate-limited). Optional Google Places can be wired later via env without UI changes.
- Browser/PWA must grant geolocation; `Permissions-Policy: geolocation=(self)` already set in `vercel.json`.
