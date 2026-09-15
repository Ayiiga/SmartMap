#!/usr/bin/env bash
# First-time Vercel setup for Smart Map (matches interactive wizard answers).
# Prerequisites: vercel login (or export VERCEL_TOKEN)
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -z "${VERCEL_TOKEN:-}" ]; then
  if ! env -u VERCEL_TOKEN vercel whoami >/dev/null 2>&1; then
    echo "Run: vercel login"
    echo "  Or: export VERCEL_TOKEN=... from https://vercel.com/account/tokens"
    exit 1
  fi
fi

echo "→ Link project (default: prj_fueH7SVjqymh14dzrvCGoHIKSfcg)"
PROJECT_ID="${VERCEL_PROJECT_ID:-prj_fueH7SVjqymh14dzrvCGoHIKSfcg}"
if [ -n "${VERCEL_TOKEN:-}" ]; then
  vercel link --yes --project "$PROJECT_ID" --token "$VERCEL_TOKEN"
else
  env -u VERCEL_TOKEN vercel link --yes --project "$PROJECT_ID"
fi

echo "→ Deploy to production"
if [ -n "${VERCEL_TOKEN:-}" ]; then
  vercel deploy --prod --yes --token "$VERCEL_TOKEN"
else
  vercel deploy --prod --yes
fi

echo "✓ Done. Copy the *.vercel.app URL → NEXT_PUBLIC_APP_URL + Supabase auth redirect."
