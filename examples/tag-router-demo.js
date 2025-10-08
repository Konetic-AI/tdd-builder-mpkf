#!/usr/bin/env node

/**
 * Tag-Based Filtering Demo
 * 
 * This script demonstrates the tag-based filtering functionality
 * in the TDD Builder tool.
 */

const { loadQuestionnaireSchema } = require('../dist/src/lib/schemaLoader');
const { filterQuestionsByTags } = require('../dist/src/lib/tagRouter');

console.log('═══════════════════════════════════════════════════════════');
console.log('  Tag-Based Question Filtering Demo');
console.log('═══════════════════════════════════════════════════════════\n');

// Load the question schema
const schema = loadQuestionnaireSchema();
console.log(`Loaded ${schema.questions.length} questions from schema\n`);

// Demo 1: Filter by operations tag with on-premise deployment
console.log('─────────────────────────────────────────────────────────');
console.log('Demo 1: Operations questions for on-premise deployment');
console.log('─────────────────────────────────────────────────────────');

const demo1Answers = {
  'deployment.model': 'on-premise'
};

const demo1Results = filterQuestionsByTags(
  schema.questions,
  ['operations'],
  demo1Answers
);

console.log(`Selected Tags: ['operations']`);
console.log(`Answers: deployment.model = 'on-premise'`);
console.log(`\nFiltered Questions (${demo1Results.length}):`);
demo1Results.forEach(q => {
  console.log(`  • ${q.id} [${q.tags.join(', ')}]`);
});

console.log('\n✓ Note: Cloud questions (cloud.provider, cloud.regions) are skipped');
console.log('✓ Note: On-premise question (datacenter.location) is included');
console.log('✓ Note: Foundation questions are always included\n');

// Demo 2: Filter by security tag with PII handling
console.log('─────────────────────────────────────────────────────────');
console.log('Demo 2: Security questions with PII handling');
console.log('─────────────────────────────────────────────────────────');

const demo2Answers = {
  'privacy.pii': true
};

const demo2Results = filterQuestionsByTags(
  schema.questions,
  ['security'],
  demo2Answers
);

console.log(`Selected Tags: ['security']`);
console.log(`Answers: privacy.pii = true`);
console.log(`\nFiltered Questions (${demo2Results.length}):`);
demo2Results.forEach(q => {
  console.log(`  • ${q.id} [${q.tags.join(', ')}]`);
});

console.log('\n✓ Note: Privacy follow-up questions are included because PII = true');
console.log('✓ Note: Questions with both "security" and "privacy" tags are included\n');

// Demo 3: Filter by security tag WITHOUT PII
console.log('─────────────────────────────────────────────────────────');
console.log('Demo 3: Security questions without PII handling');
console.log('─────────────────────────────────────────────────────────');

const demo3Answers = {
  'privacy.pii': false
};

const demo3Results = filterQuestionsByTags(
  schema.questions,
  ['security'],
  demo3Answers
);

console.log(`Selected Tags: ['security']`);
console.log(`Answers: privacy.pii = false`);
console.log(`\nFiltered Questions (${demo3Results.length}):`);
demo3Results.forEach(q => {
  console.log(`  • ${q.id} [${q.tags.join(', ')}]`);
});

console.log('\n✓ Note: Privacy follow-up questions are skipped because PII = false');
console.log('✓ Note: Fewer questions than Demo 2\n');

// Demo 4: Multiple tags with hybrid deployment
console.log('─────────────────────────────────────────────────────────');
console.log('Demo 4: Multiple tags (operations + architecture) - Hybrid');
console.log('─────────────────────────────────────────────────────────');

const demo4Answers = {
  'deployment.model': 'hybrid'
};

const demo4Results = filterQuestionsByTags(
  schema.questions,
  ['operations', 'architecture'],
  demo4Answers
);

console.log(`Selected Tags: ['operations', 'architecture']`);
console.log(`Answers: deployment.model = 'hybrid'`);
console.log(`\nFiltered Questions (${demo4Results.length}):`);
demo4Results.forEach(q => {
  console.log(`  • ${q.id} [${q.tags.join(', ')}]`);
});

console.log('\n✓ Note: Both cloud AND on-premise questions are included (hybrid)');
console.log('✓ Note: Questions with "operations" OR "architecture" tags are included\n');

// Demo 5: No tag filter (all questions)
console.log('─────────────────────────────────────────────────────────');
console.log('Demo 5: No tag filter - All questions');
console.log('─────────────────────────────────────────────────────────');

const demo5Answers = {};

const demo5Results = filterQuestionsByTags(
  schema.questions,
  undefined,
  demo5Answers
);

console.log(`Selected Tags: undefined (no filter)`);
console.log(`Answers: {} (empty)`);
console.log(`\nFiltered Questions (${demo5Results.length}):`);

// Group by stage
const byStage = demo5Results.reduce((acc, q) => {
  if (!acc[q.stage]) acc[q.stage] = [];
  acc[q.stage].push(q);
  return acc;
}, {});

Object.keys(byStage).forEach(stage => {
  console.log(`\n  ${stage.toUpperCase()} (${byStage[stage].length} questions):`);
  byStage[stage].forEach(q => {
    console.log(`    • ${q.id} [${q.tags.join(', ')}]`);
  });
});

console.log('\n✓ Note: All questions are included (no tag filter)');
console.log('✓ Note: Skip_if conditions still apply\n');

// Performance benchmark
console.log('─────────────────────────────────────────────────────────');
console.log('Performance Benchmark');
console.log('─────────────────────────────────────────────────────────');

const iterations = 1000;
const benchmarkAnswers = {
  'deployment.model': 'cloud',
  'privacy.pii': true
};

const start = Date.now();
for (let i = 0; i < iterations; i++) {
  filterQuestionsByTags(
    schema.questions,
    ['operations', 'security', 'privacy'],
    benchmarkAnswers
  );
}
const end = Date.now();

const avgTime = (end - start) / iterations;
console.log(`\nIterations: ${iterations}`);
console.log(`Total Time: ${end - start}ms`);
console.log(`Average Time: ${avgTime.toFixed(3)}ms`);
console.log(`Status: ${avgTime < 5 ? '✅ PASS' : '❌ FAIL'} (target: <5ms)\n`);

console.log('═══════════════════════════════════════════════════════════');
console.log('  Demo Complete');
console.log('═══════════════════════════════════════════════════════════\n');

