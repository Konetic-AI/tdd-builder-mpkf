/**
 * @fileoverview Review Screen Component
 * Displays collected answers grouped by TDD section with inline editing
 * and preview of TDD sections that will be generated.
 */

const readline = require('readline');

/**
 * Map question field IDs to TDD sections
 * This maps the field prefixes to their corresponding TDD stages
 */
const SECTION_MAPPING = {
  'doc': {
    stage: 1,
    title: 'Stage 1: Project Foundation',
    subsection: '1.1 Document Information'
  },
  'summary': {
    stage: 1,
    title: 'Stage 1: Project Foundation',
    subsection: '1.2 Executive Summary'
  },
  'context': {
    stage: 2,
    title: 'Stage 2: Requirements & Context Analysis',
    subsection: '2.1 Business Context & Scope'
  },
  'constraints': {
    stage: 2,
    title: 'Stage 2: Requirements & Context Analysis',
    subsection: '2.2 Constraints & Assumptions'
  },
  'architecture': {
    stage: 3,
    title: 'Stage 3: Architecture Design',
    subsection: '3.1-3.4 Architecture Details'
  },
  'nfr': {
    stage: 4,
    title: 'Stage 4: Non-Functional Requirements',
    subsection: 'NFRs'
  },
  'security': {
    stage: 5,
    title: 'Stage 5: Security & Privacy Architecture',
    subsection: '5.1 Security by Design'
  },
  'privacy': {
    stage: 5,
    title: 'Stage 5: Security & Privacy Architecture',
    subsection: '5.2 Privacy by Design'
  },
  'ops': {
    stage: 6,
    title: 'Stage 6: Operations & Observability',
    subsection: 'Operations'
  },
  'implementation': {
    stage: 7,
    title: 'Stage 7: Implementation Planning',
    subsection: 'Implementation'
  },
  'risks': {
    stage: 8,
    title: 'Stage 8: Risk Management & Technical Debt',
    subsection: 'Risks'
  },
  'debt': {
    stage: 8,
    title: 'Stage 8: Risk Management & Technical Debt',
    subsection: 'Technical Debt'
  },
  'appendices': {
    stage: 9,
    title: 'Stage 9: Appendices & References',
    subsection: 'Appendices'
  }
};

/**
 * Get section info from field ID
 * @param {string} fieldId - The field ID (e.g., 'doc.version', 'summary.problem')
 * @returns {object} Section info
 */
function getSectionInfo(fieldId) {
  const prefix = fieldId.split('.')[0];
  return SECTION_MAPPING[prefix] || {
    stage: 0,
    title: 'Other',
    subsection: 'Miscellaneous'
  };
}

/**
 * Group answers by TDD section
 * @param {object} answers - The collected answers
 * @param {object} schema - The questionnaire schema
 * @returns {object} Grouped answers by section
 */
function groupAnswersBySection(answers, schema) {
  const grouped = {};
  
  // Build a map of field IDs to questions for display
  const questionMap = new Map();
  if (schema && schema.questions) {
    schema.questions.forEach(q => {
      questionMap.set(q.id, q);
    });
  }
  
  // Group answers by section
  Object.entries(answers).forEach(([fieldId, answer]) => {
    const sectionInfo = getSectionInfo(fieldId);
    const sectionKey = `${sectionInfo.stage}:${sectionInfo.title}`;
    
    if (!grouped[sectionKey]) {
      grouped[sectionKey] = {
        stage: sectionInfo.stage,
        title: sectionInfo.title,
        answers: []
      };
    }
    
    const question = questionMap.get(fieldId);
    grouped[sectionKey].answers.push({
      fieldId,
      question: question ? question.question : fieldId,
      answer,
      subsection: sectionInfo.subsection
    });
  });
  
  // Sort sections by stage number
  const sortedSections = Object.values(grouped).sort((a, b) => a.stage - b.stage);
  
  return sortedSections;
}

/**
 * Generate TDD section preview based on current answers
 * Shows which sections will be included and their completeness
 * @param {object} answers - The collected answers
 * @param {string} complexity - The complexity level
 * @returns {object} Preview of TDD sections
 */
