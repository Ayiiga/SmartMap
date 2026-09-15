# Deploy Smart Map to GitHub + Cloudflare

## 1. Push to GitHub

### Automated (recommended)
```bash
export GITHUB_TOKEN=your_pat_here     # PAT with repo scope — never commit
export GITHUB_OWNER=Ayiiga            # optional; default Ayiiga
export GITHUB_REPO=Smart Map          # optional; default Smart Map
./scripts/push-github.sh
```

Target: **https://github.com/Ayiiga/Smart Map.git**

If the Cloud Agent VM cannot reach GitHub, push from your laptop — see **[PUSH_GITHUB_LOCAL.md](./PUSH_GITHUB_LOCAL.md)**.

### Manual with GitHub CLI
```bash
gh auth login
gh repo create smartmap --public --source=. --remote=github --push
```

Or create manually at https://github.com/new then:
```bash
git remote add github git@github.com:YOUR_USERNAME/smartmap.git
git push -u github main
```

### Branches included
- `smartmap/` — Next.js PWA application
- `.github/workflows/` — CI + Cloudflare deploy

---

## 2. GitHub Actions secrets

In **GitHub → Settings → Secrets and variables → Actions**, add:

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Workers deploy permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vhgqzdxkjmsomclyrchv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon JWT |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional publishable key |
| `NEXT_PUBLIC_APP_URL` | Production URL (e.g. `https://smartmap.YOUR_SUBDOMAIN.workers.dev`) |
| `OPENAI_API_KEY` | Optional — AI tutor |

---

## 3. Cloudflare setup

### Create API token
1. [Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. **Create Token** → **Edit Cloudflare Workers** template
3. Copy token → GitHub secret `CLOUDFLARE_API_TOKEN`

### Account ID
Dashboard → Workers & Pages → right sidebar → **Account ID**

### Manual deploy (local)
```bash
cd smartmap
cp .env.example .env.local   # fill in values
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=76ab741d1c4f937e97167a05a9063c00
./scripts/deploy-cloudflare.sh
# or: npm run deploy
```

If the Cloud Agent VM cannot reach Cloudflare, see **[DEPLOY_CLOUDFLARE_LOCAL.md](./DEPLOY_CLOUDFLARE_LOCAL.md)**.

---

## 4. Automatic deployment

On push to `master` or `main`:
- **smartmap-ci.yml** — lint, test, build
- **deploy-cloudflare.yml** — deploy to Cloudflare Workers via OpenNext

---

## 5. Post-deploy checklist

1. Set **Supabase redirect URLs** to your Cloudflare URL:
   ```
   https://smartmap.YOUR_SUBDOMAIN.workers.dev/auth/callback
   ```
2. Set `NEXT_PUBLIC_APP_URL` to the same URL in GitHub secrets
3. Run SQL migrations in Supabase (001 + 002)
4. Enable Google OAuth provider if using Google sign-in

---

## Stack

| Layer | Technology |
|-------|------------|
| Hosting | Cloudflare Workers (OpenNext) |
| CI/CD | GitHub Actions |
| App | Next.js 15 + PWA |
