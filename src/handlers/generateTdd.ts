/**
 * @fileoverview TypeScript handler for TDD generation with schema-based questions.
 * Replaces hardcoded question maps with dynamic schema loading.
 */

import { 
  loadQuestionnaireSchema, 
  loadTagSchema, 
  Question
} from '../lib/schemaLoader';

// Type definitions for compatibility with existing system
export interface ProjectData {
  [key: string]: string | string[] | boolean | number | undefined;
}

export interface ComplexityLevel {
  simple: string;
  startup: string;
  enterprise: string;
  'mcp-specific': string;
  mcp: string;
}

export interface Questionnaire {
  version: string;
  stages: string[];
  complexity_levels: string[];
  questions: Question[];
}

export interface QuestionFlow {
  questions: Question[];
  metadata: {
    complexity: string;
    tags: string[];
    total_questions: number;
  };
}

export interface TriggerResult {
  questions: Question[];
  applied_triggers: string[];
}

/**
 * Loads the questionnaire schema and returns it as a Questionnaire object
 * @param basePath - Base path to schemas directory (defaults to schemas/)
 * @returns Questionnaire object
 */
export function loadQuestionnaire(basePath: string = 'schemas'): Questionnaire {
  try {
    const schema = loadQuestionnaireSchema(basePath);
    return {
      version: schema.version,
      stages: schema.stages,
      complexity_levels: schema.complexity_levels,
      questions: schema.questions
    };
  } catch (error) {
    throw new Error(`Failed to load questionnaire: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Maps legacy complexity levels to schema complexity levels
 * @param complexity - Legacy complexity level
 * @returns Schema complexity level
 */
function mapComplexityLevel(complexity: string): string {
  const complexityMap: Record<string, string> = {
    'simple': 'base',
    'startup': 'minimal', 
    'enterprise': 'enterprise',
    'mcp-specific': 'enterprise',
    'mcp': 'enterprise'
  };
  
  return complexityMap[complexity] || 'base';
}

/**
 * Gets questions based on complexity level and selected tags
 * @param params - Parameters object
 * @param params.complexity - Complexity level (simple, startup, enterprise, mcp-specific, mcp)
 * @param params.tags - Array of selected tags to filter by
 * @param params.basePath - Base path to schemas directory
 * @returns Array of questions matching the criteria
 */
export function getQuestionFlow({ 
  complexity, 
  tags = [], 
  basePath = 'schemas' 
}: { 
  complexity: string; 
  tags?: string[]; 
  basePath?: string; 
}): Question[] {
  try {
    const questionnaire = loadQuestionnaire(basePath);
    const tagSchema = loadTagSchema(basePath);
    const schemaComplexity = mapComplexityLevel(complexity);
    
    // Filter questions by complexity level
    let filteredQuestions = questionnaire.questions.filter(question => {
      // Check if question is applicable to this complexity level
      const fieldMetadata = tagSchema.field_metadata[question.id];
      if (fieldMetadata) {
        return fieldMetadata.complexity_levels.includes(schemaComplexity);
      }
      
      // Default to include if no metadata found (backward compatibility)
      return true;
    });
    
    // Filter out questions with skip_if conditions that would be skipped
    filteredQuestions = filteredQuestions.filter(question => {
      if (!question.skip_if) {
        return true;
      }
      
      // For now, we'll include questions with skip_if conditions
      // In a real implementation, you'd evaluate the skip_if condition
      // against the current answers, but for the base case we want to be conservative
      return true;
    });
    
    // Filter by tags if provided
    if (tags.length > 0) {
      filteredQuestions = filterByTags(filteredQuestions, tags);
    }
    
    return filteredQuestions;
  } catch (error) {
    throw new Error(`Failed to get question flow: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Applies triggers to expand follow-up questions based on answers
 * @param answers - Object containing answers to questions
 * @param basePath - Base path to schemas directory
 * @returns Object containing expanded questions and applied triggers
 */
export function applyTriggers(answers: ProjectData, basePath: string = 'schemas'): TriggerResult {
  try {
    const questionnaire = loadQuestionnaire(basePath);
    const appliedTriggers: string[] = [];
    const additionalQuestions: Question[] = [];
    
    // Process each answer to check for triggers
    for (const [questionId, answer] of Object.entries(answers)) {
      const question = questionnaire.questions.find(q => q.id === questionId);
      
      if (question && question.triggers) {
        // Handle different answer types
        let triggerKey: string | null = null;
        
        if (typeof answer === 'boolean') {
          triggerKey = answer.toString();
        } else if (typeof answer === 'string') {
          triggerKey = answer;
        } else if (Array.isArray(answer)) {
          // For multi-select, check each selected option
          for (const selectedOption of answer) {
            if (question.triggers[selectedOption]) {
              triggerKey = selectedOption;
              break;
            }
          }
        }
        
        if (triggerKey && question.triggers[triggerKey]) {
          const triggeredQuestionIds = question.triggers[triggerKey];
          appliedTriggers.push(`${questionId}:${triggerKey}`);
          
          // Add triggered questions
          for (const triggeredId of triggeredQuestionIds) {
            const triggeredQuestion = questionnaire.questions.find(q => q.id === triggeredId);
            if (triggeredQuestion && !additionalQuestions.find(q => q.id === triggeredId)) {
              additionalQuestions.push(triggeredQuestion);
            }
          }
        }
      }
    }
    
    return {
      questions: additionalQuestions,
      applied_triggers: appliedTriggers
    };
  } catch (error) {
    throw new Error(`Failed to apply triggers: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Filters questions by selected tags
 * @param questions - Array of questions to filter
 * @param selectedTags - Array of tag names to filter by
 * @returns Filtered array of questions
 */
export function filterByTags(questions: Question[], selectedTags: string[]): Question[] {
  if (selectedTags.length === 0) {
    return questions;
  }
  
  return questions.filter(question => {
    // Check if question has any of the selected tags
    return question.tags.some(tag => selectedTags.includes(tag));
  });
}

/**
 * Legacy compatibility function - converts schema-based questions to legacy format
 * @param complexity - Complexity level
 * @param basePath - Base path to schemas directory
 * @returns Object with required_fields in legacy format
 */
export function getMpkfRequirements(complexity: string, basePath: string = 'schemas'): { required_fields: Record<string, string> } {
  try {
    const questions = getQuestionFlow({ complexity, basePath });
    const requiredFields: Record<string, string> = {};
    
    // Convert questions to legacy format
    for (const question of questions) {
      requiredFields[question.id] = question.question;
    }
    
    return { required_fields: requiredFields };
  } catch (error) {
    // Fallback to hardcoded requirements for backward compatibility
    console.warn(`Warning: Failed to load schema-based requirements, falling back to hardcoded: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return getHardcodedRequirements(complexity);
  }
}

/**
 * Fallback hardcoded requirements for backward compatibility
 * @param complexity - Complexity level
 * @returns Hardcoded requirements object
 */
function getHardcodedRequirements(complexity: string): { required_fields: Record<string, string> } {
  const base_reqs = {
    'doc.version': 'What is the TDD version?',
    'project.name': 'What is the official name for this project?',
    'summary.problem': 'In one or two sentences, what is the core problem this project solves?',
    'summary.solution': 'Describe the solution you envision at a high level.'
  };

  const startup_reqs = {
    ...base_reqs,
    'doc.created_date': 'What is the creation date for this TDD?',
    'doc.authors': 'Who are the authors of this TDD?',
    'summary.key_decisions': 'What are the key architectural decisions for your MVP?',
    'summary.success_criteria': 'What are your initial success metrics (KPIs)?',
    'context.business_goals': 'What is your core value proposition and initial business goal?',
    'context.scope_in': 'What is the minimum viable feature set for launch?',
    'context.scope_out': 'What features are you explicitly deferring post-MVP?',
    'context.personas': 'Who is your primary user persona or early adopter?',
    'constraints.technical': 'Are there any technical constraints (budget, timeline, existing tech)?',
    'constraints.business': 'What is your runway and time-to-market constraint?',
    'architecture.style': 'What is your architectural approach (monolith, serverless, etc.)?',
    'architecture.tech_stack': 'What is your technology stack?',
    'architecture.c4_l1_description': 'Provide a high-level system context description.',
    'nfr.performance': 'What are your baseline performance expectations?',
    'nfr.scalability': 'How many users do you expect in the first 6 months?',
    'security.auth': 'What is your authentication approach?',
    'security.data_classification': 'What type of data will you handle (user data, PII, etc.)?',
    'ops.deployment_strategy': 'What is your deployment strategy (cloud provider, CI/CD)?',
    'implementation.methodology': 'What is your development approach (Agile, Lean Startup, etc.)?',
    'implementation.roadmap': 'What is your MVP roadmap and key milestones?',
    'risks.technical': 'What are your biggest technical risks or unknowns?',
    'risks.mitigation': 'How will you validate assumptions and mitigate risks?'
  };

  const enterprise_reqs = {
    ...base_reqs,
    'doc.created_date': 'What is the creation date for this TDD?',
    'doc.authors': 'Who are the authors of this TDD?',
    'doc.stakeholders': 'Who are the primary business and technical stakeholders?',
    'summary.key_decisions': 'What are the key architectural decisions?',
    'summary.success_criteria': 'How will we know this project is a success?',
    'context.business_goals': 'What are the primary business goals this project supports?',
    'context.scope_in': 'What are the absolute "must-have" features for the first release?',
    'context.scope_out': 'What features are explicitly not being built in this version?',
    'context.personas': 'Who are the key user personas and roles?',
    'constraints.technical': 'Are there any hard technical constraints we must work within?',
    'constraints.business': 'What are the budget and timeline constraints?',
    'constraints.compliance': 'Are there any legal or compliance standards to adhere to?',
    'constraints.assumptions': 'What are the key assumptions?',
    'architecture.style': 'Do you have a preferred architectural style?',
    'architecture.principles': 'What are the key design principles?',
    'architecture.tech_stack': 'What is the technology stack?',
    'architecture.c4_l1_description': 'Provide a description for the C4 Level 1 diagram.',
    'architecture.c4_l2_description': 'Provide a description for the C4 Level 2 diagram.',
    'architecture.data_model': 'What is the high-level data model?',
    'nfr.performance': 'What are the performance expectations?',
    'nfr.scalability': 'How many users and how much activity do you expect?',
    'nfr.availability': 'What are the uptime requirements?',
    'nfr.maintainability': 'What are the maintainability requirements?',
    'nfr.usability': 'What are the usability requirements?',
    'nfr.cost': 'What are the cost efficiency requirements?',
    'security.threat_model': 'What is the summary of the threat model?',
    'security.auth': 'Who should be allowed to access the system?',
    'security.controls': 'What are the key security controls?',
    'security.data_classification': 'What kind of data will this system handle?',
    'privacy.controls': 'What are the data privacy controls for PII?',
    'privacy.residency': 'Are there requirements for where data must be stored?',
    'privacy.retention': 'What are the data retention policies?',
    'ops.deployment_strategy': 'What is the deployment strategy?',
    'ops.environments': 'What is the environment strategy?',
    'ops.logging': 'What is the logging approach?',
    'ops.monitoring': 'What is the monitoring and alerting strategy?',
    'ops.disaster_recovery': 'What is the disaster recovery strategy?',
    'implementation.methodology': 'Do you follow a specific development methodology?',
    'implementation.team': 'What is the team structure?',
    'implementation.roadmap': 'What is the high-level phased roadmap?',
    'implementation.testing_strategy': 'What is the testing strategy?',
    'risks.technical': 'What are the biggest technical risks?',
    'risks.business': 'What are the biggest business risks?',
    'risks.mitigation': 'What is the risk mitigation plan?'
  };

  const mcp_reqs = {
    ...enterprise_reqs,
    'security.mcp_protocol_compliance': 'Describe the MCP protocol compliance strategy.',
    'security.mcp_sandboxing_model': 'Describe the MCP tool sandboxing model.',
    'security.mcp_permission_model': 'Describe the MCP tool permission model.'
  };

  const requirements = {
    simple: { required_fields: base_reqs },
    startup: { required_fields: startup_reqs },
    enterprise: { required_fields: enterprise_reqs },
    'mcp-specific': { required_fields: mcp_reqs },
    'mcp': { required_fields: mcp_reqs }
  };

  return requirements[complexity as keyof typeof requirements] || requirements.enterprise;
}

/**
 * Validates project data against schema requirements
 * @param projectData - Project data to validate
 * @param complexity - Complexity level
 * @param basePath - Base path to schemas directory
 * @returns Validation result
 */
export function validateProjectDataAgainstSchema(
  projectData: ProjectData, 
  complexity: string, 
  basePath: string = 'schemas'
): { valid: boolean; errors: string[]; missing_fields: string[] } {
  try {
    const requirements = getMpkfRequirements(complexity, basePath);
    const errors: string[] = [];
    const missingFields: string[] = [];
    
    for (const [field, question] of Object.entries(requirements.required_fields)) {
      if (!projectData || !projectData.hasOwnProperty(field) || !projectData[field] || projectData[field] === '') {
        missingFields.push(field);
        errors.push(`Missing required field: ${field} - ${question}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      missing_fields: missingFields
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      missing_fields: []
    };
  }
}
