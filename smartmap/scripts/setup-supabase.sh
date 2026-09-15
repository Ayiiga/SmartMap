#!/usr/bin/env bash
# Link Smart Map to remote Supabase and push migrations.
# Prerequisites:
#   1. supabase login          (or set SUPABASE_ACCESS_TOKEN)
#   2. Database password from Supabase Dashboard → Settings → Database

set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_REF="vhgqzdxkjmsomclyrchv"

echo "→ Linking project ${PROJECT_REF}..."
if [ -n "${SUPABASE_DB_PASSWORD:-}" ]; then
  npx supabase link --project-ref "$PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"
else
  npx supabase link --project-ref "$PROJECT_REF"
fi

echo "→ Pushing migrations..."
npx supabase db push

echo "✓ Done. Verify tables in Supabase Dashboard → Table Editor."
