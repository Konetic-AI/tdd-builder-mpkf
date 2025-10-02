/**
 * Test Runner for TDD Builder MPKF Tool
 * Executes all sample test cases and validates outputs
 */

const { validate_and_generate_tdd } = require('./handlers/generate_tdd');
const fs = require('fs').promises;
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

/**
 * Run a single test case
 */
async function runTest(testName, complexity) {
  console.log(`\n${colors.blue}${colors.bold}Running ${testName} Test${colors.reset}`);
  console.log('='.repeat(50));

  try {
    // Load test data
    const testDataPath = path.join(__dirname, 'tests', `sample_${complexity}.json`);
    const testData = JSON.parse(await fs.readFile(testDataPath, 'utf8'));

    // Execute the handler
    console.log(`${colors.yellow}Complexity:${colors.reset} ${complexity}`);
    console.log(`${colors.yellow}Project:${colors.reset} ${testData['project.name'] || 'Unnamed'}`);

    const startTime = Date.now();
    const result = await validate_and_generate_tdd({
      project_data: testData,
      complexity: complexity
    });
    const endTime = Date.now();

    console.log(`${colors.yellow}Execution Time:${colors.reset} ${endTime - startTime}ms`);

    // Validate the result
    if (result.status === 'complete') {
      console.log(`${colors.green}✅ Status: COMPLETE${colors.reset}`);

      // Check for orphan variables
      const orphans = (result.tdd.match(/{{[^}]+}}/g) || []).filter(v => !v.includes('*Not Provided*'));
      if (orphans.length > 0) {
        console.log(`${colors.red}⚠️  Warning: Found ${orphans.length} orphan variables${colors.reset}`);
        console.log(`   ${orphans.slice(0, 3).join(', ')}${orphans.length > 3 ? '...' : ''}`);
      } else {
        console.log(`${colors.green}✅ No orphan variables${colors.reset}`);
      }

      // Check for required sections
      const requiredSections = [
        '## Stage 1: Project Foundation',
        '## Stage 2: Requirements & Context Analysis',
        '## Stage 3: Architecture Design'
      ];

      if (complexity === 'startup') {
        requiredSections.push(
          '## Stage 4: Non-Functional Requirements',
          '## Stage 5: Security & Privacy Architecture',
          '## Stage 6: Operations & Observability',
          '## Stage 7: Implementation Planning',
          '## Stage 8: Risk Management & Technical Debt'
        );
      }

      if (complexity === 'enterprise' || complexity === 'mcp-specific') {
        requiredSections.push(
          '## Stage 4: Non-Functional Requirements',
          '## Stage 5: Security & Privacy Architecture',
          '## Stage 6: Operations & Observability',
          '## Stage 7: Implementation Planning',
          '## Stage 8: Risk Management & Technical Debt',
          '## Stage 9: Appendices & References'
        );
      }

      if (complexity === 'mcp-specific') {
        requiredSections.push('### 5.3 [MCP] Tool Security Boundaries');
      }

      let allSectionsPresent = true;
      for (const section of requiredSections) {
        if (!result.tdd.includes(section)) {
          console.log(`${colors.red}⚠️  Missing section: ${section}${colors.reset}`);
          allSectionsPresent = false;
        }
      }

      if (allSectionsPresent) {
        console.log(`${colors.green}✅ All required sections present${colors.reset}`);
      }

      // Check for compliance reports
      const reports = [
        '## Gap Analysis Report',
        '## MPKF Compliance Report',
        '## Completeness Report'
      ];

      let allReportsPresent = true;
      for (const report of reports) {
        if (!result.tdd.includes(report)) {
          console.log(`${colors.red}⚠️  Missing report: ${report}${colors.reset}`);
          allReportsPresent = false;
        }
      }

      if (allReportsPresent) {
        console.log(`${colors.green}✅ All compliance reports present${colors.reset}`);
      }

      // Check for Micro Builds Guide
      if (!result.tdd.includes('## Micro Builds Guide')) {
        console.log(`${colors.red}❌ Missing Micro Builds Guide in generated TDD${colors.reset}`);
        return false;
      } else {
        console.log(`${colors.green}✅ Micro Builds Guide present${colors.reset}`);
      }

      // Save output to file
      const outputPath = path.join(__dirname, 'output', `${complexity}_output.md`);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, result.tdd, 'utf8');
      console.log(`${colors.green}✅ Output saved to: ${outputPath}${colors.reset}`);

      // Display metadata
      if (result.metadata) {
        console.log(`${colors.yellow}Metadata:${colors.reset}`);
        console.log(`  - Total Fields: ${result.metadata.total_fields}`);
        console.log(`  - Populated Fields: ${result.metadata.populated_fields}`);
        console.log(`  - Generation Time: ${result.metadata.generation_timestamp}`);
      }

      return true;

    } else if (result.status === 'incomplete') {
      console.log(`${colors.yellow}⚠️  Status: INCOMPLETE${colors.reset}`);
      console.log(`${colors.yellow}Missing Fields (${result.missing_fields.length}):${colors.reset}`);
      result.missing_fields.slice(0, 5).forEach(field => {
        console.log(`  - ${field}`);
      });
      if (result.missing_fields.length > 5) {
        console.log(`  ... and ${result.missing_fields.length - 5} more`);
      }
      console.log(`\n${colors.yellow}Sample Questions:${colors.reset}`);
      result.adhoc_questions.slice(0, 3).forEach(q => {
        console.log(`  - ${q.field}: "${q.question}"`);
      });
      return false;

    } else {
      console.log(`${colors.red}❌ Status: ERROR${colors.reset}`);
      console.log(`   ${result.message}`);
      return false;
    }

  } catch (error) {
    console.log(`${colors.red}❌ Test Failed${colors.reset}`);
    console.log(`   ${error.message}`);
    if (process.env.DEBUG) {
      console.log(error.stack);
    }
    return false;
  }
}

