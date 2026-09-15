# Smart Map Architecture

## Overview

Smart Map is an offline-first PWA built on Next.js 15 with a client-heavy architecture for learning interactions and server components for SEO/marketing pages.

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ React UI │  │ Zustand  │  │ IndexedDB (Dexie)    │  │
│  │ Framer   │  │ Store    │  │ Lessons, Progress,   │  │
│  │ Motion   │  │          │  │ Sync Queue           │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Service  │  │ Web      │  │ Speech API           │  │
│  │ Worker   │  │ Speech   │  │ TTS + Recognition    │  │
│  │ Workbox  │  │          │  │                      │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS (when online)
┌────────────────────────▼────────────────────────────────┐
│                   Next.js Server                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ App      │  │ API      │  │ Middleware           │  │
│  │ Router   │  │ Routes   │  │ Auth session refresh │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   ┌─────────┐    ┌───────────┐    ┌──────────┐
   │Supabase │    │ OpenAI    │    │Cloudflare│
   │Auth+DB  │    │ AI Tutor  │    │ CDN/Edge │
   └─────────┘    └───────────┘    └──────────┘
```

## Offline-First Strategy

1. **Lesson content** cached in IndexedDB on first visit
2. **Progress** saved locally immediately, queued for sync
3. **Service worker** caches static assets and API responses
4. **Background sync** flushes queue when connectivity returns
5. **AI features** degrade gracefully with built-in offline responses

## Authentication Flow

- Supabase Auth with email/password
- Profile auto-created via DB trigger
- Role stored in `profiles.role` (student, teacher, parent, admin)
- Middleware refreshes session cookies on each request

## Content Model

Lessons stored as JSONB in Supabase with structured activities:

```typescript
{
  type: "phonics",
  activities: [
    { type: "blending", data: { word: "cat" } },
    { type: "speaking", data: { word: "cat" } }
  ]
}
```

Local curriculum in `src/content/curriculum.ts` provides seed/demo content.

## Gamification

Client-side Zustand store with localStorage persistence:

- XP → level calculation: `floor(sqrt(xp/100)) + 1`
- Streak tracking by date comparison
- Badges earned at XP thresholds
- Synced to Supabase `gamification` table when online
