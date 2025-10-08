# 🤖 Automation Guide

Complete guide to using the automated workflows and release management tools in the TDD Builder MPKF project.

## 📋 Table of Contents

- [Fast Sync Workflow](#fast-sync-workflow)
- [Version Bump & Release](#version-bump--release)
- [Pull Request Automation](#pull-request-automation)
- [Changelog Management](#changelog-management)
- [Best Practices](#best-practices)

---

## 🚀 Fast Sync Workflow

### Overview
The Fast Sync script (`scripts/fast-sync.sh`) provides a one-command workflow for committing, pushing, and syncing across all development environments.

### Usage

```bash
# Basic usage with default message
./scripts/fast-sync.sh

# With custom commit message
./scripts/fast-sync.sh "feat: add new validation feature"
```

### What It Does

1. ✅ **Stages all changes** - `git add -A`
2. 💾 **Commits changes** - With your custom message or default
3. 🧪 **Runs pre-push tests** - Ensures all tests pass
4. 🔼 **Pushes to GitHub** - Automatically detects and sets upstream
5. 🔗 **Prints CI links** - Direct links to GitHub Actions and commit
6. 🔄 **Syncs Replit** - Triggers Replit sync if configured

### Output

```bash
🚀 Starting fast sync...
📍 Current branch: main
📦 Staging all changes...
💾 Committing changes...
✅ All tests passed!
🔼 Pushing to origin/main...
✅ Successfully pushed to origin/main

🔗 GitHub Links:
   Commit: https://github.com/Konetic-AI/tdd-builder-mpkf/commit/abc123
   Actions: https://github.com/Konetic-AI/tdd-builder-mpkf/actions
   Branch: https://github.com/Konetic-AI/tdd-builder-mpkf/tree/main

✨ Fast sync complete!
```

---

## 📦 Version Bump & Release

### Overview
The version bump script (`scripts/version-bump.sh`) automates the release process with semantic versioning.

### Usage

```bash
# Patch release (1.0.0 → 1.0.1)
./scripts/version-bump.sh patch "Bug fixes and minor improvements"

# Minor release (1.0.0 → 1.1.0)
./scripts/version-bump.sh minor "New features added"

# Major release (1.0.0 → 2.0.0)
./scripts/version-bump.sh major "Breaking changes introduced"
```

### What It Does

1. 🔍 **Validates environment** - Checks for uncommitted changes
2. 📦 **Bumps version** - Updates `package.json` and `package-lock.json`
3. 📝 **Updates CHANGELOG** - Moves unreleased items to new version section
4. 🧪 **Runs tests** - Ensures everything passes before release
5. 💾 **Commits changes** - With release commit message
6. 🏷️ **Creates Git tag** - Tags the release (e.g., `v1.1.0`)
7. 📋 **Prints next steps** - Guides you through publishing

### Example Output

```bash
🎯 TDD Builder MPKF - Version Bump Script

📦 Current version: 1.0.0
✨ New version: 1.1.0

🔄 Updating version...
✅ Updated CHANGELOG.md
🧪 Running test suite...
✅ All tests passed
💾 Committing version bump...
🏷️ Creating git tag v1.1.0...

✅ Version bump complete!

📋 Next steps:
   1. Review the changes: git show
   2. Push to GitHub: git push origin main --follow-tags
   3. Create GitHub release: https://github.com/Konetic-AI/tdd-builder-mpkf/releases/new?tag=v1.1.0
   4. Use release template: .github/release-template.md
```

### Publishing a Release

After running the version bump:

1. **Push tags to GitHub:**
   ```bash
   git push origin main --follow-tags
   ```

2. **Create GitHub Release:**
   - Go to: https://github.com/Konetic-AI/tdd-builder-mpkf/releases/new
   - Select the new tag (e.g., `v1.1.0`)
   - Copy content from `.github/release-template.md`
   - Fill in the placeholders with actual metrics
   - Publish release

3. **Verify CI/CD:**
   - Check: https://github.com/Konetic-AI/tdd-builder-mpkf/actions
   - Ensure all workflows pass

---

## 🔄 Pull Request Automation

### Overview
The PR automation workflow (`.github/workflows/pr-automation.yml`) automatically enhances pull requests with useful information.

### Features

#### 1. **Auto-labeling**
Automatically adds labels based on changed files:
- `documentation` - For `.md` files
- `typescript` - For `.ts` files
- `javascript` - For `.js` files
- `tests` - For test files
- `ci` - For workflow changes
- `dependencies` - For `package.json` changes

#### 2. **Size Labeling**
Automatically calculates and labels PR size:
- `size/XS` - < 50 lines changed
- `size/S` - 50-200 lines
- `size/M` - 200-500 lines
- `size/L` - 500-1000 lines
- `size/XL` - > 1000 lines

#### 3. **Auto-generated Checklist**
Adds a comprehensive checklist to every new PR:

```markdown
## 🔍 Pre-merge Checklist

- [ ] All tests pass locally and in CI
- [ ] Documentation updated (if needed)
- [ ] CHANGELOG.md updated with changes
- [ ] No breaking changes (or documented if present)
- [ ] Backward compatibility maintained
- [ ] Security considerations reviewed
- [ ] Performance impact assessed

## 🧪 Testing

- [ ] Unit tests added/updated
- [ ] E2E tests pass
- [ ] Manual testing completed
- [ ] All complexity levels validated (if applicable)
```

#### 4. **PR Metrics**
Automatically comments with:
- Files changed count
- Commit count
- Line change statistics
- Breaking change warnings
- Useful links (CI, CHANGELOG, Contributing)

### Usage

Simply create a PR - the automation runs automatically! No configuration needed.

---

## 📝 Changelog Management

### Overview
The `CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/) format with semantic versioning.

### Structure

```markdown
## [Unreleased]

### Added
- New features go here

### Changed
- Modifications to existing features

### Fixed
- Bug fixes

### Deprecated
- Features marked for removal

### Removed
- Features that were removed

### Security
- Security-related changes
```

### Best Practices

1. **Always add to `[Unreleased]`:**
   ```markdown
   ## [Unreleased]

   ### Added
   - New validation system for ISO-8601 dates
   ```

2. **Use present tense:**
   - ✅ "Add feature" 
   - ❌ "Added feature"

3. **Be specific:**
   - ✅ "Add ISO-8601 date validation with timezone support"
   - ❌ "Improve validation"

4. **Link to issues/PRs when relevant:**
   ```markdown
   ### Fixed
   - Fix date validation edge case (#123)
   ```

5. **Group related changes:**
   ```markdown
   ### Added
   - New validation system
   - Validation error messages
   - Validation test suite
   ```

### Version Release Process

When using `version-bump.sh`, the script automatically:
1. Moves `[Unreleased]` items to new version section
2. Adds release date
3. Updates comparison links at bottom
4. Creates new empty `[Unreleased]` section

---

## 🎯 Best Practices

### Daily Development Workflow

1. **Make changes** to your code
2. **Add to CHANGELOG** under `[Unreleased]`
3. **Run tests** locally: `npm test`
4. **Fast sync** when ready:
   ```bash
   ./scripts/fast-sync.sh "feat: add new feature"
   ```

### Feature Branch Workflow

1. **Create feature branch:**
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make changes and test**

3. **Fast sync to push:**
   ```bash
   ./scripts/fast-sync.sh "feat: implement my new feature"
   ```

4. **Create PR on GitHub**
   - Auto-labeling will activate
   - Checklist will be added
   - Size label applied

5. **Address review feedback**

6. **Merge when approved**

### Release Workflow

1. **Update CHANGELOG** - Ensure all changes are documented

2. **Run version bump:**
   ```bash
   # For features (1.0.0 → 1.1.0)
   ./scripts/version-bump.sh minor "New feature release"
   
   # For bug fixes (1.1.0 → 1.1.1)
   ./scripts/version-bump.sh patch "Bug fixes"
   
   # For breaking changes (1.1.1 → 2.0.0)
   ./scripts/version-bump.sh major "Major overhaul with breaking changes"
   ```

3. **Push with tags:**
   ```bash
   git push origin main --follow-tags
   ```

4. **Create GitHub Release:**
   - Use template from `.github/release-template.md`
   - Fill in metrics and details
   - Attach any necessary files

5. **Announce release** (if applicable)

### Commit Message Conventions

Follow conventional commits for better automation:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `test:` - Test updates
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `ci:` - CI/CD changes
- `build:` - Build system changes

**Examples:**
```bash
feat: add ISO-8601 date validation
fix: resolve date parsing edge case
docs: update API documentation
chore: update dependencies
test: add E2E tests for validation flow
```

---

## 🔍 Troubleshooting

### Fast Sync Issues

**Problem:** Script fails with "No changes to commit"
```bash
Solution: This is normal if no files changed. Sync complete!
```

**Problem:** Tests fail during pre-push
```bash
Solution: Fix failing tests before pushing:
1. Run: npm test
2. Fix issues
3. Try fast-sync again
```

**Problem:** Replit sync fails
```bash
Solution: Check if Replit configuration exists:
- Verify: replit-sync script in package.json
- Check: scripts/replit-sync.sh exists and is executable
```

### Version Bump Issues

**Problem:** "You have uncommitted changes"
```bash
Solution: The script will offer to commit them, or:
git add -A && git commit -m "prepare for release"
```

**Problem:** Tests fail during version bump
```bash
Solution: Version bump automatically reverts on test failure:
1. Fix failing tests
2. Run version-bump again
```

**Problem:** Already tagged version
```bash
Solution: Delete the tag first:
git tag -d v1.1.0
git push origin :refs/tags/v1.1.0
```

### PR Automation Issues

**Problem:** Labels not applied
```bash
Solution: Check .github/labeler.yml configuration
- Ensure file patterns match your changes
- GitHub Actions may need permissions
```

**Problem:** Workflow not triggering
```bash
Solution: Verify workflow file:
- Check: .github/workflows/pr-automation.yml exists
- Ensure: GitHub Actions enabled in repo settings
```

---

## 📚 Additional Resources

- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Git Tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging)

---

## 🤝 Contributing

When contributing to automation scripts:

1. Test thoroughly in a safe branch
2. Update this guide with new features
3. Add examples of usage
4. Document any new configuration options
5. Update CHANGELOG.md

---

## 📞 Support

For issues or questions about automation:
- Open an issue: [GitHub Issues](https://github.com/Konetic-AI/tdd-builder-mpkf/issues)
- Check existing docs in `/docs` directory
- Review CONTEXT.md for architecture details

---

**Last Updated:** 2024-10-08
**Version:** 1.0.0

