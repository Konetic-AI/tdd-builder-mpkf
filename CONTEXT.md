Create `/context.md`:
```markdown
# TDD Builder Context Documentation

## Overview

The TDD Builder is a Node.js command-line application that generates Technical Design Documents (TDDs) following the Master Project Knowledge File (MPKF) framework. It's designed to standardize and automate the creation of enterprise-grade technical documentation.

## Architecture

### Core Components

1. **Handler Layer** (`/handlers/`)
   - `generate_tdd.js`: Main business logic for TDD generation
   - Implements MPKF validation, template population, and self-auditing
   - Manages complexity levels and generates compliance reports

2. **Template System** (`/templates/`)
   - `tdd_v5.0.md`: Official MPKF-compliant template with variable placeholders
   - Uses `{{variable}}` syntax for dynamic content injection
   - Supports 9 stages of technical documentation

3. **Test Infrastructure** (`/tests/`)
   - Sample JSON files for each complexity level
   - Unit tests for audit report generation
   - Comprehensive test runner with color-coded output

4. **Utilities** (`/utils/`)
   - `pdfExporter.js`: PDF export functionality using Puppeteer for headless PDF generation
   - Includes batch export capabilities and fallback to text export

5. **CLI Interface** (`cli.js`)
   - Interactive mode with guided questionnaire
   - File-based mode for batch processing
   - PDF export functionality with `--pdf` flag
   - Retry logic for incomplete data

## Data Flow
User Input → CLI → Validation → Template Population → Audit Reports → Output
↓                    ↓                    ↓
Missing Fields?    MPKF Requirements    PDF Export (if --pdf flag)
↓                    ↑                    ↓
Ad-hoc Questions    Complexity Level    PDF Generation

## Key Concepts

### Complexity Levels

- **Simple**: Minimal documentation for POCs (4 fields)
- **Startup**: Lean documentation for MVPs (8 fields)
- **Enterprise**: Full documentation for production (45+ fields)
- **MCP-Specific**: AI/LLM tool documentation (48+ fields)

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
npm install              # Install dependencies (Puppeteer for PDF export)
```

### Development
```bash
node cli.js              # Run interactive mode
node cli.js -f <file>    # Run with input file
node cli.js --pdf        # Run interactive mode with PDF export
node cli.js -f <file> --pdf  # Run with input file and PDF export
```

### Testing
```bash
npm test                 # Run all tests
npm run test:simple      # Test simple complexity
npm run test:startup     # Test startup complexity
npm run test:enterprise  # Test enterprise complexity
npm run test:mcp         # Test MCP complexity
npm run test:audit       # Test audit reports
npm run test:pdf         # Test PDF export functionality
```

### Debugging
```bash
DEBUG=* node cli.js      # Run with debug output
node test_runner.js      # Run tests directly
```
File Organization
Root Files:
- cli.js: Entry point for interactive use
- test_runner.js: Main test orchestrator
- package.json: Project metadata and scripts
- README.md: User documentation
- context.md: This file (developer context)

Core Modules:
- handlers/generate_tdd.js: TDD generation logic
- templates/tdd_v5.0.md: Document template
- utils/pdfExporter.js: Export utilities

Test Data:
- tests/sample_*.json: Test fixtures for each complexity
- tests/test_generateAuditReports.js: Unit tests

Output:
- output/: Generated TDD markdown files
- exports/: Exported text files
## Environment Requirements

- Node.js >= 18.0.0
- Puppeteer for PDF export functionality
- Works in Replit, local development, and CI/CD environments
- PDF export requires headless browser support (included with Puppeteer)

## Error Handling
The application implements comprehensive error handling:

- Input validation with detailed error messages
- Graceful fallbacks for missing templates
- Retry logic for incomplete data
- PDF export fallback to text format if Puppeteer fails
- Detailed stack traces in debug mode

## Performance Optimizations

- Template caching (5-minute TTL)
- Puppeteer browser instance reuse for PDF generation
- Efficient regex-based template population
- Streaming file operations for large documents
- Headless browser optimization for CI/CD environments

## Security Considerations

- Input sanitization to prevent script injection
- Field length limits (10,000 chars)
- No external API calls
- No sensitive data storage
- Read-only template access
- Sandboxed PDF generation with restricted browser permissions