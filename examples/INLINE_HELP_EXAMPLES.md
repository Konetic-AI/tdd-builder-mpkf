# Inline Help Feature - Examples

This document provides practical examples of the inline help feature in action.

## Example 1: Deployment Model Question

### Question Display
```
[3/10] Where will this be deployed? (?)
  💡 This determines your infrastructure approach

  1. cloud
  2. on-premise
  3. hybrid
  (Type '?' for help)

  Your answer:
```

### When User Types '?'
```
━━━ Help ━━━

Why We Ask:
  Deployment model affects architecture decisions, cost structure,
  scalability options, security requirements, and operational complexity.
  Cloud offers flexibility and managed services, on-premise offers control,
  and hybrid balances both.

Examples:
  cloud      → Deploy to AWS/Azure/GCP for scalability and managed services
  on-premise → Run in company datacenter for regulatory compliance
  hybrid     → Critical data on-premise, compute workloads in cloud

Learn More:
  https://docs.mpkf.io/deployment-models
━━━━━━━━━━━

[3/10] Where will this be deployed? (?)
  💡 This determines your infrastructure approach

  1. cloud
  2. on-premise
  3. hybrid
  (Type '?' for help)

  Your answer:
```

## Example 2: Authentication Methods Question

### Question Display
```
[5/10] What authentication methods will you support? (?)

  1. oauth2
  2. saml
  3. basic-auth
  4. api-key
  5. mfa
  (Enter numbers separated by commas, e.g., 1,3,5)
  (Type '?' for help)

  Your answer:
```

### When User Types '?'
```
━━━ Help ━━━

Why We Ask:
  Authentication determines how users prove their identity. The choice affects
  user experience, security posture, integration complexity, and compliance
  requirements. Modern systems often support multiple methods for different
  use cases.

Examples:
  oauth2     → Social login (Google, GitHub) or enterprise SSO
  saml       → Enterprise SSO for large organizations
  basic-auth → Simple username/password authentication
  api-key    → Service-to-service authentication
  mfa        → Additional security layer (SMS, TOTP, biometric)

Learn More:
  https://auth0.com/docs/authenticate/protocols
━━━━━━━━━━━

[5/10] What authentication methods will you support? (?)

  1. oauth2
  2. saml
  3. basic-auth
  4. api-key
  5. mfa
  (Enter numbers separated by commas, e.g., 1,3,5)
  (Type '?' for help)

  Your answer:
```

## Example 3: Expected Scale Question

### Question Display
```
[8/15] What is your expected scale? (?)

  1. small
  2. medium
  3. large
  4. massive
  (Type '?' for help)

  Your answer:
```

### When User Types '?'
```
━━━ Help ━━━

Why We Ask:
  Expected scale drives architecture decisions around database choice, caching
  strategies, infrastructure design, and cost optimization. Over-engineering
  for scale adds complexity; under-engineering causes performance issues.

Examples:
  small   → <10K users, <100 requests/sec
  medium  → 10K-100K users, 100-1K requests/sec
  large   → 100K-1M users, 1K-10K requests/sec
  massive → >1M users, >10K requests/sec

Learn More:
  https://docs.mpkf.io/architecture-scale
━━━━━━━━━━━

[8/15] What is your expected scale? (?)

  1. small
  2. medium
  3. large
  4. massive
  (Type '?' for help)

  Your answer:
```

## Example 4: PII Handling Question

### Question Display
```
[6/10] Will this system handle personally identifiable information (PII)? (?)

  1. Yes
  2. No
  (Type '?' for help)

  Your answer:
```

### When User Types '?'
```
━━━ Help ━━━

Why We Ask:
  Systems handling PII require additional security controls, privacy protections,
  and often regulatory compliance. This triggers questions about data encryption,
  retention policies, user consent, and right-to-deletion capabilities.

Examples:
  Direct Identifiers → Names, email addresses, phone numbers, social security numbers, addresses
  Financial Data     → Credit card numbers, bank account information, transaction history
  Sensitive Data     → Biometric data, health records, IP addresses (in some jurisdictions)

Learn More:
  https://gdpr.eu/eu-gdpr-personal-data/
━━━━━━━━━━━

[6/10] Will this system handle personally identifiable information (PII)? (?)

  1. Yes
  2. No
  (Type '?' for help)

  Your answer:
```

## Happy Path (No Help Needed)

When users know the answer, they can skip help entirely:

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

## Key Observations

1. **Non-Intrusive**: The `(?)` indicator is subtle and doesn't clutter the UI
2. **Consistent**: All help displays follow the same format
3. **Actionable**: Examples are concrete and directly related to the question
4. **Educational**: "Why We Ask" helps users understand the bigger picture
5. **Optional**: Users can proceed without ever viewing help

## Questions Enhanced with Help

Currently, 9 questions have enhanced help:

1. `doc.version` - Version tracking
2. `project.name` - Project naming
3. `summary.problem` - Problem definition
4. `summary.solution` - Solution design
5. `project.description` - Project description
6. `deployment.model` - Deployment strategy
7. `security.auth` - Authentication methods
8. `privacy.pii` - PII handling
9. `architecture.scale` - Expected scale

## Adding Help to New Questions

When creating a new question, add help like this:

```json
{
  "id": "my.question",
  "question": "Your question text?",
  "help": {
    "why": "Explain why this question matters and how it impacts the project",
    "examples": {
      "option1": "Clear description of what this option means",
      "option2": "Clear description of what this option means",
      "option3": "Clear description of what this option means"
    },
    "learnMore": "https://docs.mpkf.io/relevant-topic"
  }
}
```

## Testing the Feature

Try it yourself:

```bash
# Start interactive mode
node cli.js

# At any question with (?), type:
?

# Then answer normally
cloud
```

## Demo

Run the demo script to see a simulated flow:

```bash
./examples/demo_inline_help.sh
```

