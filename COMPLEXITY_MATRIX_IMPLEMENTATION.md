# Graduated Complexity Matrix Implementation

## Overview

This document describes the implementation of the graduated complexity matrix feature that replaces the 4 fixed complexity levels with a 5-level adaptive system with automatic recommendation.

## Implementation Date
October 7, 2025

## New Complexity Levels

The system now supports 5 graduated complexity levels:

| Level | Min Fields | Sections | Description |
|-------|-----------|----------|-------------|
| **base** | 4 | 2 | Quick prototypes and experiments |
| **minimal** | 8 | 3 | Simple projects with basic requirements |
| **standard** | 15 | 5 | Typical projects with moderate complexity |
| **comprehensive** | 25 | 7 | Complex projects with extensive requirements |
| **enterprise** | 35+ | 9 | Enterprise-grade systems with full compliance |

## Auto-Recommendation Engine

### Factors Considered

The auto-recommendation engine analyzes the following project characteristics:

1. **PII Handling** - Personal Identifiable Information (+6 points)
2. **PHI Handling** - Protected Health Information (+8 points)
3. **Payment Processing** - PCI-DSS compliance (+7 points)
4. **Multi-Region Deployment** - Geographic distribution (+5 points)
5. **Compliance Requirements** - GDPR, HIPAA, SOC 2, etc. (+8 points)
6. **Regulated Industries** - Healthcare, finance, government (+7 points)
7. **Multi-Tenant Architecture** - SaaS platforms (+5 points)
8. **High Availability** - 99.99%+ uptime (+5 points)
9. **Large Scale** - High volume systems (+6 points)

### Scoring System

```
Base score: 4 (base level threshold)

Score ranges:
- 4-9:   base level
- 10-19: minimal level
- 20-34: standard level
- 35-47: comprehensive level
- 48+:   enterprise level
```

### Stability

The auto-recommendation system provides:
- **Deterministic results**: Same inputs always produce same recommendations
- **No re-asking**: Higher complexity levels add questions without repeating core questions
- **Progressive disclosure**: Sections are revealed incrementally based on complexity

## Progressive Section Revealing

Sections are progressively revealed as complexity increases:

- **base**: foundation, summary
- **minimal**: + architecture
- **standard**: + operations, security
- **comprehensive**: + privacy, implementation
- **enterprise**: + risks, compliance

## CLI Usage

### Explicit Level

```bash
# Specify level explicitly
node cli.js --complexity base
node cli.js --complexity minimal
node cli.js --complexity standard
node cli.js --complexity comprehensive
node cli.js --complexity enterprise
```

### Auto-Recommendation (Default)

```bash
# Use automatic recommendation
node cli.js --complexity auto
# or simply
node cli.js  # auto is the default
```

### Combined with Templates

```bash
# Template with auto complexity
node cli.js --template healthcare --complexity auto

# Template with explicit complexity
node cli.js --template fintech --complexity comprehensive
```

## Implementation Details

### Files Modified

1. **src/lib/complexity.ts**
   - Added `handlesPHI` and `regulatedIndustry` to `RiskFactors`
   - Enhanced `detectRiskFactors()` to detect PHI and regulated industries
   - Updated `calculateComplexityScore()` with new risk factor weights
   - Added `getMinFieldCountForLevel()` for minimum field enforcement
   - Added `meetsMinFieldCount()` to validate field completeness
   - Added `getSectionsForLevel()` for progressive disclosure
   - Added `getTagsForLevel()` to map tags to complexity levels

2. **src/lib/complexity.test.ts**
   - Added 47 comprehensive tests covering:
     - PHI and regulated industry detection
     - Minimum field count validation
     - Progressive section revealing
     - Auto-recommendation scenarios
     - Stable recommendation behavior

3. **handlers/generate_tdd.js**
   - Added requirements for all 5 complexity levels
   - Updated `validComplexities` array to include new levels
   - Added field requirements for `base`, `minimal`, `standard`, `comprehensive`
   - Maintained backward compatibility with legacy levels
   - Updated section count map for audit reports

