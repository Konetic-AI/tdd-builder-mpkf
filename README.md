# TDD Builder MPKF

[![CI](https://github.com/Konetic-AI/tdd-builder-mpkf/actions/workflows/ci.yml/badge.svg)](https://github.com/Konetic-AI/tdd-builder-mpkf/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](package.json)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)](package.json)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](test_runner.js)

A powerful Node.js command-line tool that generates enterprise-grade Technical Design Documents (TDDs) compliant with the Master Project Knowledge File (MPKF) framework.

## ✨ What's New

**Latest Enhancements (October 2025)**:

1. 📖 **Complete "Why We Ask" Documentation** - Every question now includes contextual help explaining its purpose and importance
2. 💡 **Rich Examples for All Dropdowns** - 2-3 realistic examples for every dropdown/multi-select field
3. 💾 **Noninteractive Import/Export** - Save answers with `--export-answers` and load them later with `--answers` for reproducible TDD generation
4. 📊 **Privacy-Safe Analytics** - Opt-in telemetry (via `ONBOARDING_TELEMETRY=1`) tracks anonymized metrics to improve the tool:
   - Time per stage
   - Questions skipped by tag
   - Template usage patterns
   - **Zero PII collected** - all data is anonymized and stored locally

👉 **See [ENHANCED_FEATURES_SUMMARY.md](ENHANCED_FEATURES_SUMMARY.md) for complete details and examples**

## 🚀 Features

- **MPKF-Compliant**: Generates TDDs following the official Universal Enterprise-Grade TDD Template v5.0
- **Graduated Complexity Matrix**: Five-level adaptive complexity system with auto-recommendation:
  - `base` - Quick prototypes and experiments (4 required fields)
  - `minimal` - Simple projects with basic requirements (8 required fields)
  - `standard` - Typical projects with moderate complexity (15 required fields)
  - `comprehensive` - Complex projects with extensive requirements (25 required fields)
  - `enterprise` - Enterprise-grade systems with full compliance (35+ required fields)
  - `auto` - Automatic recommendation based on project characteristics (PII/PHI, payments, compliance, multi-region, regulated industries)
- **Pre-TDD Validation**: Validates input data and generates targeted questions for missing information
- **Self-Auditing**: Automatically appends Gap Analysis, Compliance, and Completeness reports
- **Micro Builds Guide**: Every generated TDD includes a standardized breakdown into atomic micro builds, with categories (Core Modules, User Workflows, Shared Components, System Services) and a 10-step workflow for vibe coding success
- **Smart Caching**: Template caching with 5-minute TTL for improved performance (11ms → 0ms)
- **ISO-8601 Date Validation**: Comprehensive date validation supporting all ISO-8601 formats with leap year and timezone support
- **Enhanced Validation**: Robust input validation with detailed error messages and type checking
- **Export Capabilities**: Export TDDs as formatted text files or PDF documents
- **PDF Export**: Generate professional PDF documents with proper formatting, styling, and fallback to text export
- **Interactive CLI**: User-friendly command-line interface with retry logic, enhanced error handling, and both interactive and file-based modes
- **Enhanced Review Screen**: 
  - Grouped answers display organized by TDD sections
  - Visual TDD preview showing which sections will be generated
  - Completeness indicators with progress bars (✓ complete, ◐ partial, ○ minimal)
  - Inline edit functionality to fix mistakes without restarting
  - Confirmation step before generation with preview of conditional sections
- **Inline Help System**: Contextual help available for every question with (?) affordance, showing explanations, examples, and documentation links - **Now with "why we ask" for ALL questions!**
- **Industry Starter Templates**: Pre-configured templates for SaaS, FinTech, E-Commerce, and Healthcare that pre-fill 10-57 defaults and focus on relevant topics
- **Answer Import/Export**: Save interview answers to JSON with `--export-answers` and reload them with `--answers` for reproducible workflows
- **Privacy-Safe Telemetry**: Opt-in analytics (ONBOARDING_TELEMETRY=1) with anonymized metrics and zero PII

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

## 🔄 Feature Flags & Migration Guide

### Schema-Driven vs Legacy Mode

This tool supports two operational modes via the `SCHEMA_DRIVEN_ONBOARDING` feature flag:

#### **Legacy Mode (Default)**
- Uses hardcoded question sets based on complexity level
- Fully backward compatible with existing workflows
- No TypeScript compilation required
- Works with non-interactive mode (`--noninteractive`)

#### **Schema-Driven Mode**
- Uses Pre-TDD Client Questionnaire v2.0 schema
- Provides enhanced question routing with tags and metadata
- Supports dynamic skip logic and conditional questions
- Requires TypeScript modules to be compiled (`npm run build`)

### Enabling Schema-Driven Mode

```bash
# Option 1: Environment variable
export SCHEMA_DRIVEN_ONBOARDING=true
node cli.js

# Option 2: .env file
echo "SCHEMA_DRIVEN_ONBOARDING=true" >> .env
node cli.js

# Option 3: Inline environment variable
SCHEMA_DRIVEN_ONBOARDING=true node cli.js
```

### Forcing Legacy Mode

```bash
# Use --legacy flag to override environment variable
node cli.js --legacy --noninteractive tests/sample_mcp.json

# Or unset the environment variable
export SCHEMA_DRIVEN_ONBOARDING=false
node cli.js
```

### Migration Path

**Current State (v1.0.0):**
- Default mode: **Legacy** (for stability)
- Schema-driven mode: **Opt-in** (requires explicit flag)

**Recommended Migration:**

1. **Phase 1 - Test Schema Mode (Weeks 1-2)**
   ```bash
   # Test schema mode with your existing test data
   SCHEMA_DRIVEN_ONBOARDING=true npm test
   
   # Try interactive mode with schema
   SCHEMA_DRIVEN_ONBOARDING=true node cli.js
   ```

2. **Phase 2 - Parallel Testing (Weeks 3-4)**
   ```bash
   # Run both modes and compare outputs
   node cli.js --legacy --noninteractive tests/sample_mcp.json
   SCHEMA_DRIVEN_ONBOARDING=true node cli.js --noninteractive tests/sample_mcp.json
   ```

3. **Phase 3 - Switch Default (Future Release)**
   - After sufficient testing, default will change to `SCHEMA_DRIVEN_ONBOARDING=true`
   - Legacy mode will remain available via `--legacy` flag

### Feature Flag Details

| Feature Flag | Default | Description | Override |
|--------------|---------|-------------|----------|
| `SCHEMA_DRIVEN_ONBOARDING` | `false` | Enable schema-driven question flow | `--legacy` CLI flag |

### Troubleshooting

**Error: "TypeScript modules not compiled"**
```bash
# Solution: Build TypeScript modules
npm run build

# Or use legacy mode
node cli.js --legacy
```

**Error: "SCHEMA_DRIVEN_ONBOARDING enabled but modules unavailable"**
```bash
# Solution 1: Build the modules
npm run build

# Solution 2: Disable schema mode
export SCHEMA_DRIVEN_ONBOARDING=false

# Solution 3: Use legacy flag
node cli.js --legacy
```

### Checking Current Mode

The banner displays the current operational mode:
```
╔══════════════════════════════════════════════════════════════╗
║     TDD Builder - MPKF Enterprise Framework Edition         ║
║              Technical Design Document Generator            ║
║                    [Legacy Mode]                             ║  ← Mode indicator
╚══════════════════════════════════════════════════════════════╝
Legacy Mode: Using hardcoded question sets                      ← Description
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

The interactive mode features a 3-stage interview process:

1. **Stage 1: Core Questions** (5-7 essential questions)
2. **Stage 2: Review & Edit** (NEW! Enhanced review screen)
   - See all your answers grouped by TDD section
   - View a preview of which TDD sections will be generated
   - Visual completeness indicators with progress bars
   - Edit any answer inline without restarting
3. **Stage 3: Deep Dive** (optional detailed questions by topic)
4. **Final Review & Confirmation** (NEW!)
   - Updated preview after deep dive
   - Confirm before generation
   - Last chance to edit

**Demo the Review Screen:**
```bash
node examples/review-screen-demo.js
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
# New graduated complexity levels
node cli.js --noninteractive tests/sample_simple.json --complexity base
node cli.js --noninteractive tests/sample_simple.json --complexity minimal
node cli.js --noninteractive tests/sample_enterprise.json --complexity standard
node cli.js --noninteractive tests/sample_enterprise.json --complexity comprehensive
node cli.js --noninteractive tests/sample_enterprise.json --complexity enterprise

# Legacy build scripts (still supported)
npm run build:simple     # Generate TDD for simple complexity
npm run build:startup    # Generate TDD for startup complexity
npm run build:enterprise # Generate TDD for enterprise complexity
npm run build:mcp        # Generate TDD for MCP-specific complexity
```

### Industry Starter Templates
Start with pre-configured templates for common industries:
```bash
# SaaS template (35 defaults: multi-tenancy, rate limiting, SSO)
node cli.js --template saas

# FinTech template (43 defaults: SOC 2/PCI, audit logging, segregation of duties)
node cli.js --template fintech

# E-Commerce template (57 defaults: catalog, inventory, checkout, payments, fraud)
node cli.js --template ecommerce

# Healthcare template (57 defaults: PHI/PII, HIPAA, data retention)
node cli.js --template healthcare

# Templates can be combined with other options
node cli.js --template saas --pdf
node cli.js --template fintech --complexity comprehensive
```

**Benefits:**
- ✅ Pre-fills 10-57 sensible defaults
- ✅ Focuses on industry-relevant topics
- ✅ Skips irrelevant questions
- ✅ Still allows overrides and customization

See [Industry Templates Documentation](templates/industries/README.md) for details on each template.

### Inline Help
During interactive mode, get contextual help for any question:
```bash
# When you see a question with (?) indicator:
[1/10] Where will this be deployed? (?)
  💡 This determines your infrastructure approach
  
  1. cloud
  2. on-premise
  3. hybrid
  (Type '?' for help)

  Your answer: ?

# Help displays:
# - Why we ask this question
# - Example values with descriptions
# - Link to detailed documentation
```

See [Inline Help Feature Documentation](docs/INLINE_HELP_FEATURE.md) for complete details.

### Complexity Levels

The TDD Builder uses a graduated complexity matrix that automatically scales the level of detail based on your project's requirements. You can either specify a complexity level explicitly or use `auto` for automatic recommendation.

#### Graduated Complexity Matrix

| Level | Fields | Sections | Use Case |
|-------|--------|----------|----------|
| **base** | 4 | 2 | Quick prototypes, experiments, proof-of-concepts |
| **minimal** | 8 | 3 | Simple projects, MVPs, internal tools |
| **standard** | 15 | 5 | Typical projects with moderate complexity |
| **comprehensive** | 25 | 7 | Complex projects with extensive requirements |
| **enterprise** | 35+ | 9 | Enterprise-grade systems with full compliance |

#### Auto-Recommendation

Use `--complexity auto` (default) to let the system recommend the appropriate level based on:

- **PII/PHI Handling**: Personal or health information
- **Payment Processing**: PCI-DSS compliance required
- **Multi-Region**: Deployment across multiple geographic regions
- **Compliance Requirements**: GDPR, HIPAA, SOC 2, etc.
- **Regulated Industries**: Healthcare, finance, government
- **Multi-Tenant Architecture**: SaaS platforms with tenant isolation
- **High Availability**: 99.99%+ uptime requirements

#### Usage Examples

```bash
# Use automatic recommendation (default)
node cli.js --complexity auto

# Specify a level explicitly for quick prototype
node cli.js --complexity base

# Enterprise-grade system with full documentation
node cli.js --complexity enterprise

# Combine with templates
node cli.js --template healthcare --complexity comprehensive
```

#### Progressive Disclosure

Higher complexity levels progressively reveal more sections without re-asking core questions:

- **base → minimal**: Adds architecture section
- **minimal → standard**: Adds operations and security sections
- **standard → comprehensive**: Adds privacy and implementation sections
- **comprehensive → enterprise**: Adds risks and compliance sections

This ensures that you only answer the questions relevant to your project's complexity level, making the process efficient while maintaining completeness.

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
## 📋 CLI Flags Reference

### Complete Flag Documentation

| Flag | Arguments | Description | Example |
|------|-----------|-------------|---------|
| `--noninteractive` | `<file>` | Load answers from JSON file (skip interview) | `node cli.js --noninteractive tests/sample_mcp.json` |
| `--template` | `<name>` | Use an industry starter template | `node cli.js --template healthcare` |
| `--tags` | `<tag1,tag2,...>` | Filter deep dive questions by tags | `node cli.js --tags security,privacy` |
| `--complexity` | `<level>` | Set complexity level or use auto | `node cli.js --complexity enterprise` |
| `--legacy` | (none) | Force legacy mode (hardcoded questions) | `node cli.js --legacy --noninteractive file.json` |
| `--pdf` | (none) | Export generated TDD as PDF | `node cli.js --pdf` |
| `-h, --help` | (none) | Show help message | `node cli.js --help` |

### Flag Details

#### `--noninteractive <file>`
Load answers from a JSON file and generate TDD without prompting for input.

**Example:**
```bash
node cli.js --noninteractive tests/sample_enterprise.json
```

**JSON Format:**
```json
{
  "project.name": "My Project",
  "project.description": "Project description",
  "project.version": "1.0.0",
  "problem.description": "Problem statement",
  "solution.description": "Solution approach"
}
```

#### `--template <name>`
Start with a pre-configured industry template that provides sensible defaults and focuses on relevant questions.

**Available Templates:**
- `saas` - Multi-tenant SaaS applications (35 defaults)
- `fintech` - Financial services and FinTech (43 defaults)
- `ecommerce` - E-commerce platforms (57 defaults)
- `healthcare` - Healthcare and medical systems (57 defaults)

**Example:**
```bash
# Start with SaaS template
node cli.js --template saas

# Combine template with other flags
node cli.js --template fintech --complexity comprehensive --pdf
```

**See:** [Template Authoring Guide](#-template-authoring-guide) for creating custom templates.

#### `--tags <tag1,tag2,...>`
Filter deep dive questions to only include those with specified tags. Useful for focusing on specific aspects of your project.

**Available Tags:**
- `foundation` - Project basics and setup (always included)
- `architecture` - System architecture and design
- `security` - Security controls and compliance
- `operations` - Operational concerns and monitoring
- `privacy` - Data privacy and protection
- `compliance` - Regulatory compliance requirements
- `risks` - Risk management and mitigation

**Example:**
```bash
# Focus on security and privacy questions only
node cli.js --tags security,privacy

# Combine with complexity level
node cli.js --tags architecture,operations --complexity standard
```

**Note:** Questions tagged with `foundation` are always included regardless of tag filters.

#### `--complexity <level>`
Set the complexity level explicitly or use `auto` for automatic recommendation.

**Complexity Levels:**
- `base` - Bare minimum (4 fields) for quick prototypes
- `minimal` - Core essentials (8 fields) for simple projects
- `standard` - Moderate complexity (15 fields) for typical projects
- `comprehensive` - Extensive requirements (25 fields) for complex projects
- `enterprise` - Full TDD (35+ fields) for enterprise-grade systems
- `auto` - Automatic recommendation based on project characteristics (default)

**Example:**
```bash
# Use automatic recommendation (default)
node cli.js --complexity auto

# Specify enterprise level explicitly
node cli.js --complexity enterprise

# Quick prototype with minimal fields
node cli.js --complexity base
```

**Auto-Recommendation Factors:**
The system analyzes your answers and automatically recommends a complexity level based on:
- PII/PHI data handling (+6/+8 points)
- Payment processing / PCI-DSS (+7 points)
- Multi-region deployment (+5 points)
- Compliance requirements (GDPR, HIPAA, etc.) (+8 points)
- Regulated industries (healthcare, finance, government) (+7 points)
- Multi-tenant architecture (+5 points)
- High availability requirements (99.99%+) (+5 points)
- Large scale systems (+6 points)

**See:** [Complexity Matrix Documentation](#complexity-levels) for complete details.

#### `--legacy`
Force legacy mode, overriding the `SCHEMA_DRIVEN_ONBOARDING` environment variable. Uses hardcoded question sets instead of schema-driven routing.

**Example:**
```bash
# Force legacy mode even if SCHEMA_DRIVEN_ONBOARDING=true
node cli.js --legacy --noninteractive tests/sample_mcp.json

# Useful for backwards compatibility
SCHEMA_DRIVEN_ONBOARDING=true node cli.js --legacy
```

**When to Use:**
- Ensuring backwards compatibility with existing workflows
- Debugging schema-related issues
- Working in environments where TypeScript compilation is unavailable

#### `--pdf`
Export the generated TDD as a professionally formatted PDF in addition to the markdown file.

**Example:**
```bash
# Interactive mode with PDF export
node cli.js --pdf

# Non-interactive with PDF
node cli.js --noninteractive tests/sample_mcp.json --pdf

# Combine with all options
node cli.js --template healthcare --complexity comprehensive --pdf
```

**PDF Features:**
- Professional formatting with proper typography
- Headers/footers with page numbers
- Styled tables, code blocks, and lists
- A4 page format with appropriate margins
- Syntax highlighting for code blocks

### Combining Flags

Flags can be combined to create powerful workflows:

```bash
# Enterprise healthcare project with PDF export
node cli.js --template healthcare --complexity enterprise --pdf

# Security-focused standard project
node cli.js --tags security,privacy,compliance --complexity standard

# Legacy mode with specific template
node cli.js --legacy --template saas --noninteractive data.json

# Auto-recommended with specific tag focus
node cli.js --tags architecture,operations --complexity auto
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

## 📝 Schema Authoring Guide

The TDD Builder is designed to be **extended without code changes**. All questions, rules, and logic are defined in JSON schemas, allowing you to customize the tool to your organization's needs.

### Understanding the Schema System

The system uses two primary schemas:

1. **Pre-TDD Client Questionnaire Schema** (`schemas/Pre-TDD_Client_Questionnaire_v2.0.json`)
   - Defines all questions, validation rules, and conditional logic
   - Controls question flow and routing

2. **Universal Tag Schema** (`schemas/Universal_Tag_Schema_v1.1.json`)
   - Defines question tags and metadata
   - Controls complexity routing and field weights

### Adding New Questions

To add a question without touching code, edit `schemas/Pre-TDD_Client_Questionnaire_v2.0.json`:

```json
{
  "questions": [
    {
      "id": "deployment.container_orchestration",
      "stage": "deep_dive",
      "type": "select",
      "question": "What container orchestration platform will you use?",
      "hint": "Choose the platform that best fits your scale and complexity",
      "options": ["kubernetes", "docker-swarm", "ecs", "none"],
      "validation": {
        "required": true,
        "allowedValues": ["kubernetes", "docker-swarm", "ecs", "none"]
      },
      "tags": ["architecture", "operations"],
      "skip_if": {
        "neq": ["deployment.model", "cloud"]
      },
      "triggers": {
        "kubernetes": ["deployment.k8s_cluster_config", "deployment.k8s_namespace_strategy"]
      },
      "help": {
        "why": "Container orchestration affects your deployment strategy and operational complexity",
        "examples": {
          "kubernetes": "Industry standard, highly scalable, steep learning curve",
          "docker-swarm": "Simpler alternative, good for smaller deployments",
          "ecs": "AWS-native, tight integration with AWS services"
        },
        "learnMore": "https://kubernetes.io/docs/concepts/overview/"
      }
    }
  ]
}
```

### Question Schema Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier (dot-notation: `category.field`) |
| `stage` | string | ✓ | Stage: `core`, `review`, or `deep_dive` |
| `type` | string | ✓ | Question type: `text`, `select`, `multi-select`, `boolean`, `date` |
| `question` | string | ✓ | The question text displayed to users |
| `hint` | string | | Optional hint displayed below the question |
| `options` | string[] | | Options for `select` and `multi-select` types |
| `validation` | object | ✓ | Validation rules (see below) |
| `tags` | string[] | ✓ | Tags for routing and grouping (see Tag Schema) |
| `skip_if` | expression | | Conditional logic to skip this question (see below) |
| `triggers` | object | | Questions to trigger based on answer |
| `help` | object | | Inline help content (why, examples, learnMore) |

### Validation Rules

Validation is defined per-question and enforced automatically:

```json
{
  "validation": {
    "required": true,
    "type": "date",
    "format": "ISO-8601",
    "allowedValues": ["option1", "option2"],
    "minLength": 5,
    "maxLength": 100,
    "pattern": "^[A-Za-z0-9-]+$"
  }
}
```

**Supported Validation Types:**
- `required` - Field cannot be empty
- `type` - Data type: `string`, `number`, `boolean`, `date`, `array`
- `format` - Format validation: `ISO-8601`, `email`, `url`
- `allowedValues` - Enum validation
- `minLength` / `maxLength` - String length constraints
- `pattern` - Regex pattern matching

### Conditional Logic (skip_if)

Use the `skip_if` expression to conditionally show/hide questions:

**JSON Expression Format (Recommended):**
```json
{
  "skip_if": {
    "eq": ["deployment.model", "on-premise"]
  }
}
```

**Supported Operators:**
- `eq: [field, value]` - Equality check
- `neq: [field, value]` - Not equal check
- `has: [field, value]` - Array contains check
- `not: expression` - Logical negation
- `and: [expr1, expr2, ...]` - Logical AND
- `or: [expr1, expr2, ...]` - Logical OR

**Complex Example:**
```json
{
  "skip_if": {
    "and": [
      { "eq": ["deployment.model", "cloud"] },
      {
        "or": [
          { "eq": ["cloud.provider", "aws"] },
          { "eq": ["cloud.provider", "azure"] }
        ]
      }
    ]
  }
}
```

**Legacy String Format (Still Supported):**
```json
{
  "skip_if": "deployment.model == 'on-premise' && privacy.pii == true"
}
```

### Triggers

Use triggers to dynamically add follow-up questions:

```json
{
  "triggers": {
    "cloud": ["cloud.provider", "cloud.regions"],
    "on-premise": ["datacenter.location", "datacenter.capacity"],
    "hybrid": ["cloud.provider", "datacenter.location"]
  }
}
```

When a user answers with a trigger key (e.g., "cloud"), the system automatically adds the specified questions to the interview flow.

### Configuring Question Metadata

Edit `schemas/Universal_Tag_Schema_v1.1.json` to configure tags and field metadata:

```json
{
  "tags": {
    "container": {
      "label": "Containerization",
      "description": "Docker, Kubernetes, and container orchestration"
    }
  },
  "field_metadata": {
    "deployment.container_orchestration": {
      "tags": ["architecture", "operations", "container"],
      "related_fields": ["deployment.model", "cloud.provider"],
      "complexity_levels": ["standard", "comprehensive", "enterprise"],
      "weight": 5
    }
  }
}
```

**Field Metadata Properties:**
- `tags` - Tags for this field (enables tag-based filtering)
- `related_fields` - Related questions (for documentation and navigation)
- `complexity_levels` - Which complexity levels include this question
- `weight` - Contribution to complexity score (higher = more complex)

### Tag-Based Routing

Questions are automatically routed based on their tags. To add a new tag domain:

1. Add the tag to the Tag Schema:
```json
{
  "tags": {
    "mobile": {
      "label": "Mobile Development",
      "description": "Mobile-specific architecture and deployment"
    }
  }
}
```

2. Tag your questions:
```json
{
  "id": "mobile.platform",
  "tags": ["mobile", "architecture"],
  "question": "Which mobile platforms will you support?"
}
```

3. Users can now filter by tag:
```bash
node cli.js --tags mobile,architecture
```

### Complexity Routing

Control which questions appear at each complexity level via `complexity_levels` in field metadata:

```json
{
  "field_metadata": {
    "basic_question": {
      "complexity_levels": ["base", "minimal", "standard", "comprehensive", "enterprise"]
    },
    "advanced_question": {
      "complexity_levels": ["comprehensive", "enterprise"]
    },
    "expert_question": {
      "complexity_levels": ["enterprise"]
    }
  }
}
```

### Best Practices

1. **Question IDs**: Use dot-notation (`category.subcategory.field`) for organization
2. **Progressive Disclosure**: Put basic questions in `core`, detailed ones in `deep_dive`
3. **Tag Consistently**: Use existing tags when possible, create new ones sparingly
4. **Validation First**: Always define validation rules to prevent invalid input
5. **Helpful Hints**: Provide context with `hint` and `help` properties
6. **Test Thoroughly**: Run `npm test` after schema changes to verify integrity

### Example: Adding a New Domain

Let's add support for "Machine Learning" projects:

**1. Add Tag:**
```json
{
  "tags": {
    "ml": {
      "label": "Machine Learning",
      "description": "ML/AI model training and deployment"
    }
  }
}
```

**2. Add Core Question:**
```json
{
  "id": "ml.enabled",
  "stage": "core",
  "type": "boolean",
  "question": "Does this project include machine learning components?",
  "validation": { "required": true },
  "tags": ["foundation", "ml"],
  "triggers": {
    "true": ["ml.framework", "ml.model_type", "ml.training_data"]
  }
}
```

**3. Add Deep Dive Questions:**
```json
{
  "id": "ml.framework",
  "stage": "deep_dive",
  "type": "select",
  "question": "Which ML framework will you use?",
  "options": ["tensorflow", "pytorch", "scikit-learn", "custom"],
  "validation": { "required": true },
  "tags": ["ml", "architecture"],
  "skip_if": { "neq": ["ml.enabled", true] }
}
```

**4. Configure Metadata:**
```json
{
  "field_metadata": {
    "ml.framework": {
      "tags": ["ml", "architecture"],
      "related_fields": ["ml.model_type", "infrastructure.gpu"],
      "complexity_levels": ["standard", "comprehensive", "enterprise"],
      "weight": 4
    }
  }
}
```

**5. Test:**
```bash
# Build TypeScript
npm run build

# Test with ML tag filter
node cli.js --tags ml --complexity standard
```

Now users can focus on ML-specific questions, and the system will route appropriately!

## 🎨 Template Authoring Guide

Templates are pre-configured JSON files that provide sensible defaults for common industry use cases. They allow users to get started quickly without answering dozens of questions.

### Template Structure

Templates are stored in `templates/industries/` and follow this structure:

```json
{
  "template_name": "Healthcare Starter",
  "template_id": "healthcare",
  "version": "1.0.0",
  "description": "Pre-configured for HIPAA-compliant healthcare applications",
  "industry": "Healthcare",
  "complexity_recommendation": "comprehensive",
  "tag_focus": ["security", "privacy", "compliance"],
  "defaults": {
    "project.industry": "Healthcare",
    "privacy.pii": true,
    "privacy.regulations": ["hipaa", "gdpr"],
    "security.authentication": "OAuth2 + MFA",
    "security.encryption.at_rest": true,
    "security.encryption.in_transit": true,
    "security.audit_logging": true,
    "operations.sla": "99.99",
    "deployment.model": "cloud"
  }
}
```

### Template Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `template_name` | string | ✓ | Human-readable template name |
| `template_id` | string | ✓ | Unique identifier (used in CLI: `--template healthcare`) |
| `version` | string | ✓ | Template version (semver) |
| `description` | string | ✓ | Brief description of template purpose |
| `industry` | string | ✓ | Target industry |
| `complexity_recommendation` | string | ✓ | Recommended complexity level |
| `tag_focus` | string[] | ✓ | Tags to focus on in deep dive |
| `defaults` | object | ✓ | Default answer values (question ID → value) |

### Creating a New Template

**Example: Creating an "IoT Platform" Template**

**1. Create File:** `templates/industries/iot-starter.json`

```json
{
  "template_name": "IoT Platform Starter",
  "template_id": "iot",
  "version": "1.0.0",
  "description": "Pre-configured for IoT device management and data platforms",
  "industry": "IoT / Smart Devices",
  "complexity_recommendation": "comprehensive",
  "tag_focus": ["architecture", "operations", "security"],
  "defaults": {
    "project.industry": "IoT",
    "project.description": "IoT device management and data collection platform",
    
    "architecture.type": "Microservices",
    "architecture.scale": "large",
    "architecture.pattern": "Event-Driven",
    
    "deployment.model": "cloud",
    "cloud.provider": "aws",
    "cloud.regions": ["us-east-1", "eu-west-1"],
    
    "database.type": "Time-Series",
    "database.timeseries": "InfluxDB",
    "database.cache": "Redis",
    
    "messaging.broker": "MQTT",
    "messaging.protocol": "AMQP",
    
    "security.device_auth": "X.509 Certificates",
    "security.encryption.in_transit": true,
    "security.api_gateway": true,
    
    "operations.monitoring": "CloudWatch + Grafana",
    "operations.sla": "99.9",
    "operations.alerting": "PagerDuty",
    
    "scalability.device_count": "1000000+",
    "scalability.messages_per_second": "100000+",
    
    "privacy.pii": false,
    "privacy.regulations": ["none"]
  }
}
```

**2. Document Available Tags:**

Ensure the `tag_focus` aligns with questions in your schema. Common tags:
- `foundation` - Always included
- `architecture` - System design
- `security` - Security controls
- `operations` - Monitoring and ops
- `privacy` - Data privacy
- `compliance` - Regulatory compliance

**3. Test the Template:**

```bash
# Compile if using schema-driven mode
npm run build

# Test interactive flow
node cli.js --template iot

# Test non-interactive flow
node cli.js --template iot --noninteractive tests/sample_iot.json

# Test with complexity override
node cli.js --template iot --complexity enterprise
```

**4. Verify Output:**

The generated TDD should:
- Pre-fill all default values
- Focus questions on specified tags
- Recommend the specified complexity level
- Include industry-specific considerations

### Template Best Practices

#### 1. **Provide Comprehensive Defaults**
Include 30-60 defaults to minimize user input while maintaining flexibility.

```json
{
  "defaults": {
    // Core identity (10-15 fields)
    "project.industry": "...",
    "project.type": "...",
    
    // Architecture (10-15 fields)
    "architecture.type": "...",
    "architecture.pattern": "...",
    
    // Security (10-15 fields)
    "security.authentication": "...",
    "security.authorization": "...",
    
    // Operations (10-15 fields)
    "operations.monitoring": "...",
    "operations.ci_cd": "..."
  }
}
```

#### 2. **Focus on Relevant Topics**
Use `tag_focus` to emphasize important topics for the industry:

```json
{
  "tag_focus": ["security", "privacy", "compliance"],  // For healthcare
  "tag_focus": ["architecture", "operations"],         // For high-scale platforms
  "tag_focus": ["security", "architecture"]            // For fintech
}
```

#### 3. **Set Appropriate Complexity**
Recommend complexity based on typical industry requirements:

- `minimal` - Simple internal tools, prototypes
- `standard` - Typical web/mobile apps
- `comprehensive` - Regulated industries, large-scale systems
- `enterprise` - Mission-critical, highly regulated

#### 4. **Industry-Specific Defaults**
Tailor defaults to industry standards:

**FinTech:**
```json
{
  "privacy.regulations": ["pci-dss", "sox", "gdpr"],
  "security.encryption.at_rest": true,
  "security.audit_logging": true,
  "operations.sla": "99.99"
}
```

**Healthcare:**
```json
{
  "privacy.regulations": ["hipaa", "hitech", "gdpr"],
  "privacy.phi": true,
  "security.encryption.at_rest": true,
  "security.access_controls": "RBAC + Audit"
}
```

**E-Commerce:**
```json
{
  "privacy.regulations": ["pci-dss", "gdpr"],
  "architecture.caching": "Redis",
  "operations.sla": "99.9",
  "scalability.peak_traffic": "high"
}
```

#### 5. **Document Template Usage**
Update `templates/industries/README.md` with template details:

```markdown
## IoT Platform Starter

**Use Case:** IoT device management, data collection platforms, smart device networks

**Defaults Provided:** 45

**Key Features:**
- MQTT/AMQP messaging protocols
- Time-series database (InfluxDB)
- Device authentication via X.509 certificates
- Event-driven architecture
- High-scale support (1M+ devices)

**Ideal For:**
- Smart home platforms
- Industrial IoT solutions
- Connected device ecosystems
- Sensor data collection platforms

**Usage:**
```bash
node cli.js --template iot
```
```

### Template Testing Checklist

Before committing a new template:

- [ ] Template file is valid JSON
- [ ] All required properties present
- [ ] `template_id` is unique and matches filename
- [ ] All default field IDs exist in the questionnaire schema
- [ ] All values match validation rules
- [ ] `tag_focus` tags exist in the tag schema
- [ ] Complexity recommendation is valid
- [ ] Template generates valid TDD
- [ ] No orphan variables in output
- [ ] Documentation added to `templates/industries/README.md`

### Advanced: Dynamic Defaults

For computed or conditional defaults, templates can include expressions:

```json
{
  "defaults": {
    "project.start_date": "{{TODAY}}",
    "project.target_launch": "{{TODAY+90}}",
    "security.compliance_deadline": "{{TODAY+180}}"
  }
}
```

**Supported Expressions:**
- `{{TODAY}}` - Current date (ISO-8601)
- `{{TODAY+N}}` - N days from today
- `{{TODAY-N}}` - N days before today
- `{{RANDOM_UUID}}` - Generate UUID v4
- `{{ENV:VAR}}` - Environment variable

### Template Versioning

Use semantic versioning for templates:

- **MAJOR** - Breaking changes (removes/renames fields)
- **MINOR** - New defaults added
- **PATCH** - Value adjustments or bug fixes

```json
{
  "version": "2.1.0",
  "changelog": [
    {
      "version": "2.1.0",
      "date": "2024-01-15",
      "changes": ["Added Kubernetes defaults", "Updated security recommendations"]
    },
    {
      "version": "2.0.0",
      "date": "2024-01-01",
      "changes": ["BREAKING: Renamed cloud.type to cloud.provider"]
    }
  ]
}
```

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
set -euo pipefail
COMMIT_MSG="${COMMIT_MSG:-chore: quick sync (commit+push+ci+replit)}"
REPLIT_SYNC="${REPLIT_SYNC:-npm run replit-sync}"

REPO_URL="$(git remote get-url origin || true)"
REPO_SLUG="${REPO_URL##*/}"; REPO_SLUG="${REPO_SLUG%.git}"
OWNER="$(printf "%s" "$REPO_URL" | sed -E 's#(.*[:/])([^/]+)/[^/]+(\.git)?#\2#')"
OWNER="${OWNER:-Konetic-AI}"; NAME="${REPO_SLUG:-tdd-builder-mpkf}"
BRANCH="$(git rev-parse --abbrev-ref HEAD || echo 'unknown')"

git config core.hooksPath .husky || true
if ! git diff --quiet || ! git diff --cached --quiet; then
  git add -A && git commit -m "${COMMIT_MSG}" || true
fi
if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
  time git push
else
  time git push -u origin HEAD
fi

if [ "${BRANCH}" = "main" ]; then
  echo "🔗 Commits: https://github.com/${OWNER}/${NAME}/commits/main"
  echo "🔗 Actions: https://github.com/${OWNER}/${NAME}/actions?query=branch%3Amain"
else
  echo "🔗 Create/visit PR: https://github.com/${OWNER}/${NAME}/compare/main...${BRANCH}"
  echo "🔗 Actions: https://github.com/${OWNER}/${NAME}/actions?query=branch%3A${BRANCH}"
fi

if grep -q '"replit-sync"' package.json 2>/dev/null; then
  time ${REPLIT_SYNC} || echo "⚠️ Replit sync returned non-zero."
fi
```

### Full Check (Tests→Build→Validators→Commit→Push/PR→Replit)

```bash
set -euo pipefail
COMMIT_MSG="${COMMIT_MSG:-feat: full validation sync (tests+build+validators+commit+push+replit)}"
REPLIT_SYNC="${REPLIT_SYNC:-npm run replit-sync}"

REPO_URL="$(git remote get-url origin || true)"
REPO_SLUG="${REPO_URL##*/}"; REPO_SLUG="${REPO_SLUG%.git}"
OWNER="$(printf "%s" "$REPO_URL" | sed -E 's#(.*[:/])([^/]+)/[^/]+(\.git)?#\2#')"
OWNER="${OWNER:-Konetic-AI}"; NAME="${REPO_SLUG:-tdd-builder-mpkf}"
BRANCH="$(git rev-parse --abbrev-ref HEAD || echo 'unknown')"

# Run full validation suite
echo "🧪 Running test suite..."
time npm test

echo "🏗️ Running build validation..."
time npm run build:all

echo "🔍 Running microbuild validation..."
time npm run validate:microbuild

echo "✅ Running variable validation..."
time npm run validate:variables

git config core.hooksPath .husky || true
if ! git diff --quiet || ! git diff --cached --quiet; then
  git add -A && git commit -m "${COMMIT_MSG}" || true
fi
if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
  time git push
else
  time git push -u origin HEAD
fi

if [ "${BRANCH}" = "main" ]; then
  echo "🔗 Commits: https://github.com/${OWNER}/${NAME}/commits/main"
  echo "🔗 Actions: https://github.com/${OWNER}/${NAME}/actions?query=branch%3Amain"
else
  echo "🔗 Create/visit PR: https://github.com/${OWNER}/${NAME}/compare/main...${BRANCH}"
  echo "🔗 Actions: https://github.com/${OWNER}/${NAME}/actions?query=branch%3A${BRANCH}"
fi

if grep -q '"replit-sync"' package.json 2>/dev/null; then
  time ${REPLIT_SYNC} || echo "⚠️ Replit sync returned non-zero."
fi
```

## 🙏 Acknowledgments

- MPKF Core Team for the foundational framework
- TDD Genesis Gem contributors
- Model Context Protocol community
- Puppeteer team for PDF generation capabilities
- Jest team for comprehensive testing framework