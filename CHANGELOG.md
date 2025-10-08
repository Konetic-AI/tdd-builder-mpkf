# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Schema-driven onboarding system with adaptive questionnaire flow
- `SCHEMA_DRIVEN_ONBOARDING_GUIDE.md` - Comprehensive architecture documentation
- `QUICK_START_SCHEMA_ONBOARDING.md` - Fast-track developer onboarding guide
- `SCHEMA_ONBOARDING_SETUP.md` - Setup and configuration instructions
- `scripts/fast-sync.sh` - One-command commit→push→CI→Replit workflow
- Tag Router system for intelligent question routing based on schemas
- Rules Engine for conditional logic in onboarding flows
- Feature Flags system for toggling experimental features
- Validation system with ISO-8601 date support and answer validation
- Review Screen for previewing answers before TDD generation
- Complexity Matrix for multi-level project support (Simple, Startup, Enterprise, MCP)
- Industry-specific templates (eCommerce, FinTech, Healthcare, SaaS)
- TypeScript-based core library modules in `src/lib/`
- Comprehensive test coverage with Jest and E2E tests
- Inline help system with contextual guidance
- `CLI_GUIDE.md` - Enhanced CLI documentation

### Changed
- Enhanced README with Fast Sync workflow documentation
- Updated CONTEXT.md with new architecture details
- Improved CI/CD pipeline with pre-push validation hooks
- Enhanced GitHub Actions workflow for automated testing

### Documentation
- Added 16 new documentation files covering all major features
- Created `examples/` directory with demo scripts and validation guides
- Added `IMPLEMENTATION_SUMMARY.md` for tracking feature rollout
- Created feature-specific implementation reports:
  - `FEATURE_FLAG_IMPLEMENTATION.md`
  - `INLINE_HELP_SUMMARY.md`
  - `REVIEW_SCREEN_IMPLEMENTATION.md`
  - `TAG_ROUTER_FINAL_REPORT.md`
  - `VALIDATION_IMPLEMENTATION_SUMMARY.md`
  - `COMPLEXITY_MATRIX_IMPLEMENTATION.md`
  - `INDUSTRY_TEMPLATES_SUMMARY.md`

### Fixed
- Improved error handling in validation flows
- Enhanced date validation with comprehensive ISO-8601 support
- Better type safety with TypeScript integration

## [1.0.0] - 2024-10-08

### Added
- Initial release of TDD Builder MPKF
- Core TDD generation engine with template system
- MPKF compliance validation
- Micro Builds Guide generation
- PDF export functionality with Puppeteer
- Audit report generation (compliance & completeness)
- Interactive CLI with guided questionnaire
- File-based batch processing
- Template caching system (5-minute TTL)
- Comprehensive test suite across all complexity levels
- Support for Simple, Startup, Enterprise, and MCP-specific projects
- ISO-8601 date validation system
- Retry logic for incomplete data (up to 3 attempts)
- Browser-based PDF generation with professional styling
- GitHub → Cursor → Replit sync workflow

### Documentation
- README.md with comprehensive usage guide
- CONTEXT.md with architecture documentation
- Test fixtures for all complexity levels
- Sample JSON files for each project type

### Security
- Input sanitization to prevent injection attacks
- Field length limits (10,000 chars)
- No external API dependencies
- Sandboxed PDF generation

---

## Release Notes Format

Each release should include:
- **Version number** following semver (MAJOR.MINOR.PATCH)
- **Release date** in YYYY-MM-DD format
- **Categories**: Added, Changed, Deprecated, Removed, Fixed, Security
- **Links** to relevant PRs, issues, and commits

## Contributing to Changelog

When adding entries:
1. Add new changes under `[Unreleased]` section
2. Use present tense ("Add feature" not "Added feature")
3. Group by category (Added, Changed, Fixed, etc.)
4. Link to relevant issues/PRs when applicable
5. Keep descriptions concise but informative

## Version Bump Checklist

Before releasing a new version:
- [ ] Update version in `package.json`
- [ ] Move `[Unreleased]` items to new version section
- [ ] Add release date
- [ ] Create Git tag with version number
- [ ] Generate GitHub release with notes
- [ ] Run full test suite
- [ ] Update documentation if needed
- [ ] Push changes and tags to GitHub

---

[Unreleased]: https://github.com/Konetic-AI/tdd-builder-mpkf/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Konetic-AI/tdd-builder-mpkf/releases/tag/v1.0.0

