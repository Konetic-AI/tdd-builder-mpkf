#!/usr/bin/env node

/**
 * Command Line Interface for TDD Builder MPKF Tool
 * Enhanced 3-stage interview: Core → Review → Deep Dive
 */

const { validate_and_generate_tdd } = require('./handlers/generate_tdd');
const pdfExporter = require('./utils/pdfExporter');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const fsSync = require('fs');

// Import feature flags
const { 
  isSchemaOnboardingEnabled, 
  setSchemaOnboardingEnabled, 
  getCurrentModeDescription,
  validateFeatureFlags,
  canUseSchemaMode
} = require('./dist/src/lib/featureFlags');

// Import compiled TypeScript modules (conditionally loaded based on feature flag)
let schemaModules = null;

function loadSchemaModules() {
  if (!schemaModules) {
    try {
      schemaModules = {
        loadQuestionnaireSchema: require('./dist/src/lib/schemaLoader').loadQuestionnaireSchema,
        loadTagSchema: require('./dist/src/lib/schemaLoader').loadTagSchema,
        evaluateSkip: require('./dist/src/lib/rulesEngine').evaluateSkip,
        filterQuestions: require('./dist/src/lib/rulesEngine').filterQuestions,
        expandTriggers: require('./dist/src/lib/rulesEngine').expandTriggers,
        recommendLevel: require('./dist/src/lib/complexity').recommendLevel,
        getComplexityLevelDescription: require('./dist/src/lib/complexity').getComplexityLevelDescription,
        groupQuestionsByTag: require('./dist/src/lib/tagRouter').groupQuestionsByTag,
        filterByTagsAndComplexity: require('./dist/src/lib/tagRouter').filterQuestions,
        validateAnswer: require('./dist/src/lib/validateAnswer').validateAnswer
      };
    } catch (error) {
      throw new Error(`Failed to load schema modules: ${error.message}. Run "npm run build" to compile TypeScript modules.`);
    }
  }
  return schemaModules;
}

// Import review screen module
const reviewScreen = require('./src/lib/reviewScreen');

// Import telemetry module
const { 
  isTelemetryEnabled, 
  TelemetrySession, 
  displayAggregateInsights 
} = require('./src/lib/telemetry');

// CLI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m'
};

