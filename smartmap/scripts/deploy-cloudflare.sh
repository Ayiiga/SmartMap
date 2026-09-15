#!/usr/bin/env bash
# Build and deploy Smart Map to Cloudflare Workers (OpenNext).
set -euo pipefail
cd "$(dirname "$0")/.."

: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN (Dashboard → API Tokens → Edit Cloudflare Workers)}"
: "${CLOUDFLARE_ACCOUNT_ID:?Set CLOUDFLARE_ACCOUNT_ID (Dashboard → Workers → Account ID)}"

if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

: "${NEXT_PUBLIC_SUPABASE_URL:?Set in .env.local or environment}"
: "${NEXT_PUBLIC_SUPABASE_ANON_KEY:?Set in .env.local or environment}"

echo "→ Lint & test"
npm run lint
npm run test

echo "→ Deploy to Cloudflare Workers (smartmap)"
npm run deploy

echo "✓ Deploy complete. Worker URL: https://smartmap.<your-subdomain>.workers.dev"
echo "  Update Supabase Auth redirect URLs and NEXT_PUBLIC_APP_URL to match."
