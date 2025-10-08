import { Question, Expression } from './schemaLoader';

export type AnswerMap = Record<string, any>;
export type { Expression } from './schemaLoader';

/**
 * Registry of questions for trigger expansion
 */
export type QuestionRegistry = Map<string, Question>;

/**
 * Evaluates a skip_if condition to determine if a question should be shown
 * @param question - Question with optional skip_if condition
 * @param answers - Current answer map
 * @returns True if question should be skipped, false otherwise
 */
export function evaluateSkip(
  question: Question,
  answers: AnswerMap
): boolean {
  if (!question.skip_if) {
    return false;
  }
  
  try {
    return evaluateExpression(question.skip_if, answers);
  } catch (error) {
    console.error(`Error evaluating skip_if for question "${question.id}":`, error);
    return false; // Default to showing the question if evaluation fails
  }
}

/**
 * Evaluates a conditional expression (JSON or string format)
 * @param expression - Expression to evaluate
 * @param answers - Current answer map
 * @returns Boolean result of the expression
 */
function evaluateExpression(expression: Expression, answers: AnswerMap): boolean {
  // Handle JSON object expressions
  if (typeof expression === 'object' && expression !== null) {
    // eq: equality check
    if ('eq' in expression) {
      const [fieldPath, value] = expression.eq;
      const fieldValue = getFieldValue(fieldPath, answers);
      return fieldValue === value;
    }
    
    // neq: not equal check
    if ('neq' in expression) {
      const [fieldPath, value] = expression.neq;
      const fieldValue = getFieldValue(fieldPath, answers);
      return fieldValue !== value;
    }
    
    // has: array/collection contains check
    if ('has' in expression) {
      const [fieldPath, value] = expression.has;
      const fieldValue = getFieldValue(fieldPath, answers);
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(value);
      }
      return false;
    }
    
    // not: logical negation
    if ('not' in expression) {
      return !evaluateExpression(expression.not, answers);
    }
    
    // and: logical AND
    if ('and' in expression) {
      return expression.and.every(expr => evaluateExpression(expr, answers));
    }
    
    // or: logical OR
    if ('or' in expression) {
      return expression.or.some(expr => evaluateExpression(expr, answers));
    }
  }
  
  // Handle legacy string format
  if (typeof expression === 'string') {
    return evaluateLegacyCondition(expression, answers);
  }
  
  return false;
}

/**
 * Evaluates legacy string-based conditions (for backwards compatibility)
 * @param condition - Condition string
 * @param answers - Current answer map
 * @returns Boolean result of the condition
 */
function evaluateLegacyCondition(condition: string, answers: AnswerMap): boolean {
  // Handle && (and)
  if (condition.includes('&&')) {
    const conditions = condition.split('&&').map(s => s.trim());
    return conditions.every(c => evaluateLegacyCondition(c, answers));
  }
  
  // Handle || (or)
  if (condition.includes('||')) {
    const conditions = condition.split('||').map(s => s.trim());
    return conditions.some(c => evaluateLegacyCondition(c, answers));
  }
  
  // Handle != (not equal)
  if (condition.includes('!=')) {
    const [fieldPath, value] = condition.split('!=').map(s => s.trim());
    const fieldValue = getFieldValue(fieldPath, answers);
    const expectedValue = parseValue(value);
    return fieldValue !== expectedValue;
  }
  
  // Handle == (equal)
  if (condition.includes('==')) {
    const [fieldPath, value] = condition.split('==').map(s => s.trim());
    const fieldValue = getFieldValue(fieldPath, answers);
    const expectedValue = parseValue(value);
    return fieldValue === expectedValue;
  }
  
  // Handle simple field existence check
  const fieldValue = getFieldValue(condition, answers);
  return Boolean(fieldValue);
}

/**
 * Gets a field value from the answers map using dot notation
 * @param fieldPath - Dot-notated field path (e.g., "deployment.model")
 * @param answers - Answer map
 * @returns Field value or undefined
 */
function getFieldValue(fieldPath: string, answers: AnswerMap): any {
  return answers[fieldPath];
}

/**
 * Parses a string value to its actual type
 * @param value - String value to parse
 * @returns Parsed value (string, number, boolean, or null)
 */
function parseValue(value: string): any {
  const trimmed = value.trim();
  
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return trimmed.slice(1, -1);
  }
  
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  
  if (!isNaN(Number(trimmed))) {
    return Number(trimmed);
  }
  
  return trimmed;
}

/**
 * Expands triggers by looking up the triggered question IDs and returning the Question objects
 * @param question - Question that was answered
 * @param answer - Answer value
 * @param registry - Registry/map of all questions by ID
 * @returns Array of Question objects that should be triggered
 */
export function expandTriggers(
  question: Question,
  answer: any,
  registry: QuestionRegistry
): Question[] {
  if (!question.triggers) {
    return [];
  }
  
  const triggerKey = String(answer);
  
  if (triggerKey in question.triggers) {
    const questionIds = question.triggers[triggerKey];
    const triggeredQuestions: Question[] = [];
    
    for (const id of questionIds) {
      const q = registry.get(id);
      if (q) {
        triggeredQuestions.push(q);
      }
    }
    
    return triggeredQuestions;
  }
  
  return [];
}

/**
 * Filters questions based on current answers and rules
 * @param questions - All available questions
 * @param answers - Current answer map
 * @returns Filtered array of questions that should be shown
 */
export function filterQuestions(
  questions: Question[],
  answers: AnswerMap
): Question[] {
  return questions.filter(question => {
    // Check if question should be skipped
    return !evaluateSkip(question, answers);
  });
}

/**
 * Gets the next question(s) to ask based on current answers
 * @param questions - All available questions
 * @param answers - Current answer map
 * @param currentStage - Current stage name
 * @returns Array of next questions to ask
 */
export function getNextQuestions(
  questions: Question[],
  answers: AnswerMap,
  currentStage: string
): Question[] {
  // Filter questions for current stage
  const stageQuestions = questions.filter(q => q.stage === currentStage);
  
  // Filter based on rules
  const availableQuestions = filterQuestions(stageQuestions, answers);
  
  // Return unanswered questions
  return availableQuestions.filter(q => !(q.id in answers));
}

// Backwards compatibility exports
export const shouldSkipQuestion = (
  condition: string | null | undefined,
  answers: AnswerMap
): boolean => {
  if (!condition) return false;
  try {
    return evaluateExpression(condition as Expression, answers);
  } catch (error) {
    console.error(`Error evaluating condition "${condition}":`, error);
    return false;
  }
};

export const getTriggeredQuestions = (
  question: Question,
  answer: any
): string[] => {
  if (!question.triggers) return [];
  const triggerKey = String(answer);
  return triggerKey in question.triggers ? question.triggers[triggerKey] : [];
};