// Create readline interface
let rl = readline.createInterface({
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
  const mode = isSchemaOnboardingEnabled() ? 'Schema-Driven' : 'Legacy';
  const modeColor = isSchemaOnboardingEnabled() ? colors.green : colors.yellow;
  
  console.log(`
${colors.blue}${colors.bold}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     TDD Builder - MPKF Enterprise Framework Edition         ║
║              Technical Design Document Generator            ║
║                        Version 2.0.0                        ║
║                    ${modeColor}[${mode} Mode]${colors.blue}                         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}
${colors.dim}${getCurrentModeDescription()}${colors.reset}
`);
}

/**
 * Display stage header
 */
function displayStageHeader(stageName, stageDescription) {
  console.log(`\n${colors.cyan}${colors.bold}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  ${stageName}${colors.reset}`);
  console.log(`${colors.dim}  ${stageDescription}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}${'='.repeat(60)}${colors.reset}\n`);
}

/**
 * Display question with formatting
 */
function displayQuestion(question, questionNumber, totalQuestions, showHelpAffordance = false) {
  // Display question with help affordance if available
  let questionText = `${colors.bold}[${questionNumber}/${totalQuestions}] ${question.question}${colors.reset}`;
  if (showHelpAffordance && question.help) {
    questionText += ` ${colors.cyan}(?)${colors.reset}`;
  }
  console.log(questionText);
  
  if (question.hint) {
    console.log(`${colors.dim}  💡 ${question.hint}${colors.reset}`);
  }
}

/**
 * Display help information for a question
 */
function displayHelp(question) {
  if (question.help) {
    console.log(`\n${colors.yellow}${colors.bold}━━━ Help ━━━${colors.reset}`);
    
    // Display "why" explanation
    if (question.help.why) {
      console.log(`\n${colors.yellow}${colors.bold}Why We Ask:${colors.reset}`);
      console.log(`${colors.dim}  ${question.help.why}${colors.reset}`);
    }
    
    // Display examples (handle both array and object formats)
    if (question.help.examples) {
      console.log(`\n${colors.yellow}${colors.bold}Examples:${colors.reset}`);
      
      if (Array.isArray(question.help.examples)) {
        // Legacy array format
        question.help.examples.forEach((example, idx) => {
          console.log(`${colors.dim}  ${idx + 1}. ${example}${colors.reset}`);
        });
      } else if (typeof question.help.examples === 'object') {
        // New object format - display as a table
        const entries = Object.entries(question.help.examples);
        const maxKeyLength = Math.max(...entries.map(([key]) => key.length));
        
        entries.forEach(([key, value]) => {
          const paddedKey = key.padEnd(maxKeyLength);
          console.log(`${colors.cyan}  ${paddedKey}${colors.reset} ${colors.dim}→${colors.reset} ${value}`);
        });
      }
    }
    
    // Display learn more link
    if (question.help.learnMore) {
      console.log(`\n${colors.yellow}${colors.bold}Learn More:${colors.reset}`);
      console.log(`${colors.cyan}  ${colors.underline}${question.help.learnMore}${colors.reset}`);
    }
    
    console.log(`${colors.yellow}${colors.bold}━━━━━━━━━━━${colors.reset}`);
  } else {
    console.log(`${colors.dim}  No additional help available for this question.${colors.reset}`);
  }
}

/**
 * Display validation error with examples and learn more link
 */
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

/**
 * Ask a single question and get answer
 */
async function askQuestion(question, questionNumber, totalQuestions, showHelp = false) {
  displayQuestion(question, questionNumber, totalQuestions, showHelp);
  
  // Display options if available
  if (question.options && Array.isArray(question.options)) {
    if (question.type === 'select') {
      question.options.forEach((opt, idx) => {
        console.log(`  ${idx + 1}. ${opt}`);
      });
    } else if (question.type === 'multi-select') {
      question.options.forEach((opt, idx) => {
        console.log(`  ${idx + 1}. ${opt}`);
      });
      console.log(`${colors.dim}  (Enter numbers separated by commas, e.g., 1,3,5)${colors.reset}`);
    } else if (question.type === 'boolean') {
      console.log(`  1. Yes`);
      console.log(`  2. No`);
    }
  }
  
  // Show help instruction if help is available
  if (showHelp && question.help) {
    console.log(`${colors.dim}  (Type '?' for help)${colors.reset}`);
  }
  
  let answer = await prompt('\n  Your answer: ');
  
  // Handle help request
  if (answer.trim() === '?') {
    displayHelp(question);
    console.log('');
    return askQuestion(question, questionNumber, totalQuestions, showHelp);
  }
  
  // Handle empty answer
  if (!answer.trim()) {
    console.log(`${colors.yellow}  Skipping this question (you can fill it in later)${colors.reset}\n`);
    return null;
  }
  
  // Parse answer based on question type
  const parsedAnswer = parseAnswer(answer, question);
  
  // Validate the parsed answer (only in schema-driven mode)
  if (question.validation && isSchemaOnboardingEnabled()) {
    try {
      const modules = loadSchemaModules();
      const validationResult = modules.validateAnswer(question, parsedAnswer);
      
      if (!validationResult.valid) {
        // Display validation error with examples and learn more link
        displayValidationError(validationResult);
        
        // Ask the question again
        return askQuestion(question, questionNumber, totalQuestions, showHelp);
      }
    } catch (error) {
      // If validation fails to load, just skip validation
      console.log(`${colors.yellow}Warning: Validation not available${colors.reset}`);
    }
  }
  
  // Return the validated answer
  return parsedAnswer;
}

/**
 * Parse answer based on question type
 */
function parseAnswer(answer, question) {
  const trimmed = answer.trim();
  
  if (question.type === 'boolean') {
    const lower = trimmed.toLowerCase();
    if (lower === '1' || lower === 'yes' || lower === 'y' || lower === 'true') {
      return true;
    } else if (lower === '2' || lower === 'no' || lower === 'n' || lower === 'false') {
      return false;
    }
    return null;
  }
  
  if (question.type === 'select') {
    if (question.options) {
      const index = parseInt(trimmed) - 1;
      if (index >= 0 && index < question.options.length) {
        return question.options[index];
      }
      // Try to match by name
      const match = question.options.find(opt => opt.toLowerCase() === trimmed.toLowerCase());
      if (match) return match;
    }
    return trimmed;
  }
  
  if (question.type === 'multi-select') {
    if (question.options) {
      const selections = trimmed.split(',').map(s => s.trim());
      const results = [];
      
      for (const selection of selections) {
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < question.options.length) {
          results.push(question.options[index]);
        } else {
          // Try to match by name
          const match = question.options.find(opt => opt.toLowerCase() === selection.toLowerCase());
          if (match) results.push(match);
        }
      }
      
      return results.length > 0 ? results : [trimmed];
    }
    return trimmed.split(',').map(s => s.trim());
  }
  
  return trimmed;
}

/**
 * STAGE 1: Core Questions (5-7 essentials)
 */
