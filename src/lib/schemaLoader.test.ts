import * as fs from 'fs';
import {
  loadSchema,
  loadQuestionnaireSchema,
  loadTagSchema,
  validateSchemaStructure,
  getQuestionById,
  getQuestionsByStage,
  getQuestionsByTag,
  QuestionnaireSchema,
  TagSchema
} from './schemaLoader';

// Mock fs for controlled testing
jest.mock('fs');

describe('schemaLoader', () => {
  const mockedFs = fs as jest.Mocked<typeof fs>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadSchema', () => {
    it('should load and parse a valid JSON schema', () => {
      const mockSchema = { version: '1.0', data: 'test' };
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockSchema));
      
      const result = loadSchema('test-schema.json');
      
      expect(result).toEqual(mockSchema);
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('test-schema.json'),
        'utf-8'
      );
    });

    it('should handle absolute paths', () => {
      const mockSchema = { version: '1.0' };
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockSchema));
      
      const absolutePath = '/absolute/path/schema.json';
      loadSchema(absolutePath);
      
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(absolutePath, 'utf-8');
    });

    it('should throw error on invalid JSON', () => {
      mockedFs.readFileSync.mockReturnValue('invalid json {');
      
      expect(() => loadSchema('invalid.json')).toThrow('Failed to load schema');
    });

    it('should throw error when file does not exist', () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });
      
      expect(() => loadSchema('nonexistent.json')).toThrow('Failed to load schema');
    });
  });

  describe('loadQuestionnaireSchema', () => {
    it('should load questionnaire schema with default path', () => {
      const mockSchema: QuestionnaireSchema = {
        version: '2.0',
        stages: ['core', 'review', 'deep_dive'],
        complexity_levels: ['base', 'minimal', 'standard'],
        questions: []
      };
      
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockSchema));
      
      const result = loadQuestionnaireSchema();
      
      expect(result).toEqual(mockSchema);
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('schemas'),
        'utf-8'
      );
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('Pre-TDD_Client_Questionnaire_v2.0.json'),
        'utf-8'
      );
    });

    it('should load questionnaire schema with custom base path', () => {
      const mockSchema: QuestionnaireSchema = {
        version: '2.0',
        stages: ['core'],
        complexity_levels: ['base'],
        questions: []
      };
      
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockSchema));
      
      loadQuestionnaireSchema('custom/path');
      
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('custom/path'),
        'utf-8'
      );
    });
  });

  describe('loadTagSchema', () => {
    it('should load tag schema with default path', () => {
      const mockSchema: TagSchema = {
        version: '1.1',
        tags: {
          foundation: { label: 'Foundation' }
        },
        field_metadata: {}
      };
      
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockSchema));
      
      const result = loadTagSchema();
      
      expect(result).toEqual(mockSchema);
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('Universal_Tag_Schema_v1.1.json'),
        'utf-8'
      );
    });

    it('should load tag schema with custom base path', () => {
      const mockSchema: TagSchema = {
        version: '1.1',
        tags: {},
        field_metadata: {}
      };
      
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockSchema));
      
      loadTagSchema('custom/schemas');
      
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining('custom/schemas'),
        'utf-8'
      );
    });
  });

  describe('validateSchemaStructure', () => {
    it('should return true for valid schema with all required properties', () => {
      const schema = {
        version: '1.0',
        stages: [],
        questions: []
      };
      
      const result = validateSchemaStructure(schema, ['version', 'stages', 'questions']);
      
      expect(result).toBe(true);
    });

    it('should throw error when required property is missing', () => {
      const schema = {
        version: '1.0',
        stages: []
      };
      
      expect(() => 
        validateSchemaStructure(schema, ['version', 'stages', 'questions'])
      ).toThrow('Schema is missing required property: questions');
    });

    it('should validate empty required props array', () => {
      const schema = { data: 'test' };
      
      const result = validateSchemaStructure(schema, []);
      
      expect(result).toBe(true);
    });
  });

  describe('getQuestionById', () => {
    const mockSchema: QuestionnaireSchema = {
      version: '2.0',
      stages: ['core'],
      complexity_levels: ['base'],
      questions: [
        {
          id: 'project.name',
          stage: 'core',
          type: 'text',
          question: 'Project name?',
          validation: {},
          tags: ['foundation']
        },
        {
          id: 'project.description',
          stage: 'core',
          type: 'text',
          question: 'Description?',
          validation: {},
          tags: ['foundation']
        }
      ]
    };

    it('should find question by id', () => {
      const result = getQuestionById(mockSchema, 'project.name');
      
      expect(result).toBeDefined();
      expect(result?.id).toBe('project.name');
      expect(result?.question).toBe('Project name?');
    });

    it('should return undefined for non-existent id', () => {
      const result = getQuestionById(mockSchema, 'nonexistent.id');
      
      expect(result).toBeUndefined();
    });
  });

  describe('getQuestionsByStage', () => {
    const mockSchema: QuestionnaireSchema = {
      version: '2.0',
      stages: ['core', 'deep_dive'],
      complexity_levels: ['base'],
      questions: [
        {
          id: 'q1',
          stage: 'core',
          type: 'text',
          question: 'Core Q1',
          validation: {},
          tags: ['foundation']
        },
        {
          id: 'q2',
          stage: 'core',
          type: 'text',
          question: 'Core Q2',
          validation: {},
          tags: ['foundation']
        },
        {
          id: 'q3',
          stage: 'deep_dive',
          type: 'text',
          question: 'Deep Q1',
          validation: {},
          tags: ['architecture']
        }
      ]
    };

    it('should return all questions for a specific stage', () => {
      const coreQuestions = getQuestionsByStage(mockSchema, 'core');
      
      expect(coreQuestions).toHaveLength(2);
      expect(coreQuestions[0].id).toBe('q1');
      expect(coreQuestions[1].id).toBe('q2');
    });

    it('should return empty array for stage with no questions', () => {
      const result = getQuestionsByStage(mockSchema, 'nonexistent_stage');
      
      expect(result).toEqual([]);
    });
  });

  describe('getQuestionsByTag', () => {
    const mockSchema: QuestionnaireSchema = {
      version: '2.0',
      stages: ['core'],
      complexity_levels: ['base'],
      questions: [
        {
          id: 'q1',
          stage: 'core',
          type: 'text',
          question: 'Q1',
          validation: {},
          tags: ['foundation', 'architecture']
        },
        {
          id: 'q2',
          stage: 'core',
          type: 'text',
          question: 'Q2',
          validation: {},
          tags: ['foundation']
        },
        {
          id: 'q3',
          stage: 'core',
          type: 'text',
          question: 'Q3',
          validation: {},
          tags: ['security']
        }
      ]
    };

    it('should return questions with specific tag', () => {
      const foundationQuestions = getQuestionsByTag(mockSchema, 'foundation');
      
      expect(foundationQuestions).toHaveLength(2);
      expect(foundationQuestions[0].id).toBe('q1');
      expect(foundationQuestions[1].id).toBe('q2');
    });

    it('should return empty array for non-existent tag', () => {
      const result = getQuestionsByTag(mockSchema, 'nonexistent');
      
      expect(result).toEqual([]);
    });

    it('should handle questions with multiple tags', () => {
      const architectureQuestions = getQuestionsByTag(mockSchema, 'architecture');
      
      expect(architectureQuestions).toHaveLength(1);
      expect(architectureQuestions[0].id).toBe('q1');
    });
  });

  describe('Integration: Real schema structure', () => {
    it('should handle realistic questionnaire schema structure', () => {
      const realisticSchema: QuestionnaireSchema = {
        version: '2.0',
        stages: ['core', 'review', 'deep_dive'],
        complexity_levels: ['base', 'minimal', 'standard', 'comprehensive', 'enterprise'],
        questions: [
          {
            id: 'project.name',
            stage: 'core',
            type: 'text',
            question: 'What is the name of your project?',
            hint: 'Use a descriptive name',
            validation: { required: true },
            tags: ['foundation'],
            skip_if: null,
            triggers: {}
          }
        ]
      };

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(realisticSchema));
      
      const loaded = loadQuestionnaireSchema();
      
      expect(validateSchemaStructure(loaded, ['version', 'stages', 'complexity_levels', 'questions'])).toBe(true);
      expect(loaded.stages).toContain('core');
      expect(loaded.complexity_levels).toContain('enterprise');
    });

    it('should handle realistic tag schema structure', () => {
      const realisticTagSchema: TagSchema = {
        version: '1.1',
        tags: {
          foundation: {
            label: 'Foundation',
            description: 'Core project information'
          },
          architecture: {
            label: 'Architecture',
            description: 'System architecture and design'
          }
        },
        field_metadata: {
          'project.name': {
            tags: ['foundation'],
            related_fields: ['project.description'],
            complexity_levels: ['base', 'minimal', 'standard', 'comprehensive', 'enterprise'],
            weight: 2
          }
        }
      };

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(realisticTagSchema));
      
      const loaded = loadTagSchema();
      
      expect(validateSchemaStructure(loaded, ['version', 'tags', 'field_metadata'])).toBe(true);
      expect(loaded.tags.foundation).toBeDefined();
      expect(loaded.field_metadata['project.name']).toBeDefined();
    });
  });
});
