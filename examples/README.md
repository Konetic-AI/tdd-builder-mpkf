# TDD Builder Examples

This directory contains example scripts and demos for the TDD Builder MPKF tool.

## Available Examples

### 1. Tag-Based Question Filtering Demo

**File**: `tag-router-demo.js`

Demonstrates the tag-based filtering functionality that intelligently filters questions based on selected tags and conditional logic.

**Features Demonstrated**:
- Filtering by single tag (operations)
- Filtering by multiple tags (operations + architecture)
- On-premise deployment skipping cloud questions
- Security tag with PII handling
- Performance benchmarking

**Run**:
```bash
# Ensure TypeScript is compiled first
npm run build

# Run the demo
node examples/tag-router-demo.js
```

**Expected Output**:
```
═══════════════════════════════════════════════════════════
  Tag-Based Question Filtering Demo
═══════════════════════════════════════════════════════════

Demo 1: Operations questions for on-premise deployment
✓ Cloud questions skipped
✓ On-premise questions included
✓ Foundation questions always included

Demo 2: Security questions with PII handling
✓ Privacy follow-ups included when PII = true

Performance: 0.007ms (target: <5ms) ✅
```

**Related Documentation**: `docs/TAG_ROUTER_IMPLEMENTATION.md`

---

### 2. Inline Help Demo

**Files**: 
- `demo_inline_help.sh` - Shell script demo
- `INLINE_HELP_EXAMPLES.md` - Documentation with examples

Demonstrates the inline help feature that provides contextual guidance for questions.

**Features Demonstrated**:
- Inline help triggered by '?' input
- "Why We Ask" explanations
- Concrete examples for each option
- Learn more links

**Run**:
```bash
./examples/demo_inline_help.sh
```

**Related Documentation**: `docs/INLINE_HELP_FEATURE.md`

---

### 3. Template Starter Demo

**File**: `demo_templates.sh`

Demonstrates the industry-specific starter templates.

**Features Demonstrated**:
- Pre-filled templates for common industries
- E-commerce starter
- Fintech starter
- Healthcare starter
- SaaS starter

**Run**:
```bash
./examples/demo_templates.sh
```

**Related Documentation**: `INDUSTRY_TEMPLATES_SUMMARY.md`

---

### 4. Validation Flow Demo

**Files**:
- `validation-demo.js` - Basic validation demo
- `validation-flow-demo.js` - Full validation flow

Demonstrates the answer validation system.

**Features Demonstrated**:
- String validation (min/max length)
- Enum validation
- Boolean validation
- Array validation
- Custom validators

**Run**:
```bash
node examples/validation-demo.js
node examples/validation-flow-demo.js
```

**Related Documentation**: 
- `examples/VALIDATION_GUIDE.md`
- `examples/VALIDATION_QUICK_REFERENCE.md`

---

## Sample Data Files

### Answer Sets

- `sample_answers.json` - Example answer sets for testing

These files can be used to test TDD generation without manual input:
```bash
node cli.js --input tests/sample_simple.json
```

---

## Quick Start

### Prerequisites
```bash
# Install dependencies
npm install

# Build TypeScript files
npm run build
```

### Running All Demos
```bash
# Tag router demo
node examples/tag-router-demo.js

# Inline help demo
./examples/demo_inline_help.sh

# Template demo
./examples/demo_templates.sh

# Validation demos
node examples/validation-demo.js
node examples/validation-flow-demo.js
```

---

## Creating Your Own Examples

### Structure
```javascript
#!/usr/bin/env node

/**
 * Your Demo Name
 * Description of what this demo shows
 */

// Import required modules
const { yourFunction } = require('../dist/src/lib/yourModule');

// Set up demo data
const demoData = { ... };

// Run demo scenarios
console.log('Demo Scenario 1...');
const result = yourFunction(demoData);
console.log('Result:', result);

// Show results
console.log('✅ Demo complete');
```

### Best Practices
1. **Clear Output**: Use visual separators and emojis
2. **Explanations**: Explain what each demo shows
3. **Performance**: Include timing information where relevant
4. **Error Handling**: Show both success and failure cases
5. **Documentation**: Link to related docs

---

## Documentation Cross-Reference

| Example | Documentation |
|---------|---------------|
| tag-router-demo.js | docs/TAG_ROUTER_IMPLEMENTATION.md |
| demo_inline_help.sh | docs/INLINE_HELP_FEATURE.md |
| demo_templates.sh | INDUSTRY_TEMPLATES_SUMMARY.md |
| validation-demo.js | examples/VALIDATION_GUIDE.md |

---

## Contributing Examples

When adding a new example:

1. **Create the example file** in `examples/`
2. **Make it executable** (if shell script): `chmod +x examples/your-demo.sh`
3. **Add to this README** in the appropriate section
4. **Test it works**: Run from project root
5. **Add documentation**: Create or update related docs
6. **Update cross-reference table** at the bottom

---

## Troubleshooting

### "Module not found" errors
```bash
# Rebuild TypeScript
npm run build
```

### "Permission denied" for shell scripts
```bash
# Make executable
chmod +x examples/demo_inline_help.sh
```

### Demo shows old behavior
```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

---

## Performance Testing

Most demos include performance benchmarks. Typical results:

| Feature | Expected Performance | Typical Result |
|---------|---------------------|----------------|
| Tag Filtering | <5ms | ~0.005ms ✅ |
| Question Validation | <1ms | ~0.1ms ✅ |
| Schema Loading | <100ms | ~50ms ✅ |
| TDD Generation | <500ms | ~250ms ✅ |

---

## Support

For issues or questions about examples:
1. Check the related documentation
2. Review the example code
3. Run with verbose output
4. Check the test suite for similar scenarios

---

---

### 5. Enhanced Features Demo (NEW!)

**File**: `enhanced-features-demo.sh`

A comprehensive demonstration of the latest enhancements to TDD Builder MPKF.

**Features Demonstrated**:
- **Enhanced Help System**: "Why we ask" explanations for all questions
- **Realistic Examples**: 2-3 examples for all dropdown/multi-select fields
- **Noninteractive Import/Export**: Save and load interview answers
- **Privacy-Safe Analytics**: Opt-in telemetry with anonymized metrics

**Run**:
```bash
./examples/enhanced-features-demo.sh
```

**What You'll See**:
```
✓ Complete overview of all 4 new features
✓ Usage examples and CLI commands
✓ Privacy guarantees for telemetry
✓ Complete workflow examples
```

**Try It Yourself**:
```bash
# Enable telemetry to see analytics
export ONBOARDING_TELEMETRY=1
export SCHEMA_DRIVEN_ONBOARDING=true

# Start with template and export answers
node cli.js --template saas --export-answers ./test-answers.json

# Load saved answers and regenerate
node cli.js --answers ./test-answers.json --complexity enterprise --pdf

# View telemetry data
cat .telemetry/aggregate-stats.json
```

**Related Documentation**: 
- `ENHANCED_FEATURES_SUMMARY.md` - Complete feature documentation
- `docs/INLINE_HELP_FEATURE.md` - Help system details

---

**Last Updated**: October 7, 2025
**Total Examples**: 5 demos + validation examples
**Test Coverage**: All examples tested and working ✅

