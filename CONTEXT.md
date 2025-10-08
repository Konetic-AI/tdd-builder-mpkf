# TDD Builder Context Documentation

## Overview

The TDD Builder is a Node.js command-line application that generates Technical Design Documents (TDDs) following the Master Project Knowledge File (MPKF) framework. It's designed to standardize and automate the creation of enterprise-grade technical documentation.

## Architecture

### Core Components

1. **Handler Layer** (`/handlers/`)
   - `generate_tdd.js`: Main business logic for TDD generation
   - Implements MPKF validation, template population, and self-auditing
   - Manages complexity levels and generates compliance reports
   - Generates Micro Builds Guide for iterative development workflow
   - Features template caching (5-minute TTL) for performance optimization
   - Includes comprehensive input validation with ISO-8601 date support
   - Exports utility functions: `isValidIso8601Date`, `validateProjectData`, `clearTemplateCache`

2. **Template System** (`/templates/`)
   - `tdd_v5.0.md`: Official MPKF-compliant template with variable placeholders
   - Uses `{{variable}}` syntax for dynamic content injection
   - Supports 9 stages of technical documentation plus Micro Builds Guide section

3. **Test Infrastructure** (`/tests/`)
   - Sample JSON files for each complexity level including `sample_startup.json`
   - Jest-based unit tests for audit report generation
   - PDF export test suite with Puppeteer mocking
   - Comprehensive test runner with color-coded output
   - Individual test scripts for each complexity level

4. **Utilities** (`/utils/`)
   - `pdfExporter.js`: PDF export functionality using Puppeteer for headless PDF generation
   - Includes batch export capabilities and fallback to formatted text export
   - Browser instance reuse for improved performance
   - Sandboxed PDF generation with restricted permissions
   - Professional styling with headers, footers, and proper typography

5. **CLI Interface** (`cli.js`)
   - Interactive mode with guided questionnaire for all complexity levels
   - File-based mode for batch processing
   - PDF export functionality with `--pdf` flag
   - Retry logic for incomplete data (up to 3 retries)
   - Enhanced error handling with detailed validation messages
   - Startup-specific prompts for MVP-focused projects
   - Comprehensive help system with usage examples

6. **Validation System** (`/src/validation/`)
   - `date.js`: ISO-8601 date validation utilities
   - `date.test.js`: Comprehensive test suite for date validation (45+ test cases)
   - Support for all ISO-8601 formats including leap years and timezones
   - Integration with project data validation
   - Detailed error messages for validation failures
   - Bulk validation capabilities for multiple date fields

## Data Flow
User Input → CLI → Enhanced Validation → Template Population (Cached) → Micro Builds Guide → Audit Reports → Output
↓                    ↓                    ↓                    ↓                    ↓
Missing Fields?    ISO-8601 Dates    MPKF Requirements    Component Analysis    PDF Export (if --pdf flag)
↓                    ↓                    ↑                    ↓                    ↓
Ad-hoc Questions    Error Messages    Complexity Level    Categorization    PDF Generation
↓                    ↓                    ↓                    ↓                    ↓
Retry Logic        Type Checking    Startup/MCP Support    Workflow Guide    Fallback Text Export

## Architecture / Outputs

### Micro Builds Guide
The TDD builder appends the Micro Builds Guide after compliance/completeness reports. This standardized section provides:

- **A 4-row table** with fixed categories:
  - Core Modules (Authentication, Dashboard, Billing)
  - User Workflows (Onboarding, Data Import, Report Gen.)
  - Shared Components (Notifications, Search, File Upload)
  - System Services (API Layer, Integrations, Logging)

