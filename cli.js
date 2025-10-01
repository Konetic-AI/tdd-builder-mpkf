#!/usr/bin/env node

/**
 * Command Line Interface for TDD Builder MPKF Tool
 * Provides interactive mode and file-based generation
 */

const { validate_and_generate_tdd } = require('./handlers/generate_tdd');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// CLI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt user for input
 */
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

/**
 * Display banner
 */
function displayBanner() {
  console.log(`
${colors.blue}${colors.bold}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     TDD Builder - MPKF Enterprise Framework Edition         ║
║              Technical Design Document Generator            ║
║                        Version 1.0.0                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}
`);
}

/**
 * Interactive mode - gather project data through prompts
 */
async function interactiveMode() {
  console.log(`${colors.green}Starting Interactive Mode${colors.reset}\n`);

  // Select complexity
  console.log('Select project complexity:');
  console.log('  1. Simple (POCs, internal tools)');
  console.log('  2. Startup (MVP-focused, early-stage products)');
  console.log('  3. Enterprise (production systems)');
  console.log('  4. MCP-Specific (AI/LLM tools)\n');

  const complexityChoice = await prompt('Enter choice (1-4): ');
  const complexityMap = { '1': 'simple', '2': 'startup', '3': 'enterprise', '4': 'mcp-specific' };
  const complexity = complexityMap[complexityChoice] || 'enterprise';

  console.log(`\n${colors.yellow}Selected complexity: ${complexity}${colors.reset}\n`);

  // Get basic project data
  const project_data = {};

  // Basic questions for all complexities
  project_data['doc.version'] = await prompt('TDD Version (e.g., 1.0): ');
  project_data['project.name'] = await prompt('Project Name: ');
  project_data['summary.problem'] = await prompt('Problem Statement (1-2 sentences): ');
  project_data['summary.solution'] = await prompt('Proposed Solution (high level): ');

  if (complexity === 'startup') {
    // Startup-specific questions (MVP-focused)
    project_data['doc.created_date'] = new Date().toISOString().split('T')[0];
    project_data['doc.authors'] = await prompt('Authors: ');
    project_data['summary.key_decisions'] = await prompt('Key Architectural Decisions for MVP: ');
    project_data['summary.success_criteria'] = await prompt('Initial Success Metrics (KPIs): ');
    project_data['context.business_goals'] = await prompt('Core Value Proposition: ');
    project_data['context.scope_in'] = await prompt('Minimum Viable Feature Set: ');
    project_data['context.scope_out'] = await prompt('Features Deferred Post-MVP: ');
    project_data['context.personas'] = await prompt('Primary User Persona: ');
    project_data['constraints.technical'] = await prompt('Technical Constraints: ');
    project_data['constraints.business'] = await prompt('Runway and Time-to-Market: ');
    project_data['architecture.style'] = await prompt('Architecture Approach: ');
    project_data['architecture.tech_stack'] = await prompt('Technology Stack: ');
    project_data['nfr.performance'] = await prompt('Baseline Performance Expectations: ');
    project_data['nfr.scalability'] = await prompt('Expected Users (first 6 months): ');
    project_data['security.auth'] = await prompt('Authentication Approach: ');
    project_data['ops.deployment_strategy'] = await prompt('Deployment Strategy: ');
  }

  if (complexity === 'enterprise' || complexity === 'mcp-specific') {
    // Additional enterprise questions
    project_data['doc.created_date'] = new Date().toISOString().split('T')[0];
    project_data['doc.authors'] = await prompt('Authors (comma-separated): ');
    project_data['doc.stakeholders'] = await prompt('Stakeholders (comma-separated): ');
    project_data['summary.key_decisions'] = await prompt('Key Architectural Decisions: ');
    project_data['summary.success_criteria'] = await prompt('Success Criteria: ');
    project_data['context.business_goals'] = await prompt('Business Goals: ');
    project_data['context.scope_in'] = await prompt('In-Scope Features: ');
    project_data['context.scope_out'] = await prompt('Out-of-Scope Features: ');
    project_data['constraints.technical'] = await prompt('Technical Constraints: ');
    project_data['architecture.style'] = await prompt('Architecture Style (e.g., microservices): ');
    project_data['nfr.performance'] = await prompt('Performance Requirements: ');
    project_data['security.threat_model'] = await prompt('Threat Model Summary: ');
    project_data['ops.deployment_strategy'] = await prompt('Deployment Strategy: ');
  }

  if (complexity === 'mcp-specific') {
    // MCP-specific questions
    console.log(`\n${colors.yellow}MCP-Specific Configuration${colors.reset}\n`);
    project_data['security.mcp_protocol_compliance'] = await prompt('MCP Protocol Compliance Strategy: ');
    project_data['security.mcp_sandboxing_model'] = await prompt('MCP Sandboxing Model: ');
    project_data['security.mcp_permission_model'] = await prompt('MCP Permission Model: ');
  }

  return { project_data, complexity };
}

