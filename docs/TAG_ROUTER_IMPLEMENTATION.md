# Tag-Based Filtering Implementation

## Overview

This document describes the tag-based filtering feature implemented in `src/lib/tagRouter.ts`. The feature enables intelligent question filtering based on selected tags while respecting conditional logic and maintaining core requirements.

## Implementation Details

### Function: `filterQuestionsByTags`

**Location**: `src/lib/tagRouter.ts`

**Signature**:
```typescript
export function filterQuestionsByTags(
  questions: Question[],
  selectedTags: string[] | undefined,
  answers: AnswerMap
): Question[]
```

**Purpose**: Filters questions by tags with skip_if evaluation

### Algorithm

The function applies a two-stage filtering process:

#### Stage 1: Tag Filtering
- If `selectedTags` is provided and not empty:
  - Include questions that have at least one intersecting tag with `selectedTags`
  - **Always** include questions tagged with `"foundation"` (core questions)
- If `selectedTags` is undefined or empty:
  - Include all questions

#### Stage 2: Skip Condition Evaluation
- Apply `skip_if` evaluation to the tag-filtered questions
- Questions whose `skip_if` condition evaluates to `true` are filtered out
- Uses the `evaluateSkip` function from `rulesEngine.ts`

### Key Features

1. **Core Questions Always Included**: Questions tagged with "foundation" are always included in the result, regardless of selected tags
2. **Intersection Logic**: Questions with ANY of the selected tags are included (OR logic)
3. **Skip_if Respects Answers**: Conditional logic is evaluated against the current answer map
4. **Performance Optimized**: Runs in <5ms for standard flows

## Test Coverage

### Test Suite: `src/lib/tagRouter.test.ts`

The implementation includes 21 comprehensive tests organized into 5 categories:

#### 1. Basic Filtering (5 tests)
- Returns appropriate questions when no tags are selected
- Returns appropriate questions when selectedTags is empty array
- Always includes foundation-tagged questions
- Filters questions by single tag
- Filters questions by multiple tags

#### 2. Skip_if Evaluation (3 tests)
- Applies skip_if after tag filtering
- Skips privacy controls when PII is false
- Includes privacy controls when PII is true

#### 3. On-premise + Operations Test Case (3 tests)
✅ **Test Case 1**: Verifies that when `deployment.model` is "on-premise" and "operations" tag is selected:
- Cloud-specific questions (`cloud.provider`, `cloud.regions`) are **skipped**
- On-premise questions (`datacenter.location`) are **included**
- Operations questions are **included**
- Foundation questions are **included**

Also tests cloud and hybrid deployment scenarios.

#### 4. Security + Privacy Test Case (3 tests)
✅ **Test Case 2**: Verifies that when "security" tag is selected and PII is present:
- Privacy follow-up questions are **included** when `privacy.pii` is `true`
- Privacy follow-up questions are **skipped** when `privacy.pii` is `false` or undefined
- Questions with both "security" and "privacy" tags are handled correctly

#### 5. Performance Tests (2 tests)
✅ **Acceptance Criteria**: 
- Runs in **<5ms** for standard flows ✓ (measured ~0.005ms)
- Handles large datasets efficiently (140 questions in ~0.06ms)

#### 6. Edge Cases (5 tests)
- Handles empty questions array
- Handles questions with multiple tags
- Handles questions with no skip_if condition
- Handles complex skip_if conditions
- Maintains question order

## Usage Examples

### Example 1: Filter by Operations Tag

```typescript
import { filterQuestionsByTags } from './tagRouter';

const questions = loadQuestions(); // Load from schema
const selectedTags = ['operations'];
const answers = {
  'deployment.model': 'on-premise'
};

const filtered = filterQuestionsByTags(questions, selectedTags, answers);
// Result: Foundation questions + operations questions
// Cloud questions are skipped due to skip_if condition
```

### Example 2: Filter by Security Tag with PII

```typescript
const selectedTags = ['security'];
const answers = {
  'privacy.pii': true
};

const filtered = filterQuestionsByTags(questions, selectedTags, answers);
// Result: Foundation questions + security questions + privacy questions
// that have both security and privacy tags (e.g., privacy.pii, privacy.regulations)
```

