#!/usr/bin/env node

/**
 * Demonstrates the complete validation flow
 * Shows how validation errors are caught and formatted for display
 */

const { loadQuestionnaireSchema } = require('../dist/src/lib/schemaLoader');
const { validateAnswer } = require('../dist/src/lib/validateAnswer');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m'
};

function displayValidationError(validationResult) {
  if (!validationResult.errors || validationResult.errors.length === 0) {
    return;
  }
  
  console.log(`\n${colors.red}${colors.bold}✗ Invalid input:${colors.reset}`);
  
  // Display error messages
  validationResult.errors.forEach(error => {
    console.log(`${colors.red}  • ${error}${colors.reset}`);
  });
  
  // Display examples if available
  if (validationResult.examples && validationResult.examples.length > 0) {
    console.log(`\n${colors.yellow}${colors.bold}Examples:${colors.reset}`);
    validationResult.examples.forEach((example, idx) => {
      console.log(`${colors.dim}  ${idx + 1}. ${example}${colors.reset}`);
    });
  }
  
  // Display learn more link if available
  if (validationResult.learnMore) {
    console.log(`\n${colors.cyan}${colors.bold}Learn more:${colors.reset} ${colors.underline}${validationResult.learnMore}${colors.reset}`);
    console.log(`${colors.dim}  Type '?' to see why we ask this question${colors.reset}`);
  }
  
  console.log('');
}

console.log(`${colors.blue}${colors.bold}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           Validation Flow Demonstration                      ║
║     Shows how errors are caught and displayed to users       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

// Load schema
const schema = loadQuestionnaireSchema('schemas');

// Simulate user interaction flow
console.log(`${colors.cyan}${colors.bold}Scenario 1: User enters empty project name${colors.reset}`);
console.log('─'.repeat(60));
console.log(`\n${colors.bold}[1/5] What is the official name for this project?${colors.reset}`);
console.log(`${colors.dim}  💡 Keep it concise and memorable.${colors.reset}`);
console.log(`\n  Your answer: ${colors.yellow}""${colors.reset}`);

const projectNameQuestion = schema.questions.find(q => q.id === 'project.name');
let result = validateAnswer(projectNameQuestion, '');

displayValidationError(result);

console.log(`  ${colors.dim}User tries again...${colors.reset}`);
console.log(`\n${colors.bold}[1/5] What is the official name for this project?${colors.reset}`);
console.log(`  Your answer: ${colors.green}"Customer Portal v2"${colors.reset}`);

result = validateAnswer(projectNameQuestion, 'Customer Portal v2');
if (result.valid) {
  console.log(`${colors.green}  ✓ Valid!${colors.reset}\n`);
}

console.log('\n' + '═'.repeat(60) + '\n');

// Scenario 2: Invalid enum selection
console.log(`${colors.cyan}${colors.bold}Scenario 2: User enters invalid deployment option${colors.reset}`);
console.log('─'.repeat(60));
console.log(`\n${colors.bold}[2/5] Where will this be deployed?${colors.reset}`);
console.log(`  1. cloud`);
console.log(`  2. on-premise`);
console.log(`  3. hybrid`);
console.log(`\n  Your answer: ${colors.yellow}4${colors.reset} (or "datacenter")`);

const deploymentQuestion = schema.questions.find(q => q.id === 'deployment.model');
result = validateAnswer(deploymentQuestion, 'datacenter');

displayValidationError(result);

console.log(`  ${colors.dim}User tries again with valid option...${colors.reset}`);
console.log(`\n${colors.bold}[2/5] Where will this be deployed?${colors.reset}`);
console.log(`  Your answer: ${colors.green}1${colors.reset} (cloud)`);

result = validateAnswer(deploymentQuestion, 'cloud');
if (result.valid) {
  console.log(`${colors.green}  ✓ Valid!${colors.reset}\n`);
}

console.log('\n' + '═'.repeat(60) + '\n');

// Scenario 3: Array with too few items
console.log(`${colors.cyan}${colors.bold}Scenario 3: User doesn't select any authentication methods${colors.reset}`);
console.log('─'.repeat(60));
console.log(`\n${colors.bold}[3/5] What authentication methods will you support?${colors.reset}`);
console.log(`  1. oauth2`);
console.log(`  2. saml`);
console.log(`  3. basic-auth`);
console.log(`  4. api-key`);
console.log(`  5. mfa`);
console.log(`${colors.dim}  (Enter numbers separated by commas, e.g., 1,3,5)${colors.reset}`);
console.log(`\n  Your answer: ${colors.yellow}(empty)${colors.reset}`);

const securityAuthQuestion = schema.questions.find(q => q.id === 'security.auth');
result = validateAnswer(securityAuthQuestion, []);

displayValidationError(result);

console.log(`  ${colors.dim}User tries again and selects options...${colors.reset}`);
console.log(`\n${colors.bold}[3/5] What authentication methods will you support?${colors.reset}`);
console.log(`  Your answer: ${colors.green}1,5${colors.reset} (oauth2, mfa)`);

result = validateAnswer(securityAuthQuestion, ['oauth2', 'mfa']);
if (result.valid) {
  console.log(`${colors.green}  ✓ Valid!${colors.reset}\n`);
}

console.log('\n' + '═'.repeat(60) + '\n');

// Scenario 4: String too long
console.log(`${colors.cyan}${colors.bold}Scenario 4: User enters description that's too long${colors.reset}`);
console.log('─'.repeat(60));
console.log(`\n${colors.bold}[4/5] Provide a brief description of your project${colors.reset}`);
console.log(`${colors.dim}  💡 What problem does this solve? Who is it for?${colors.reset}`);

const longDescription = 'This is an extremely long project description that exceeds the maximum allowed length of 500 characters. '.repeat(10);
console.log(`\n  Your answer: ${colors.yellow}"${longDescription.substring(0, 80)}..."${colors.reset}`);

const descriptionQuestion = schema.questions.find(q => q.id === 'project.description');
result = validateAnswer(descriptionQuestion, longDescription);

displayValidationError(result);

console.log(`  ${colors.dim}User shortens the description...${colors.reset}`);
console.log(`\n${colors.bold}[4/5] Provide a brief description of your project${colors.reset}`);
const goodDescription = "A web-based dashboard for marketing teams to track campaign performance across multiple channels.";
console.log(`  Your answer: ${colors.green}"${goodDescription}"${colors.reset}`);

result = validateAnswer(descriptionQuestion, goodDescription);
if (result.valid) {
  console.log(`${colors.green}  ✓ Valid!${colors.reset}\n`);
}

console.log('\n' + '═'.repeat(60) + '\n');

// Final summary
console.log(`${colors.green}${colors.bold}✓ All questions answered successfully!${colors.reset}\n`);
console.log(`${colors.bold}Key Features Demonstrated:${colors.reset}`);
console.log(`${colors.green}  ✓${colors.reset} Clear error messages`);
console.log(`${colors.green}  ✓${colors.reset} Examples shown on validation failure`);
console.log(`${colors.green}  ✓${colors.reset} Learn more URLs when available`);
console.log(`${colors.green}  ✓${colors.reset} Re-entry without losing prior answers`);
console.log(`${colors.green}  ✓${colors.reset} User-friendly validation flow\n`);

console.log(`${colors.cyan}${colors.bold}Note:${colors.reset} ${colors.dim}In the actual CLI, the user can type '?' at any time to see`);
console.log(`why we ask a question, and all previous answers are preserved during re-entry.${colors.reset}\n`);