function generateTddPreview(answers, complexity) {
  // Define all possible TDD stages
  const allStages = [
    { stage: 1, title: 'Project Foundation', required: ['doc.version', 'project.name', 'summary.problem', 'summary.solution'] },
    { stage: 2, title: 'Requirements & Context Analysis', required: ['context.business_goals', 'context.scope_in'] },
    { stage: 3, title: 'Architecture Design', required: ['architecture.style', 'architecture.tech_stack'] },
    { stage: 4, title: 'Non-Functional Requirements', required: ['nfr.performance', 'nfr.scalability'] },
    { stage: 5, title: 'Security & Privacy Architecture', required: ['security.auth', 'security.data_classification'] },
    { stage: 6, title: 'Operations & Observability', required: ['ops.deployment_strategy'] },
    { stage: 7, title: 'Implementation Planning', required: ['implementation.methodology'] },
    { stage: 8, title: 'Risk Management & Technical Debt', required: ['risks.technical'] },
    { stage: 9, title: 'Appendices & References', required: [] }
  ];
  
  // Determine which stages will be included based on complexity
  let includedStages = [];
  switch(complexity) {
    case 'base':
    case 'simple':
      includedStages = [1, 2];
      break;
    case 'minimal':
      includedStages = [1, 2, 3];
      break;
    case 'standard':
      includedStages = [1, 2, 3, 4, 5];
      break;
    case 'startup':
      includedStages = [1, 2, 3, 4, 5, 6, 7, 8];
      break;
    case 'comprehensive':
      includedStages = [1, 2, 3, 4, 5, 6, 7];
      break;
    case 'enterprise':
    case 'mcp-specific':
    case 'mcp':
      includedStages = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      break;
    default:
      includedStages = [1, 2, 3, 4, 5];
  }
  
  // Calculate completeness for each stage
  const preview = allStages
    .filter(stage => includedStages.includes(stage.stage))
    .map(stage => {
      const totalRequired = stage.required.length;
      const answered = stage.required.filter(field => 
        answers[field] !== undefined && answers[field] !== '' && answers[field] !== null
      ).length;
      
      const completeness = totalRequired > 0 ? Math.round((answered / totalRequired) * 100) : 100;
      const status = completeness === 100 ? 'complete' : completeness >= 50 ? 'partial' : 'minimal';
      
      return {
        stage: stage.stage,
        title: stage.title,
        completeness,
        status,
        answered,
        totalRequired
      };
    });
  
  return preview;
}

/**
 * Display the review screen with grouped answers and TDD preview
 * @param {object} answers - The collected answers
 * @param {object} schema - The questionnaire schema
 * @param {object} tagSchema - The tag schema
 * @param {string} complexity - The complexity level
 * @param {object} colors - CLI color codes
 */
function displayReviewScreen(answers, schema, tagSchema, complexity, colors) {
  console.log('\n');
  console.log(`${colors.cyan}${colors.bold}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  REVIEW YOUR ANSWERS${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}${'='.repeat(70)}${colors.reset}\n`);
  
  // Group answers by section
  const groupedAnswers = groupAnswersBySection(answers, schema);
  
  // Display grouped answers
  groupedAnswers.forEach((section, idx) => {
    console.log(`${colors.magenta}${colors.bold}${section.title}${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(70)}${colors.reset}`);
    
    section.answers.forEach((item, answerIdx) => {
      const displayAnswer = Array.isArray(item.answer) 
        ? item.answer.join(', ') 
        : String(item.answer);
      
      const answerNumber = idx * 100 + answerIdx + 1; // Create unique answer numbers
      
      console.log(`\n  ${colors.cyan}[${answerNumber}]${colors.reset} ${colors.bold}${item.question}${colors.reset}`);
      console.log(`       ${colors.green}→${colors.reset} ${colors.dim}${displayAnswer}${colors.reset}`);
    });
    
    console.log('\n');
  });
  
  // Display TDD preview
  console.log(`${colors.yellow}${colors.bold}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}  TDD PREVIEW - Sections to be Generated (Complexity: ${complexity})${colors.reset}`);
  console.log(`${colors.yellow}${colors.bold}${'='.repeat(70)}${colors.reset}\n`);
  
  const preview = generateTddPreview(answers, complexity);
  
  preview.forEach(stage => {
    const statusIcon = stage.status === 'complete' ? '✓' : stage.status === 'partial' ? '◐' : '○';
    const statusColor = stage.status === 'complete' ? colors.green : stage.status === 'partial' ? colors.yellow : colors.red;
    
    const progressBar = generateProgressBar(stage.completeness, 30);
    
    console.log(`  ${statusColor}${statusIcon}${colors.reset} ${colors.bold}Stage ${stage.stage}: ${stage.title}${colors.reset}`);
    console.log(`     ${progressBar} ${stage.completeness}% complete`);
    if (stage.totalRequired > 0) {
      console.log(`     ${colors.dim}${stage.answered}/${stage.totalRequired} required fields answered${colors.reset}`);
    }
    console.log('');
  });
  
  console.log(`${colors.dim}Legend: ${colors.green}✓${colors.reset} Complete  ${colors.yellow}◐${colors.reset} Partial  ${colors.red}○${colors.reset} Minimal${colors.reset}\n`);
}

