# Schema-Driven Onboarding Library

This library provides a flexible, schema-driven approach to client onboarding for the TDD Builder. It includes questionnaire management, validation, conditional logic, and complexity analysis.

## Directory Structure

```
schemas/
  ├── Pre-TDD_Client_Questionnaire_v2.0.json  # Question definitions
  └── Universal_Tag_Schema_v1.1.json          # Tag metadata and relationships

src/lib/
  ├── schemaLoader.ts       # Schema loading utilities
  ├── validateAnswer.ts     # Answer validation with ajv
  ├── rulesEngine.ts        # Conditional logic evaluation
  ├── tagRouter.ts          # Tag filtering and routing
  ├── complexity.ts         # Complexity analysis and recommendations
  └── README.md            # This file

templates/industries/
  └── (future industry-specific templates)
```

## Core Modules

### 1. Schema Loader (`schemaLoader.ts`)

Loads and manages JSON schemas for questionnaires and tags.

```typescript
import { loadQuestionnaireSchema, loadTagSchema, getQuestionById } from './lib/schemaLoader';

// Load schemas
const questionnaireSchema = loadQuestionnaireSchema();
const tagSchema = loadTagSchema();

// Find a specific question
const question = getQuestionById(questionnaireSchema, 'project.name');

// Get questions by stage or tag
const coreQuestions = getQuestionsByStage(questionnaireSchema, 'core');
const securityQuestions = getQuestionsByTag(questionnaireSchema, 'security');
```

**Key Functions:**
- `loadQuestionnaireSchema()` - Load questionnaire schema
- `loadTagSchema()` - Load tag schema
- `getQuestionById(schema, id)` - Find question by ID
- `getQuestionsByStage(schema, stage)` - Get questions for a stage
- `getQuestionsByTag(schema, tag)` - Get questions with a tag

### 2. Answer Validation (`validateAnswer.ts`)

Validates answers against question schemas using ajv.

```typescript
import { validateAnswer, validateAnswers } from './lib/validateAnswer';

// Validate a single answer
const result = validateAnswer(question, userAnswer);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}

// Validate multiple answers
const results = validateAnswers(questions, answers);
const allValid = Object.values(results).every(r => r.valid);
```

**Supported Validation Types:**
- String (with minLength, maxLength, pattern)
- Number/Integer (with min, max)
- Boolean
- Array (with minItems, maxItems)
- Enum (predefined options)

### 3. Rules Engine (`rulesEngine.ts`)

Evaluates conditional logic for question visibility and triggers.

```typescript
import { shouldSkipQuestion, getTriggeredQuestions, filterQuestions } from './lib/rulesEngine';

// Check if a question should be skipped
const skip = shouldSkipQuestion(question.skip_if, currentAnswers);

// Get questions triggered by an answer
const triggered = getTriggeredQuestions(question, answer);

// Filter questions based on current answers
const visibleQuestions = filterQuestions(allQuestions, currentAnswers);
```

**Supported Conditions:**
- `field == 'value'` - Equality check
- `field != 'value'` - Inequality check
- `condition1 && condition2` - Logical AND
- `condition1 || condition2` - Logical OR

**Example skip_if conditions:**
```json
"skip_if": "deployment.model != 'cloud'"
"skip_if": "privacy.pii != true"
"skip_if": "deployment.model != 'cloud' && deployment.model != 'hybrid'"
```

### 4. Tag Router (`tagRouter.ts`)

Manages question filtering and routing based on tags.

```typescript
import { getQuestionsByTag, getFieldMetadata, filterQuestions } from './lib/tagRouter';

// Get questions by tag
const securityQuestions = getQuestionsByTag(schema, 'security');

// Get field metadata
const metadata = getFieldMetadata(tagSchema, 'security.auth');
const relatedFields = metadata.related_fields;
const weight = metadata.weight;

// Filter questions by multiple criteria
const filtered = filterQuestions(schema, tagSchema, {
  tags: ['security', 'privacy'],
  stage: 'core',
  complexityLevel: 'enterprise'
});
```

**Available Tags:**
- `foundation` - Project basics
- `architecture` - Architecture & design
- `security` - Security & compliance
- `operations` - Operations & SRE
- `privacy` - Privacy & data protection

### 5. Complexity Analysis (`complexity.ts`)

Recommends complexity levels based on project requirements.

