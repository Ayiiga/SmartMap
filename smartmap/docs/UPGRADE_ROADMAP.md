# Smart Map Upgrade Roadmap

Maps the [Master Vision](./VISION.md) to the current codebase and recommended build phases.

**Legend:** ✅ Implemented · 🟡 Partial · ⬜ Not started

---

## Current platform snapshot (v1.0)

| Layer | Status | Notes |
| --- | --- | --- |
| Next.js 15 + TypeScript + Tailwind 4 | ✅ | App Router, Framer Motion |
| PWA + Workbox | ✅ | Disabled on GitHub Pages static export |
| IndexedDB (Dexie) | ✅ | Local progress, sync queue |
| Supabase Auth + Postgres | ✅ | Profiles, roles, migrations |
| OpenAI AI tutor | 🟡 | API route; offline fallbacks on static host |
| Cloudflare deploy path | 🟡 | Workflow exists on draft branch |
| GitHub Pages deploy | ✅ | Static export workflow on `main` |
| Android app (`com.ayiiga3.smartmap`) | ✅ | Separate module in monorepo |

---

## Core learning areas

| Vision area | Status | Current implementation |
| --- | --- | --- |
| GigaPhonics | 🟡 | **A–Z letter lessons** (26); CVC blending, phonics cards; expand digraphs/trigraphs + guided reading |
| Reading & comprehension | 🟡 | Stories page, Leo the Lion lesson; needs guided reading library |
| Vocabulary & semantics | 🟡 | Flashcards, categories; needs picture dictionary scale |
| Tone, rhythm & expression | 🟡 | Level defined; minimal interactive content |
| Grammar | 🟡 | Landing page; few structured lessons |
| **Mathematics / GigaMath** | 🟡 | **Starter module** — counting 1–10, basic addition (3 lessons) |

---

## AI features

| Feature | Status | Upgrade path |
| --- | --- | --- |
| AI Learning Assistant | 🟡 | `/ai-tutor` + `/api/ai`; wire real keys in production |
| AI Reading Coach | ⬜ | Add speech scoring + fluency metrics |
| AI Story Generator | 🟡 | Offline demo text; connect OpenAI with child-safe prompts |
| AI Quiz Generator | ⬜ | New generator + adaptive difficulty engine |

---

## Gamification

| Feature | Status |
| --- | --- |
| XP, coins, streaks | ✅ Zustand + localStorage |
| Achievement badges | 🟡 Defined in curriculum; UI on `/achievements` |
| Leaderboards | ⬜ |
| Quests / unlockables | ⬜ |
| Certificates | ⬜ |

---

## Dashboards

| Dashboard | Status |
| --- | --- |
| Student | 🟡 Basic progress view |
| Teacher | 🟡 **Mock data** — needs Supabase classes, assignments, attendance |
| Parent | 🟡 **Mock data** — needs child linking + reports |
| Admin | 🟡 Shell page |

---

## Offline-first

| Feature | Status |
| --- | --- |
| Lesson cache | 🟡 |
| Progress queue + sync API | ✅ |
| Offline stories/games | 🟡 |
| Media cache | 🟡 Workbox rules for images/API |

---

## Design & UX

| Vision element | Status |
| --- | --- |
| Child-friendly UI | ✅ |
| Animated mascot / characters | ⬜ Emoji-only today |
| Educational videos | ⬜ |
| High-quality illustrations | 🟡 Icons + emoji; needs asset pipeline |

---

## Recommended phases

### Phase 1 — Foundation (4–6 weeks of focused work)

1. **Ship production hosting** — Cloudflare or Vercel (full API + auth); keep GitHub Pages as marketing/demo
2. **Complete GigaPhonics A–Z** — one lesson per letter, tracing + sound + word
3. **Wire teacher/parent dashboards** to Supabase (replace mocks)
4. **Fix GitHub push** — `Ayiiga/Smart Map` with working Actions secrets

### Phase 2 — AI & engagement

1. Production OpenAI with safety filters and age bands
2. AI Reading Coach (Web Speech API + feedback UI)
3. Leaderboards + daily quests
4. Mascot character system (Lottie or Rive)

### Phase 3 — GigaMath & ecosystem

1. New `mathematics` learning level + GigaMath module
2. GigaScience / expanded story library
3. School multi-tenant (institutions, class codes)
4. Certificates + parent email reports

### Phase 4 — Scale

1. Localization (French, Swahili, etc.)
2. Low-bandwidth mode for rural Africa
3. Android + web feature parity
4. App store / Play Store release

---

## How to use this document

- Product decisions should trace back to [VISION.md](./VISION.md)
- Before large features, update this roadmap with issue/MR links
- Prefer extending `src/content/curriculum.ts` and Supabase schemas together

**Founder:** Ayiiga Benard Issaka · **Repo:** [Ayiiga/Smart Map](https://github.com/Ayiiga/Smart Map)