async function runCoreStage(schema, tagSchema, answers = {}, telemetry = null) {
  const modules = loadSchemaModules();
  
  // Start telemetry tracking for this stage
  if (telemetry) {
    telemetry.startStage('core');
  }
  
  displayStageHeader(
    'STAGE 1: Core Questions',
    'Essential information to get started (5-7 questions)'
  );
  
  // Get core stage questions
  let coreQuestions = schema.questions.filter(q => q.stage === 'core');
  
  // Filter based on skip_if conditions
  coreQuestions = coreQuestions.filter(q => !modules.evaluateSkip(q, answers));
  
  // Build question registry for triggers
  const questionRegistry = new Map();
  schema.questions.forEach(q => questionRegistry.set(q.id, q));
  
  let questionNum = 1;
  const totalQuestions = coreQuestions.length;
  
  for (const question of coreQuestions) {
    // Skip if already answered
    if (answers[question.id] !== undefined) {
      questionNum++;
      continue;
    }
    
    // Track question asked
    if (telemetry) {
      telemetry.trackQuestionAsked(question.id, question.tags || []);
    }
    
    const answer = await askQuestion(question, questionNum, totalQuestions, true);
    
    // Track answer
    if (telemetry) {
      telemetry.trackQuestionAnswered(question.id, question.tags || [], answer !== null);
    }
    
      if (answer !== null) {
      answers[question.id] = answer;
      
      // Check for triggers
      const triggered = modules.expandTriggers(question, answer, questionRegistry);
      if (triggered.length > 0) {
        // Add triggered questions to core stage if they're not already there
        triggered.forEach(tq => {
          if (tq.stage === 'core' && !coreQuestions.find(q => q.id === tq.id)) {
            coreQuestions.push(tq);
          }
        });
      }
    }
    
    questionNum++;
  }
  
  // End telemetry tracking for this stage
  if (telemetry) {
    telemetry.endStage('core');
  }
  
  console.log(`${colors.green}✓ Core questions complete!${colors.reset}\n`);
  return answers;
}

/**
 * STAGE 2: Review & Edit (Enhanced)
 */
async function runReviewStage(schema, tagSchema, answers, complexity, telemetry = null) {
  const modules = loadSchemaModules();
  
  // Start telemetry tracking for this stage
  if (telemetry) {
    telemetry.startStage('review');
  }
  
  displayStageHeader(
    'STAGE 2: Review Your Answers',
    'Review and edit your responses before continuing'
  );
  
  // Determine complexity level for preview
  const previewComplexity = complexity || modules.recommendLevel(answers, tagSchema);
  
  // Display enhanced review screen with grouped answers and TDD preview
  reviewScreen.displayReviewScreen(answers, schema, tagSchema, previewComplexity, colors);
  
  // Recommend complexity level
  const recommendedLevel = modules.recommendLevel(answers, tagSchema);
  console.log(`${colors.yellow}${colors.bold}📊 Recommended Complexity Level:${colors.reset} ${recommendedLevel}`);
  console.log(`${colors.dim}   ${modules.getComplexityLevelDescription(recommendedLevel)}${colors.reset}\n`);
  
  // Track complexity recommendation
  if (telemetry) {
    telemetry.trackComplexity(recommendedLevel, complexity || recommendedLevel);
  }
  
  // Ask if user wants to edit any answers
  console.log(`${colors.dim}You can edit any answer by entering its number [in brackets], or type 'done' to continue.${colors.reset}\n`);
  
  answers = await reviewScreen.handleAnswerEditing(answers, schema, prompt, askQuestion, colors);
  
  // End telemetry tracking for this stage
  if (telemetry) {
    telemetry.endStage('review');
  }
  
  console.log(`${colors.green}✓ Review complete!${colors.reset}\n`);
  return answers;
}

/**
 * STAGE 3: Deep Dive (filtered by tags/complexity)
 */