/**
 * Test incomplete data handling
 */
async function testIncompleteData() {
  console.log(`\n${colors.blue}${colors.bold}Testing Incomplete Data Handling${colors.reset}`);
  console.log('='.repeat(50));

  const incompleteData = {
    "project.name": "Test Project",
    "summary.problem": "Test problem"
  };

  const result = await validate_and_generate_tdd({
    project_data: incompleteData,
    complexity: "enterprise"
  });

  if (result.status === 'incomplete' && result.adhoc_questions.length > 0) {
    console.log(`${colors.green}✅ Correctly identified ${result.missing_fields.length} missing fields${colors.reset}`);
    console.log(`${colors.green}✅ Generated ${result.adhoc_questions.length} ad-hoc questions${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.red}❌ Failed to handle incomplete data correctly${colors.reset}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`${colors.bold}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bold}TDD Builder MPKF - Test Suite${colors.reset}`);
  console.log(`${colors.bold}${'='.repeat(60)}${colors.reset}`);

  const tests = [
    { name: 'Simple Project', complexity: 'simple' },
    { name: 'Startup Project', complexity: 'startup' },
    { name: 'Enterprise Project', complexity: 'enterprise' },
    { name: 'MCP-Specific Project', complexity: 'mcp-specific' }
  ];

  const results = [];

  // Run standard tests
  for (const test of tests) {
    const passed = await runTest(test.name, test.complexity);
    results.push({ name: test.name, passed });
  }

  // Run special tests
  const incompleteTestPassed = await testIncompleteData();
  results.push({ name: 'Incomplete Data Handling', passed: incompleteTestPassed });

  // Summary
  console.log(`\n${colors.bold}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bold}Test Summary${colors.reset}`);
  console.log(`${colors.bold}${'='.repeat(60)}${colors.reset}`);

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  results.forEach(result => {
    const status = result.passed ? `${colors.green}✅ PASSED` : `${colors.red}❌ FAILED`;
    console.log(`${status}${colors.reset}: ${result.name}`);
  });

  console.log(`\n${colors.bold}Total: ${passed} passed, ${failed} failed${colors.reset}`);

  if (failed === 0) {
    console.log(`${colors.green}${colors.bold}🎉 All tests passed! Tool is MPKF compliant.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bold}⚠️  Some tests failed. Please review the output.${colors.reset}`);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
}

module.exports = { runTest, runAllTests };