#!/usr/bin/env bash
# Push Smart Map monorepo to GitHub (creates remote if needed).
# Optionally enables GitHub Pages (Actions workflow source).
set -euo pipefail
cd "$(dirname "$0")/.."

GITHUB_OWNER="${GITHUB_OWNER:-Ayiiga}"
GITHUB_REPO="${GITHUB_REPO:-Smart Map}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"

if [ -z "${GITHUB_TOKEN:-}" ] && [ -z "${GH_TOKEN:-}" ]; then
  echo "Set GITHUB_TOKEN (PAT with repo + workflow scopes) or run: gh auth login"
  exit 1
fi

TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
export GH_TOKEN="$TOKEN"

# When GH_TOKEN is set, gh uses it directly (ignore stale hosts.yml accounts).
if [ -z "${GH_TOKEN:-}" ]; then
  if ! gh auth status -h github.com >/dev/null 2>&1; then
    echo "Set GITHUB_TOKEN or run: gh auth login"
    exit 1
  fi
fi

if [ -z "$GITHUB_OWNER" ]; then
  GITHUB_OWNER="$(gh api user -q .login)"
fi

REMOTE_URL="https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}.git"

if git remote get-url github >/dev/null 2>&1; then
  git remote set-url github "$REMOTE_URL"
else
  git remote add github "$REMOTE_URL"
fi

if ! gh repo view "${GITHUB_OWNER}/${GITHUB_REPO}" >/dev/null 2>&1; then
  echo "→ Creating GitHub repo ${GITHUB_OWNER}/${GITHUB_REPO}..."
  gh repo create "$GITHUB_REPO" --public --source=. --remote=github --push=false \
    --description "Smart Map — offline-first English learning PWA for young learners"
  git remote set-url github "$REMOTE_URL"
fi

echo "→ Pushing ${GITHUB_BRANCH} to github (${GITHUB_OWNER}/${GITHUB_REPO})..."
git push -u github "HEAD:${GITHUB_BRANCH}"

echo "→ Enabling GitHub Pages (Actions source)..."
gh api -X PUT "repos/${GITHUB_OWNER}/${GITHUB_REPO}/pages" \
  -f build_type=workflow \
  -f "source[branch]=${GITHUB_BRANCH}" \
  -f "source[path]=/" 2>/dev/null || \
gh api -X POST "repos/${GITHUB_OWNER}/${GITHUB_REPO}/pages" \
  -f build_type=workflow 2>/dev/null || true

echo "✓ GitHub: https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}"
echo "✓ Pages URL (after workflow): https://${GITHUB_OWNER}.github.io/${GITHUB_REPO}/"
echo "  Configure Actions secrets — see smartmap/docs/DEPLOY_GITHUB_CLOUDFLARE.md"
echo "  Vercel deploy: smartmap/docs/DEPLOY_VERCEL.md"
