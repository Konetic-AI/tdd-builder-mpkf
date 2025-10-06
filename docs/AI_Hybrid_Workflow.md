# 🧠 Hybrid AI Build Workflow — Cursor (GPT-5) + Claude 4.5 + MPKF TDD Builder

## Overview
This workflow unifies **Cursor (GPT-5)** for engineering automation and **Claude 4.5 (Sonnet)** for deep reasoning across MPKF-validated Technical Design Documents. It ensures every build remains reproducible, compliant, and enterprise-grade.

---

## Phase 0 — Environment Setup
```bash
git clone https://github.com/Konetic-AI/tdd-builder-mpkf.git
cd tdd-builder-mpkf
nvm use
npm ci
npx husky init
git config core.hooksPath .husky

Phase 1 — Build via Cursor / GPT-5
Generate or edit TDDs using Cursor prompts.
Run validators:
npm run build:all
npm run validate:microbuild
npm run validate:variables
Fix any gaps flagged by MPKF validation.

Phase 2 — Design Review via Claude 4.5
Open latest TDD in Claude 4.5.
Use prompts like:
“Assess MPKF coverage and propose optimizations for scalability and risk.”
Export results to docs/review_<project>_claude45.md.

Phase 3 — Sync & CI
git add -A
git commit -m "feat: new TDD + Claude 4.5 review"
git push
npm run replit-sync
CI validates builds; artifacts upload to GitHub Actions.

Phase 4 — Audit & Governance
Dependabot updates weekly.
Run npm audit fix monthly.
Keep .nvmrc → Node 18 LTS.
Store Claude 4.5 reviews in /docs/reviews/.
Integration Notes
Claude 4.5 Agent Mode: supports ~30 hours continuous reasoning.
MCP TDD Builder remains the compliance source of truth.
Cursor / GPT-5 handles repo automation and CI orchestration.

---

## ✅ 4. Next Steps

1. Add that file → commit:
   ```bash
   git add docs/AI_Hybrid_Workflow.md
   git commit -m "docs: add hybrid Claude 4.5 + Cursor workflow guide"
   git push
Add link references in:
README.md → under “CI/CD & Automation.”
CONTEXT.md → under “Workflow Integration.”