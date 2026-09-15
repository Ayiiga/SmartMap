# Deploy Smart Map to GitHub Pages

## Quick deploy (Ayiiga/Smart Map)

```bash
export GITHUB_TOKEN=ghp_...   # repo + workflow scopes
export GITHUB_OWNER=Ayiiga
export GITHUB_REPO=Smart Map
./scripts/push-github.sh
```

Or manually:

```bash
git remote add github https://github.com/Ayiiga/Smart Map.git
git push -u github master:main
```

Then in **GitHub → Settings → Pages**, set **Source** to **GitHub Actions** (the push script attempts this automatically).

## GitHub Actions secrets

| Secret | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Recommended | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Recommended | Supabase anon JWT |

## Local build (static export)

```bash
cd smartmap
export NEXT_PUBLIC_BASE_PATH=/smartmap   # match your repo name
npm install
npm run build:github-pages
# Output: smartmap/out/
```

## Live URL

Project site: `https://YOUR_USERNAME.github.io/REPO_NAME/`

## GitHub Pages limitations

Static hosting does not run Next.js middleware or `/api/*` routes. On Pages:

- Auth uses client-side Supabase only
- AI tutor uses built-in offline demo responses
- Offline learning, curriculum, and PWA assets still work