### Example 3: No Tag Filter

```typescript
const selectedTags = undefined; // or []
const answers = {};

const filtered = filterQuestionsByTags(questions, selectedTags, answers);
// Result: All questions, minus those filtered by skip_if conditions
```

## Integration Points

### Dependencies

The function depends on:
- `evaluateSkip` from `src/lib/rulesEngine.ts` - Evaluates skip_if conditions
- `Question` type from `src/lib/schemaLoader.ts` - Question interface
- `AnswerMap` type from `src/lib/rulesEngine.ts` - Answer map interface

### Used By

This function can be integrated into:
- CLI questionnaire flow
- TDD generation pipeline
- Interactive question filtering UI
- Complexity-based question filtering

## Performance Characteristics

### Benchmarks

| Scenario | Question Count | Execution Time | Status |
|----------|----------------|----------------|--------|
| Standard Flow | 14 questions | ~0.005ms | ✅ <5ms |
| Large Dataset | 140 questions | ~0.06ms | ✅ <5ms |

### Complexity Analysis

- **Time Complexity**: O(n × m) where:
  - n = number of questions
  - m = average number of tags per question
- **Space Complexity**: O(k) where k = number of filtered questions
- **Optimization**: Early exit when no tags match; single-pass filtering

## Schema Requirements

### Question Structure

Questions must include:
```typescript
{
  id: string;
  tags: string[];        // Array of tag names
  skip_if?: Expression;  // Optional skip condition
  // ... other properties
}
```

### Tag Schema

Foundation tag must be defined in Universal_Tag_Schema:
```json
{
  "tags": {
    "foundation": {
      "label": "Project Foundation",
      "description": "Core project information and setup"
    }
  }
}
```

## Design Decisions

### Why Foundation Tags Are Always Included

Core/foundation questions represent essential project information that should always be collected, regardless of which specific areas (tags) the user is focusing on. Examples include:
- Project name
- TDD version
- Problem statement
- Solution description

### Why Skip_if Is Applied After Tag Filtering

This ensures that:
1. Tag filtering happens first (fast, simple operation)
2. Conditional evaluation only runs on the subset of relevant questions
3. Performance is optimized for workflows with specific tag focus
4. The answer state determines visibility within the selected domain

### Why Intersection Logic Uses OR (not AND)

Questions with ANY of the selected tags are included because:
- Enables flexible cross-domain filtering (e.g., security + operations)
- Matches user mental model: "Show me security OR operations questions"
- Questions with multiple tags (e.g., ["privacy", "security"]) are included when filtering by either tag

## Future Enhancements

Potential improvements to consider:

1. **Tag Combinations**: Support for AND logic (questions must have ALL selected tags)
2. **Tag Exclusions**: Ability to exclude specific tags (e.g., "operations BUT NOT cloud")
3. **Tag Priorities**: Weight/priority system for tag importance
4. **Caching**: Memoize results for identical inputs
5. **Tag Hierarchies**: Support for parent-child tag relationships
6. **Analytics**: Track which tag combinations are most commonly used

## Maintenance Notes

### Testing

When adding new questions:
1. Ensure appropriate tags are assigned
2. Test skip_if conditions with various answer states
3. Verify foundation questions are not broken by new logic

### Schema Updates

When modifying tag schema:
1. Ensure "foundation" tag exists and is properly assigned
2. Test that tag filtering works with new tags
3. Update tests if tag semantics change

### Performance Monitoring

If performance degrades:
1. Check number of questions in schema (should be <1000 for optimal performance)
2. Profile skip_if evaluation complexity
3. Consider caching or memoization strategies

## Conclusion

The tag-based filtering implementation provides a robust, performant, and well-tested solution for intelligent question filtering. It successfully meets all acceptance criteria:

✅ Runs in <5ms for standard flows
✅ Correct pruning verified by comprehensive tests
✅ on-premise + operations skips cloud fields
✅ security tag forces privacy follow-ups when PII is present

The implementation is production-ready and can be integrated into the TDD Builder workflow.

