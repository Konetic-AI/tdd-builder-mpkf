# Quick Start: Schema-Driven Onboarding

**⚡ 5-Minute Setup Guide for TDD Builder v2.0**

---

## Prerequisites

- Node.js >= 18
- Git repository cloned
- Terminal access

---

## Setup (One-Time)

```bash
# 1. Install dependencies
npm install

# 2. Compile TypeScript modules
npm run build

# 3. Enable schema-driven mode
export SCHEMA_DRIVEN_ONBOARDING=true

# 4. (Optional) Enable telemetry
export ONBOARDING_TELEMETRY=1

# 5. Verify setup
node cli.js --help
```

**Expected output:** Should show `[Schema-Driven Mode]` in banner.

---

## Quick Usage Examples

### 🎯 Interactive Mode (Full Interview)

```bash
node cli.js
```

**What happens:**
- Stage 1: Core Questions (5-7 questions)
- Stage 2: Review & Edit
- Stage 3: Deep Dive (topic-based, skip sections as needed)

---

### 📋 Industry Template Starter

```bash
node cli.js --template saas
```

**Available templates:** `saas`, `healthcare`, `fintech`, `ecommerce`

Pre-fills 35-45 default answers based on industry best practices.

---

### 📄 Non-Interactive Mode (From File)

```bash
node cli.js --answers tests/sample_mcp.json
```

Loads answers from JSON, skips interview, generates TDD immediately.

---

### 💾 Save & Reuse Answers

```bash
# First interview: save answers
node cli.js --export-answers my-project.json

# Later: reuse answers
node cli.js --answers my-project.json
```

---

### 📊 Auto-Complexity Recommendation

```bash
node cli.js --complexity auto
```

Analyzes risk factors (PII, compliance, scale) and recommends appropriate complexity level.

---

### 🔍 Filter by Tags (Security Focus)

```bash
node cli.js --tags security,privacy --complexity comprehensive
```

Deep dive stage only shows questions tagged with `security` or `privacy`.

---

### 📑 Export to PDF

```bash
node cli.js --pdf
```

Generates both markdown and PDF versions of the TDD.

---

### 🚀 Complete Workflow

```bash
node cli.js \
  --template fintech \
  --complexity auto \
  --export-answers fintech-config.json \
  --pdf
```

**Does everything:**
1. ✅ Loads fintech template
2. ✅ Runs 3-stage interview
3. ✅ Auto-recommends complexity
4. ✅ Exports answers for reuse
5. ✅ Generates markdown + PDF

---

## Feature Flags

### Enable Schema-Driven Mode

```bash
# Temporary (current session)
export SCHEMA_DRIVEN_ONBOARDING=true

# Permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export SCHEMA_DRIVEN_ONBOARDING=true' >> ~/.bashrc
source ~/.bashrc
```

### Enable Telemetry (Privacy-Safe)

```bash
export ONBOARDING_TELEMETRY=1
```

**What's tracked (anonymized):**
- ⏱️ Time per stage
- 📊 Skipped sections by tag
- 🏷️ Template usage
- ✅ Completion rates

**What's NOT tracked:**
- ❌ Project names
- ❌ User identities
- ❌ Answer content

---

## Complexity Levels

| Level | Fields | Use Case |
|-------|--------|----------|
| `base` | 4 | Quick prototypes |
| `minimal` | 8-10 | Simple internal tools |
| `standard` | 15-20 | Typical SaaS apps |
| `comprehensive` | 25-35 | Complex systems |
| `enterprise` | 35-48+ | Regulated industries |

**Auto-recommendation factors:**
- PII/PHI handling
- Compliance requirements (GDPR, HIPAA, PCI-DSS)
- Multi-region deployment
- High availability (99.99%+)
- Regulated industries (healthcare, finance)

---

## Troubleshooting

### "Required TypeScript modules are not compiled"

```bash
npm run build
```

### Questions Not Showing Up

```bash
# Enable debug mode
DEBUG=* node cli.js
```

### Force Legacy Mode

```bash
node cli.js --legacy
```

---

## Available Tags

- `foundation` - Project basics
- `architecture` - System design
- `security` - Security controls
- `operations` - Monitoring, SLA
- `privacy` - Data privacy, PII
- `compliance` - Regulations
- `risks` - Risk management
- `implementation` - Delivery planning

---

## Testing

```bash
# Run all tests
npm run test:jest

# Run specific tests
npx jest src/lib/complexity.test.ts

# Build all complexity levels
npm run build:all
```

---

## Additional Resources

📚 **Full Documentation:** [SCHEMA_DRIVEN_ONBOARDING_GUIDE.md](SCHEMA_DRIVEN_ONBOARDING_GUIDE.md)  
📖 **Context:** [CONTEXT.md](CONTEXT.md)  
📋 **README:** [README.md](README.md)  
🔗 **Repository:** https://github.com/Konetic-AI/tdd-builder-mpkf

---

## Support

- **Issues:** https://github.com/Konetic-AI/tdd-builder-mpkf/issues
- **Email:** engineering@konetic.ai
- **Docs:** https://docs.mpkf.io

---

**Quick Start Version:** 1.0  
**Last Updated:** October 8, 2025  
**Copyright © 2025 Konetic-AI**