- **A fixed 10-step workflow** for breaking large builds into atomic tasks:
  1. Brainstorm & Scope - Draft concise PRD/README with features, stack, milestones
  2. One-Shot MVP Framework - Scaffold repo (e.g., Next.js, Supabase) in Replit
  3. Break Down into Categories - Use the table above to split the TDD into micro builds
  4. Plan Mode per Feature - New chat per feature (auth, workflow, service). Outline 3–5 micro steps
  5. Implement in Isolation - 20–30 min coding loops per micro build
  6. Test & Review - Unit/integration tests per micro build. Use AI for code reviews
  7. Commit & Integrate - Version-control each micro build with clear commit messages
  8. Iterate with Feedback - After each feature, run end-to-end tests and refine docs
  9. Scale to Full Build - Repeat until all categories are covered
  10. Stage Deployments - Release core modules first, then workflows, components, and services

This approach ensures modular progress, faster feedback loops, and a scalable TDD-to-build workflow.

### Dynamic Module Breakdown Enhancement

The TDD Builder now supports an optional `modules` array in JSON input files. When provided, these modules are rendered under the *Micro Builds Guide* section with:

- **Custom module categorization** based on user-defined modules
- **Integration with standard workflow** - modules are mapped to the 4-row table categories
- **Enhanced project planning** for complex systems with specific module requirements
- **Flexible architecture support** for microservices, monoliths, and hybrid approaches

Example JSON structure:
```json
{
  "projectName": "My Project",
  "modules": [
    "Authentication Service",
    "User Dashboard",
    "Payment Gateway",
    "Notification System"
  ],
  // ... other fields
}
```

This enhancement allows teams to define their specific module architecture while maintaining MPKF compliance and the standardized workflow approach.

### Micro Builds Guide Output
After compliance and completeness checks, the builder appends a standardized **Micro Builds Guide** to each TDD. This output is non-code but fundamental for planning and vibe coding workflows. The guide includes:

- **A 4-row table** with fixed categories:
  - Core Modules (Authentication, Dashboard, Billing)
  - User Workflows (Onboarding, Data Import, Report Gen.)
  - Shared Components (Notifications, Search, File Upload)
  - System Services (API Layer, Integrations, Logging)

- **A fixed 10-step workflow** guiding iterative, AI-assisted development:
  1. Brainstorm & Scope - Draft concise PRD/README with features, stack, milestones
  2. One-Shot MVP Framework - Scaffold repo (e.g., Next.js, Supabase) in Replit
  3. Break Down into Categories - Use the table above to split the TDD into micro builds
  4. Plan Mode per Feature - New chat per feature (auth, workflow, service). Outline 3–5 micro steps
  5. Implement in Isolation - 20–30 min coding loops per micro build
  6. Test & Review - Unit/integration tests per micro build. Use AI for code reviews
  7. Commit & Integrate - Version-control each micro build with clear commit messages
  8. Iterate with Feedback - After each feature, run end-to-end tests and refine docs
  9. Scale to Full Build - Repeat until all categories are covered
  10. Stage Deployments - Release core modules first, then workflows, components, and services

The test runner should verify the presence of the Micro Builds Guide in generated outputs.

## Key Concepts

### Complexity Levels

- **Simple**: Minimal documentation for POCs (4 fields)
- **Startup**: MVP-focused documentation for early-stage products (26 fields)
- **Enterprise**: Full documentation for production systems (48+ fields)
- **MCP-Specific**: AI/LLM tool documentation with MCP protocol compliance (51+ fields)

### MPKF Compliance

**Every generated TDD includes Micro Builds Guide, Compliance Report, and Completeness Report.**

The tool enforces compliance with:
- Pre-TDD Client Questionnaire v2.0
- Universal Enterprise-Grade TDD Template v5.0
- Adaptive Complexity Model
- Self-audit requirements
- **Dynamic Module Breakdown** for enhanced project planning

### Validation Process

1. Check required fields based on complexity
2. Generate questions for missing data
3. Block generation until complete
4. Validate ISO date formats
5. Sanitize input to prevent injection

## Development Commands

### Setup
```bash
npm install              # Install dependencies (Puppeteer for PDF export, Jest for testing)
```

