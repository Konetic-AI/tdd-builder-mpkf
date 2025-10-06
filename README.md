# TDD Builder MPKF

[![CI](https://github.com/Konetic-AI/tdd-builder-mpkf/actions/workflows/ci.yml/badge.svg)](https://github.com/Konetic-AI/tdd-builder-mpkf/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](package.json)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)](package.json)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](test_runner.js)

A powerful Node.js command-line tool that generates enterprise-grade Technical Design Documents (TDDs) compliant with the Master Project Knowledge File (MPKF) framework.

## 🚀 Features

- **MPKF-Compliant**: Generates TDDs following the official Universal Enterprise-Grade TDD Template v5.0
- **Adaptive Complexity**: Supports four complexity levels:
  - `simple` - For POCs and internal tools (4 required fields)
  - `startup` - For MVP-focused, early-stage products (26 required fields)  
  - `enterprise` - For production systems (48+ required fields)
  - `mcp-specific` - For AI/LLM tools using Model Context Protocol (51+ required fields)
- **Pre-TDD Validation**: Validates input data and generates targeted questions for missing information
- **Self-Auditing**: Automatically appends Gap Analysis, Compliance, and Completeness reports
- **Micro Builds Guide**: Every generated TDD includes a standardized breakdown into atomic micro builds, with categories (Core Modules, User Workflows, Shared Components, System Services) and a 10-step workflow for vibe coding success
- **Smart Caching**: Template caching with 5-minute TTL for improved performance (11ms → 0ms)
- **ISO-8601 Date Validation**: Comprehensive date validation supporting all ISO-8601 formats with leap year and timezone support
- **Enhanced Validation**: Robust input validation with detailed error messages and type checking
- **Export Capabilities**: Export TDDs as formatted text files or PDF documents
- **PDF Export**: Generate professional PDF documents with proper formatting, styling, and fallback to text export
- **Interactive CLI**: User-friendly command-line interface with retry logic, enhanced error handling, and both interactive and file-based modes

## 📁 Project Structure
tdd-builder-mpkf/
├── handlers/              # Core business logic
│   └── generate_tdd.js   # Main TDD generation handler
├── templates/            # Document templates
│   └── tdd_v5.0.md      # Official MPKF TDD template
├── tests/               # Test files and sample data
│   ├── sample_simple.json
│   ├── sample_startup.json
│   ├── sample_enterprise.json
│   ├── sample_mcp-specific.json
│   ├── pdf_export.test.js
│   └── test_generateAuditReports.js
├── src/                # Source modules
│   └── validation/     # Date validation utilities
│       ├── date.js     # ISO-8601 validation
│       └── date.test.js
├── utils/              # Utility modules
│   └── pdfExporter.js  # PDF export functionality
├── docs/               # Documentation
│   ├── REFACTORING_SUMMARY.md
│   └── DATE_VALIDATION_IMPLEMENTATION.md
├── output/              # Generated TDDs (gitignored)
├── exports/             # Exported text files (gitignored)
├── cli.js              # Interactive CLI interface
├── test_runner.js      # Main test suite
└── package.json        # Project configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (use `.nvmrc` file)

### Setup
```bash
# Clone the repository
git clone https://github.com/Konetic-AI/tdd-builder-mpkf.git
cd tdd-builder-mpkf

# Use Node 18 (if using nvm)
nvm use

# Install dependencies
npm ci

# Run tests
npm test

# Build all TDDs
npm run build:all

# Validate microbuilds
npm run validate:microbuild

# Validate variables
npm run validate:variables
```

## 🛠️ Installation
```bash
# Clone the repository
git clone https://github.com/Konetic-AI/tdd-builder-mpkf.git
cd tdd-builder-mpkf

# Install dependencies
npm install
```

## 📖 Usage

### Interactive Mode
Start the interactive wizard to create a TDD by answering questions:
```bash
node cli.js
# or use the alias
npm run generate
```

### File-Based Mode
Generate a TDD from a JSON file:
```bash
node cli.js -f tests/sample_enterprise.json
```

### PDF Export
Generate a TDD and export it as a PDF:
```bash
# Interactive mode with PDF export
node cli.js --pdf

# File-based mode with PDF export
node cli.js -f tests/sample_enterprise.json --pdf
```

### Build Scripts
Generate TDDs for specific complexity levels:
```bash
npm run build:simple     # Generate TDD for simple complexity
npm run build:startup    # Generate TDD for startup complexity
npm run build:enterprise # Generate TDD for enterprise complexity
npm run build:mcp        # Generate TDD for MCP-specific complexity
```

### Help
View all available options:
```bash
node cli.js --help
```
## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Complexity Tests
```bash
npm run test:simple
npm run test:startup
npm run test:enterprise
npm run test:mcp
```

### Run Unit Tests with Jest
```bash
npm run test:jest
npm run test:unit
```

### Run Audit Tests
```bash
npm run test:audit
```

### Run PDF Export Tests
```bash
npm run test:pdf
```
## 📋 Commands Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run complete test suite |
| `npm run test:simple` | Test simple complexity |
| `npm run test:startup` | Test startup complexity |
| `npm run test:enterprise` | Test enterprise complexity |
| `npm run test:mcp` | Test MCP-specific complexity |
| `npm run test:audit` | Test audit report generation |
| `npm run test:pdf` | Test PDF export functionality |
| `npm run test:jest` | Run Jest test suite |
| `npm run test:unit` | Run unit tests |
| `npm run generate` | Start interactive mode (alias) |
| `npm run build:simple` | Generate TDD for simple complexity |
| `npm run build:startup` | Generate TDD for startup complexity |
| `npm run build:enterprise` | Generate TDD for enterprise complexity |
| `npm run build:mcp` | Generate TDD for MCP-specific complexity |
| `node cli.js` | Start interactive mode |
| `node cli.js -f <file>` | Generate from JSON file |
| `node cli.js --pdf` | Generate TDD and export as PDF |
| `node cli.js -f <file> --pdf` | Generate from file and export as PDF |
| `node cli.js --help` | Show help information |
## 📊 Sample Output

A generated TDD includes:

- **9 comprehensive stages** covering all aspects of technical design
- **Architecture diagrams** in PlantUML format with auto-generation
- **Security and privacy considerations** including MCP-specific boundaries
- **Operations and deployment strategies** with environment planning
- **Risk management and mitigation plans** with technical debt tracking
- **Micro Builds Guide** for iterative development including:
  - Component categorization (Core Modules, User Workflows, Shared Components, System Services)
  - Vibe coding workflow with 10-step iterative approach
  - Implementation tips and best practices
- **Self-audit reports** for compliance verification including:
  - Gap Analysis Report with missing field tracking
  - MPKF Compliance Report with validation status
  - Completeness Report with orphan variable detection
- **Micro Builds Guide** for iterative development workflow

All generated TDDs now end with Compliance Report, Completeness Report, and Micro Builds Guide.

### Performance Features
- **Template Caching**: 5-minute TTL reduces load times from 11ms to 0ms
- **Retry Logic**: Up to 3 retries for incomplete data with guided questions
- **Enhanced Validation**: Early input validation prevents processing errors
- **Browser Reuse**: Puppeteer browser instances reused for PDF generation

### PDF Export Features

When using the `--pdf` flag, the generated PDF includes:

- Professional formatting with proper typography and modern styling
- Headers and footers with page numbers
- Styled tables, code blocks, and lists with syntax highlighting
- A4 page format with appropriate margins (20mm top/bottom, 15mm left/right)
- Puppeteer-based headless browser PDF generation
- Fallback to formatted text export if PDF generation fails
- Batch export capabilities for multiple files
- Browser instance reuse for improved performance
- Sandboxed PDF generation with restricted permissions

## 🔐 MPKF Compliance
This tool strictly adheres to the Master Project Knowledge File (MPKF) framework:

- Uses Pre-TDD Client Questionnaire v2.0 for validation
- Populates Universal Enterprise-Grade TDD Template v5.0
- Implements Adaptive Complexity Model
- Compatible with downstream Phoenix and Iris Gem schemas
- Comprehensive ISO-8601 date validation
- Template caching for optimal performance
- Enhanced input validation and error handling

## 🤝 Contributing

### Pre-commit Checks
Husky pre-push hook runs the same validation checks as CI:
- Test suite execution
- Build validation
- Microbuild validation
- Variable validation

Initialize hooks once:
```bash
npx husky init
```

### Development Workflow
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Run tests to ensure everything works (`npm test`)
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

Please refer to the PR template checklist for complete contribution guidelines.

### Development Setup
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:jest
npm run test:pdf

# Generate sample TDD
npm run generate
```

## 🔄 CI/CD Pipeline

The `.github/workflows/ci.yml` workflow automatically:

1. **Install** - Sets up Node.js 18 and installs dependencies
2. **Test** - Runs complete test suite including Jest and custom tests
3. **Build** - Generates TDDs for all complexity levels
4. **Validate** - Runs microbuild and variable validation
5. **Artifact Upload** - Creates `tdd-exports.zip` with all generated outputs

**View Artifacts**: Go to *Actions* tab → Select workflow run → Download `tdd-exports.zip`

> For the full AI-assisted development process using Cursor (GPT-5) + Claude 4.5, see [AI Hybrid Workflow](docs/AI_Hybrid_Workflow.md).

## 🔄 Git Sync Flows

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

## 📄 License
This project is licensed under the MIT License.

## Syncing Workflow

**Local Dev (Cursor/VSCode/Mac):** `npm run autopush -- "commit message"`  
→ Stages, commits, and syncs to GitHub.

**Replit:** `npm run replit-sync`  
→ Force-syncs with GitHub `main`, discards uncommitted changes, reinstalls deps.

**Why:** Prevents "can't pull: uncommitted changes", ensures GitHub = source of truth, keeps all environments aligned.

## 📦 Dependencies & Security

### Automated Updates
- **Dependabot**: Weekly npm package updates
- **Security**: Automated vulnerability scanning
- **Maintenance**: Run `npm audit fix` for minor vulnerability patches

### Build Artifacts
- `output/` - Generated TDD markdown files (git-ignored)
- `exports/` - Exported text files (git-ignored)

These directories are automatically created during builds and excluded from version control.

## One-Shot Workflow Prompts

### Fast Sync (Commit→Push/PR→CI→Replit→Summary)

```bash
# Fast sync workflow - commit, push, and sync across environments
git add -A
git commit -m "wip(sync)"
git push origin main
```

### Full Check (Tests→Build→Validators→Commit→Push/PR→Replit)

```bash
# Full validation workflow - run all checks before sync
npm test
npm run build:all
npm run validate:microbuild
npm run validate:variables
git add -A
git commit -m "feat: full validation sync"
git push origin main
```

## 🙏 Acknowledgments

- MPKF Core Team for the foundational framework
- TDD Genesis Gem contributors
- Model Context Protocol community
- Puppeteer team for PDF generation capabilities
- Jest team for comprehensive testing framework