#!/usr/bin/env node

/**
 * Demonstration of the Ajv validation integration
 * Shows how validation errors surface clear, actionable messages with examples and learn more URLs
 */

const { loadQuestionnaireSchema } = require('../dist/src/lib/schemaLoader');
const { validateAnswer } = require('../dist/src/lib/validateAnswer');

console.log('═══════════════════════════════════════════════════════════');
console.log('  Ajv Validation Demo - Error Messages with Examples');
console.log('═══════════════════════════════════════════════════════════\n');

// Load the schema
const schema = loadQuestionnaireSchema('schemas');

// Example 1: String too short
console.log('Example 1: String validation (too short)');
console.log('─────────────────────────────────────────────────────────\n');

const docVersionQuestion = schema.questions.find(q => q.id === 'doc.version');
const result1 = validateAnswer(docVersionQuestion, '');

console.log('Question:', docVersionQuestion.question);
console.log('Input:', '""');
console.log('Valid:', result1.valid);
if (!result1.valid) {
  console.log('Errors:', result1.errors);
  if (result1.examples) {
    console.log('Examples:', result1.examples);
  }
}

console.log('\n═══════════════════════════════════════════════════════════\n');

// Example 2: String too long
console.log('Example 2: String validation (too long)');
console.log('─────────────────────────────────────────────────────────\n');

const projectNameQuestion = schema.questions.find(q => q.id === 'project.name');
const longName = 'This is an extremely long project name that exceeds the maximum allowed length of 100 characters and will fail validation';
const result2 = validateAnswer(projectNameQuestion, longName);

console.log('Question:', projectNameQuestion.question);
console.log('Input:', longName);
console.log('Valid:', result2.valid);
if (!result2.valid) {
  console.log('Errors:', result2.errors);
  if (result2.examples) {
    console.log('Examples:', result2.examples);
  }
}

console.log('\n═══════════════════════════════════════════════════════════\n');

// Example 3: Array with too few items
console.log('Example 3: Array validation (too few items)');
console.log('─────────────────────────────────────────────────────────\n');

const securityAuthQuestion = schema.questions.find(q => q.id === 'security.auth');
const result3 = validateAnswer(securityAuthQuestion, []);

console.log('Question:', securityAuthQuestion.question);
console.log('Input:', '[]');
console.log('Valid:', result3.valid);
if (!result3.valid) {
  console.log('Errors:', result3.errors);
  if (result3.examples) {
    console.log('Examples:', result3.examples);
  }
  if (result3.learnMore) {
    console.log('Learn More:', result3.learnMore);
  }
}

console.log('\n═══════════════════════════════════════════════════════════\n');

// Example 4: Invalid enum value
console.log('Example 4: Enum validation (invalid option)');
console.log('─────────────────────────────────────────────────────────\n');

const deploymentModelQuestion = schema.questions.find(q => q.id === 'deployment.model');
const result4 = validateAnswer(deploymentModelQuestion, 'invalid-option');

console.log('Question:', deploymentModelQuestion.question);
console.log('Input:', 'invalid-option');
console.log('Valid:', result4.valid);
if (!result4.valid) {
  console.log('Errors:', result4.errors);
  if (result4.examples) {
    console.log('Examples:', result4.examples);
  }
  if (result4.learnMore) {
    console.log('Learn More:', result4.learnMore);
  }
}

console.log('\n═══════════════════════════════════════════════════════════\n');

// Example 5: Valid input
console.log('Example 5: Valid input');
console.log('─────────────────────────────────────────────────────────\n');

const result5 = validateAnswer(docVersionQuestion, '1.0.0');

console.log('Question:', docVersionQuestion.question);
console.log('Input:', '1.0.0');
console.log('Valid:', result5.valid);
console.log('Errors:', result5.errors || 'None');

console.log('\n═══════════════════════════════════════════════════════════\n');

// Example 6: PII question with boolean validation and learnMore URL
console.log('Example 6: Boolean validation with learnMore URL');
console.log('─────────────────────────────────────────────────────────\n');

const piiQuestion = schema.questions.find(q => q.id === 'privacy.pii');
const result6 = validateAnswer(piiQuestion, 'maybe'); // Invalid boolean

console.log('Question:', piiQuestion.question);
console.log('Input:', 'maybe');
console.log('Valid:', result6.valid);
if (!result6.valid) {
  console.log('Errors:', result6.errors);
  if (result6.examples) {
    console.log('Examples:', result6.examples);
  }
  if (result6.learnMore) {
    console.log('Learn More:', result6.learnMore);
  }
}

console.log('\n═══════════════════════════════════════════════════════════\n');
console.log('✓ Validation demo complete!');
console.log('═══════════════════════════════════════════════════════════\n');

