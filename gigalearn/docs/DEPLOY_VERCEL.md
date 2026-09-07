# Deploy GigaLearn to Vercel

Vercel is the **recommended** deploy path for this Next.js 15 app.

## Dashboard setup (first time)

1. [vercel.com/new](https://vercel.com/new) → Import **GitLab** or **GitHub** repo
2. **Root Directory:** `gigalearn` (required — monorepo)
3. **Framework:** Next.js (auto)
4. Add environment variables (Production):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vhgqzdxkjmsomclyrchv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable/anon key from [API Keys](https://supabase.com/dashboard/project/vhgqzdxkjmsomclyrchv/settings/api-keys) — must match project `vhgqzdxkjmsomclyrchv` |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | `GigaLearn` |
| `OPENAI_API_KEY` | Optional |

5. Deploy

## Interactive CLI (first deploy)

From repo root after clone:

```bash
npm install -g vercel    # or: npx vercel
vercel login             # browser or device code
cd gigalearn
vercel
```

Answer the wizard:

| Prompt | Answer |
|--------|--------|
| Set up and deploy? | **Y** |
| Which scope? | Your account (e.g. Ayiiga) |
| Link to existing project? | **Y** (use project ID below) or **N** for new |
| Project name? | **gigalearn** (or link `prj_fueH7SVjqymh14dzrvCGoHIKSfcg`) |
| Directory? | **./** |

Or non-interactive after login:

```bash
cd gigalearn
chmod +x scripts/setup-vercel.sh
./scripts/setup-vercel.sh
```

**Important:** If `VERCEL_TOKEN` is set to an invalid/placeholder value, unset it before `vercel login`:

```bash
unset VERCEL_TOKEN
vercel login
```

## Token-based deploy (CI / Cloud Agent)

```bash
git clone https://gitlab.com/ayiiga3-group/vibepay.git
cd vibepay/gigalearn
cp .env.example .env.local   # fill Supabase keys
npm install
export VERCEL_TOKEN=...      # https://vercel.com/account/tokens
npm run deploy:vercel
```

Or:

```bash
chmod +x scripts/deploy-vercel.sh
./scripts/deploy-vercel.sh
```

## GitHub Actions

Workflow: `.github/workflows/deploy-vercel.yml`

Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, Supabase env vars.

When `VERCEL_TOKEN` is unset, the workflow **skips** instead of failing — production still deploys via Vercel Git integration on push to `main`.

**Project ID (GigaLearn):** `prj_fueH7SVjqymh14dzrvCGoHIKSfcg`

Link locally:

```bash
cd gigalearn
export VERCEL_PROJECT_ID=prj_fueH7SVjqymh14dzrvCGoHIKSfcg
vercel link --yes --project "$VERCEL_PROJECT_ID"
```

## Analytics

The app includes [`@vercel/analytics`](https://vercel.com/docs/analytics) via `<Analytics />` in `src/app/layout.tsx`. Page views are recorded automatically when deployed on Vercel (no extra env vars). Enable **Web Analytics** in the Vercel project dashboard if prompted.

## Post-deploy

**Supabase → Authentication → URL configuration:**

- Site URL: `https://your-project.vercel.app`
- Redirect: `https://your-project.vercel.app/auth/callback`

If login shows "Failed to fetch" or an auth config banner, verify:

1. `NEXT_PUBLIC_SUPABASE_URL` is `https://vhgqzdxkjmsomclyrchv.supabase.co` (not an empty string in Vercel)
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the **publishable/anon key for project `vhgqzdxkjmsomclyrchv`** (JWT `ref` must match)
3. Redirect URLs include `https://your-project.vercel.app/auth/callback`

Health check: `GET /api/health` should return `"status":"healthy"` when configured correctly.

Config file: `gigalearn/vercel.json` (PWA cache headers + security headers).
