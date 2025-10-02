# MPKF Mapping Document

## Overview

This document provides the mapping between MPKF (Master Project Knowledge File) framework components and their corresponding implementations in the TDD Builder system.

## Framework Components

### 1. Pre-TDD Client Questionnaire v2.0
- **Purpose**: Validates project data completeness before TDD generation
- **Implementation**: `validateProjectData()` function in `handlers/generate_tdd.js`
- **Complexity Levels**: Simple (4 fields), Startup (26 fields), Enterprise (48+ fields), MCP-Specific (51+ fields)

### 2. Universal Enterprise-Grade TDD Template v5.0
- **Purpose**: Standardized template for all TDD generation
- **Implementation**: `templates/tdd_v5.0.md`
- **Features**: 9-stage structure with variable placeholders using `{{variable}}` syntax

### 3. Adaptive Complexity Model
- **Purpose**: Determines required fields based on project complexity
- **Implementation**: `getMpkfRequirements()` function in `handlers/generate_tdd.js`
- **Rules**: Field requirements scale with complexity level

### 4. Self-Audit Requirements
- **Purpose**: Ensures compliance and completeness
- **Implementation**: MPKF Compliance Report and Completeness Report sections
- **Validation**: Orphan variables, required sections, diagram generation, document structure

### 5. Phoenix and Iris Gem Schemas
- **Purpose**: Downstream compatibility for enterprise systems
- **Implementation**: Structured output format compatible with enterprise schemas
- **Validation**: Document structure maintains compatibility

### 6. MCP Protocol Compliance
- **Purpose**: AI/LLM tool integration standards
- **Implementation**: MCP-specific fields in Stage 5.3
- **Requirements**: Protocol compliance, sandboxing model, permission model

## Validation Flow

1. **Input Validation**: Type checking and required field validation
2. **MPKF Interrogation**: Load authoritative documents and requirements
3. **Pre-TDD Gating**: Generate questions for missing data
4. **Template Population**: Fill template with validated data
5. **Self-Audit**: Generate compliance and completeness reports
6. **Output Generation**: Produce final TDD with audit trails

## Compliance Standards

- **Pre-TDD Gating**: ✅ Passed - Input validated against MPKF questionnaire schema
- **Template Population**: ✅ Passed - Uses authoritative Universal template
- **Complexity Adherence**: ✅ Passed - Applied complexity rules per Adaptive Model
- **Downstream Compatibility**: ✅ Passed - Structured for Phoenix/Iris schemas
- **Self-Audit Executed**: ✅ Passed - Automated compliance reporting
- **MCP Section Handling**: ✅ Passed - MCP-specific fields populated (where applicable)

## Field Mapping

### Simple Complexity (4 fields)
- `project.name`
- `summary.problem`
- `summary.solution`
- `architecture.tech_stack`

### Startup Complexity (26 fields)
- All Simple fields plus MVP-focused requirements
- Business goals, scope definition, personas
- Technical constraints, deployment strategy
- Risk management, implementation roadmap

### Enterprise Complexity (48+ fields)
- All Startup fields plus enterprise requirements
- Full security architecture, privacy controls
- Operations strategy, disaster recovery
- Comprehensive risk assessment

### MCP-Specific Complexity (51+ fields)
- All Enterprise fields plus MCP protocol requirements
- MCP protocol compliance specifications
- Tool sandboxing and permission models
- AI/LLM integration standards

## References

- MPKF_Consolidated_MASTER.md
- Universal_Enterprise_Grade_TDD_Template_v5.0.md
- Deep_Research_Addendum.md
- Pre-TDD Client Questionnaire v2.0