async function runDeepDiveStage(schema, tagSchema, answers, options = {}, telemetry = null) {
  const modules = loadSchemaModules();
  
  // Start telemetry tracking for this stage
  if (telemetry) {
    telemetry.startStage('deep_dive');
  }
  
  displayStageHeader(
    'STAGE 3: Deep Dive',
    'Detailed questions organized by topic (skip sections as needed)'
  );
  
  // Get deep dive questions
  let deepDiveQuestions = schema.questions.filter(q => q.stage === 'deep_dive');
  
  // Filter by skip_if conditions
  deepDiveQuestions = deepDiveQuestions.filter(q => !modules.evaluateSkip(q, answers));
  
  // Apply tag filter if specified
  if (options.tags && options.tags.length > 0) {
    deepDiveQuestions = deepDiveQuestions.filter(q =>
      q.tags.some(tag => options.tags.includes(tag))
    );
  }
  
  // Apply complexity filter if specified
  if (options.complexity) {
    deepDiveQuestions = deepDiveQuestions.filter(q => {
      const metadata = tagSchema.field_metadata[q.id];
      if (!metadata) return options.complexity === 'base';
      return metadata.complexity_levels.includes(options.complexity);
    });
  }
  
  // Group questions by primary tag
  const groupedQuestions = {};
  deepDiveQuestions.forEach(q => {
    const primaryTag = q.tags[0] || 'other';
    if (!groupedQuestions[primaryTag]) {
      groupedQuestions[primaryTag] = [];
    }
    groupedQuestions[primaryTag].push(q);
  });
  
  // Process each section
  for (const [tag, questions] of Object.entries(groupedQuestions)) {
    const tagInfo = tagSchema.tags[tag];
    const tagLabel = tagInfo ? tagInfo.label : tag;
    const tagDescription = tagInfo ? tagInfo.description : '';
    
    console.log(`\n${colors.magenta}${colors.bold}━━━ ${tagLabel} ━━━${colors.reset}`);
    if (tagDescription) {
      console.log(`${colors.dim}${tagDescription}${colors.reset}`);
    }
    console.log(`${colors.dim}${questions.length} question(s) in this section${colors.reset}\n`);
    
    // Ask if user wants to skip this section
    const skipSection = await prompt(`${colors.bold}Do you want to answer questions in this section? (y/n): ${colors.reset}`);
    
    if (skipSection.toLowerCase() === 'n' || skipSection.toLowerCase() === 'no') {
      console.log(`${colors.yellow}⊘ Skipping ${tagLabel} section${colors.reset}\n`);
      
      // Track section skip
      if (telemetry) {
        telemetry.trackSectionSkipped(tagLabel, questions.length);
      }
      
      continue;
    }
    
    // Ask questions in this section
    let questionNum = 1;
    const totalInSection = questions.length;
    
    for (const question of questions) {
      // Skip if already answered
      if (answers[question.id] !== undefined) {
        questionNum++;
        continue;
      }
      
      // Track question asked
      if (telemetry) {
        telemetry.trackQuestionAsked(question.id, question.tags || []);
      }
      
      const answer = await askQuestion(question, questionNum, totalInSection, true);
      
      // Track answer
      if (telemetry) {
        telemetry.trackQuestionAnswered(question.id, question.tags || [], answer !== null);
      }
      
      if (answer !== null) {
        answers[question.id] = answer;
      }
      
      questionNum++;
    }
    
    console.log(`${colors.green}✓ ${tagLabel} section complete!${colors.reset}`);
  }
  
  // End telemetry tracking for this stage
  if (telemetry) {
    telemetry.endStage('deep_dive');
  }
  
  console.log(`\n${colors.green}${colors.bold}✓ Deep dive complete!${colors.reset}\n`);
  return answers;
}

/**
 * Interactive mode - 3-stage interview
 */
