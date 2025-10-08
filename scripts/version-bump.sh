#!/bin/bash

# Version bump helper script
# Usage: ./scripts/version-bump.sh [major|minor|patch] ["release message"]

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Default values
BUMP_TYPE="${1:-patch}"
RELEASE_MSG="${2:-Release version bump}"

echo -e "${BLUE}🎯 TDD Builder MPKF - Version Bump Script${NC}"
echo ""

# Validate bump type
if [[ ! "$BUMP_TYPE" =~ ^(major|minor|patch)$ ]]; then
  echo -e "${RED}❌ Error: Invalid bump type '$BUMP_TYPE'${NC}"
  echo -e "${YELLOW}Usage: ./scripts/version-bump.sh [major|minor|patch] [\"release message\"]${NC}"
  exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo -e "${YELLOW}⚠️  Warning: Not on main branch (currently on: ${CURRENT_BRANCH})${NC}"
  read -p "Continue anyway? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted${NC}"
    exit 1
  fi
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
  echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
  read -p "Commit them first? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add -A
    git commit -m "chore: prepare for version bump"
  else
    echo -e "${RED}❌ Please commit or stash changes before version bump${NC}"
    exit 1
  fi
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📦 Current version: ${CURRENT_VERSION}${NC}"

# Calculate new version
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

case "$BUMP_TYPE" in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  patch)
    PATCH=$((PATCH + 1))
    ;;
esac

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
echo -e "${GREEN}✨ New version: ${NEW_VERSION}${NC}"
echo ""

# Confirmation
read -p "$(echo -e ${YELLOW}Bump version from ${CURRENT_VERSION} to ${NEW_VERSION}? \(y/N\): ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}Aborted${NC}"
  exit 1
fi

echo -e "${BLUE}🔄 Updating version...${NC}"

# Update package.json
npm version "$NEW_VERSION" --no-git-tag-version

# Update CHANGELOG.md
if [[ -f "CHANGELOG.md" ]]; then
  TODAY=$(date +%Y-%m-%d)
  
  # Replace [Unreleased] with new version
  sed -i.bak "s/## \[Unreleased\]/## [Unreleased]\n\n## [${NEW_VERSION}] - ${TODAY}/" CHANGELOG.md
  
  # Update comparison links at bottom
  sed -i.bak "s|\[Unreleased\]:.*|[Unreleased]: https://github.com/Konetic-AI/tdd-builder-mpkf/compare/v${NEW_VERSION}...HEAD\n[${NEW_VERSION}]: https://github.com/Konetic-AI/tdd-builder-mpkf/compare/v${CURRENT_VERSION}...v${NEW_VERSION}|" CHANGELOG.md
  
  rm -f CHANGELOG.md.bak
  echo -e "${GREEN}✅ Updated CHANGELOG.md${NC}"
else
  echo -e "${YELLOW}⚠️  CHANGELOG.md not found, skipping${NC}"
fi

# Run tests
echo ""
echo -e "${BLUE}🧪 Running test suite...${NC}"
if npm test > /dev/null 2>&1; then
  echo -e "${GREEN}✅ All tests passed${NC}"
else
  echo -e "${RED}❌ Tests failed! Please fix before proceeding.${NC}"
  # Revert version change
  npm version "$CURRENT_VERSION" --no-git-tag-version
  exit 1
fi

# Commit changes
echo ""
echo -e "${BLUE}💾 Committing version bump...${NC}"
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): bump version to ${NEW_VERSION}

${RELEASE_MSG}"

# Create git tag
echo -e "${BLUE}🏷️  Creating git tag v${NEW_VERSION}...${NC}"
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}

${RELEASE_MSG}"

echo ""
echo -e "${GREEN}✅ Version bump complete!${NC}"
echo ""
echo -e "${PURPLE}📋 Next steps:${NC}"
echo -e "   1. Review the changes: ${BLUE}git show${NC}"
echo -e "   2. Push to GitHub: ${BLUE}git push origin ${CURRENT_BRANCH} --follow-tags${NC}"
echo -e "   3. Create GitHub release: ${BLUE}https://github.com/Konetic-AI/tdd-builder-mpkf/releases/new?tag=v${NEW_VERSION}${NC}"
echo -e "   4. Use release template: ${BLUE}.github/release-template.md${NC}"
echo ""
echo -e "${YELLOW}🚀 Quick push command:${NC}"
echo -e "   ${BLUE}git push origin ${CURRENT_BRANCH} --follow-tags${NC}"
echo ""
echo -e "${GREEN}✨ Release v${NEW_VERSION} ready!${NC}"

