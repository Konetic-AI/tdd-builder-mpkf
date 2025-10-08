# Ajv Validation - Quick Reference

## ✅ What It Does

Provides clear, actionable error messages with examples when users enter invalid inputs. Users can re-enter without losing previous answers.

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| **Clear Error Messages** | "Answer must be at least 3 characters long" instead of cryptic errors |
| **Examples Display** | Shows valid examples when validation fails |
| **Learn More URLs** | Optional links to additional documentation |
| **Re-Entry Support** | Invalid inputs can be corrected without data loss |
| **Preserves Answers** | All previous answers maintained during re-entry |

## 📋 Schema Configuration

### Minimal (just validation)
```json
{
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
  "validation": {
    "type": "array",
    "minItems": 1
  },
  "help": {
    "examples": [
      "Example 1",
      "Example 2"
    ]
  }
}
```

### Full Featured (with learnMore)
```json
{
  "validation": {
    "type": "string",
    "minLength": 3
  },
  "help": {
    "why": "Explanation of why we ask",
    "examples": [
      "Example 1",
      "Example 2"
    ],
    "learnMore": "https://example.com/docs"
  }
}
```

## 🔧 Supported Validation Types

| Type | Rules | Example |
|------|-------|---------|
| **string** | minLength, maxLength, pattern | `{ "type": "string", "minLength": 3 }` |
| **number** | minimum, maximum | `{ "type": "number", "minimum": 0 }` |
| **integer** | minimum, maximum | `{ "type": "integer", "minimum": 1 }` |
| **boolean** | (type only) | `{ "type": "boolean" }` |
| **array** | minItems, maxItems, items | `{ "type": "array", "minItems": 1 }` |
| **enum** | enum values | `{ "enum": ["option1", "option2"] }` |

## 🧪 Testing

```bash
# Run validation tests
npm run test:jest -- validateAnswer.test

# Run demo
node examples/validation-demo.js

# Run flow demo
node examples/validation-flow-demo.js
```

## 💡 Example Output

```
✗ Invalid input:
  • Please select at least 1 item

Examples:
  1. oauth2 - Social login (Google, GitHub) or enterprise SSO
  2. saml - Enterprise SSO for large organizations
  3. api-key - Service-to-service authentication

Learn more: https://auth0.com/docs/authenticate/protocols
  Type '?' to see why we ask this question
```

## 📚 Full Documentation

- **Complete Guide**: `examples/VALIDATION_GUIDE.md`
- **Implementation Summary**: `VALIDATION_IMPLEMENTATION_SUMMARY.md`
- **Demo Scripts**: `examples/validation-demo.js`, `examples/validation-flow-demo.js`

## 🚀 Quick Start

1. Add validation rules to your question in the schema
2. Optionally add examples in `help.examples`
3. Optionally add learnMore URL in `help.learnMore`
4. Validation happens automatically in the CLI!

## ✨ Benefits

- **Better UX**: Users know exactly what went wrong
- **Faster Completion**: Examples guide users to correct format
- **No Frustration**: Re-entry without losing work
- **Educational**: Learn more links provide context
- **Consistent**: All validation uses same Ajv engine

