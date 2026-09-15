# Smart Map Phased Rollout

## Feature flags

| Flag | Env | Default | Purpose |
|------|-----|---------|---------|
| Phase 1 Foundation | always on | `true` | Map, search, nearby essentials, saved places, profile, PWA |
| `publicSafetyPhase2` | `NEXT_PUBLIC_FEATURE_PUBLIC_SAFETY` | `false` | SOS, emergency contacts, community reports, alerts |
| `aiExpansionPhase3` | `NEXT_PUBLIC_FEATURE_AI_EXPANSION` | `false` | AI assistant, voice, offline maps, tourism, business, admin |
| `smartServicesPhase4` | `NEXT_PUBLIC_FEATURE_SMART_SERVICES` | `false` | Public services, transport, trip planner |
| `businessCommunityPhase5` | `NEXT_PUBLIC_FEATURE_BUSINESS_COMMUNITY` | `false` | Business portal, groups, reviews |
| `africaExpansionPhase6` | `NEXT_PUBLIC_FEATURE_AFRICA_EXPANSION` | `false` | Africa expansion, enterprise, command center |
| `advancedNavigationPhase7` | `NEXT_PUBLIC_FEATURE_ADVANCED_NAVIGATION` | `false` | Advanced routing, layers, AI safety, trip summary |

Enable only after explicit approval:

```bash
export NEXT_PUBLIC_FEATURE_PUBLIC_SAFETY=true
export NEXT_PUBLIC_FEATURE_AI_EXPANSION=true
# Phase 7 (keep false until QA):
# export NEXT_PUBLIC_FEATURE_ADVANCED_NAVIGATION=true
```

## Production posture

Deploy with Phases 2–7 flags **false**. Phase 1 remains live.

## Rollback plan

1. Keep previous Vercel deployment available for instant rollback.
2. If a phase flag was enabled accidentally, set env vars back to `false` and redeploy.
3. Auth, Supabase schema, and package routes are unchanged — rollback does not require data migration.
4. Phase 7 uses client-side route/trip cache only.

## Known constraints

- Map tiles require WebGL in the browser.
- Community media attachments are client-side metadata only until storage backend is provisioned.
- Rate limiting is in-memory per instance.
- Phase 7 routing is deterministic/offline-capable until a live routing provider is wired.