/**
 * Generate a visual progress bar
 * @param {number} percentage - Percentage complete (0-100)
 * @param {number} width - Width of progress bar in characters
 * @returns {string} Progress bar string
 */
function generateProgressBar(percentage, width = 30) {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  const dim = '\x1b[2m';
  const reset = '\x1b[0m';
  return `[${'█'.repeat(filled)}${dim}${'░'.repeat(empty)}${reset}]`;
}

/**
 * Get colors object for CLI display
 */
function getColors() {
  return {
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
}

/**
 * Prompt user for confirmation before TDD generation
 * @param {function} promptFn - Readline prompt function
 * @param {object} colors - CLI color codes
 * @returns {Promise<boolean>} True if user confirms, false otherwise
 */
async function confirmGeneration(promptFn, colors) {
  console.log(`${colors.cyan}${colors.bold}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  READY TO GENERATE TDD${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}${'='.repeat(70)}${colors.reset}\n`);
  
  const response = await promptFn(`${colors.bold}Proceed with TDD generation? (yes/no/edit): ${colors.reset}`);
  
  const normalized = response.toLowerCase().trim();
  
  if (normalized === 'yes' || normalized === 'y') {
    return { action: 'generate' };
  } else if (normalized === 'edit' || normalized === 'e') {
    return { action: 'edit' };
  } else {
    return { action: 'cancel' };
  }
}

/**
 * Handle inline answer editing
 * @param {object} answers - Current answers
 * @param {object} schema - The questionnaire schema
 * @param {function} promptFn - Readline prompt function
 * @param {function} askQuestionFn - Function to ask a question
 * @param {object} colors - CLI color codes
 * @returns {Promise<object>} Updated answers
 */
async function handleAnswerEditing(answers, schema, promptFn, askQuestionFn, colors) {
  const groupedAnswers = groupAnswersBySection(answers, schema);
  
  // Build a flat list of all answers with their indices
  const flatAnswers = [];
  groupedAnswers.forEach((section, sectionIdx) => {
    section.answers.forEach((answer, answerIdx) => {
      flatAnswers.push({
        number: sectionIdx * 100 + answerIdx + 1,
        fieldId: answer.fieldId,
        question: answer.question,
        currentAnswer: answer.answer
      });
    });
  });
  
  // Build question map for lookup
  const questionMap = new Map();
  if (schema && schema.questions) {
    schema.questions.forEach(q => {
      questionMap.set(q.id, q);
    });
  }
  
  while (true) {
    const editChoice = await promptFn(`\n${colors.bold}Enter answer number to edit, or 'done' to finish: ${colors.reset}`);
    
    if (editChoice.toLowerCase() === 'done' || editChoice.toLowerCase() === 'd') {
      break;
    }
    
    const answerNum = parseInt(editChoice);
    const answerToEdit = flatAnswers.find(a => a.number === answerNum);
    
    if (answerToEdit) {
      const question = questionMap.get(answerToEdit.fieldId);
      
      if (question) {
        console.log(`\n${colors.yellow}Editing: ${question.question}${colors.reset}`);
        console.log(`${colors.dim}Current answer: ${answerToEdit.currentAnswer}${colors.reset}\n`);
        
        const newAnswer = await askQuestionFn(question, 1, 1, false);
        if (newAnswer !== null) {
          answers[answerToEdit.fieldId] = newAnswer;
          console.log(`${colors.green}✓ Answer updated!${colors.reset}\n`);
          
          // Refresh the display
          displayReviewScreen(answers, schema, null, 'standard', colors);
        }
      } else {
        console.log(`${colors.red}Could not find question for field ${answerToEdit.fieldId}${colors.reset}\n`);
      }
    } else {
      console.log(`${colors.red}Invalid answer number. Please try again.${colors.reset}\n`);
    }
  }
  
  return answers;
}

module.exports = {
  groupAnswersBySection,
  generateTddPreview,
  displayReviewScreen,
  confirmGeneration,
  handleAnswerEditing,
  getSectionInfo,
  getColors
};