async function interactiveMode(options = {}) {
  console.log(`${colors.green}${colors.bold}Starting 3-Stage Interview${colors.reset}\n`);
  
  // Initialize telemetry session
  const telemetry = isTelemetryEnabled() ? new TelemetrySession() : null;
  
  if (telemetry) {
    console.log(`${colors.dim}📊 Telemetry enabled - collecting anonymized usage metrics${colors.reset}\n`);
  }
  
  // Load schemas (only if schema-driven mode is enabled)
  let schema, tagSchema;
  
  if (isSchemaOnboardingEnabled()) {
    try {
      const modules = loadSchemaModules();
      schema = modules.loadQuestionnaireSchema();
      tagSchema = modules.loadTagSchema();
    } catch (error) {
      throw new Error(`Failed to load schemas: ${error.message}`);
    }
  } else {
    // Legacy mode: Use fallback approach
    console.log(`${colors.yellow}Running in legacy mode (hardcoded questions)${colors.reset}`);
    console.log(`${colors.dim}To enable schema-driven mode: export SCHEMA_DRIVEN_ONBOARDING=true${colors.reset}\n`);
    
    // In legacy mode, we need to provide minimal schema structure or use a different flow
    // For now, we'll throw an error indicating this path needs full implementation
    throw new Error('Legacy mode is not fully implemented in interactive CLI. Use SCHEMA_DRIVEN_ONBOARDING=true or provide input via --noninteractive.');
  }
  
  let answers = {};
  let template = null;
  
  // Load template if specified
  if (options.template) {
    template = loadTemplate(options.template);
    
    // Track template usage
    if (telemetry) {
      telemetry.trackTemplate(options.template);
    }
    
    // Pre-fill answers from template defaults
    answers = { ...template.defaults };
    
    // Apply template tag focus if no tags specified
    if (!options.tags || options.tags.length === 0) {
      options.tags = template.tag_focus;
    }
    
    // Apply template complexity recommendation if not specified
    if (!options.complexity || options.complexity === 'auto') {
      options.complexity = template.complexity_recommendation;
    }
    
    console.log(`${colors.green}✓ Pre-filled ${Object.keys(template.defaults).length} answers${colors.reset}`);
    console.log(`${colors.dim}  Tag focus: ${template.tag_focus.join(', ')}${colors.reset}`);
    console.log(`${colors.dim}  Complexity: ${template.complexity_recommendation}${colors.reset}\n`);
  }
  
  // STAGE 1: Core Questions
  answers = await runCoreStage(schema, tagSchema, answers, telemetry);
  
  // Determine complexity level for review and deep dive
  const modules = loadSchemaModules();
  let complexity = options.complexity;
  if (!complexity || complexity === 'auto') {
    complexity = modules.recommendLevel(answers, tagSchema);
  }
  
  // STAGE 2: Review with enhanced preview
  answers = await runReviewStage(schema, tagSchema, answers, complexity, telemetry);
  
  // Ask if user wants to continue to deep dive
  const continueToDeepDive = await prompt(`${colors.bold}Continue to detailed questions (Deep Dive)? (y/n): ${colors.reset}`);
  
  if (continueToDeepDive.toLowerCase() === 'y' || continueToDeepDive.toLowerCase() === 'yes') {
    // STAGE 3: Deep Dive
    answers = await runDeepDiveStage(schema, tagSchema, answers, {
      tags: options.tags,
      complexity: complexity
    }, telemetry);
    
    // FINAL REVIEW: Show updated preview after deep dive
    console.log(`\n${colors.cyan}${colors.bold}FINAL REVIEW${colors.reset}\n`);
    reviewScreen.displayReviewScreen(answers, schema, tagSchema, complexity, colors);
    
    // Confirm before generation
    const confirmation = await reviewScreen.confirmGeneration(prompt, colors);
    
    if (confirmation.action === 'edit') {
      // Allow final edits
      answers = await reviewScreen.handleAnswerEditing(answers, schema, prompt, askQuestion, colors);
      
      // Ask for confirmation again
      const finalConfirmation = await reviewScreen.confirmGeneration(prompt, colors);
      if (finalConfirmation.action === 'cancel') {
        throw new Error('TDD generation cancelled by user');
      }
    } else if (confirmation.action === 'cancel') {
      throw new Error('TDD generation cancelled by user');
    }
  } else {
    console.log(`${colors.yellow}⊘ Skipping deep dive stage${colors.reset}\n`);
    
    // Track that deep dive was skipped entirely
    if (telemetry) {
      telemetry.trackSectionSkipped('Deep Dive (entire stage)', 0);
    }
    
    // Still show confirmation before generation
    const confirmation = await reviewScreen.confirmGeneration(prompt, colors);
    
    if (confirmation.action === 'edit') {
      // Allow edits
      answers = await reviewScreen.handleAnswerEditing(answers, schema, prompt, askQuestion, colors);
      
      // Ask for confirmation again
      const finalConfirmation = await reviewScreen.confirmGeneration(prompt, colors);
      if (finalConfirmation.action === 'cancel') {
        throw new Error('TDD generation cancelled by user');
      }
    } else if (confirmation.action === 'cancel') {
      throw new Error('TDD generation cancelled by user');
    }
  }
  
  return { project_data: answers, complexity, telemetry };
}

/**
 * Non-interactive mode - load answers from JSON file
 */
async function nonInteractiveMode(filePath) {
  console.log(`${colors.green}Loading answers from: ${filePath}${colors.reset}\n`);
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    
    let complexity;
    
    // If schema-driven mode is enabled, use schema-based complexity recommendation
    if (isSchemaOnboardingEnabled()) {
      try {
        const modules = loadSchemaModules();
        const schema = modules.loadQuestionnaireSchema();
        const tagSchema = modules.loadTagSchema();
        complexity = data.complexity || modules.recommendLevel(data, tagSchema);
      } catch (error) {
        console.log(`${colors.yellow}Warning: Could not load schema modules, using provided or default complexity${colors.reset}`);
        complexity = data.complexity || 'standard';
      }
    } else {
      // Legacy mode: Use complexity from data or default to 'standard'
      complexity = data.complexity || 'standard';
      console.log(`${colors.dim}Legacy mode: Using ${complexity} complexity level${colors.reset}`);
    }
    
    console.log(`${colors.green}✓ Loaded ${Object.keys(data).length} answers${colors.reset}`);
    console.log(`${colors.yellow}Complexity: ${complexity}${colors.reset}\n`);
    
    return {
      project_data: data,
      complexity: complexity
    };
  } catch (error) {
    throw new Error(`Failed to load file: ${error.message}`);
  }
}

/**
 * Generate TDD with retry logic for incomplete data
 */
