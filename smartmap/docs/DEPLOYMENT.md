# Smart Map Deployment Guide

## Vercel (recommended)

Native Next.js hosting — SSR, API routes, middleware, Supabase auth.

See **[DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)**.

```bash
cd smartmap
cp .env.example .env.local
export VERCEL_TOKEN=...
npm run deploy:vercel
# or: ./scripts/deploy-vercel.sh
```

GitHub Actions: `.github/workflows/deploy-vercel.yml`

---

## GitHub + Cloudflare Workers

See **[DEPLOY_GITHUB_CLOUDFLARE.md](./DEPLOY_GITHUB_CLOUDFLARE.md)** and **[DEPLOY_CLOUDFLARE_LOCAL.md](./DEPLOY_CLOUDFLARE_LOCAL.md)**.

```bash
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=76ab741d1c4f937e97167a05a9063c00
npm run deploy
```

Workflow: `.github/workflows/deploy-cloudflare.yml`

---

## GitHub Pages (static export)

See **[DEPLOY_GITHUB_PAGES.md](./DEPLOY_GITHUB_PAGES.md)**.

```bash
npm run build:github-pages
```

Workflow: `.github/workflows/deploy-github-pages.yml`

---

## CI

`.github/workflows/smartmap-ci.yml` — lint, test, build on PR/push

---

## Supabase

1. Run migrations `001_initial_schema.sql` + `002_google_oauth_profiles.sql`
2. Auth redirect: `https://YOUR_URL/auth/callback`

See [SUPABASE.md](./SUPABASE.md) and [GOOGLE_AUTH.md](./GOOGLE_AUTH.md).

---

## Environment variables

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `NEXT_PUBLIC_APP_URL` | Production URL |
| `OPENAI_API_KEY` | Optional |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional (server) |

---

## PWA verification

1. Chrome → Install app  
2. Lighthouse → PWA audit  
3. Test offline mode
