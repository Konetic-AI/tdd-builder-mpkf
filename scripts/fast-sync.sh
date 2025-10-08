#!/bin/bash

# Fast sync script: stage, commit, push, and sync with Replit
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default commit message
COMMIT_MSG="${1:-chore: quick sync (commit+push+ci+replit)}"

echo -e "${BLUE}🚀 Starting fast sync...${NC}"

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}📍 Current branch: ${BRANCH}${NC}"

# Check if there are changes to commit
if [[ -z $(git status --porcelain) ]]; then
  echo -e "${YELLOW}⚠️  No changes to commit${NC}"
else
  # Stage all changes
  echo -e "${BLUE}📦 Staging all changes...${NC}"
  git add -A
  
  # Commit changes
  echo -e "${BLUE}💾 Committing changes...${NC}"
  git commit -m "$COMMIT_MSG"
fi

# Get remote URL and extract repo info
REMOTE_URL=$(git config --get remote.origin.url)
if [[ $REMOTE_URL =~ github.com[:/]([^/]+)/([^/.]+) ]]; then
  GITHUB_USER="${BASH_REMATCH[1]}"
  GITHUB_REPO="${BASH_REMATCH[2]}"
else
  echo -e "${YELLOW}⚠️  Could not parse GitHub URL${NC}"
  GITHUB_USER=""
  GITHUB_REPO=""
fi

# Push to remote (handle both first push and existing upstream)
echo -e "${BLUE}🔼 Pushing to origin/${BRANCH}...${NC}"
if git rev-parse --verify "origin/${BRANCH}" >/dev/null 2>&1; then
  # Branch exists on remote
  git push origin "$BRANCH"
else
  # First push - set upstream
  echo -e "${YELLOW}⚠️  First push detected, setting upstream...${NC}"
  git push -u origin "$BRANCH"
fi

# Get commit hash
COMMIT_HASH=$(git rev-parse HEAD)
SHORT_HASH=$(git rev-parse --short HEAD)

echo -e "${GREEN}✅ Successfully pushed to origin/${BRANCH}${NC}"

# Print GitHub links
if [[ -n "$GITHUB_USER" && -n "$GITHUB_REPO" ]]; then
  echo ""
  echo -e "${GREEN}🔗 GitHub Links:${NC}"
  echo -e "   Commit: ${BLUE}https://github.com/${GITHUB_USER}/${GITHUB_REPO}/commit/${COMMIT_HASH}${NC}"
  echo -e "   Actions: ${BLUE}https://github.com/${GITHUB_USER}/${GITHUB_REPO}/actions${NC}"
  echo -e "   Branch: ${BLUE}https://github.com/${GITHUB_USER}/${GITHUB_REPO}/tree/${BRANCH}${NC}"
fi

# Trigger Replit sync if script exists in package.json
if [[ -f "package.json" ]]; then
  if grep -q '"replit-sync"' package.json; then
    echo ""
    echo -e "${BLUE}🔄 Triggering Replit sync...${NC}"
    
    # Run Replit sync but don't fail the whole script if it fails
    if npm run replit-sync 2>&1; then
      echo -e "${GREEN}✅ Replit sync completed${NC}"
    else
      echo -e "${YELLOW}⚠️  Replit sync failed (continuing anyway)${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️  No 'replit-sync' script found in package.json${NC}"
  fi
fi

echo ""
echo -e "${GREEN}✨ Fast sync complete!${NC}"
echo -e "${BLUE}   Commit: ${SHORT_HASH}${NC}"
echo -e "${BLUE}   Branch: ${BRANCH}${NC}"

