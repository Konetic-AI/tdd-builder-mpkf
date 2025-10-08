# TDD Builder CLI Guide - 3-Stage Interview System

## Overview

The TDD Builder CLI now features an enhanced 3-stage interview system that makes gathering project requirements more intuitive and efficient.

## 3-Stage Interview Process

### Stage 1: Core Questions (5-7 essentials)
Essential questions to establish the project foundation. These are the minimum required to get started.

**Questions include:**
- Project name and version
- Problem statement and solution
- Deployment model and cloud provider
- Authentication methods
- PII handling

### Stage 2: Review & Edit
Review all your answers before continuing. You can edit any answer at this stage.

**Features:**
- View all collected answers
- Edit any answer by entering its number
- See auto-recommended complexity level
- Decide whether to continue to deep dive

### Stage 3: Deep Dive (Optional)
Detailed questions organized by topic. You can skip entire sections if they're not relevant.

**Topics include:**
- Security & Compliance
- Operations & Monitoring
- Architecture & Scaling
- Privacy Controls
- And more...

## Command Line Options

### Basic Usage

```bash
# Interactive mode - Full 3-stage interview
node cli.js

# Show help
node cli.js --help
```

### Non-Interactive Mode

Load answers from a JSON file and generate TDD without any prompts:

```bash
# Load from file
node cli.js --noninteractive examples/sample_answers.json

# Legacy flag (still supported)
node cli.js --file examples/sample_answers.json
```

### Filtering Options

#### Filter by Tags

Only ask deep dive questions related to specific topics:

```bash
# Focus on security and privacy
node cli.js --tags security,privacy

# Focus on operations
node cli.js --tags operations
```

**Available Tags:**
- `foundation` - Project basics and setup
- `architecture` - System architecture and design
- `security` - Security controls and compliance
- `operations` - Operational concerns and monitoring
- `privacy` - Data privacy and protection

#### Set Complexity Level

Manually set the complexity level for deep dive questions:

```bash
# Enterprise level (most comprehensive)
node cli.js --complexity enterprise

# Standard level (balanced)
node cli.js --complexity standard

# Auto-recommend based on answers (default)
node cli.js --complexity auto
```

**Complexity Levels:**
- `base` - Basic project (~4 questions)
- `minimal` - Simple project (~10 questions)
- `standard` - Typical project (~20 questions)
- `comprehensive` - Complex project (~35 questions)
- `enterprise` - Enterprise-grade (~48+ questions)

### PDF Export

Generate a PDF version of the TDD:

```bash
# Interactive mode with PDF
node cli.js --pdf

# Non-interactive with PDF
node cli.js --noninteractive examples/sample_answers.json --pdf
```

### Combined Options

You can combine multiple options:

```bash
# Non-interactive, filter by security, set enterprise complexity, export PDF
node cli.js --noninteractive examples/sample_answers.json --tags security,privacy --complexity enterprise --pdf

# Interactive, filter operations, export PDF
node cli.js --tags operations --pdf
```

## Interactive Features

### Help Toggle - "Why We Ask" (?)

While answering questions, type `?` to see:
- **Why we ask**: Explanation of why this information is important
- **Examples**: Real-world examples of good answers

```
[1/7] What is the official name for this project?
  💡 Keep it concise and memorable.
  Type '?' for help on why we ask this question

  Your answer: ?

Why We Ask:
  A clear project name helps stakeholders identify and discuss the project,
  appears in documentation, and is used for file naming and repository organization.

Examples:
  1. Customer Portal v2
  2. Payment Gateway
  3. Analytics Dashboard
  4. Mobile App Backend
```

### Edit Answers in Review Stage

During Stage 2 (Review), you can edit any answer:

```
Your answers so far:

  1. What is the TDD version?
     → 1.0

  2. What is the official name for this project?
     → E-Commerce Platform

  3. In one or two sentences, what is the core problem this project solves?
     → Small businesses lack affordable platforms...

Would you like to edit any answers? (Enter question number, or 'no' to continue): 2

Editing: What is the official name for this project?
Current answer: E-Commerce Platform

  Your answer: Advanced E-Commerce Platform
✓ Answer updated!
```

### Skip Sections in Deep Dive

During Stage 3 (Deep Dive), you can skip entire sections:

```
━━━ Security & Compliance ━━━
Security controls and compliance requirements
5 question(s) in this section

Do you want to answer questions in this section? (y/n): n
⊘ Skipping Security & Compliance section
```

## Creating Answer Files

To use `--noninteractive` mode, create a JSON file with your answers:

```json
{
  "doc.version": "1.0",
  "project.name": "My Project",
  "summary.problem": "Users struggle to...",
  "summary.solution": "Build a platform that...",
  "deployment.model": "cloud",
  "cloud.provider": "aws",
  "security.auth": ["oauth2", "mfa"],
  "privacy.pii": true
}
```

**Note:** Field IDs must match the schema. See `schemas/Pre-TDD_Client_Questionnaire_v2.0.json` for all available fields.

## Output

Generated files are saved to the `output/` directory:

```
output/
├── my_project_tdd.md      # Markdown TDD
└── my_project_tdd.pdf     # PDF (if --pdf flag used)
```

## Examples

### Example 1: Quick Start (Interactive)

```bash
node cli.js
```

Follow the prompts through all three stages.

### Example 2: Pre-filled Answers (Non-Interactive)

```bash
node cli.js --noninteractive examples/sample_answers.json --pdf
```

Generate TDD from pre-filled answers and export to PDF.

### Example 3: Security-Focused Deep Dive

```bash
node cli.js --tags security,privacy --complexity enterprise
```

Interactive mode focusing on security and privacy questions at enterprise level.

### Example 4: Quick MVP (Minimal Complexity)

```bash
node cli.js --complexity minimal
```

Interactive mode with fewer questions, suitable for MVPs and prototypes.

## Tips & Best Practices

1. **Start Interactive**: Use interactive mode the first time to understand the questions
2. **Save Time Later**: Export your answers and reuse them with `--noninteractive`
3. **Use Help**: Don't hesitate to type `?` to see examples and explanations
4. **Skip Irrelevant**: Skip entire sections in deep dive that don't apply to your project
5. **Review Carefully**: Take time in Stage 2 to ensure all answers are accurate
6. **Filter Wisely**: Use `--tags` to focus on what matters most for your project
7. **Auto Complexity**: Let the system recommend complexity based on your answers

## Troubleshooting

### Missing Fields Warning

If you see "Missing required information" in non-interactive mode:
- The system will still generate a TDD with "Not Provided" for missing fields
- You can fill in missing information later by editing the output
- Or, run interactive mode to be prompted for missing fields

### Question Not Appearing

Some questions only appear based on previous answers (conditional logic):
- For example, cloud provider questions only appear if deployment model is "cloud"
- PII-related questions only appear if you answer "yes" to handling PII

### Complexity Too High/Low

The auto-recommended complexity is based on your answers:
- Answering "yes" to PII, compliance, multi-region increases complexity
- Use `--complexity` flag to override if needed

## Schema Reference

All questions are defined in:
```
schemas/Pre-TDD_Client_Questionnaire_v2.0.json
```

Tag metadata and complexity levels are in:
```
schemas/Universal_Tag_Schema_v1.1.json
```

## Support

For issues or questions:
1. Check `README.md` for project overview
2. Review `CONTEXT.md` for architecture details
3. See examples in `tests/` directory
4. Run `node cli.js --help` for quick reference

