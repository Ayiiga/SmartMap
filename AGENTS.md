# AGENTS.md

## Cursor Cloud specific instructions

### Repository layout

| Path | Purpose |
| --- | --- |
| `app/`, `gradlew` | Android app (Smart Map, `com.ayiiga3.smartmap`) |
| `smartmap/` | Next.js website / PWA (Smart Map) |
| `.github/workflows/deploy-vercel.yml` | Vercel production deploy |
| `scripts/push-github.sh` | Push `main` → GitHub `Ayiiga/SmartMap` |

### Android (local / CI)

```bash
export ANDROID_HOME=/android-sdk-linux
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
./gradlew assembleDebug test
```

Ruby gems for fastlane: `bundle config set --local path vendor/bundle && bundle install` (regenerate `Gemfile.lock` on Ruby 3.2 if Bundler 1.x fails).

### Website (local)

```bash
cd smartmap
npm install
npm run build:github-pages   # static export to smartmap/out/
```

### Website deploy (recommended: Vercel)

```bash
cd smartmap
npm install
export VERCEL_TOKEN=...
npm run deploy:vercel
```

See `smartmap/docs/DEPLOY_VERCEL.md`. Vercel project **Root Directory** must be `smartmap`.

### GitHub push

- Remote: `https://github.com/Ayiiga/SmartMap.git`
- `./scripts/push-github.sh` requires `GITHUB_TOKEN` with **Contents: Read and write** (see `smartmap/docs/PUSH_GITHUB_LOCAL.md`)
- Repo is currently empty on GitHub until a token with Contents write succeeds

### GitLab

- Origin: `ayiiga3-group/vibepay` (project 77966430), default branch `master`
- CI may fail until GitLab account identity verification is complete

### Merge conflict note

`master` already contains the GitHub Pages–ready `smartmap/` tree. Older branches (`cursor/smartmap-pwa-46dc`, `cursor/deploy-github-cloudflare-46dc`) conflict if merged wholesale — prefer `master` versions and cherry-pick only missing features.
