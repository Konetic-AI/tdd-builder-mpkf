# Technical Design Document: {{project.name}}

## Stage 1: Project Foundation
### 1.1 Document Information
| Field | Value |
|---|---|
| **TDD Version** | `{{doc.version}}` |
| **Date Created** | `{{doc.created_date}}` |
| **Authors** | `{{doc.authors}}` |
| **Primary Stakeholders** | `{{doc.stakeholders}}` |
| **Approval Status** | `{{doc.approval_status}}` |
| **Document Type** | `{{doc.type}}` |

### 1.2 Executive Summary
- **Problem Statement:** `{{summary.problem}}`
- **Proposed Solution:** `{{summary.solution}}`
- **Key Architectural Decisions:** `{{summary.key_decisions}}`
- **Business Outcomes & Success Criteria:** `{{summary.success_criteria}}`

---

## Stage 2: Requirements & Context Analysis
### 2.1 Business Context & Scope
- **Business Goals:** `{{context.business_goals}}`
- **In-Scope Functionality:** `{{context.scope_in}}`
- **Out-of-Scope Functionality:** `{{context.scope_out}}`
- **Key User Personas & Roles:** `{{context.personas}}`

### 2.2 Constraints & Assumptions
- **Technical Constraints:** `{{constraints.technical}}`
- **Business & Budget Constraints:** `{{constraints.business}}`
- **Legal & Compliance Constraints:** `{{constraints.compliance}}`
- **Key Assumptions:** `{{constraints.assumptions}}`

---

## Stage 3: Architecture Design
### 3.1 Solution Strategy & Style
- **Architecture Style:** `{{architecture.style}}`
- **Key Design Principles:** `{{architecture.principles}}`
- **Technology Stack:** `{{architecture.tech_stack}}`

### 3.2 C4 Model: System Context (Level 1)
- **Description:** `{{architecture.c4_l1_description}}`
- **Diagram:**
{{architecture.c4_l1_diagram}}


### 3.3 C4 Model: Container Diagram (Level 2)
- **Description:** `{{architecture.c4_l2_description}}`
- **Diagram:**
{{architecture.c4_l2_diagram}}


### 3.4 Data Model & Flow
- **High-Level Data Model:** `{{architecture.data_model}}`
- **Data Flow Diagram:**
{{architecture.data_flow_diagram}}


---

## Stage 4: Non-Functional Requirements (NFRs)
| Category | Requirement |
|---|---|
| **Performance** | `{{nfr.performance}}` |
| **Scalability** | `{{nfr.scalability}}` |
| **Availability** | `{{nfr.availability}}` |
| **Maintainability** | `{{nfr.maintainability}}` |
| **Usability (UX)** | `{{nfr.usability}}` |
| **Cost Efficiency** | `{{nfr.cost}}` |
- **NFR Trade-off Analysis:** `{{nfr.tradeoffs}}`

---

## Stage 5: Security & Privacy Architecture
### 5.1 Security by Design
- **Threat Model Summary:** `{{security.threat_model}}`
- **Authentication & Authorization:** `{{security.auth}}`
- **Key Security Controls:** `{{security.controls}}`
- **Data Classification:** `{{security.data_classification}}`

### 5.2 Privacy by Design
- **Data Privacy Controls (PII):** `{{privacy.controls}}`
- **Data Residency Requirements:** `{{privacy.residency}}`
- **Data Retention Policies:** `{{privacy.retention}}`

### 5.3 [MCP] Tool Security Boundaries
- **MCP Protocol Compliance:** `{{security.mcp_protocol_compliance}}`
- **MCP Tool Sandboxing Model:** `{{security.mcp_sandboxing_model}}`
- **MCP Tool Permission Model:** `{{security.mcp_permission_model}}`

---

## Stage 6: Operations & Observability
- **Deployment Strategy:** `{{ops.deployment_strategy}}`
- **Environment Strategy (Dev/Staging/Prod):** `{{ops.environments}}`
- **Logging Approach:** `{{ops.logging}}`
- **Monitoring & Alerting:** `{{ops.monitoring}}`
- **Disaster Recovery & Backup Strategy:** `{{ops.disaster_recovery}}`

---

## Stage 7: Implementation Planning
- **Development Methodology:** `{{implementation.methodology}}`
- **Team Structure & Roles:** `{{implementation.team}}`
- **High-Level Phased Roadmap:** `{{implementation.roadmap}}`
- **Testing Strategy:** `{{implementation.testing_strategy}}`

---

## Stage 8: Risk Management & Technical Debt
- **Identified Technical Risks:** `{{risks.technical}}`
- **Identified Business Risks:** `{{risks.business}}`
- **Risk Mitigation Plan:** `{{risks.mitigation}}`
- **Known Technical Debt:** `{{debt.known}}`

---

## Stage 9: Appendices & References
- **Glossary of Terms:** `{{appendices.glossary}}`
- **Linked Documents & References:** `{{appendices.references}}`
- **Architecture Decision Records (ADRs):** `{{appendices.adrs}}`