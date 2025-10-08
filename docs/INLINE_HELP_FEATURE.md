# Inline Help Feature Documentation

## Overview

The TDD Builder CLI now includes an enhanced inline help system that allows users to reveal contextual help for any question without disrupting their workflow. This feature provides richer information including explanations, examples in table format, and links to additional documentation.

## Features

### 1. **Inline Help Affordance**
- Questions with available help display a `(?)` indicator
- Users can type `?` at any question prompt to reveal help
- Help is completely optional - no friction added to the happy path

### 2. **Rich Help Content**

Each help section can include:

- **Why We Ask**: Clear explanation of why the question matters and how it impacts the project
- **Examples**: Key-value pairs showing concrete examples (formatted as an aligned table)
- **Learn More**: URL to additional documentation for deeper understanding

## Schema Format

### New Help Structure

```json
{
  "help": {
    "why": "Explanation of why this question is important",
    "examples": {
      "key1": "Description of example 1",
      "key2": "Description of example 2",
      "key3": "Description of example 3"
    },
    "learnMore": "https://docs.mpkf.io/topic"
  }
}
```

### Example Question

```json
{
  "id": "deployment.model",
  "stage": "core",
  "type": "select",
  "question": "Where will this be deployed?",
  "options": ["cloud", "on-premise", "hybrid"],
  "help": {
    "why": "Deployment model affects architecture decisions, cost structure, scalability options, security requirements, and operational complexity.",
    "examples": {
      "cloud": "Deploy to AWS/Azure/GCP for scalability and managed services",
      "on-premise": "Run in company datacenter for regulatory compliance",
      "hybrid": "Critical data on-premise, compute workloads in cloud"
    },
    "learnMore": "https://docs.mpkf.io/deployment-models"
  }
}
```

## CLI Display Format

### Question with Help Affordance

```
[1/10] Where will this be deployed? (?)
  💡 This determines your infrastructure approach

  1. cloud
  2. on-premise
  3. hybrid
  (Type '?' for help)

  Your answer:
```

### Help Display (when user types '?')

```
━━━ Help ━━━

Why We Ask:
  Deployment model affects architecture decisions, cost structure, 
  scalability options, security requirements, and operational complexity.

Examples:
  cloud      → Deploy to AWS/Azure/GCP for scalability and managed services
  on-premise → Run in company datacenter for regulatory compliance
  hybrid     → Critical data on-premise, compute workloads in cloud

Learn More:
  https://docs.mpkf.io/deployment-models
━━━━━━━━━━━
```

## Implementation Details

### Schema Location
- Primary schema: `/schemas/Pre-TDD_Client_Questionnaire_v2.0.json`
- Template: `/templates/Pre-TDD_Client_Questionnaire_v2.0.json`

### CLI Functions

#### `displayQuestion(question, questionNumber, totalQuestions, showHelpAffordance)`
- Displays the question text with optional `(?)` indicator
- Shows hint if available
- Parameters:
  - `showHelpAffordance`: boolean to enable/disable the `(?)` display

#### `displayHelp(question)`
- Renders the complete help information
- Handles both object and array example formats (backward compatible)
- Formats examples as aligned tables for better readability
- Displays links with underline formatting

#### `askQuestion(question, questionNumber, totalQuestions, showHelp)`
- Main question flow handler
- Intercepts `?` input to display help
- Re-asks question after help is displayed
- Parameters:
  - `showHelp`: boolean to enable help functionality for the question

## Backward Compatibility

The system maintains backward compatibility with the legacy array-based examples format:

### Legacy Format (still supported)
```json
{
  "help": {
    "why": "Explanation text",
    "examples": [
      "Example 1",
      "Example 2",
      "Example 3"
    ]
  }
}
```

### Legacy Display
```
Examples:
  1. Example 1
  2. Example 2
  3. Example 3
```

## Questions with Enhanced Help

The following questions currently have enhanced help information:

1. **doc.version** - Version tracking and naming conventions
2. **project.name** - Project naming best practices
3. **summary.problem** - Problem definition guidelines
4. **summary.solution** - Solution design principles
5. **project.description** - Project description formatting
6. **deployment.model** - Deployment strategy considerations
7. **security.auth** - Authentication method selection
8. **privacy.pii** - PII handling requirements
9. **architecture.scale** - Scaling considerations

## Acceptance Criteria

✅ **Users can reveal help inline**
- Help is accessible via `?` command at any question
- No need to leave the CLI or interrupt workflow

✅ **Help displays all required information**
- Why: Clear explanation of question importance
- Examples: Formatted table showing concrete examples
- Learn More: Direct link to detailed documentation

✅ **No change in happy-path friction**
- Help is completely optional
- Users who know their answers can proceed without delay
- `(?)` indicator is subtle and non-intrusive

## Usage Examples

### Example 1: Getting Help During Interview

```
[3/10] Where will this be deployed? (?)
  💡 This determines your infrastructure approach

  1. cloud
  2. on-premise
  3. hybrid
  (Type '?' for help)

  Your answer: ?

━━━ Help ━━━

Why We Ask:
  Deployment model affects architecture decisions...

Examples:
  cloud      → Deploy to AWS/Azure/GCP for scalability
  on-premise → Run in company datacenter for compliance
  hybrid     → Critical data on-premise, workloads in cloud

Learn More:
  https://docs.mpkf.io/deployment-models
━━━━━━━━━━━

[3/10] Where will this be deployed? (?)
  💡 This determines your infrastructure approach

  1. cloud
  2. on-premise
  3. hybrid
  (Type '?' for help)

  Your answer: 1
```

### Example 2: Direct Answer (Happy Path)

```
[3/10] Where will this be deployed? (?)
  💡 This determines your infrastructure approach

  1. cloud
  2. on-premise
  3. hybrid
  (Type '?' for help)

  Your answer: cloud

✓ Answer recorded
```

## Benefits

1. **Better User Education**: Users understand why each question matters
2. **Improved Answer Quality**: Examples guide users to provide better information
3. **Self-Service Documentation**: Learn More links reduce need for external support
4. **Non-Intrusive**: Help is available but never forced on users
5. **Consistent UX**: Unified help interface across all questions
6. **Maintainable**: Help content lives with questions in schema

## Future Enhancements

Potential improvements for future versions:

1. Context-aware help based on previous answers
2. Interactive examples that auto-fill answers
3. Video or screenshot links for complex topics
4. Question dependencies explained in help
5. Success criteria or validation hints
6. Common mistakes to avoid

## Testing

Run the test suite to verify help functionality:

```bash
# Test the help display
node test_help_feature.js

# Interactive test
node cli.js
# Then type '?' at any question to see help
```

## Contributing

When adding new questions with help:

1. Always include a `why` explanation
2. Use object format for examples (not arrays)
3. Provide 2-5 relevant examples
4. Include a `learnMore` link to documentation
5. Keep examples concise and actionable
6. Align examples with question options when applicable

