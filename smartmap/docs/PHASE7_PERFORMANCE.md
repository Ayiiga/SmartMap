# Phase 7 Performance Report

## Route calculation

| Metric | Result |
| --- | --- |
| Algorithm | Deterministic corridor + preference factors (offline-capable) |
| Alternatives per request | Up to 5 (fastest/safest/shortest/eco/lowest fuel) |
| Complexity | O(preferences × waypoints) |
| Typical Accra demo route | &lt; 5 ms in unit tests (CPU math only) |

## Caching

- Successful routes stored in `localStorage` under `smart-map-route-cache-v1:*`
- Trip summaries stored in `sessionStorage`
- Revisit avoids full recomputation when cache hit is used by UI after start

## Rendering

- `MapView` remains dynamically imported (`ssr: false`)
- Phase 7 page is feature-gated; when flag is off only Coming Soon ships
- Layer toggles wrapped in `startTransition` for responsive UI
- Elevation sparkline is CSS-only (no chart library)

## Battery / GPS

- High-accuracy geolocation watch starts **only while navigating**
- Cleared on unmount / trip end
- Speed shown only with user permission / valid GPS speed

## Map tiles

- Continues to use OpenFreeMap styles (no new paid tile keys required)
- Overlay layers are informational toggles; basemap switches among existing streets/satellite/terrain/dark
