# Smart Map v2.0.0 Release Notes

**Tag:** `v2.0.0`  
**Date:** 2026-07-27  
**Merge commit:** `cf09146`

## Highlights

- Full product transformation to **Smart Map** (Explore • Connect • Stay Safe)
- Interactive MapLibre home map for Ghana with nearby essentials search
- Saved places / favorites, profile, PWA, light/dark mode
- Phases 2–6 implemented behind feature flags (**disabled by default**)

## New features

### Phase 1 (live)
- Branding, map, GPS, search, nearby police/fire/hospitals/pharmacies/schools/universities/hostels
- Navigation, favorites, dashboard hub, settings/accessibility

### Phases 2–6 (flagged off)
- Public safety / SOS / community reporting
- AI assistant & expansion modules
- Smart public services, transport, trip planner
- Business portal, groups, reviews + AI moderation
- Africa expansion catalog, enterprise & command center

## Fixes / improvements
- MapLibre ESM import compatibility
- Geolocation permissions enabled for maps
- Auth redirects updated to Smart Map destinations
- Rate limiting and input validation for AI/report flows

## Database
- Additive migration only: `supabase/migrations/004_smart_map_phase4_6.sql`
- Existing auth/profile tables unchanged

## Feature flags (production defaults)
```
NEXT_PUBLIC_FEATURE_PUBLIC_SAFETY=false
NEXT_PUBLIC_FEATURE_AI_EXPANSION=false
NEXT_PUBLIC_FEATURE_SMART_SERVICES=false
NEXT_PUBLIC_FEATURE_BUSINESS_COMMUNITY=false
NEXT_PUBLIC_FEATURE_AFRICA_EXPANSION=false
```

## Rollback
Revert to previous `main` commit `835db67` or previous Vercel deployment. No destructive schema changes.
