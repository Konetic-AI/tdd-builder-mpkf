# Rules Engine - Quick Reference

## Overview
A powerful conditional logic system for dynamic questionnaires with `skip_if` expressions and `triggers`.

## Quick Start

```typescript
import { evaluateSkip, expandTriggers, QuestionRegistry } from './rulesEngine';

// Check if question should be skipped
const shouldSkip = evaluateSkip(question, answers);

// Get triggered follow-up questions
const nextQuestions = expandTriggers(question, answer, registry);
```

## Expression Syntax

### Basic Operators
| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equals | `{ "eq": ["deployment.model", "cloud"] }` |
| `neq` | Not equals | `{ "neq": ["deployment.model", "cloud"] }` |
| `has` | Array contains | `{ "has": ["security.data_types", "PII"] }` |

### Logical Operators
| Operator | Description | Example |
|----------|-------------|---------|
| `not` | Negation | `{ "not": { "eq": ["field", "value"] } }` |
| `and` | All must be true | `{ "and": [expr1, expr2] }` |
| `or` | Any must be true | `{ "or": [expr1, expr2] }` |

## Common Patterns

### Pattern 1: Show question only if field equals value
```json
{
  "id": "cloud.provider",
  "skip_if": { "neq": ["deployment.model", "cloud"] }
}
```
Shows only when `deployment.model === "cloud"`

### Pattern 2: Show question only if array contains value
```json
{
  "id": "pii.controls",
  "skip_if": { "not": { "has": ["security.data_types", "PII"] } }
}
```
Shows only when `security.data_types` includes "PII"

### Pattern 3: Show question for multiple values
```json
{
  "id": "datacenter.location",
  "skip_if": {
    "not": {
      "or": [
        { "eq": ["deployment.model", "on-premise"] },
        { "eq": ["deployment.model", "hybrid"] }
      ]
    }
  }
}
```
Shows only for on-premise OR hybrid deployment

### Pattern 4: Dynamic follow-up questions
```json
{
  "id": "deployment.model",
  "triggers": {
    "cloud": ["cloud.provider", "cloud.regions"],
    "on-premise": ["datacenter.location"]
  }
}
```
Different questions appear based on selected value

## API Reference

### `evaluateSkip(question, answers): boolean`
- **Returns:** `true` to skip question, `false` to show
- **Parameters:**
  - `question`: Question with optional `skip_if` property
  - `answers`: Current answer map `{ questionId: value }`

### `expandTriggers(question, answer, registry): Question[]`
- **Returns:** Array of triggered Question objects
- **Parameters:**
  - `question`: Question that was answered
  - `answer`: The answer value
  - `registry`: `Map<string, Question>` of all questions

### `filterQuestions(questions, answers): Question[]`
- **Returns:** Questions that should be shown (not skipped)
- **Parameters:**
  - `questions`: Array of all questions
  - `answers`: Current answer map

### `getNextQuestions(questions, answers, stage): Question[]`
- **Returns:** Unanswered questions for the stage
- **Parameters:**
  - `questions`: Array of all questions
  - `answers`: Current answer map
  - `stage`: Stage name (e.g., 'core', 'review')

## Testing

```bash
# Run rules engine tests
npx jest src/lib/rulesEngine.test.ts

# Run with coverage
npx jest src/lib/rulesEngine.test.ts --coverage
```

**Test Coverage:**
- ✅ 26 tests passing
- ✅ 79% code coverage
- ✅ All expression types tested
- ✅ Integration tests included

## Documentation

- **`RULES_ENGINE_GUIDE.md`** - Complete guide with examples
- **`RULES_ENGINE_IMPLEMENTATION.md`** - Implementation details
- **`RULES_ENGINE_README.md`** - This quick reference

## Backwards Compatibility

Legacy string format still supported:
```json
{
  "skip_if": "deployment.model != 'cloud'"
}
```

Operators: `==`, `!=`, `&&`, `||`

## Complete Example

```typescript
// Question definitions
const questions = [
  {
    id: 'deployment.model',
    triggers: {
      'cloud': ['cloud.provider', 'cloud.regions'],
      'on-premise': ['datacenter.location']
    }
  },
  {
    id: 'cloud.provider',
    skip_if: { neq: ['deployment.model', 'cloud'] }
  },
  {
    id: 'datacenter.location',
    skip_if: { neq: ['deployment.model', 'on-premise'] }
  }
];

// Create registry
const registry = new Map(questions.map(q => [q.id, q]));

// User answers "cloud"
const answers = { 'deployment.model': 'cloud' };

// Get triggered questions
const triggered = expandTriggers(
  questions[0], 
  'cloud', 
  registry
);
// Result: [cloud.provider, cloud.regions]

// Filter visible questions
const visible = filterQuestions(questions, answers);
// Result: [deployment.model, cloud.provider, cloud.regions]
// Note: datacenter.location is filtered out
```

## Need Help?

- See `RULES_ENGINE_GUIDE.md` for detailed examples
- See `RULES_ENGINE_IMPLEMENTATION.md` for technical details
- Run tests: `npx jest src/lib/rulesEngine.test.ts --verbose`

