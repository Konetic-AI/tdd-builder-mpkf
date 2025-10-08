import * as fs from 'fs';
import * as path from 'path';

/**
 * Expression types for skip_if conditions
 */
export type Expression =
  | { eq: [string, any] }
  | { neq: [string, any] }
  | { has: [string, any] }
  | { not: Expression }
  | { and: Expression[] }
  | { or: Expression[] }
  | string; // Legacy string format support

export interface Question {
  id: string;
  stage: string;
  type: string;
  question: string;
  hint?: string;
  options?: string[];
  validation: any;
  tags: string[];
  skip_if?: Expression | null;
  triggers?: Record<string, string[]>;
  examples?: string[];
  help?: {
    why?: string;
    examples?: string[];
    learnMore?: string;
  };
}

export interface QuestionnaireSchema {
  version: string;
  stages: string[];
  complexity_levels: string[];
  questions: Question[];
}

export interface Tag {
  label: string;
  description?: string;
}

export interface FieldMetadata {
  tags: string[];
  related_fields: string[];
  complexity_levels: string[];
  weight: number;
}

export interface TagSchema {
  version: string;
  tags: Record<string, Tag>;
  field_metadata: Record<string, FieldMetadata>;
}

/**
 * Loads a JSON schema from the file system
 * @param schemaPath - Path to the schema file
 * @returns Parsed JSON object
 */
export function loadSchema<T = any>(schemaPath: string): T {
  try {
    const absolutePath = path.isAbsolute(schemaPath) 
      ? schemaPath 
      : path.resolve(process.cwd(), schemaPath);
    
    const fileContents = fs.readFileSync(absolutePath, 'utf-8');
    return JSON.parse(fileContents) as T;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load schema from ${schemaPath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Loads the questionnaire schema
 * @param basePath - Base path to schemas directory (defaults to schemas/)
 * @returns Questionnaire schema object
 */
export function loadQuestionnaireSchema(basePath: string = 'schemas'): QuestionnaireSchema {
  const schemaPath = path.join(basePath, 'Pre-TDD_Client_Questionnaire_v2.0.json');
  return loadSchema<QuestionnaireSchema>(schemaPath);
}

/**
 * Loads the tag schema
 * @param basePath - Base path to schemas directory (defaults to schemas/)
 * @returns Tag schema object
 */
export function loadTagSchema(basePath: string = 'schemas'): TagSchema {
  const schemaPath = path.join(basePath, 'Universal_Tag_Schema_v1.1.json');
  return loadSchema<TagSchema>(schemaPath);
}

/**
 * Validates that required schema properties exist
 * @param schema - Schema object to validate
 * @param requiredProps - Array of required property names
 * @returns True if valid, throws error if invalid
 */
export function validateSchemaStructure(
  schema: any,
  requiredProps: string[]
): boolean {
  for (const prop of requiredProps) {
    if (!(prop in schema)) {
      throw new Error(`Schema is missing required property: ${prop}`);
    }
  }
  return true;
}

/**
 * Gets a question by ID from the questionnaire schema
 * @param schema - Questionnaire schema
 * @param questionId - ID of the question to find
 * @returns Question object or undefined if not found
 */
export function getQuestionById(
  schema: QuestionnaireSchema,
  questionId: string
): Question | undefined {
  return schema.questions.find(q => q.id === questionId);
}

/**
 * Gets all questions for a specific stage
 * @param schema - Questionnaire schema
 * @param stage - Stage name (core, review, deep_dive)
 * @returns Array of questions for that stage
 */
export function getQuestionsByStage(
  schema: QuestionnaireSchema,
  stage: string
): Question[] {
  return schema.questions.filter(q => q.stage === stage);
}

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