async function generateWithRetry(project_data, complexity, isInteractive = true, maxRetries = 3) {
  let retryCount = 0;
  let currentData = { ...project_data };

  while (retryCount < maxRetries) {
    console.log(`\n${colors.blue}Generating TDD...${colors.reset}`);

    const result = await validate_and_generate_tdd({
      project_data: currentData,
      complexity: complexity,
      allowIncomplete: !isInteractive  // Allow incomplete in non-interactive mode
    });

    if (result.status === 'complete') {
      return result;
    } else if (result.status === 'incomplete') {
      console.log(`\n${colors.yellow}Missing required information:${colors.reset}`);
      console.log(`Found ${result.missing_fields.length} missing fields\n`);

      // In non-interactive mode, just proceed with what we have
      if (!isInteractive) {
        console.log(`${colors.yellow}Note: Running in non-interactive mode. Proceeding with available data.${colors.reset}`);
        console.log(`${colors.dim}Missing fields will be marked as "Not Provided" in the TDD.${colors.reset}\n`);
        return result;
      }

      if (retryCount < maxRetries - 1) {
        try {
          const continuePrompt = await prompt('Would you like to provide missing information? (y/n): ');
          if (continuePrompt.toLowerCase() !== 'y') {
            return result;
          }

          // Ask for missing fields
          for (const question of result.adhoc_questions.slice(0, 10)) {
            const answer = await prompt(`${question.question}: `);
            if (answer) {
              currentData[question.field] = answer;
            }
          }

          retryCount++;
        } catch (error) {
          // If readline fails, just return what we have
          console.log(`${colors.yellow}Could not gather additional input. Proceeding with available data.${colors.reset}`);
          return result;
        }
      } else {
        console.log(`${colors.yellow}Maximum retries reached. Proceeding with available data.${colors.reset}\n`);
        return result;
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
 * Export answers to JSON file for later reuse
 */
async function exportAnswers(answers, complexity, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  
  const exportData = {
    ...answers,
    complexity: complexity,
    _metadata: {
      exported_at: new Date().toISOString(),
      version: '2.0'
    }
  };
  
  await fs.writeFile(outputPath, JSON.stringify(exportData, null, 2), 'utf8');
  console.log(`${colors.green}✅ Answers exported to: ${outputPath}${colors.reset}`);
  console.log(`${colors.dim}   You can reuse these answers with: --answers ${outputPath}${colors.reset}`);
}

/**
 * Export TDD to PDF
 */
async function exportToPDF(tdd, outputPath) {
  try {
    const success = await pdfExporter.exportToPDF(tdd, outputPath);
    if (success) {
      console.log(`${colors.green}✅ PDF exported to: ${outputPath}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️  PDF export failed, check console for details${colors.reset}`);
    }
    return success;
  } catch (error) {
    console.log(`${colors.red}❌ PDF export error: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Display help message
 */
function displayHelp() {
  const availableTemplates = listAvailableTemplates();
  
  console.log(`
${colors.bold}TDD Builder CLI - 3-Stage Interview System${colors.reset}

${colors.bold}Usage:${colors.reset}
  node cli.js [options]

${colors.bold}Options:${colors.reset}
  ${colors.cyan}--answers FILE${colors.reset}         Load answers from JSON file (skip interview)
  ${colors.cyan}--export-answers FILE${colors.reset}  Save answers to JSON file after interview
  ${colors.cyan}--noninteractive FILE${colors.reset}  (Alias for --answers) Load from JSON
  ${colors.cyan}--template NAME${colors.reset}        Use an industry starter template
  ${colors.cyan}--tags TAG1,TAG2${colors.reset}       Filter deep dive questions by tags
  ${colors.cyan}--complexity LEVEL${colors.reset}     Set complexity level for deep dive
                            Levels: base → minimal → standard → comprehensive → enterprise
                            Use 'auto' for automatic recommendation (default)
                            Default: auto (recommended based on answers)
  ${colors.cyan}--legacy${colors.reset}               Force legacy mode (hardcoded questions)
  ${colors.cyan}--pdf${colors.reset}                  Export generated TDD as PDF
  ${colors.cyan}-h, --help${colors.reset}             Show this help message

${colors.bold}Feature Flags:${colors.reset}
  ${colors.cyan}SCHEMA_DRIVEN_ONBOARDING${colors.reset}  Enable schema-driven question flow (default: false)
                                  Set to 'true' to use Pre-TDD Client Questionnaire v2.0 schema
                                  Use --legacy flag to override and force legacy mode
  ${colors.cyan}ONBOARDING_TELEMETRY${colors.reset}     Enable privacy-safe analytics (default: disabled)
                                  Set to '1' to collect anonymized metrics:
                                  - Time per stage
                                  - % skipped by tag
                                  - Most common templates
                                  All data is anonymized with NO personally identifiable information

${colors.bold}Industry Templates:${colors.reset}
  ${availableTemplates.map(t => `${colors.green}${t.padEnd(12)}${colors.reset} - Pre-configured for ${t} applications`).join('\n  ')}

${colors.bold}Graduated Complexity Matrix:${colors.reset}
  ${colors.green}base${colors.reset}           → Bare minimum (4 fields) - Quick prototypes
  ${colors.green}minimal${colors.reset}        → Core essentials (8 fields) - Simple projects
  ${colors.green}standard${colors.reset}       → Moderate complexity (15 fields) - Typical projects
  ${colors.green}comprehensive${colors.reset}  → Extensive requirements (25 fields) - Complex projects
  ${colors.green}enterprise${colors.reset}     → Full TDD (35+ fields) - Enterprise-grade systems
  ${colors.cyan}auto${colors.reset}           → Automatic recommendation based on project characteristics

${colors.bold}Auto-Recommendation Factors:${colors.reset}
  • PII/PHI data handling
  • Payment processing (PCI-DSS)
  • Multi-region deployment
  • Compliance requirements (GDPR, HIPAA, SOC2, etc.)
  • Regulated industries (healthcare, finance, government)
  • Multi-tenant architecture
  • High availability requirements

${colors.bold}3-Stage Interview:${colors.reset}
  ${colors.green}1. Core${colors.reset}        Essential questions (5-7 questions)
  ${colors.green}2. Review${colors.reset}      Review and edit answers before continuing
  ${colors.green}3. Deep Dive${colors.reset}   Detailed questions by topic (skip sections as needed)

${colors.bold}Available Tags:${colors.reset}
  - foundation      (Project basics and setup)
  - architecture    (System architecture and design)
  - security        (Security controls and compliance)
  - operations      (Operational concerns and monitoring)
  - privacy         (Data privacy and protection)

${colors.bold}Examples:${colors.reset}
  ${colors.dim}# Interactive mode (full 3-stage interview)${colors.reset}
  node cli.js

  ${colors.dim}# Start with a SaaS template${colors.reset}
  node cli.js --template saas

  ${colors.dim}# Start with a healthcare template${colors.reset}
  node cli.js --template healthcare

  ${colors.dim}# Non-interactive mode (load from file)${colors.reset}
  node cli.js --answers tests/sample_mcp.json

  ${colors.dim}# Save answers for later reuse${colors.reset}
  node cli.js --export-answers ./my-answers.json

  ${colors.dim}# Combine: start with template, export answers, and generate PDF${colors.reset}
  node cli.js --template saas --export-answers ./saas-answers.json --pdf

  ${colors.dim}# Filter deep dive by specific tags${colors.reset}
  node cli.js --tags security,privacy

  ${colors.dim}# Set specific complexity level${colors.reset}
  node cli.js --complexity enterprise

  ${colors.dim}# Use auto complexity recommendation${colors.reset}
  node cli.js --complexity auto

  ${colors.dim}# Start with base level for quick prototypes${colors.reset}
  node cli.js --complexity base

  ${colors.dim}# Combine template with other options${colors.reset}
  node cli.js --template fintech --complexity comprehensive --pdf

${colors.bold}Output:${colors.reset}
  Generated TDD will be saved to ./output/[project_name]_tdd.md
  If --pdf flag is used, PDF will be saved to ./output/[project_name]_tdd.pdf
  `);
}

/**
 * Load an industry starter template
 */
function loadTemplate(templateName) {
  const templatePath = path.join(__dirname, 'templates', 'industries', `${templateName}-starter.json`);
  
  try {
    if (!fsSync.existsSync(templatePath)) {
      throw new Error(`Template '${templateName}' not found`);
    }
    
    const templateData = fsSync.readFileSync(templatePath, 'utf8');
    const template = JSON.parse(templateData);
    
    console.log(`${colors.cyan}${colors.bold}📋 Loading ${template.template_name} Template${colors.reset}`);
    console.log(`${colors.dim}   ${template.description}${colors.reset}`);
    console.log(`${colors.dim}   Pre-filling ${Object.keys(template.defaults).length} default values${colors.reset}\n`);
    
    return template;
  } catch (error) {
    throw new Error(`Failed to load template: ${error.message}`);
  }
}

/**
 * List available templates
 */
function listAvailableTemplates() {
  const templatesDir = path.join(__dirname, 'templates', 'industries');
  
  try {
    if (!fsSync.existsSync(templatesDir)) {
      return [];
    }
    
    const files = fsSync.readdirSync(templatesDir);
    return files
      .filter(f => f.endsWith('-starter.json'))
      .map(f => f.replace('-starter.json', ''));
  } catch (error) {
    return [];
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const options = {
    noninteractive: null,
    answers: null,  // New: alias for noninteractive with clearer name
    exportAnswers: null,  // New: export answers after interview
    tags: [],
    complexity: 'auto',
    pdf: false,
    help: false,
    template: null,
    legacy: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--noninteractive') {
      options.noninteractive = args[++i];
    } else if (arg === '--answers') {
      options.answers = args[++i];
    } else if (arg === '--export-answers') {
      options.exportAnswers = args[++i];
    } else if (arg === '--tags') {
      options.tags = args[++i].split(',').map(t => t.trim());
    } else if (arg === '--complexity') {
      const complexityValue = args[++i];
      const validComplexities = ['base', 'minimal', 'standard', 'comprehensive', 'enterprise', 'auto'];
      
      // Legacy complexity mapping
      const legacyMap = {
        'simple': 'base',
        'startup': 'standard',
        'mcp-specific': 'comprehensive',
        'mcp': 'comprehensive'
      };
      
      // Check if it's a legacy value
      if (legacyMap[complexityValue]) {
        const newValue = legacyMap[complexityValue];
        console.error(`${colors.yellow}⚠️  Deprecation Notice: '${complexityValue}' is deprecated, mapping to '${newValue}'${colors.reset}`);
        options.complexity = newValue;
      } else if (validComplexities.includes(complexityValue)) {
        options.complexity = complexityValue;
      } else {
        console.error(`${colors.red}Invalid complexity level${colors.reset}`);
        console.error(`${colors.yellow}Valid options: ${validComplexities.join(', ')}${colors.reset}`);
        console.error(`${colors.dim}Legacy values (deprecated): ${Object.keys(legacyMap).join(', ')}${colors.reset}\n`);
        process.exit(1);
      }
    } else if (arg === '--pdf') {
      options.pdf = true;
    } else if (arg === '--template') {
      options.template = args[++i];
    } else if (arg === '--legacy') {
      options.legacy = true;
    } else if (arg === '--file' || arg === '-f') {
      // Legacy support
      options.noninteractive = args[++i];
    }
  }
  
  // --answers is an alias for --noninteractive with clearer naming
  if (options.answers && !options.noninteractive) {
    options.noninteractive = options.answers;
  }
  
  return options;
}

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // Apply --legacy flag (overrides environment variable)
  if (options.legacy) {
    setSchemaOnboardingEnabled(false);
  }

  // Display banner (shows current mode)
  displayBanner();

  try {
    // Validate feature flags before proceeding
    try {
      validateFeatureFlags();
    } catch (error) {
      console.log(`\n${colors.red}❌ Configuration Error: ${error.message}${colors.reset}`);
      console.log(`${colors.yellow}Tip: Use --legacy flag to run in legacy mode${colors.reset}\n`);
      process.exit(1);
    }

    // Show help
    if (options.help) {
      displayHelp();
      process.exit(0);
    }

    let project_data, complexity, telemetry = null;
    const isInteractive = !options.noninteractive;

    // Display aggregate insights if telemetry is enabled
    if (isTelemetryEnabled() && isInteractive) {
      await displayAggregateInsights(colors);
    }

    // Non-interactive mode
    if (options.noninteractive) {
      ({ project_data, complexity } = await nonInteractiveMode(options.noninteractive));
    } else {
      // Interactive mode (3-stage interview)
      ({ project_data, complexity, telemetry } = await interactiveMode(options));
    }

    // Export answers if requested
    if (options.exportAnswers) {
      const exportPath = options.exportAnswers;
      console.log(`\n${colors.blue}Exporting answers...${colors.reset}`);
      await exportAnswers(project_data, complexity, exportPath);
    }

    // Generate TDD
    const result = await generateWithRetry(project_data, complexity, isInteractive);

    if (result.status === 'complete' || result.status === 'incomplete') {
      // Check if TDD was actually generated
      if (!result.tdd) {
        throw new Error('TDD generation failed: no output produced');
      }

      // Display summary
      if (result.status === 'complete') {
        console.log(`\n${colors.green}${colors.bold}✅ TDD Generation Complete!${colors.reset}`);
      } else {
        console.log(`\n${colors.yellow}${colors.bold}⚠️  TDD Generation Complete (with missing fields)${colors.reset}`);
      }

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

      // Export to PDF if requested
      if (options.pdf) {
        const pdfPath = path.join('output', `${safeProjectName}_tdd.pdf`);
        console.log(`\n${colors.blue}Generating PDF export...${colors.reset}`);
        await exportToPDF(result.tdd, pdfPath);
      }

      // Summary
      console.log(`\n${colors.dim}You can view the generated TDD at: ${outputPath}${colors.reset}`);
      if (options.pdf) {
        const pdfPath = path.join('output', `${safeProjectName}_tdd.pdf`);
        console.log(`${colors.dim}PDF version available at: ${pdfPath}${colors.reset}`);
      }
      
      // Display and save telemetry if enabled
      if (telemetry) {
        telemetry.displaySummary(colors);
        
        const telemetryPath = await telemetry.save();
        if (telemetryPath) {
          console.log(`${colors.dim}Session analytics saved to: ${telemetryPath}${colors.reset}`);
        }
      }
    } else {
      throw new Error('TDD generation failed');
    }

  } catch (error) {
    console.log(`\n${colors.red}❌ Error: ${error.message}${colors.reset}`);
    if (process.env.DEBUG) {
      console.log(error.stack);
    }
    
    // Save telemetry even on error
    if (telemetry) {
      try {
        await telemetry.save();
      } catch (telemetryError) {
        // Ignore telemetry errors
      }
    }
    
    process.exit(1);
  } finally {
    // Clean up PDF exporter resources
    try {
      await pdfExporter.cleanup();
    } catch (error) {
      // Ignore cleanup errors
    }
    rl.close();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
