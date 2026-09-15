# Phase 7 — Advanced Navigation & Safety

## Feature flag

| Flag | Env | Default |
|------|-----|---------|
| `advancedNavigationPhase7` | `NEXT_PUBLIC_FEATURE_ADVANCED_NAVIGATION` | `false` |

**Do not enable in production until QA sign-off.**

```bash
# local verification only
export NEXT_PUBLIC_FEATURE_ADVANCED_NAVIGATION=true
```

## Routes (gated)

- `/advanced-navigation` — route planning, modes, layers, emergency nav, AI safety, voice
- `/trip-summary` — post-navigation summary

Existing `/navigate` (Phase 1) remains unchanged and always available.

## Capabilities

- Multi-stop route planning with avoid tolls/traffic/ferries/unpaved
- Modes: car, bus, motorcycle, bicycle, walking
- Distance (km/mi), ETA, difficulty, fuel estimate, elevation profile
- Map layers: satellite, standard, terrain, vegetation, rivers, lakes, mountains, forests, land cover, traffic, weather, night
- Nearby emergency services with distance, ETA, open status, one-tap navigate/call
- AI route safety warnings + voice guidance phrases
- Offline route cache (localStorage) + trip summary (sessionStorage)
- No auth/schema/API breaking changes; no destructive migrations

## Rollback

1. Keep flag `false` (default) — Phase 7 UI shows Coming soon.
2. If enabled accidentally: set `NEXT_PUBLIC_FEATURE_ADVANCED_NAVIGATION=false` and redeploy.
3. Instant app rollback: previous Vercel production deployment / git tag `v2.0.0`.
4. User data preserved — Phase 7 uses client cache only.

## Performance notes

- Route math is deterministic O(preferences × waypoints); suitable for offline/demo.
- Dynamic `MapView` import keeps Phase 7 JS off the critical home path when unused.
- Layer toggles use `startTransition` to keep UI responsive.
- Route results cached locally to avoid recomputation on revisit.