### Development
```bash
node cli.js              # Run interactive mode
npm run generate         # Alternative alias for interactive mode
node cli.js -f <file>    # Run with input file
node cli.js --pdf        # Run interactive mode with PDF export
node cli.js -f <file> --pdf  # Run with input file and PDF export
node cli.js --help       # Show comprehensive help
```

### Testing
```bash
npm test                 # Run all tests
npm run test:simple      # Test simple complexity
npm run test:startup     # Test startup complexity (26 fields)
npm run test:enterprise  # Test enterprise complexity
npm run test:mcp         # Test MCP complexity
npm run test:audit       # Test audit reports
npm run test:pdf         # Test PDF export functionality
npm run test:jest        # Run Jest test suite
npm run test:unit        # Run unit tests
```

### Debugging
```bash
DEBUG=* node cli.js      # Run with debug output
node test_runner.js      # Run tests directly
npm run test:jest -- --verbose  # Run Jest with verbose output
```

## GitHub → Cursor → Replit Sync Workflow

### One-command Sync (recommended)

Set up a global Git alias for seamless synchronization across development environments:

```bash
git config --global alias.sync '!git add -A && git commit -m "wip(sync)" || true && git pull --rebase origin main && git push origin main'
```

After setting up the alias, simply run in any terminal (Replit shell, Cursor terminal, or VS Code terminal):

```bash
git sync
```

This command performs the following steps automatically:

1. **Stage all changes** - Adds all modified, new, and deleted files to staging
2. **Commit with `wip(sync)`** - Creates a work-in-progress commit if there are changes
3. **Pull with rebase** - Fetches and rebases your local branch with the remote main branch
4. **Push to GitHub** - Pushes your synchronized changes to the remote repository

✅ **Note**: This workflow keeps Replit, Cursor, and VS Code environments perfectly synchronized.

## File Organization
Root Files:
- cli.js: Entry point for interactive use with enhanced error handling
- test_runner.js: Main test orchestrator
- package.json: Project metadata and scripts including Jest integration
- README.md: User documentation
- CONTEXT.md: This file (developer context)

Core Modules:
- handlers/generate_tdd.js: TDD generation logic with caching and validation
- templates/tdd_v5.0.md: Document template
- utils/pdfExporter.js: Export utilities with Puppeteer integration
- src/validation/date.js: ISO-8601 date validation system
- src/validation/date.test.js: Comprehensive date validation tests

Test Data:
- tests/sample_*.json: Test fixtures for each complexity including startup
- tests/pdf_export.test.js: PDF export test suite with Jest mocking
- tests/test_generateAuditReports.js: Unit tests
- src/validation/date.test.js: Date validation test suite

Output:
- output/: Generated TDD markdown files and PDF exports
- exports/: Exported text files

Documentation:
- docs/REFACTORING_SUMMARY.md: Comprehensive refactoring documentation
- docs/DATE_VALIDATION_IMPLEMENTATION.md: Date validation implementation details
## Environment Requirements

- Node.js >= 18.0.0
- Puppeteer for PDF export functionality
- Jest for comprehensive testing
- Works in Replit, local development, and CI/CD environments
- PDF export requires headless browser support (included with Puppeteer)
- Template caching requires file system access

## Error Handling
The application implements comprehensive error handling:

- **Input validation** with detailed error messages and type checking
- **ISO-8601 date validation** with specific format error reporting
- **Graceful fallbacks** for missing templates and failed PDF generation
- **Retry logic** for incomplete data (up to 3 attempts with guided questions)
- **PDF export fallback** to formatted text export if Puppeteer fails
- **Detailed stack traces** in debug mode
- **Validation error aggregation** for multiple field validation failures

## Performance Optimizations

- **Template caching** with 5-minute TTL (11ms → 0ms improvement)
- **Puppeteer browser instance reuse** for PDF generation
- **Efficient regex-based template population** with optimized patterns
- **Streaming file operations** for large documents
- **Headless browser optimization** for CI/CD environments
- **Memory-efficient validation** with early termination on errors
- **Cache management utilities** for manual cache control