4. **cli.js**
   - Added validation for complexity parameter
   - Enhanced help text with graduated complexity matrix explanation
   - Added auto-recommendation factor documentation
   - Improved usage examples

5. **schemas/Universal_Tag_Schema_v1.1.json**
   - Added `compliance`, `risks`, and `implementation` tags
   - Added field metadata for `project.industry`
   - Added metadata for `architecture.multitenancy`
   - Added metadata for risk management fields
   - Added metadata for implementation planning fields

6. **README.md**
   - Documented graduated complexity matrix
   - Added complexity level comparison table
   - Explained auto-recommendation factors
   - Provided usage examples
   - Documented progressive disclosure behavior

## Acceptance Criteria Met

✅ **5 Complexity Levels**: Replaced 4 fixed levels with 5 graduated levels  
✅ **CLI Support**: `--complexity <level>` accepts all 5 levels and `auto`  
✅ **Auto-Recommendation**: Factors include PII/PHI, payments, compliance, multi-region, regulated industries  
✅ **Min Field Counts**: Each level enforces minimum field counts (4, 8, 15, 25, 35)  
✅ **Progressive Disclosure**: Higher levels reveal more sections without re-asking core questions  
✅ **Stable Recommendations**: Auto mode gives consistent recommendations for typical inputs  
✅ **No Re-asking**: Core questions are not repeated when complexity increases  

## Test Results

All 47 tests passing:
- ✅ Risk factor detection (PHI, regulated industries)
- ✅ Complexity score calculation
- ✅ Level recommendation logic
- ✅ Minimum field count validation
- ✅ Progressive section revealing
- ✅ Auto-recommendation scenarios
- ✅ Stable recommendation behavior

## Backward Compatibility

The implementation maintains full backward compatibility:
- Legacy complexity levels (`simple`, `startup`, `enterprise`, `mcp-specific`) still work
- Existing test files and sample data continue to function
- All existing features remain operational

## Usage Examples

### Example 1: Healthcare Project with Auto-Recommendation

```bash
node cli.js --complexity auto
```

**Input answers:**
```json
{
  "project.industry": "Healthcare",
  "privacy.pii": true,
  "privacy.regulations": ["hipaa", "hitech"],
  "cloud.regions": ["us-east-1", "us-west-2"],
  "operations.sla": "99.99"
}
```

**Result:** Recommends `comprehensive` level (score: 43)
- PHI handling: +8
- Regulated industry (healthcare): +7
- PII: +6
- Compliance (HIPAA/HITECH): +8
- Multi-region: +5
- High availability: +5
- Base: +4

### Example 2: Simple Prototype

```bash
node cli.js --complexity base
```

**Input answers:**
```json
{
  "project.name": "Quick Prototype",
  "summary.problem": "Need to test an idea",
  "summary.solution": "Build a simple web app",
  "doc.version": "0.1"
}
```

**Result:** Generates base-level TDD with 2 sections (foundation, summary)

### Example 3: FinTech with Multi-Region Payments

```bash
node cli.js --template fintech --complexity auto
```

**Input answers:**
```json
{
  "project.industry": "FinTech",
  "privacy.regulations": ["pci-dss", "gdpr", "ccpa"],
  "cloud.regions": ["us-east-1", "eu-west-1", "ap-southeast-1"],
  "architecture.scale": "large",
  "operations.sla": "99.99",
  "deployment.model": "hybrid"
}
```

**Result:** Recommends `comprehensive` level (score: 47)

## Future Enhancements

Potential future improvements:
1. Machine learning-based recommendation refinement
2. Industry-specific complexity profiles
3. Custom complexity level definitions
4. Complexity level transitions with gap analysis
5. Team size and timeline considerations in auto-recommendation

## References

- [MPKF Consolidated Master](docs/_source/MPKF_Consolidated_MASTER.md)
- [Complexity Module](src/lib/complexity.ts)
- [Complexity Tests](src/lib/complexity.test.ts)
- [CLI Guide](CLI_GUIDE.md)
- [README](README.md)

