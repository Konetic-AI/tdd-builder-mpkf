import {
  validateAnswer,
  validateAnswers,
  allValid,
  getAllErrors
} from './validateAnswer';
import { Question } from './schemaLoader';

describe('validateAnswer', () => {
  describe('validateAnswer - string validation', () => {
    const stringQuestion: Question = {
      id: 'test.string',
      stage: 'core',
      type: 'text',
      question: 'Test question',
      validation: { type: 'string', minLength: 3, maxLength: 10 },
      tags: ['test']
    };
    
    it('should validate valid string', () => {
      const result = validateAnswer(stringQuestion, 'hello');
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
    
    it('should reject string that is too short', () => {
      const result = validateAnswer(stringQuestion, 'ab');
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors![0]).toContain('at least 3 characters');
    });
    
    it('should reject string that is too long', () => {
      const result = validateAnswer(stringQuestion, 'this is way too long');
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain('no more than 10 characters');
    });
    
    it('should reject non-string value', () => {
      const result = validateAnswer(stringQuestion, 123);
      expect(result.valid).toBe(false);
      expect(result.errors![0]).toContain('Expected string');
    });
    
    it('should include examples from help.examples when validation fails', () => {
      const questionWithExamples: Question = {
        ...stringQuestion,
        help: {
          why: 'Test reason',
          examples: ['example1', 'example2', 'example3']
        }
      };
      const result = validateAnswer(questionWithExamples, 'ab');
      expect(result.valid).toBe(false);
      expect(result.examples).toEqual(['example1', 'example2', 'example3']);
    });
    
    it('should include learnMore URL when validation fails', () => {
      const questionWithLearnMore: Question = {
        ...stringQuestion,
        help: {
          why: 'Test reason',
          learnMore: 'https://example.com/learn-more'
        }
      };
      const result = validateAnswer(questionWithLearnMore, 'ab');
      expect(result.valid).toBe(false);
      expect(result.learnMore).toBe('https://example.com/learn-more');
    });
  });
  
  describe('validateAnswer - enum validation', () => {
    const enumQuestion: Question = {
      id: 'test.enum',
      stage: 'core',
      type: 'select',
      question: 'Test question',
      validation: { enum: ['option1', 'option2', 'option3'] },
      tags: ['test']
    };
    
    it('should validate valid enum value', () => {
      const result = validateAnswer(enumQuestion, 'option1');
      expect(result.valid).toBe(true);
    });
    
    it('should reject invalid enum value', () => {
      const result = validateAnswer(enumQuestion, 'invalid');
      expect(result.valid).toBe(false);
    });
  });
  
  describe('validateAnswer - boolean validation', () => {
    const boolQuestion: Question = {
      id: 'test.bool',
      stage: 'core',
      type: 'boolean',
      question: 'Test question',
      validation: { type: 'boolean' },
      tags: ['test']
    };
    
    it('should validate true', () => {
      const result = validateAnswer(boolQuestion, true);
      expect(result.valid).toBe(true);
    });
    
    it('should validate false', () => {
      const result = validateAnswer(boolQuestion, false);
      expect(result.valid).toBe(true);
    });
    
    it('should reject non-boolean', () => {
      const result = validateAnswer(boolQuestion, 'true');
      expect(result.valid).toBe(false);
    });
  });
  
  describe('validateAnswer - array validation', () => {
    const arrayQuestion: Question = {
      id: 'test.array',
      stage: 'core',
      type: 'multi-select',
      question: 'Test question',
      validation: { type: 'array', minItems: 1, maxItems: 3 },
      tags: ['test']
    };
    
    it('should validate valid array', () => {
      const result = validateAnswer(arrayQuestion, ['item1', 'item2']);
      expect(result.valid).toBe(true);
    });
    
    it('should reject empty array when minItems is set', () => {
      const result = validateAnswer(arrayQuestion, []);
      expect(result.valid).toBe(false);
      expect(result.errors![0]).toContain('at least 1 item');
    });
    
    it('should reject array with too many items', () => {
      const result = validateAnswer(arrayQuestion, ['a', 'b', 'c', 'd']);
      expect(result.valid).toBe(false);
      expect(result.errors![0]).toContain('no more than 3 items');
    });
    
    it('should reject non-array value', () => {
      const result = validateAnswer(arrayQuestion, 'not an array');
      expect(result.valid).toBe(false);
    });
  });
  
  describe('validateAnswers', () => {
    const questions: Question[] = [
      {
        id: 'q1',
        stage: 'core',
        type: 'text',
        question: 'Question 1',
        validation: { type: 'string', minLength: 3 },
        tags: ['test']
      },
      {
        id: 'q2',
        stage: 'core',
        type: 'select',
        question: 'Question 2',
        validation: { enum: ['a', 'b', 'c'] },
        tags: ['test']
      }
    ];
    
    it('should validate all valid answers', () => {
      const answers = {
        q1: 'hello',
        q2: 'a'
      };
      const results = validateAnswers(questions, answers);
      expect(results.q1.valid).toBe(true);
      expect(results.q2.valid).toBe(true);
    });
    
    it('should detect invalid answers', () => {
      const answers = {
        q1: 'ab', // too short
        q2: 'd' // invalid enum
      };
      const results = validateAnswers(questions, answers);
      expect(results.q1.valid).toBe(false);
      expect(results.q2.valid).toBe(false);
    });
    
    it('should handle undefined answers as valid', () => {
      const answers = {
        q1: 'hello'
        // q2 is undefined
      };
      const results = validateAnswers(questions, answers);
      expect(results.q1.valid).toBe(true);
      expect(results.q2.valid).toBe(true); // undefined is treated as valid
    });
  });
  
  describe('allValid', () => {
    it('should return true when all results are valid', () => {
      const results = {
        q1: { valid: true },
        q2: { valid: true }
      };
      expect(allValid(results)).toBe(true);
    });
    
    it('should return false when any result is invalid', () => {
      const results = {
        q1: { valid: true },
        q2: { valid: false, errors: ['Error'] }
      };
      expect(allValid(results)).toBe(false);
    });
  });
  
  describe('getAllErrors', () => {
    it('should collect all errors', () => {
      const results = {
        q1: { valid: false, errors: ['Error 1', 'Error 2'] },
        q2: { valid: true },
        q3: { valid: false, errors: ['Error 3'] }
      };
      const errors = getAllErrors(results);
      expect(errors).toEqual(['Error 1', 'Error 2', 'Error 3']);
    });
    
    it('should return empty array when no errors', () => {
      const results = {
        q1: { valid: true },
        q2: { valid: true }
      };
      const errors = getAllErrors(results);
      expect(errors).toEqual([]);
    });
  });
  
  describe('validateAnswer - pattern validation', () => {
    const patternQuestion: Question = {
      id: 'test.pattern',
      stage: 'core',
      type: 'text',
      question: 'Test question',
      validation: { 
        type: 'string', 
        pattern: '^[A-Za-z0-9-]+$'
      },
      tags: ['test']
    };
    
    it('should validate string matching pattern', () => {
      const result = validateAnswer(patternQuestion, 'valid-string-123');
      expect(result.valid).toBe(true);
    });
    
    it('should reject string not matching pattern', () => {
      const result = validateAnswer(patternQuestion, 'invalid string with spaces');
      expect(result.valid).toBe(false);
      expect(result.errors![0]).toContain('does not match the required format');
    });
  });
  
  describe('validateAnswer - number validation', () => {
    const numberQuestion: Question = {
      id: 'test.number',
      stage: 'core',
      type: 'text',
      question: 'Test question',
      validation: { 
        type: 'number',
        minimum: 0,
        maximum: 100
      },
      tags: ['test']
    };
    
    it('should validate valid number', () => {
      const result = validateAnswer(numberQuestion, 50);
      expect(result.valid).toBe(true);
    });
    
    it('should reject number below minimum', () => {
      const result = validateAnswer(numberQuestion, -1);
      expect(result.valid).toBe(false);
      expect(result.errors![0]).toContain('at least 0');
    });
    
    it('should reject number above maximum', () => {
      const result = validateAnswer(numberQuestion, 101);
      expect(result.valid).toBe(false);
      expect(result.errors![0]).toContain('no more than 100');
    });
  });
  
  describe('validateAnswer - integer validation', () => {
    const integerQuestion: Question = {
      id: 'test.integer',
      stage: 'core',
      type: 'text',
      question: 'Test question',
      validation: { 
        type: 'integer',
        minimum: 1,
        maximum: 10
      },
      tags: ['test']
    };
    
    it('should validate valid integer', () => {
      const result = validateAnswer(integerQuestion, 5);
      expect(result.valid).toBe(true);
    });
    
    it('should reject non-integer', () => {
      const result = validateAnswer(integerQuestion, 5.5);
      expect(result.valid).toBe(false);
    });
  });
  
  describe('validateAnswer - examples from top-level property', () => {
    it('should include top-level examples when validation fails', () => {
      const questionWithTopExamples: Question = {
        id: 'test.examples',
        stage: 'core',
        type: 'text',
        question: 'Test question',
        validation: { type: 'string', minLength: 5 },
        tags: ['test'],
        examples: ['example1', 'example2']
      };
      
      const result = validateAnswer(questionWithTopExamples, 'ab');
      expect(result.valid).toBe(false);
      expect(result.examples).toEqual(['example1', 'example2']);
    });
    
    it('should prefer help.examples over top-level examples', () => {
      const questionWithBothExamples: Question = {
        id: 'test.examples',
        stage: 'core',
        type: 'text',
        question: 'Test question',
        validation: { type: 'string', minLength: 5 },
        tags: ['test'],
        examples: ['top1', 'top2'],
        help: {
          why: 'Test',
          examples: ['help1', 'help2']
        }
      };
      
      const result = validateAnswer(questionWithBothExamples, 'ab');
      expect(result.valid).toBe(false);
      expect(result.examples).toEqual(['help1', 'help2']);
    });
  });
  
  describe('validateAnswer - enum with options', () => {
    const enumWithOptionsQuestion: Question = {
      id: 'test.enum',
      stage: 'core',
      type: 'select',
      question: 'Test question',
      validation: { enum: ['option1', 'option2', 'option3'] },
      options: ['option1', 'option2', 'option3'],
      tags: ['test']
    };
    
    it('should show user-friendly message for enum with options', () => {
      const result = validateAnswer(enumWithOptionsQuestion, 'invalid');
      expect(result.valid).toBe(false);
      expect(result.errors![0]).toContain('select from the available options');
    });
  });
  
  describe('validateAnswer - direct JSON Schema', () => {
    const directSchemaQuestion: Question = {
      id: 'test.direct',
      stage: 'core',
      type: 'text',
      question: 'Test question',
      validation: {
        // Direct JSON Schema without type property
        anyOf: [
          { type: 'string', minLength: 3 },
          { type: 'number', minimum: 0 }
        ]
      },
      tags: ['test']
    };
    
    it('should validate using direct JSON Schema', () => {
      const result1 = validateAnswer(directSchemaQuestion, 'hello');
      expect(result1.valid).toBe(true);
      
      const result2 = validateAnswer(directSchemaQuestion, 5);
      expect(result2.valid).toBe(true);
    });
    
    it('should reject invalid value for direct JSON Schema', () => {
      const result = validateAnswer(directSchemaQuestion, 'ab');
      expect(result.valid).toBe(false);
    });
  });
  
  describe('validateAnswer - error handling', () => {
    it('should handle validation exceptions gracefully', () => {
      const invalidQuestion: Question = {
        id: 'test.invalid',
        stage: 'core',
        type: 'text',
        question: 'Test question',
        validation: {
          // Invalid pattern that will cause an error
          pattern: '[invalid'
        },
        tags: ['test']
      };
      
      const result = validateAnswer(invalidQuestion, 'test');
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });
});