## Verification Checklist

Mirror the CI pipeline steps for local validation:

### 1. Test Suite
```bash
npm test
```
- ✅ All Jest unit tests pass
- ✅ Custom test runner validates all complexity levels
- ✅ PDF export tests pass
- ✅ Date validation tests pass (45+ test cases)

### 2. Build Validation
```bash
npm run build:all
```
- ✅ Simple complexity TDD generated
- ✅ Startup complexity TDD generated
- ✅ Enterprise complexity TDD generated
- ✅ MCP-specific complexity TDD generated

### 3. Microbuild Validation
```bash
npm run validate:microbuild
```
- ✅ Micro Builds Guide present in all outputs
- ✅ 4-row categorization table included
- ✅ 10-step workflow documented
- ✅ Custom modules properly integrated (if provided)

### 4. Variable Validation
```bash
npm run validate:variables
```
- ✅ No orphan variables in templates
- ✅ All required fields populated
- ✅ ISO-8601 date validation passes
- ✅ Input sanitization successful

### 5. Artifact Generation
- ✅ `output/` directory contains markdown files
- ✅ `exports/` directory contains text exports
- ✅ PDF generation works (if Puppeteer available)
- ✅ All files properly formatted and complete

This checklist ensures local development matches CI/CD pipeline validation.

## Security Considerations

- **Input sanitization** to prevent script injection
- **Field length limits** (10,000 chars) with validation
- **ISO-8601 date validation** to prevent malformed input
- **No external API calls** - fully self-contained
- **No sensitive data storage** - all processing in memory
- **Read-only template access** with caching protection
- **Sandboxed PDF generation** with restricted browser permissions
- **Type validation** to prevent unexpected data types
- **Error message sanitization** to prevent information leakage

## Workflow Integration

Hybrid builds leverage **Claude 4.5 (Sonnet)** for high-context reasoning and **Cursor (GPT-5)** for execution and automation.  
See [docs/AI_Hybrid_Workflow.md](docs/AI_Hybrid_Workflow.md) for the full integration guide.

## CI Troubleshooting

### Environment Variables

#### `EXPORT_PATH` (default: `./exports`)
- Configurable directory for PDF and text exports
- System creates directory if it doesn't exist
- Must be writable; CI uses `./exports` for consistency

#### `SCHEMA_DRIVEN_ONBOARDING` (default: `false`)
- Enables schema-driven questionnaire mode
- When `true`: TypeScript must be built first (`npm run build`)
- CI tests both `true` and `false` modes for compatibility

### Optional Dependencies

#### Puppeteer (PDF Generation)
- Optional: Falls back to text export if unavailable
- Warning logged on fallback (not an error)
- Tests pass regardless of installation status

### Codecov Integration
- Requires `CODECOV_TOKEN` secret in repository settings
- Step continues without failing if token absent
- Add token at: GitHub repo → Settings → Secrets → Actions

### Date Validation (Luxon)
- Uses `luxon` for robust ISO-8601 parsing
- Supports positive/negative timezone offsets (`±HH:mm`)
- Validates both format and logical correctness

### Common Failures

**"Cannot find module 'dist/src/lib/...'"**
- Cause: TypeScript not compiled with `SCHEMA_DRIVEN_ONBOARDING=true`
- Fix: Run `npm run build` before tests

**"ENOENT" or "EACCES" errors**
- Cause: Missing or protected directories
- Fix: Use `EXPORT_PATH`, `os.tmpdir()`, and `mkdir -p`

**"Invalid complexity level"**
- Cause: Using deprecated values (`simple`, `startup`, `mcp-specific`)
- Fix: Use new levels (`base`, `minimal`, `standard`, `comprehensive`, `enterprise`) or CLI legacy mapping

See [README.md#ci-troubleshooting](README.md#ci-troubleshooting) for detailed solutions.