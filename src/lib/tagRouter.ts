import { Question, QuestionnaireSchema, TagSchema, FieldMetadata } from './schemaLoader';
import { evaluateSkip, AnswerMap } from './rulesEngine';

/**
 * Gets all questions with a specific tag
 * @param schema - Questionnaire schema
 * @param tag - Tag name
 * @returns Array of questions with that tag
 */
export function getQuestionsByTag(
  schema: QuestionnaireSchema,
  tag: string
): Question[] {
  return schema.questions.filter(q => q.tags.includes(tag));
}

/**
 * Gets all questions with any of the specified tags
 * @param schema - Questionnaire schema
 * @param tags - Array of tag names
 * @returns Array of questions with any of those tags
 */
export function getQuestionsByTags(
  schema: QuestionnaireSchema,
  tags: string[]
): Question[] {
  return schema.questions.filter(q => 
    q.tags.some(tag => tags.includes(tag))
  );
}

/**
 * Groups questions by their primary tag
 * @param questions - Array of questions
 * @returns Map of tag names to arrays of questions
 */
export function groupQuestionsByTag(
  questions: Question[]
): Record<string, Question[]> {
  const groups: Record<string, Question[]> = {};
  
  for (const question of questions) {
    const primaryTag = question.tags[0]; // Use first tag as primary
    if (!groups[primaryTag]) {
      groups[primaryTag] = [];
    }
    groups[primaryTag].push(question);
  }
  
  return groups;
}

/**
 * Gets metadata for a field from the tag schema
 * @param tagSchema - Tag schema
 * @param fieldId - Field ID (question ID)
 * @returns Field metadata or undefined if not found
 */
export function getFieldMetadata(
  tagSchema: TagSchema,
  fieldId: string
): FieldMetadata | undefined {
  return tagSchema.field_metadata[fieldId];
}

/**
 * Gets all related fields for a given field
 * @param tagSchema - Tag schema
 * @param fieldId - Field ID (question ID)
 * @returns Array of related field IDs
 */
export function getRelatedFields(
  tagSchema: TagSchema,
  fieldId: string
): string[] {
  const metadata = getFieldMetadata(tagSchema, fieldId);
  return metadata?.related_fields || [];
}

/**
 * Gets the complexity levels applicable to a field
 * @param tagSchema - Tag schema
 * @param fieldId - Field ID (question ID)
 * @returns Array of complexity level names
 */
export function getFieldComplexityLevels(
  tagSchema: TagSchema,
  fieldId: string
): string[] {
  const metadata = getFieldMetadata(tagSchema, fieldId);
  return metadata?.complexity_levels || [];
}

/**
 * Filters questions by complexity level
 * @param schema - Questionnaire schema
 * @param tagSchema - Tag schema
 * @param complexityLevel - Complexity level name
 * @returns Array of questions applicable to that complexity level
 */
export function getQuestionsByComplexity(
  schema: QuestionnaireSchema,
  tagSchema: TagSchema,
  complexityLevel: string
): Question[] {
  return schema.questions.filter(q => {
    const metadata = getFieldMetadata(tagSchema, q.id);
    if (!metadata) {
      // If no metadata, include in base level only
      return complexityLevel === 'base';
    }
    return metadata.complexity_levels.includes(complexityLevel);
  });
}

/**
 * Gets the weight of a field for complexity calculation
 * @param tagSchema - Tag schema
 * @param fieldId - Field ID (question ID)
 * @returns Weight value (defaults to 1 if not specified)
 */
export function getFieldWeight(
  tagSchema: TagSchema,
  fieldId: string
): number {
  const metadata = getFieldMetadata(tagSchema, fieldId);
  return metadata?.weight || 1;
}

/**
 * Calculates the total weight of answered questions
 * @param tagSchema - Tag schema
 * @param answeredFieldIds - Array of field IDs that have been answered
 * @returns Total weight
 */
export function calculateAnsweredWeight(
  tagSchema: TagSchema,
  answeredFieldIds: string[]
): number {
  return answeredFieldIds.reduce((total, fieldId) => {
    return total + getFieldWeight(tagSchema, fieldId);
  }, 0);
}

/**
 * Gets all available tags from the tag schema
 * @param tagSchema - Tag schema
 * @returns Array of tag names
 */
export function getAvailableTags(tagSchema: TagSchema): string[] {
  return Object.keys(tagSchema.tags);
}

/**
 * Gets tag information
 * @param tagSchema - Tag schema
 * @param tagName - Tag name
 * @returns Tag object or undefined if not found
 */
export function getTagInfo(tagSchema: TagSchema, tagName: string) {
  return tagSchema.tags[tagName];
}

/**
 * Filters questions by multiple criteria
 * @param schema - Questionnaire schema
 * @param tagSchema - Tag schema
 * @param filters - Filter criteria
 * @returns Filtered array of questions
 */
export function filterQuestions(
  schema: QuestionnaireSchema,
  tagSchema: TagSchema,
  filters: {
    tags?: string[];
    stage?: string;
    complexityLevel?: string;
    type?: string;
  }
): Question[] {
  let questions = schema.questions;
  
  if (filters.tags && filters.tags.length > 0) {
    questions = questions.filter(q => 
      q.tags.some(tag => filters.tags!.includes(tag))
    );
  }
  
  if (filters.stage) {
    questions = questions.filter(q => q.stage === filters.stage);
  }
  
  if (filters.complexityLevel) {
    questions = questions.filter(q => {
      const metadata = getFieldMetadata(tagSchema, q.id);
      if (!metadata) return filters.complexityLevel === 'base';
      return metadata.complexity_levels.includes(filters.complexityLevel!);
    });
  }
  
  if (filters.type) {
    questions = questions.filter(q => q.type === filters.type);
  }
  
  return questions;
}

/**
 * Filters questions by tags with skip_if evaluation
 * @param questions - Array of questions to filter
 * @param selectedTags - Array of tag names to filter by (optional)
 * @param answers - Current answer map for skip_if evaluation
 * @returns Filtered array of questions
 * 
 * Rules:
 * - If selectedTags provided, only include questions with intersecting tags
 * - Always include questions tagged with "foundation" (core questions)
 * - Apply skip_if evaluation after tag filtering
 */
export function filterQuestionsByTags(
  questions: Question[],
  selectedTags: string[] | undefined,
  answers: AnswerMap
): Question[] {
  let filtered = questions;
  
  // Step 1: Apply tag filtering
  if (selectedTags && selectedTags.length > 0) {
    filtered = questions.filter(q => {
      // Always include foundation/core questions
      if (q.tags.includes('foundation')) {
        return true;
      }
      
      // Include if question has any of the selected tags
      return q.tags.some(tag => selectedTags.includes(tag));
    });
  }
  
  // Step 2: Apply skip_if filtering
  filtered = filtered.filter(q => !evaluateSkip(q, answers));
  
  return filtered;
}

