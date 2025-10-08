# Rules Engine Guide

## Overview

The Rules Engine provides powerful conditional logic for questions in the TDD Builder. It supports:

1. **`skip_if` expressions** - Conditionally skip questions based on previous answers
2. **`triggers` mappings** - Dynamically activate follow-up questions based on answer values

## Exported Functions

### `evaluateSkip(question, answers): boolean`

Evaluates whether a question should be skipped based on its `skip_if` condition.

**Parameters:**
- `question`: Question object with optional `skip_if` property
- `answers`: Map of current answers (key: question ID, value: answer)

**Returns:**
- `true` if question should be skipped
- `false` if question should be shown

**Example:**
```typescript
import { evaluateSkip } from './rulesEngine';

const question = {
  id: 'cloud.provider',
  skip_if: { neq: ['deployment.model', 'cloud'] }
};

const answers = { 'deployment.model': 'on-premise' };

if (evaluateSkip(question, answers)) {
  // Skip this question
}
```

### `expandTriggers(question, answer, registry): Question[]`

Expands triggers by looking up the triggered question IDs and returning the actual Question objects.

**Parameters:**
- `question`: Question that was just answered
- `answer`: The answer value provided
- `registry`: QuestionRegistry (Map<string, Question>) containing all questions

**Returns:**
- Array of Question objects that should be activated

**Example:**
```typescript
import { expandTriggers, QuestionRegistry } from './rulesEngine';

const deploymentQuestion = {
  id: 'deployment.model',
  triggers: {
    'cloud': ['cloud.provider', 'cloud.regions'],
    'on-premise': ['datacenter.location']
  }
};

const registry: QuestionRegistry = new Map([
  ['cloud.provider', cloudProviderQuestion],
  ['cloud.regions', cloudRegionsQuestion],
  ['datacenter.location', datacenterQuestion]
]);

const triggeredQuestions = expandTriggers(
  deploymentQuestion,
  'cloud',
  registry
);
// Returns: [cloudProviderQuestion, cloudRegionsQuestion]
```

## Expression Types

### Basic Expressions

#### `eq` - Equality Check
Tests if a field equals a specific value.

**JSON Format:**
```json
{
  "skip_if": { "eq": ["deployment.model", "on-premise"] }
}
```

**Behavior:**
- Skips question if `deployment.model === "on-premise"`

#### `neq` - Not Equal Check
Tests if a field does NOT equal a specific value.

**JSON Format:**
```json
{
  "skip_if": { "neq": ["deployment.model", "cloud"] }
}
```

**Behavior:**
- Skips question if `deployment.model !== "cloud"`

#### `has` - Array Contains Check
Tests if an array field contains a specific value.

**JSON Format:**
```json
{
  "skip_if": { "has": ["security.data_types", "PII"] }
}
```

**Behavior:**
- Skips question if `security.data_types` array includes "PII"
- Returns false if field is not an array

### Logical Operators

#### `not` - Logical Negation
Negates the result of an expression.

**JSON Format:**
```json
{
  "skip_if": {
    "not": { "has": ["security.data_types", "PII"] }
  }
}
```

**Behavior:**
- Skips question if `security.data_types` does NOT contain "PII"

#### `and` - Logical AND
Requires all sub-expressions to be true.

**JSON Format:**
```json
{
  "skip_if": {
    "and": [
      { "eq": ["deployment.model", "cloud"] },
      { "eq": ["cloud.provider", "aws"] }
    ]
  }
}
```

**Behavior:**
- Skips question only if deployment is cloud AND provider is AWS

#### `or` - Logical OR
Requires at least one sub-expression to be true.

**JSON Format:**
```json
{
  "skip_if": {
    "or": [
      { "eq": ["deployment.model", "on-premise"] },
      { "eq": ["deployment.model", "hybrid"] }
    ]
  }
}
```

**Behavior:**
- Skips question if deployment is on-premise OR hybrid

### Complex Nested Expressions

You can nest expressions for complex logic:

```json
{
  "skip_if": {
    "not": {
      "and": [
        { "eq": ["deployment.model", "cloud"] },
        { "has": ["security.data_types", "PII"] }
      ]
    }
  }
}
```

**Behavior:**
- Shows question ONLY if deployment is cloud AND handles PII
- Skips in all other cases

## Legacy String Format (Backwards Compatible)

The rules engine still supports the legacy string-based format:

```json
{
  "skip_if": "deployment.model != 'cloud'"
}
```

**Supported Operators:**
- `==` - Equality
- `!=` - Not equal
- `&&` - Logical AND
- `||` - Logical OR

**Examples:**
```json
// Simple equality
"skip_if": "privacy.pii == true"

// Logical AND
"skip_if": "deployment.model == 'cloud' && privacy.pii == true"

// Logical OR
"skip_if": "deployment.model == 'on-premise' || deployment.model == 'hybrid'"
```

## Triggers

Triggers define follow-up questions that should be activated based on the answer value.

**Schema Format:**
```json
{
  "id": "deployment.model",
  "type": "select",
  "question": "Where will this be deployed?",
  "triggers": {
    "cloud": ["cloud.provider", "cloud.regions"],
    "on-premise": ["datacenter.location"],
    "hybrid": ["cloud.provider", "datacenter.location"]
  }
}
```

