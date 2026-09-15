# Smart Map Phases 4–6 Rollout

## Feature flags (default OFF)

| Flag | Env | Routes |
|------|-----|--------|
| `smartServicesPhase4` | `NEXT_PUBLIC_FEATURE_SMART_SERVICES` | `/services`, `/transport`, `/trips` |
| `businessCommunityPhase5` | `NEXT_PUBLIC_FEATURE_BUSINESS_COMMUNITY` | `/portal`, `/groups`, `/reviews` |
| `africaExpansionPhase6` | `NEXT_PUBLIC_FEATURE_AFRICA_EXPANSION` | `/enterprise`, `/countries`, `/command-center` |

## Database

Additive migration only:

`supabase/migrations/004_smart_map_phase4_6.sql`

Does not alter existing auth/profile tables.

## Security additions

- RBAC helpers (`lib/security/rbac.ts`)
- Device session stubs (`lib/security/sessions.ts`)
- Audit log helpers (`lib/security/audit.ts`)
- AI moderation heuristics (`lib/moderation/ai-moderation.ts`)
- Existing rate limiting + input validation retained

## Accessibility

Settings toggles for large text, high contrast, and reduce motion (`lib/a11y/prefs.ts` + CSS classes).

## Enable after approval

```bash
export NEXT_PUBLIC_FEATURE_SMART_SERVICES=true
export NEXT_PUBLIC_FEATURE_BUSINESS_COMMUNITY=true
export NEXT_PUBLIC_FEATURE_AFRICA_EXPANSION=true
```
