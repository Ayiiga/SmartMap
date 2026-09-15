#!/usr/bin/env bash
# Deploy Smart Map to Vercel (production).
set -euo pipefail
cd "$(dirname "$0")/.."

: "${VERCEL_TOKEN:?Set VERCEL_TOKEN from https://vercel.com/account/tokens}"

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

echo "→ Deploy to Vercel (production)"
npx vercel deploy --prod --yes --token "$VERCEL_TOKEN"

echo "✓ Done. Set NEXT_PUBLIC_APP_URL to your *.vercel.app URL in Vercel + Supabase Auth."
