# Industry Starter Templates

Pre-configured templates that accelerate TDD creation by providing sensible defaults and focused questionnaires for specific industries and use cases.

## Available Templates

### 🚀 SaaS Starter
**Template**: `saas`  
**Use Case**: Multi-tenant SaaS applications  
**Defaults**: 35 pre-filled values  
**Focus**: architecture, security, operations, business  

**Pre-configured for:**
- Multi-tenancy with schema-per-tenant isolation
- Rate limiting (token bucket strategy)
- Subscription billing with Stripe
- SSO (Google, Microsoft, Okta via SAML2)
- Cloud deployment on AWS
- OAuth2 + MFA authentication
- GDPR/CCPA compliance
- 99.9% SLA target
- Microservices architecture

**Ideal for:**
- B2B SaaS platforms
- Multi-tenant applications
- Subscription-based services
- Cloud-native applications

---

### 💰 FinTech Starter
**Template**: `fintech`  
**Use Case**: Financial technology applications  
**Defaults**: 43 pre-filled values  
**Focus**: security, privacy, compliance, operations  

**Pre-configured for:**
- SOC 2 + PCI DSS compliance
- Comprehensive audit logging (7-year retention)
- Segregation of duties
- Role-based access control (RBAC)
- KYC/AML requirements
- Fraud detection and prevention
- Encrypted sensitive data handling
- 99.95% SLA with 1-hour RTO
- Transaction logging and reconciliation
- Hybrid cloud deployment

**Ideal for:**
- Payment processors
- Banking applications
- Investment platforms
- Lending services
- Cryptocurrency exchanges

---

### 🛒 E-Commerce Starter
**Template**: `ecommerce`  
**Use Case**: E-commerce and marketplace platforms  
**Defaults**: 57 pre-filled values  
**Focus**: business, operations, security, architecture  

**Pre-configured for:**
- Product catalog with Elasticsearch
- Real-time inventory tracking
- Multi-warehouse management
- Guest and registered checkout
- Payment processing (Stripe, PayPal)
- PCI DSS compliance
- Fraud detection and risk scoring
- Shipping integrations (UPS, FedEx, USPS)
- Returns and RMA workflow
- Customer reviews and wishlists
- CDN for static assets

**Ideal for:**
- Online stores
- Marketplace platforms
- Retail applications
- B2C commerce platforms

---

### 🏥 Healthcare Starter
**Template**: `healthcare`  
**Use Case**: Healthcare and medical applications  
**Defaults**: 57 pre-filled values  
**Focus**: security, privacy, compliance, operations  

**Pre-configured for:**
- HIPAA/HITECH compliance
- PHI/PII protection (AES-256 encryption)
- BAA requirements
- Comprehensive audit logging (6-year retention)
- Patient consent management
- Access rights and amendment tracking
- Minimum necessary access principle
- 15-minute session timeout
- Secure data disposal
- Annual security testing
- 99.95% SLA with 4-hour RTO

**Ideal for:**
- EHR/EMR systems
- Patient portals
- Telehealth platforms
- Healthcare analytics
- Medical device software

---

## Usage

### Basic Usage
```bash
# Start with a template
node cli.js --template saas
node cli.js --template fintech
node cli.js --template ecommerce
node cli.js --template healthcare
```

### Combined with Other Options
```bash
# Template + PDF export
node cli.js --template saas --pdf

# Template + specific complexity
node cli.js --template fintech --complexity comprehensive

# Template + custom tags
node cli.js --template healthcare --tags security,privacy,compliance
```

### What Happens When You Use a Template

1. **Pre-filled Defaults**: 10-57 common values are automatically populated
2. **Tag Focus**: Questions are filtered to relevant topics for your industry
3. **Complexity Setting**: Recommended complexity level is applied
4. **Skip Irrelevant**: Sections not applicable to your industry are skipped
5. **Override Capable**: You can still modify any pre-filled value
6. **Conditional Expansion**: Template values trigger appropriate follow-up questions

## Template Structure

Each template is a JSON file with the following structure:

```json
{
  "template_name": "Display name",
  "template_version": "1.0.0",
  "description": "What this template is for",
  "tag_focus": ["tag1", "tag2"],
  "complexity_recommendation": "standard",
  "defaults": {
    "field.id": "default value"
  },
  "skip_sections": ["section1"],
  "recommended_questions": ["question.id"]
}
```

### Field Descriptions

- **template_name**: Human-readable name displayed to users
- **template_version**: Semantic version of the template
- **description**: Brief explanation of what the template provides
- **tag_focus**: Array of tags to focus questions on
- **complexity_recommendation**: Suggested complexity level
- **defaults**: Object mapping field IDs to default values
- **skip_sections**: Array of section IDs to skip (optional)
- **recommended_questions**: Additional questions to ask (optional)

## Creating Custom Templates

To create your own industry template:

1. Copy an existing template as a starting point
2. Modify the defaults to match your industry
3. Adjust tag_focus to emphasize relevant topics
4. Set appropriate complexity_recommendation
5. Save as `{name}-starter.json` in this directory
6. Test with: `node cli.js --template {name}`

### Best Practices

- **10-20 defaults minimum**: Provide enough to save time
- **Industry-specific values**: Use realistic defaults for the domain
- **Security by default**: Enable security features appropriate for the industry
- **Compliance-aware**: Pre-configure relevant regulations
- **Balanced complexity**: Don't overwhelm users with too many defaults

## Benefits

### Time Savings
- Reduces questionnaire completion time by 50-70%
- Skips irrelevant questions automatically
- Focuses on industry-specific concerns

### Quality
- Industry best practices baked in
- Compliance requirements pre-configured
- Security defaults appropriate for risk level

### User Experience
- Less cognitive load
- Faster time to value
- Clear starting point for customization

### Consistency
- Standard configurations across projects
- Reduced decision fatigue
- Clear industry expectations

## Acceptance Criteria ✅

All templates meet the following criteria:

- ✅ Pre-fill 10-20+ sensible defaults
- ✅ Skip irrelevant blocks for the industry
- ✅ Tag focus specified for relevant topics
- ✅ Complexity recommendation included
- ✅ Allow overrides during interview
- ✅ Support conditional expansion based on answers

## Template Comparison

| Template   | Defaults | Complexity     | Primary Focus          | Key Features                    |
|------------|----------|----------------|------------------------|---------------------------------|
| SaaS       | 35       | Standard       | Architecture, Security | Multi-tenancy, Rate limits, SSO |
| FinTech    | 43       | Comprehensive  | Security, Compliance   | SOC 2, PCI DSS, Audit logging   |
| E-Commerce | 57       | Standard       | Business, Operations   | Catalog, Payments, Fraud        |
| Healthcare | 57       | Comprehensive  | Security, Compliance   | HIPAA, PHI, Patient consent     |

## Support

For questions or issues with templates:
1. Check the template README (this file)
2. Review the template JSON file directly
3. Use `node cli.js --help` for CLI options
4. Refer to main project documentation

## Version History

- **1.0.0** (2025-10-07): Initial release with 4 industry templates

