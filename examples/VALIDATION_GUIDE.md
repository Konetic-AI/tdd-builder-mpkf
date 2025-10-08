# Ajv Validation Integration Guide

## Overview

The TDD Builder CLI now includes comprehensive Ajv validation that provides clear, actionable error messages when invalid inputs are detected. Users can re-enter their answers without losing prior responses.

## Features

### 1. Per-Question Validation

Each question in the schema can define validation rules using JSON Schema format. The validation is performed immediately after the user provides an answer.

### 2. User-Friendly Error Messages

Instead of raw Ajv error messages, the system provides clear, human-readable feedback:

- **String validation**: "Answer must be at least 3 characters long"
- **Array validation**: "Please select at least 1 item"
- **Enum validation**: "Please select from the available options"
- **Type validation**: "Expected boolean, but got string"

### 3. Examples Display

When validation fails and the question has examples defined, they are automatically displayed to guide the user:

```
✗ Invalid input:
  • Please select at least 1 item

Examples:
  1. oauth2 - Social login (Google, GitHub) or enterprise SSO
  2. saml - Enterprise SSO for large organizations
  3. api-key - Service-to-service authentication
  4. mfa - Additional security layer (SMS, TOTP, biometric)
```

### 4. Learn More URLs

Questions can include a `help.learnMore` URL that is displayed when validation fails:

```
Learn more: https://auth0.com/docs/authenticate/protocols
  Type '?' to see why we ask this question
```

### 5. Re-Entry Without Data Loss

When validation fails, the system:
1. Shows the error with examples and learn more link
2. Prompts the user to try again
3. Preserves all previously answered questions

## Schema Configuration

### Basic Validation

```json
{
  "id": "project.name",
  "question": "What is the official name for this project?",
  "validation": {
    "type": "string",
    "minLength": 3,
    "maxLength": 100
  }
}
```

### With Examples

```json
{
  "id": "deployment.model",
  "question": "Where will this be deployed?",
  "validation": {
    "enum": ["cloud", "on-premise", "hybrid"]
  },
  "help": {
    "examples": [
      "cloud - Deploy to AWS/Azure/GCP for scalability",
      "on-premise - Run in company datacenter",
      "hybrid - Critical data on-premise, compute workloads in cloud"
    ]
  }
}
```

### With Learn More URL

```json
{
  "id": "security.auth",
  "question": "What authentication methods will you support?",
  "validation": {
    "type": "array",
    "minItems": 1
  },
  "help": {
    "examples": [
      "oauth2 - Social login (Google, GitHub) or enterprise SSO",
      "saml - Enterprise SSO for large organizations"
    ],
    "learnMore": "https://auth0.com/docs/authenticate/protocols"
  }
}
```

## Supported Validation Rules

### String Validation
- `minLength`: Minimum string length
- `maxLength`: Maximum string length
- `pattern`: Regular expression pattern

### Number Validation
- `minimum`: Minimum value
- `maximum`: Maximum value

### Array Validation
- `minItems`: Minimum number of items
- `maxItems`: Maximum number of items
- `items`: Schema for array items

### Enum Validation
- `enum`: Array of allowed values

### Type Validation
- `type`: Expected data type (string, number, integer, boolean, array, object)

## Usage Examples

### Running the Demo

```bash
node examples/validation-demo.js
```

This demonstrates various validation scenarios:
- String too short/long
- Array with too few items
- Invalid enum values
- Boolean type mismatches
- Valid inputs

### Interactive CLI

When running the CLI, validation happens automatically:

```bash
node cli.js
```

Example interaction:
```
[1/7] What is the TDD version?
  💡 Version number for this TDD document.
  Type '?' for help on why we ask this question

  Your answer: 

✗ Invalid input:
  • Answer must be at least 1 characters long

Examples:
  1. 1.0
  2. 1.0.0
  3. 2.1-draft
  4. v3.0

[1/7] What is the TDD version?
  💡 Version number for this TDD document.
  Type '?' for help on why we ask this question

  Your answer: 1.0.0

✓ Valid!
```

## Testing

The validation module includes comprehensive tests:

```bash
npm run test:jest -- validateAnswer.test
```

Tests cover:
- String, number, array, and boolean validation
- Error message formatting
- Examples inclusion
- learnMore URL inclusion
- Valid and invalid inputs

## Benefits

1. **Better UX**: Clear error messages instead of cryptic validation failures
2. **Guided Input**: Examples show users what valid inputs look like
3. **Learning Opportunity**: Learn more URLs provide context and education
4. **No Data Loss**: Users can retry without losing previous answers
5. **Consistent**: All validation uses the same Ajv engine and JSON Schema format

## Future Enhancements

Potential future improvements:
- Custom error messages per validation rule
- Conditional validation based on previous answers
- Async validation (e.g., checking if project name is unique)
- Validation warnings vs. errors
- Field-level help text in error messages

