#!/bin/bash

# Demo script for Inline Help Feature
# Shows how the new help system works in the CLI

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     TDD Builder - Inline Help Feature Demo                  ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "This demo shows how users can get contextual help for any question"
echo "during the interactive TDD creation process."
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors
CYAN='\033[36m'
YELLOW='\033[33m'
GREEN='\033[32m'
BOLD='\033[1m'
DIM='\033[2m'
UNDERLINE='\033[4m'
RESET='\033[0m'

echo "Example Question Flow:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Simulate question display
echo -e "${BOLD}[3/10] Where will this be deployed?${RESET} ${CYAN}(?)${RESET}"
echo -e "${DIM}  💡 This determines your infrastructure approach${RESET}"
echo ""
echo "  1. cloud"
echo "  2. on-premise"
echo "  3. hybrid"
echo -e "${DIM}  (Type '?' for help)${RESET}"
echo ""
echo "  Your answer: ?"
echo ""

# Simulate help display
echo -e "${YELLOW}${BOLD}━━━ Help ━━━${RESET}"
echo ""
echo -e "${YELLOW}${BOLD}Why We Ask:${RESET}"
echo -e "${DIM}  Deployment model affects architecture decisions, cost structure,${RESET}"
echo -e "${DIM}  scalability options, security requirements, and operational complexity.${RESET}"
echo ""
echo -e "${YELLOW}${BOLD}Examples:${RESET}"
echo -e "${CYAN}  cloud     ${RESET} ${DIM}→${RESET} Deploy to AWS/Azure/GCP for scalability and managed services"
echo -e "${CYAN}  on-premise${RESET} ${DIM}→${RESET} Run in company datacenter for regulatory compliance"
echo -e "${CYAN}  hybrid    ${RESET} ${DIM}→${RESET} Critical data on-premise, compute workloads in cloud"
echo ""
echo -e "${YELLOW}${BOLD}Learn More:${RESET}"
echo -e "${CYAN}  ${UNDERLINE}https://docs.mpkf.io/deployment-models${RESET}"
echo -e "${YELLOW}${BOLD}━━━━━━━━━━━${RESET}"
echo ""

# Show question again after help
echo -e "${BOLD}[3/10] Where will this be deployed?${RESET} ${CYAN}(?)${RESET}"
echo -e "${DIM}  💡 This determines your infrastructure approach${RESET}"
echo ""
echo "  1. cloud"
echo "  2. on-premise"
echo "  3. hybrid"
echo -e "${DIM}  (Type '?' for help)${RESET}"
echo ""
echo "  Your answer: cloud"
echo ""
echo -e "${GREEN}✓ Answer recorded${RESET}"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Key Features:"
echo "  ✓ Inline (?) affordance shows help is available"
echo "  ✓ Type '?' at any prompt to reveal help"
echo "  ✓ Help shows WHY the question matters"
echo "  ✓ Examples displayed as formatted table"
echo "  ✓ Learn More links to detailed documentation"
echo "  ✓ No friction - help is completely optional"
echo ""
echo "Try it yourself:"
echo "  $ node cli.js"
echo "  Then type '?' at any question with a (?) indicator"
echo ""
echo "For more information, see:"
echo "  - docs/INLINE_HELP_FEATURE.md"
echo "  - INLINE_HELP_SUMMARY.md"
echo ""

