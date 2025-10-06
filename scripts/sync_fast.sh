#!/usr/bin/env bash
set -euo pipefail
COMMIT_MSG="${COMMIT_MSG:-chore: quick sync (commit+push+ci+replit)}"
REPLIT_SYNC="${REPLIT_SYNC:-npm run replit-sync}"

echo "🔎 Detecting repo & branch..."
REPO_URL="$(git remote get-url origin || true)"
REPO_SLUG="${REPO_URL##*/}"; REPO_SLUG="${REPO_SLUG%.git}"
OWNER="$(printf "%s" "$REPO_URL" | sed -E 's#(.*[:/])([^/]+)/[^/]+(\.git)?#\2#')"
OWNER="${OWNER:-Konetic-AI}"; NAME="${REPO_SLUG:-tdd-builder-mpkf}"
BRANCH="$(git rev-parse --abbrev-ref HEAD || echo 'unknown')"
echo "🧭 Repo: ${OWNER}/${NAME} | Branch: ${BRANCH}"

git config core.hooksPath .husky || true

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "📝 Committing changes…"
  git add -A
  git commit -m "${COMMIT_MSG}" || true
else
  echo "✅ No local changes to commit."
fi

if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
  echo "🚀 Pushing…"; time git push
else
  echo "🚀 First push for this branch…"; time git push -u origin HEAD
fi

if [ "${BRANCH}" = "main" ]; then
  echo "🔗 Commits: https://github.com/${OWNER}/${NAME}/commits/main"
  echo "🔗 Actions: https://github.com/${OWNER}/${NAME}/actions?query=branch%3Amain"
else
  echo "🔗 Create/visit PR: https://github.com/${OWNER}/${NAME}/compare/main...${BRANCH}"
  echo "🔗 Actions: https://github.com/${OWNER}/${NAME}/actions?query=branch%3A${BRANCH}"
fi

if grep -q '"replit-sync"' package.json 2>/dev/null; then
  echo "🔄 Replit sync: ${REPLIT_SYNC}"
  time ${REPLIT_SYNC} || echo "⚠️ Replit sync returned non-zero."
else
  echo "ℹ️ No 'replit-sync' script in package.json; skipping."
fi

echo ""; echo "================= SUMMARY ================="
echo "Branch         : ${BRANCH}"
echo "Last commit    : $(git log --oneline -n 1)"
echo "Upstream       : $(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo 'none')"
echo "==========================================="
