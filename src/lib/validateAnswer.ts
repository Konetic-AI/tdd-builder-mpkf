import Ajv, { ValidateFunction } from 'ajv';
import { Question } from './schemaLoader';

const ajv = new Ajv({ allErrors: true });

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  examples?: string[];
  learnMore?: string;
}

/**
 * Validates an answer against a question's validation schema
 * @param question - Question object with validation rules
 * @param answer - Answer value to validate
 * @returns ValidationResult with valid flag, error messages, examples, and learnMore URL
 */
export function validateAnswer(question: Question, answer: any): ValidationResult {
  try {
    // Build JSON Schema from question validation
    const schema = buildJsonSchema(question);
    
    // Compile and validate
    const validate: ValidateFunction = ajv.compile(schema);
    const valid = validate(answer);
    
    if (valid) {
      return { valid: true };
    }
    
    // Format error messages with user-friendly context
    const errors = formatValidationErrors(validate.errors || [], question);
    
    // Include examples and learnMore URL if available
    const result: ValidationResult = {
      valid: false,
      errors
    };
    
    // Add examples from help.examples or top-level examples
    if (question.help?.examples && question.help.examples.length > 0) {
      result.examples = question.help.examples;
    } else if (question.examples && question.examples.length > 0) {
      result.examples = question.examples;
    }
    
    // Add learnMore URL if available
    if (question.help?.learnMore) {
      result.learnMore = question.help.learnMore;
    }
    
    return result;
  } catch (error) {
    if (error instanceof Error) {
      return { valid: false, errors: [error.message] };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}

/**
 * Formats Ajv validation errors into user-friendly messages
 * @param errors - Array of Ajv error objects
 * @param question - Question being validated
 * @returns Array of formatted error messages
 */
function formatValidationErrors(errors: any[], question: Question): string[] {
  if (errors.length === 0) {
    return ['Validation failed'];
  }
  
  return errors.map(err => {
    // Format error based on error type
    switch (err.keyword) {
      case 'minLength':
        return `Answer must be at least ${err.params.limit} characters long`;
      case 'maxLength':
        return `Answer must be no more than ${err.params.limit} characters long`;
      case 'minimum':
        return `Value must be at least ${err.params.limit}`;
      case 'maximum':
        return `Value must be no more than ${err.params.limit}`;
      case 'minItems':
        return `Please select at least ${err.params.limit} item${err.params.limit > 1 ? 's' : ''}`;
      case 'maxItems':
        return `Please select no more than ${err.params.limit} item${err.params.limit > 1 ? 's' : ''}`;
      case 'type':
        return `Expected ${err.params.type}, but got ${typeof err.data}`;
      case 'enum':
        if (question.options && question.options.length > 0) {
          return `Please select from the available options`;
        }
        return `Invalid value. Allowed values: ${err.params.allowedValues?.join(', ')}`;
      case 'pattern':
        return `Answer does not match the required format`;
      default:
        return err.message || 'Validation failed';
    }
  });
}

/**
 * Builds a JSON Schema object from a question's validation rules
 * @param question - Question object with validation property
 * @returns JSON Schema object
 */
function buildJsonSchema(question: Question): object {
  const validation = question.validation;
  
  // Handle different validation formats
  if (validation.type) {
    // Simple type validation with additional constraints
    const schema: any = {
      type: validation.type
    };
    
    // Add string constraints
    if (validation.type === 'string') {
      if (validation.minLength !== undefined) {
        schema.minLength = validation.minLength;
      }
      if (validation.maxLength !== undefined) {
        schema.maxLength = validation.maxLength;
      }
      if (validation.pattern !== undefined) {
        schema.pattern = validation.pattern;
      }
    }
    
    // Add number constraints
    if (validation.type === 'number' || validation.type === 'integer') {
      if (validation.minimum !== undefined) {
        schema.minimum = validation.minimum;
      }
      if (validation.maximum !== undefined) {
        schema.maximum = validation.maximum;
      }
    }
    
    // Add array constraints
    if (validation.type === 'array') {
      if (validation.minItems !== undefined) {
        schema.minItems = validation.minItems;
      }
      if (validation.maxItems !== undefined) {
        schema.maxItems = validation.maxItems;
      }
      if (validation.items !== undefined) {
        schema.items = validation.items;
      }
    }
    
    return schema;
  }
  
  // Handle enum validation
  if (validation.enum) {
    return {
      enum: validation.enum
    };
  }
  
  // Return validation object as-is if it's already a JSON Schema
  return validation;
}

/**
 * Validates multiple answers against their questions
 * @param questions - Array of Question objects
 * @param answers - Map of question IDs to answer values
 * @returns Map of question IDs to ValidationResults
 */
export function validateAnswers(
  questions: Question[],
  answers: Record<string, any>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};
  
  for (const question of questions) {
    const answer = answers[question.id];
    
    // Skip validation if answer is undefined and question is optional
    if (answer === undefined) {
      results[question.id] = { valid: true };
      continue;
    }
    
    results[question.id] = validateAnswer(question, answer);
  }
  
  return results;
}

/**
 * Checks if all validation results are valid
 * @param results - Map of question IDs to ValidationResults
 * @returns True if all valid, false otherwise
 */
export function allValid(results: Record<string, ValidationResult>): boolean {
  return Object.values(results).every(r => r.valid);
}

/**
 * Gets all validation errors from results
 * @param results - Map of question IDs to ValidationResults
 * @returns Array of all error messages
 */
export function getAllErrors(results: Record<string, ValidationResult>): string[] {
  return Object.values(results)
    .filter(r => !r.valid && r.errors)
    .flatMap(r => r.errors || []);
}