/**
 * File mode - load project data from JSON file
 */
async function fileMode(filePath) {
  console.log(`${colors.green}Loading project data from: ${filePath}${colors.reset}\n`);

  try {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content);

    if (!data.complexity) {
      console.log(`${colors.yellow}Warning: No complexity specified, defaulting to 'enterprise'${colors.reset}`);
      data.complexity = 'enterprise';
    }

    return {
      project_data: data,
      complexity: data.complexity
    };
  } catch (error) {
    throw new Error(`Failed to load file: ${error.message}`);
  }
}

/**
 * Generate TDD with retry logic for incomplete data
 */
async function generateWithRetry(project_data, complexity, maxRetries = 3) {
  let retryCount = 0;
  let currentData = { ...project_data };

  while (retryCount < maxRetries) {
    console.log(`\n${colors.blue}Generating TDD...${colors.reset}`);

    const result = await validate_and_generate_tdd({
      project_data: currentData,
      complexity: complexity
    });

    if (result.status === 'complete') {
      return result;
    } else if (result.status === 'incomplete') {
      console.log(`\n${colors.yellow}Missing required information:${colors.reset}`);
      console.log(`Found ${result.missing_fields.length} missing fields\n`);

      if (retryCount < maxRetries - 1) {
        const continuePrompt = await prompt('Would you like to provide missing information? (y/n): ');
        if (continuePrompt.toLowerCase() !== 'y') {
          throw new Error('User cancelled');
        }

        // Ask for missing fields
        for (const question of result.adhoc_questions.slice(0, 10)) {
          const answer = await prompt(`${question.question}: `);
          if (answer) {
            currentData[question.field] = answer;
          }
        }

        retryCount++;
      } else {
        throw new Error(`Too many retries. ${result.missing_fields.length} fields still missing.`);
      }
    } else {
      throw new Error(result.message || 'Generation failed');
    }
  }
}

/**
 * Save TDD to file
 */
async function saveTDD(tdd, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, tdd, 'utf8');
  console.log(`${colors.green}✅ TDD saved to: ${outputPath}${colors.reset}`);
}

/**
 * Main CLI function
 */
async function main() {
  displayBanner();

  const args = process.argv.slice(2);

  try {
    let project_data, complexity;

    if (args.length === 0) {
      // Interactive mode
      ({ project_data, complexity } = await interactiveMode());
    } else if (args[0] === '--file' || args[0] === '-f') {
      // File mode
      if (!args[1]) {
        throw new Error('Please provide a file path');
      }
      ({ project_data, complexity } = await fileMode(args[1]));
    } else if (args[0] === '--help' || args[0] === '-h') {
      // Help
      console.log(`
Usage: node cli.js [options]

Options:
  (no options)     Interactive mode - answer questions to generate TDD
  -f, --file PATH  Load project data from JSON file
  -h, --help       Show this help message

Examples:
  node cli.js                          # Interactive mode
  node cli.js -f project.json          # Load from file
  node cli.js -f tests/sample_mcp.json # Use test data

Output:
  Generated TDD will be saved to ./output/[project_name]_tdd.md
      `);
      process.exit(0);
    } else {
      throw new Error('Invalid arguments. Use --help for usage information.');
    }

    // Generate TDD
    const result = await generateWithRetry(project_data, complexity);

    if (result.status === 'complete') {
      // Display summary
      console.log(`\n${colors.green}${colors.bold}✅ TDD Generation Complete!${colors.reset}`);

      if (result.metadata) {
        console.log(`\n${colors.dim}Metadata:${colors.reset}`);
        console.log(`  Complexity: ${result.metadata.complexity}`);
        console.log(`  Total Fields: ${result.metadata.total_fields}`);
        console.log(`  Populated Fields: ${result.metadata.populated_fields}`);
        console.log(`  Generated: ${result.metadata.generation_timestamp}`);
      }

      // Check for any issues
      const orphans = (result.tdd.match(/{{[^}]+}}/g) || []).filter(v => !v.includes('*Not Provided*'));
      if (orphans.length > 0) {
        console.log(`\n${colors.yellow}⚠️  Warning: ${orphans.length} orphan variables found${colors.reset}`);
      }

      // Save output
      const projectName = project_data['project.name'] || 'unnamed';
      const safeProjectName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const outputPath = path.join('output', `${safeProjectName}_tdd.md`);

      await saveTDD(result.tdd, outputPath);

      // Offer to open the file
      console.log(`\n${colors.dim}You can view the generated TDD at: ${outputPath}${colors.reset}`);
    }

  } catch (error) {
    console.log(`\n${colors.red}❌ Error: ${error.message}${colors.reset}`);
    if (process.env.DEBUG) {
      console.log(error.stack);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };