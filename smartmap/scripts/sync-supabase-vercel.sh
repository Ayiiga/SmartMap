#!/usr/bin/env bash
# Validate Supabase keys against the configured project URL and sync to Vercel.
set -euo pipefail
cd "$(dirname "$0")/.."

: "${VERCEL_TOKEN:?Set VERCEL_TOKEN from https://vercel.com/account/tokens}"

PROJECT_REF="${SUPABASE_PROJECT_REF:-vhgqzdxkjmsomclyrchv}"
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://${PROJECT_REF}.supabase.co}"
ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-${ANON_PUBLIC_KEY:-}}"

if [ -z "$ANON_KEY" ]; then
  echo "✗ No anon key found. Set NEXT_PUBLIC_SUPABASE_ANON_KEY or ANON_PUBLIC_KEY."
  echo "  Get the key from: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api-keys"
  exit 1
fi

echo "→ Validating Supabase auth for ${SUPABASE_URL}"
HTTP_CODE=$(curl -sS -o /tmp/supabase-health.json -w "%{http_code}" \
  "${SUPABASE_URL}/auth/v1/health" \
  -H "apikey: ${ANON_KEY}")

if [ "$HTTP_CODE" != "200" ]; then
  echo "✗ Anon key failed health check (HTTP ${HTTP_CODE}):"
  cat /tmp/supabase-health.json
  echo ""
  echo "  Ensure the anon/publishable key matches project ${PROJECT_REF}."
  exit 1
fi

echo "✓ Supabase auth reachable with provided anon key"

if [ "${SYNC_VERCEL:-1}" = "1" ]; then
  echo "→ Updating Vercel production env"
  npx vercel env update NEXT_PUBLIC_SUPABASE_URL production --value "$SUPABASE_URL" --yes --token "$VERCEL_TOKEN"
  npx vercel env update NEXT_PUBLIC_SUPABASE_ANON_KEY production --value "$ANON_KEY" --yes --token "$VERCEL_TOKEN"
  echo "✓ Vercel env updated. Redeploy to apply."
fi