**Behavior:**
- If user selects "cloud" → activate `cloud.provider` and `cloud.regions`
- If user selects "on-premise" → activate `datacenter.location`
- If user selects "hybrid" → activate `cloud.provider` and `datacenter.location`

## Complete Example: Cloud vs On-Premise Flow

```typescript
import { 
  evaluateSkip, 
  expandTriggers, 
  filterQuestions,
  QuestionRegistry 
} from './rulesEngine';

// Define questions
const deploymentQuestion = {
  id: 'deployment.model',
  stage: 'core',
  type: 'select',
  question: 'Where will this be deployed?',
  validation: { enum: ['cloud', 'on-premise'] },
  tags: ['architecture'],
  triggers: {
    'cloud': ['cloud.provider', 'cloud.regions'],
    'on-premise': ['datacenter.location']
  }
};

const cloudProviderQuestion = {
  id: 'cloud.provider',
  stage: 'core',
  type: 'select',
  question: 'Which cloud provider?',
  validation: { enum: ['aws', 'azure', 'gcp'] },
  tags: ['architecture'],
  skip_if: { neq: ['deployment.model', 'cloud'] }
};

const cloudRegionsQuestion = {
  id: 'cloud.regions',
  stage: 'core',
  type: 'multi-select',
  question: 'Which regions?',
  validation: { type: 'array' },
  tags: ['architecture'],
  skip_if: { neq: ['deployment.model', 'cloud'] }
};

const datacenterQuestion = {
  id: 'datacenter.location',
  stage: 'core',
  type: 'text',
  question: 'Datacenter location?',
  validation: { type: 'string' },
  tags: ['architecture'],
  skip_if: { neq: ['deployment.model', 'on-premise'] }
};

// Create registry
const registry: QuestionRegistry = new Map([
  ['deployment.model', deploymentQuestion],
  ['cloud.provider', cloudProviderQuestion],
  ['cloud.regions', cloudRegionsQuestion],
  ['datacenter.location', datacenterQuestion]
]);

// Scenario 1: User selects "cloud"
const answersCloud = { 'deployment.model': 'cloud' };

// Get triggered questions
const triggeredCloud = expandTriggers(
  deploymentQuestion,
  'cloud',
  registry
);
console.log(triggeredCloud.map(q => q.id));
// Output: ['cloud.provider', 'cloud.regions']

// Filter all questions based on current answers
const allQuestions = [
  deploymentQuestion,
  cloudProviderQuestion,
  cloudRegionsQuestion,
  datacenterQuestion
];

const visibleCloud = filterQuestions(allQuestions, answersCloud);
console.log(visibleCloud.map(q => q.id));
// Output: ['deployment.model', 'cloud.provider', 'cloud.regions']
// Note: datacenter.location is filtered out

// Scenario 2: User selects "on-premise"
const answersOnPrem = { 'deployment.model': 'on-premise' };

const triggeredOnPrem = expandTriggers(
  deploymentQuestion,
  'on-premise',
  registry
);
console.log(triggeredOnPrem.map(q => q.id));
// Output: ['datacenter.location']

const visibleOnPrem = filterQuestions(allQuestions, answersOnPrem);
console.log(visibleOnPrem.map(q => q.id));
// Output: ['deployment.model', 'datacenter.location']
// Note: cloud.provider and cloud.regions are filtered out
```

## Helper Functions

### `filterQuestions(questions, answers): Question[]`

Filters an array of questions based on their `skip_if` conditions.

**Example:**
```typescript
import { filterQuestions } from './rulesEngine';

const answers = { 'deployment.model': 'cloud' };
const visible = filterQuestions(allQuestions, answers);
// Returns only questions that should be shown
```

### `getNextQuestions(questions, answers, currentStage): Question[]`

Gets the next unanswered questions for a specific stage.

**Example:**
```typescript
import { getNextQuestions } from './rulesEngine';

const answers = { 'project.name': 'My Project' };
const nextQuestions = getNextQuestions(allQuestions, answers, 'core');
// Returns unanswered core-stage questions
```

## Type Definitions

```typescript
// Expression type
export type Expression =
  | { eq: [string, any] }
  | { neq: [string, any] }
  | { has: [string, any] }
  | { not: Expression }
  | { and: Expression[] }
  | { or: Expression[] }
  | string; // Legacy format

// Answer map type
export type AnswerMap = Record<string, any>;

// Question registry type
export type QuestionRegistry = Map<string, Question>;
```

## Testing

The rules engine includes comprehensive tests covering:
- Basic expressions (eq, neq, has)
- Logical operators (not, and, or)
- Complex nested expressions
- Legacy string format support
- Trigger expansion
- Question filtering
- Integration tests for cloud vs on-premise flows

Run tests with:
```bash
npm test src/lib/rulesEngine.test.ts
```

## Migration from Legacy Format

If you have existing questions using the string format:

**Old Format:**
```json
{
  "skip_if": "deployment.model != 'cloud'"
}
```

**New Format (recommended):**
```json
{
  "skip_if": { "neq": ["deployment.model", "cloud"] }
}
```

Both formats work, but the JSON format is:
- More explicit and self-documenting
- Easier to validate and parse
- Supports more complex expressions
- Less prone to string parsing errors

