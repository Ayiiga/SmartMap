#!/usr/bin/env bash
# Static export for GitHub Pages (no middleware or API routes).
set -euo pipefail
cd "$(dirname "$0")/.."

MIDDLEWARE_BACKUP=""
API_BACKUP=""
AUTH_CALLBACK_BACKUP=""

cleanup() {
  if [ -n "$MIDDLEWARE_BACKUP" ] && [ -f "$MIDDLEWARE_BACKUP" ]; then
    mv "$MIDDLEWARE_BACKUP" src/middleware.ts
  fi
  if [ -n "$API_BACKUP" ] && [ -d "$API_BACKUP/api" ]; then
    mv "$API_BACKUP/api" src/app/api
  fi
  if [ -n "$AUTH_CALLBACK_BACKUP" ] && [ -d "$AUTH_CALLBACK_BACKUP/callback" ]; then
    mv "$AUTH_CALLBACK_BACKUP/callback" src/app/auth/callback
  fi
}
trap cleanup EXIT

if [ -f src/middleware.ts ]; then
  MIDDLEWARE_BACKUP="$(mktemp)"
  mv src/middleware.ts "$MIDDLEWARE_BACKUP"
fi

if [ -d src/app/api ]; then
  API_BACKUP="$(mktemp -d)"
  mv src/app/api "$API_BACKUP/api"
fi

# OAuth callback is server-only; incompatible with static export
if [ -d src/app/auth/callback ]; then
  AUTH_CALLBACK_BACKUP="$(mktemp -d)"
  mv src/app/auth/callback "$AUTH_CALLBACK_BACKUP/callback"
fi

export GITHUB_PAGES=true
export NEXT_PUBLIC_GITHUB_PAGES=true
export NEXT_PUBLIC_BASE_PATH="${NEXT_PUBLIC_BASE_PATH:-}"

npx next build
