# TDD Builder Context Documentation

## Overview

The TDD Builder is a Node.js command-line application that generates Technical Design Documents (TDDs) following the Master Project Knowledge File (MPKF) framework. It's designed to standardize and automate the creation of enterprise-grade technical documentation.

## Architecture

### Core Components

1. **Handler Layer** (`/handlers/`)
   - `generate_tdd.js`: Main business logic for TDD generation
   - Implements MPKF validation, template population, and self-auditing
   - Manages complexity levels and generates compliance reports
   - Features template caching (5-minute TTL) for performance optimization
   - Includes comprehensive input validation with ISO-8601 date support
   - Exports utility functions: `isValidIso8601Date`, `validateProjectData`, `clearTemplateCache`

2. **Template System** (`/templates/`)
   - `tdd_v5.0.md`: Official MPKF-compliant template with variable placeholders
   - Uses `{{variable}}` syntax for dynamic content injection
   - Supports 9 stages of technical documentation

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
User Input → CLI → Enhanced Validation → Template Population (Cached) → Audit Reports → Output
↓                    ↓                    ↓                    ↓
Missing Fields?    ISO-8601 Dates    MPKF Requirements    PDF Export (if --pdf flag)
↓                    ↓                    ↑                    ↓
Ad-hoc Questions    Error Messages    Complexity Level    PDF Generation
↓                    ↓                    ↓                    ↓
Retry Logic        Type Checking    Startup/MCP Support    Fallback Text Export

## Key Concepts

### Complexity Levels

- **Simple**: Minimal documentation for POCs (4 fields)
- **Startup**: MVP-focused documentation for early-stage products (26 fields)
- **Enterprise**: Full documentation for production systems (48+ fields)
- **MCP-Specific**: AI/LLM tool documentation with MCP protocol compliance (51+ fields)

### MPKF Compliance

The tool enforces compliance with:
- Pre-TDD Client Questionnaire v2.0
- Universal Enterprise-Grade TDD Template v5.0
- Adaptive Complexity Model
- Self-audit requirements

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

## Syncing (Replit ↔ Local ↔ GitHub)

Developers can use the `git sync` command to safely commit, pull, and push changes in one step:

```bash
git sync
```

This Git alias is defined once as:
```bash
git config --global alias.sync '!git add -A && git commit -m "wip(sync)" || true && git pull --rebase origin main && git push origin main'
```

The `git sync` workflow ensures Replit, Cursor, VS Code, and GitHub all stay in sync by:
- Adding all changes (`git add -A`)
- Creating a work-in-progress commit (`wip(sync)`) or continuing if no changes
- Pulling latest changes with rebase (`git pull --rebase origin main`)
- Pushing local changes (`git push origin main`)

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