```typescript
import { recommendLevel, analyzeComplexity } from './lib/complexity';

// Get recommended complexity level
const level = recommendLevel(answers, tagSchema);
// Returns: 'base' | 'minimal' | 'standard' | 'comprehensive' | 'enterprise'

// Get full complexity analysis
const analysis = analyzeComplexity(answers, tagSchema);
console.log(analysis);
// {
//   recommendedLevel: 'comprehensive',
//   riskFactors: { handlesPII: true, requiresCompliance: true, ... },
//   score: 35,
//   questionCount: 35,
//   description: 'Complex project with extensive requirements (~35 questions)'
// }
```

**Complexity Levels:**
- **base** (4 questions) - Basic projects
- **minimal** (10 questions) - Simple projects
- **standard** (20 questions) - Typical projects
- **comprehensive** (35 questions) - Complex projects
- **enterprise** (48+ questions) - Enterprise-grade projects

**Risk Factors Detected:**
- PII handling
- Compliance requirements (GDPR, HIPAA, etc.)
- Multi-region deployment
- Payment processing (PCI-DSS)
- High availability requirements
- Large scale
- Multi-tenant architecture

## Question Schema Format

```json
{
  "id": "project.name",
  "stage": "core",
  "type": "text",
  "question": "What is your project name?",
  "hint": "Keep it concise and memorable.",
  "validation": { 
    "type": "string", 
    "minLength": 3,
    "maxLength": 100
  },
  "tags": ["foundation"],
  "skip_if": null,
  "triggers": {
    "value": ["triggered.question.id"]
  }
}
```

**Question Types:**
- `text` - Single-line text input
- `textarea` - Multi-line text input
- `select` - Single selection
- `multi-select` - Multiple selections
- `boolean` - Yes/No

## Tag Schema Format

```json
{
  "version": "1.1",
  "tags": {
    "security": { 
      "label": "Security & Compliance",
      "description": "Security controls and compliance requirements"
    }
  },
  "field_metadata": {
    "security.auth": {
      "tags": ["security"],
      "related_fields": ["security.controls", "privacy.controls"],
      "complexity_levels": ["standard", "comprehensive", "enterprise"],
      "weight": 2
    }
  }
}
```

## Testing

All modules have comprehensive unit tests using Jest.

```bash
# Run all library tests
npx jest src/lib

# Run specific test file
npx jest src/lib/schemaLoader.test.ts

# Run with coverage
npx jest src/lib --coverage
```

## TypeScript Support

All modules are written in TypeScript with full type definitions.

```bash
# Type-check without emitting files
npx tsc --noEmit

# Build TypeScript files
npx tsc
```

## Example Workflow

```typescript
import {
  loadQuestionnaireSchema,
  loadTagSchema,
  getQuestionsByStage,
  filterQuestions,
  validateAnswer,
  shouldSkipQuestion,
  getTriggeredQuestions,
  recommendLevel
} from './lib';

// 1. Load schemas
const questionnaireSchema = loadQuestionnaireSchema();
const tagSchema = loadTagSchema();

// 2. Get initial questions for 'core' stage
let currentStage = 'core';
let answers = {};
let availableQuestions = getQuestionsByStage(questionnaireSchema, currentStage);

// 3. Filter based on current answers
availableQuestions = filterQuestions(availableQuestions, answers);

// 4. Present question to user and validate answer
const question = availableQuestions[0];
const userAnswer = getUserInput(); // Your input logic

const validation = validateAnswer(question, userAnswer);
if (validation.valid) {
  answers[question.id] = userAnswer;
  
  // 5. Check for triggered questions
  const triggered = getTriggeredQuestions(question, userAnswer);
  // Add triggered questions to queue...
} else {
  console.error('Validation errors:', validation.errors);
}

// 6. After collecting answers, recommend complexity level
const recommendedLevel = recommendLevel(answers, tagSchema);
console.log(`Recommended complexity: ${recommendedLevel}`);
```

## Future Enhancements

- Industry-specific question templates
- Multi-language support
- Answer persistence/resume
- Question dependency graph visualization
- AI-assisted answer suggestions
- Export/import answer sets

## Contributing

When adding new questions:
1. Add question definition to `schemas/Pre-TDD_Client_Questionnaire_v2.0.json`
2. Add field metadata to `schemas/Universal_Tag_Schema_v1.1.json`
3. Update complexity weights if needed in `complexity.ts`
4. Add tests for new validation rules or conditional logic

## License

MIT

