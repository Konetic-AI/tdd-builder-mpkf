import {
  getQuestionsByTag,
  getQuestionsByTags,
  groupQuestionsByTag,
  getFieldMetadata,
  getRelatedFields,
  getFieldComplexityLevels,
  getQuestionsByComplexity,
  getFieldWeight,
  calculateAnsweredWeight,
  getAvailableTags,
  getTagInfo,
  filterQuestions,
  filterQuestionsByTags
} from './tagRouter';
import { QuestionnaireSchema, TagSchema, Question } from './schemaLoader';
import { AnswerMap } from './rulesEngine';

describe('tagRouter', () => {
  const mockQuestionnaireSchema: QuestionnaireSchema = {
    version: '2.0',
    stages: ['core', 'deep_dive'],
    complexity_levels: ['base', 'minimal', 'standard'],
    questions: [
      {
        id: 'q1',
        stage: 'core',
        type: 'text',
        question: 'Q1',
        validation: {},
        tags: ['foundation']
      },
      {
        id: 'q2',
        stage: 'core',
        type: 'text',
        question: 'Q2',
        validation: {},
        tags: ['foundation', 'architecture']
      },
      {
        id: 'q3',
        stage: 'deep_dive',
        type: 'text',
        question: 'Q3',
        validation: {},
        tags: ['security']
      },
      {
        id: 'q4',
        stage: 'deep_dive',
        type: 'text',
        question: 'Q4',
        validation: {},
        tags: ['operations']
      }
    ]
  };

  const mockTagSchema: TagSchema = {
    version: '1.1',
    tags: {
      foundation: {
        label: 'Foundation',
        description: 'Core project information'
      },
      architecture: {
        label: 'Architecture',
        description: 'System design'
      },
      security: {
        label: 'Security',
        description: 'Security controls'
      },
      operations: {
        label: 'Operations',
        description: 'Operational concerns'
      }
    },
    field_metadata: {
      'q1': {
        tags: ['foundation'],
        related_fields: ['q2'],
        complexity_levels: ['base', 'minimal', 'standard'],
        weight: 2
      },
      'q2': {
        tags: ['foundation', 'architecture'],
        related_fields: ['q1', 'q3'],
        complexity_levels: ['minimal', 'standard'],
        weight: 3
      },
      'q3': {
        tags: ['security'],
        related_fields: ['q2'],
        complexity_levels: ['standard', 'comprehensive'],
        weight: 4
      },
      'q4': {
        tags: ['operations'],
        related_fields: [],
        complexity_levels: ['standard'],
        weight: 1
      }
    }
  };

  describe('getQuestionsByTag', () => {
    it('should return questions with specific tag', () => {
      const foundationQuestions = getQuestionsByTag(mockQuestionnaireSchema, 'foundation');

      expect(foundationQuestions).toHaveLength(2);
      expect(foundationQuestions[0].id).toBe('q1');
      expect(foundationQuestions[1].id).toBe('q2');
    });

    it('should return empty array for non-existent tag', () => {
      const result = getQuestionsByTag(mockQuestionnaireSchema, 'nonexistent');

      expect(result).toEqual([]);
    });

    it('should handle questions with multiple tags', () => {
      const architectureQuestions = getQuestionsByTag(mockQuestionnaireSchema, 'architecture');

      expect(architectureQuestions).toHaveLength(1);
      expect(architectureQuestions[0].id).toBe('q2');
    });
  });

  describe('getQuestionsByTags', () => {
    it('should return questions with any of the specified tags', () => {
      const questions = getQuestionsByTags(mockQuestionnaireSchema, ['foundation', 'security']);

      expect(questions).toHaveLength(3); // q1, q2, q3
      expect(questions.map(q => q.id)).toContain('q1');
      expect(questions.map(q => q.id)).toContain('q2');
      expect(questions.map(q => q.id)).toContain('q3');
    });

    it('should return empty array when no tags match', () => {
      const questions = getQuestionsByTags(mockQuestionnaireSchema, ['nonexistent']);

      expect(questions).toEqual([]);
    });

    it('should not duplicate questions with multiple matching tags', () => {
      const questions = getQuestionsByTags(mockQuestionnaireSchema, ['foundation', 'architecture']);

      // q2 has both tags, but should appear only once
      const q2Count = questions.filter(q => q.id === 'q2').length;
      expect(q2Count).toBe(1);
    });

    it('should handle empty tags array', () => {
      const questions = getQuestionsByTags(mockQuestionnaireSchema, []);

      expect(questions).toEqual([]);
    });
  });

  describe('groupQuestionsByTag', () => {
    it('should group questions by their primary tag', () => {
      const grouped = groupQuestionsByTag(mockQuestionnaireSchema.questions);

      expect(grouped['foundation']).toHaveLength(2);
      expect(grouped['security']).toHaveLength(1);
      expect(grouped['operations']).toHaveLength(1);
    });

    it('should use first tag as primary tag', () => {
      const grouped = groupQuestionsByTag(mockQuestionnaireSchema.questions);

      // q2 has tags ['foundation', 'architecture'], so it should be grouped under 'foundation'
      expect(grouped['foundation']).toContainEqual(
        expect.objectContaining({ id: 'q2' })
      );
    });

    it('should handle empty questions array', () => {
      const grouped = groupQuestionsByTag([]);

      expect(grouped).toEqual({});
    });
  });

  describe('getFieldMetadata', () => {
    it('should return metadata for existing field', () => {
      const metadata = getFieldMetadata(mockTagSchema, 'q1');

      expect(metadata).toBeDefined();
      expect(metadata?.tags).toContain('foundation');
      expect(metadata?.weight).toBe(2);
    });

    it('should return undefined for non-existent field', () => {
      const metadata = getFieldMetadata(mockTagSchema, 'nonexistent');

      expect(metadata).toBeUndefined();
    });
  });

  describe('getRelatedFields', () => {
    it('should return related fields for existing field', () => {
      const related = getRelatedFields(mockTagSchema, 'q2');

      expect(related).toEqual(['q1', 'q3']);
    });

    it('should return empty array for field with no related fields', () => {
      const related = getRelatedFields(mockTagSchema, 'q4');

      expect(related).toEqual([]);
    });

    it('should return empty array for non-existent field', () => {
      const related = getRelatedFields(mockTagSchema, 'nonexistent');

      expect(related).toEqual([]);
    });
  });

  describe('getFieldComplexityLevels', () => {
    it('should return complexity levels for existing field', () => {
      const levels = getFieldComplexityLevels(mockTagSchema, 'q1');

      expect(levels).toEqual(['base', 'minimal', 'standard']);
    });

    it('should return empty array for non-existent field', () => {
      const levels = getFieldComplexityLevels(mockTagSchema, 'nonexistent');

      expect(levels).toEqual([]);
    });
  });

  describe('getQuestionsByComplexity', () => {
    it('should return questions for specific complexity level', () => {
      const baseQuestions = getQuestionsByComplexity(
        mockQuestionnaireSchema,
        mockTagSchema,
        'base'
      );

      expect(baseQuestions).toHaveLength(1);
      expect(baseQuestions[0].id).toBe('q1');
    });

    it('should include questions for multiple complexity levels', () => {
      const standardQuestions = getQuestionsByComplexity(
        mockQuestionnaireSchema,
        mockTagSchema,
        'standard'
      );

      expect(standardQuestions.map(q => q.id)).toContain('q1');
      expect(standardQuestions.map(q => q.id)).toContain('q2');
      expect(standardQuestions.map(q => q.id)).toContain('q3');
      expect(standardQuestions.map(q => q.id)).toContain('q4');
    });

    it('should default to base level for questions without metadata', () => {
      const schemaWithoutMetadata: QuestionnaireSchema = {
        version: '2.0',
        stages: ['core'],
        complexity_levels: ['base'],
        questions: [
          {
            id: 'q_no_metadata',
            stage: 'core',
            type: 'text',
            question: 'No metadata',
            validation: {},
            tags: ['foundation']
          }
        ]
      };

      const baseQuestions = getQuestionsByComplexity(
        schemaWithoutMetadata,
        mockTagSchema,
        'base'
      );

      expect(baseQuestions).toHaveLength(1);
      expect(baseQuestions[0].id).toBe('q_no_metadata');
    });

    it('should exclude questions without metadata for non-base levels', () => {
      const schemaWithoutMetadata: QuestionnaireSchema = {
        version: '2.0',
        stages: ['core'],
        complexity_levels: ['standard'],
        questions: [
          {
            id: 'q_no_metadata',
            stage: 'core',
            type: 'text',
            question: 'No metadata',
            validation: {},
            tags: ['foundation']
          }
        ]
      };

      const standardQuestions = getQuestionsByComplexity(
        schemaWithoutMetadata,
        mockTagSchema,
        'standard'
      );

      expect(standardQuestions).toHaveLength(0);
    });
  });

  describe('getFieldWeight', () => {
    it('should return weight for existing field', () => {
      expect(getFieldWeight(mockTagSchema, 'q1')).toBe(2);
      expect(getFieldWeight(mockTagSchema, 'q3')).toBe(4);
    });

    it('should return default weight (1) for non-existent field', () => {
      expect(getFieldWeight(mockTagSchema, 'nonexistent')).toBe(1);
    });

    it('should return default weight (1) for field without weight', () => {
      const schemaWithoutWeight: TagSchema = {
        version: '1.1',
        tags: {},
        field_metadata: {
          'q5': {
            tags: ['foundation'],
            related_fields: [],
            complexity_levels: ['base'],
            weight: undefined as any // Simulate missing weight
          }
        }
      };

      expect(getFieldWeight(schemaWithoutWeight, 'q5')).toBe(1);
    });
  });

  describe('calculateAnsweredWeight', () => {
    it('should calculate total weight of answered fields', () => {
      const answeredIds = ['q1', 'q2', 'q3'];
      const totalWeight = calculateAnsweredWeight(mockTagSchema, answeredIds);

      // q1=2, q2=3, q3=4 → total=9
      expect(totalWeight).toBe(9);
    });

    it('should return 0 for empty answered fields', () => {
      const totalWeight = calculateAnsweredWeight(mockTagSchema, []);

      expect(totalWeight).toBe(0);
    });

    it('should use default weight (1) for fields without metadata', () => {
      const answeredIds = ['q1', 'nonexistent1', 'nonexistent2'];
      const totalWeight = calculateAnsweredWeight(mockTagSchema, answeredIds);

      // q1=2, nonexistent1=1, nonexistent2=1 → total=4
      expect(totalWeight).toBe(4);
    });
  });

  describe('getAvailableTags', () => {
    it('should return all tag names from schema', () => {
      const tags = getAvailableTags(mockTagSchema);

      expect(tags).toHaveLength(4);
      expect(tags).toContain('foundation');
      expect(tags).toContain('architecture');
      expect(tags).toContain('security');
      expect(tags).toContain('operations');
    });

    it('should return empty array for schema with no tags', () => {
      const emptySchema: TagSchema = {
        version: '1.1',
        tags: {},
        field_metadata: {}
      };

      const tags = getAvailableTags(emptySchema);

      expect(tags).toEqual([]);
    });
  });

  describe('getTagInfo', () => {
    it('should return tag information for existing tag', () => {
      const info = getTagInfo(mockTagSchema, 'foundation');

      expect(info).toBeDefined();
      expect(info?.label).toBe('Foundation');
      expect(info?.description).toBe('Core project information');
    });

    it('should return undefined for non-existent tag', () => {
      const info = getTagInfo(mockTagSchema, 'nonexistent');

      expect(info).toBeUndefined();
    });
  });

  describe('filterQuestions', () => {
    it('should filter by tags', () => {
      const filtered = filterQuestions(mockQuestionnaireSchema, mockTagSchema, {
        tags: ['foundation']
      });

      expect(filtered).toHaveLength(2);
      expect(filtered.map(q => q.id)).toContain('q1');
      expect(filtered.map(q => q.id)).toContain('q2');
    });

    it('should filter by stage', () => {
      const filtered = filterQuestions(mockQuestionnaireSchema, mockTagSchema, {
        stage: 'core'
      });

      expect(filtered).toHaveLength(2);
      expect(filtered[0].stage).toBe('core');
      expect(filtered[1].stage).toBe('core');
    });

    it('should filter by complexity level', () => {
      const filtered = filterQuestions(mockQuestionnaireSchema, mockTagSchema, {
        complexityLevel: 'base'
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('q1');
    });

    it('should filter by type', () => {
      const schemaWithTypes: QuestionnaireSchema = {
        ...mockQuestionnaireSchema,
        questions: [
          { ...mockQuestionnaireSchema.questions[0], type: 'text' },
          { ...mockQuestionnaireSchema.questions[1], type: 'select' },
          { ...mockQuestionnaireSchema.questions[2], type: 'text' }
        ]
      };

      const filtered = filterQuestions(schemaWithTypes, mockTagSchema, {
        type: 'text'
      });

      expect(filtered).toHaveLength(2);
      expect(filtered.every(q => q.type === 'text')).toBe(true);
    });

    it('should combine multiple filters', () => {
      const filtered = filterQuestions(mockQuestionnaireSchema, mockTagSchema, {
        stage: 'core',
        tags: ['foundation'],
        complexityLevel: 'minimal'
      });

      // q1 and q2 should match: both are core stage with foundation tag
      // q1 has minimal in its complexity_levels, q2 also has minimal
      expect(filtered).toHaveLength(2);
      expect(filtered.map(q => q.id)).toContain('q1');
      expect(filtered.map(q => q.id)).toContain('q2');
    });

    it('should return all questions when no filters applied', () => {
      const filtered = filterQuestions(mockQuestionnaireSchema, mockTagSchema, {});

      expect(filtered).toHaveLength(4);
    });
  });

  describe('filterQuestionsByTags', () => {
    const questionsWithSkip: Question[] = [
      {
        id: 'q1',
        stage: 'core',
        type: 'text',
        question: 'Q1',
        validation: {},
        tags: ['foundation']
      },
      {
        id: 'q2',
        stage: 'core',
        type: 'text',
        question: 'Q2',
        validation: {},
        tags: ['security'],
        skip_if: { eq: ['deployment.model', 'cloud'] }
      },
      {
        id: 'q3',
        stage: 'core',
        type: 'text',
        question: 'Q3',
        validation: {},
        tags: ['operations']
      }
    ];

    it('should filter by tags', () => {
      const answers: AnswerMap = {};
      const filtered = filterQuestionsByTags(questionsWithSkip, ['foundation'], answers);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('q1');
    });

    it('should always include foundation-tagged questions', () => {
      const questionsWithFoundation: Question[] = [
        {
          id: 'q_foundation',
          stage: 'core',
          type: 'text',
          question: 'Foundation',
          validation: {},
          tags: ['foundation']
        },
        {
          id: 'q_security',
          stage: 'core',
          type: 'text',
          question: 'Security',
          validation: {},
          tags: ['security']
        }
      ];

      const answers: AnswerMap = {};
      const filtered = filterQuestionsByTags(questionsWithFoundation, ['operations'], answers);

      // foundation question should be included even though 'operations' tag was selected
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('q_foundation');
    });

    it('should apply skip_if evaluation after tag filtering', () => {
      const answers: AnswerMap = { 'deployment.model': 'cloud' };
      const filtered = filterQuestionsByTags(questionsWithSkip, ['security'], answers);

      // q2 matches tag but should be skipped due to skip_if
      // q1 has foundation tag so it's always included even though we filtered for 'security'
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('q1');
    });

    it('should include all questions when selectedTags is undefined', () => {
      const answers: AnswerMap = {};
      const filtered = filterQuestionsByTags(questionsWithSkip, undefined, answers);

      expect(filtered).toHaveLength(3);
    });

    it('should include all questions when selectedTags is empty', () => {
      const answers: AnswerMap = {};
      const filtered = filterQuestionsByTags(questionsWithSkip, [], answers);

      expect(filtered).toHaveLength(3);
    });

    it('should combine tag filtering and skip_if evaluation', () => {
      const answers: AnswerMap = { 'deployment.model': 'cloud' };
      const filtered = filterQuestionsByTags(
        questionsWithSkip, 
        ['foundation', 'security', 'operations'], 
        answers
      );

      // q1 (foundation) and q3 (operations) should be included
      // q2 (security) should be skipped due to skip_if
      expect(filtered).toHaveLength(2);
      expect(filtered.map(q => q.id)).toContain('q1');
      expect(filtered.map(q => q.id)).toContain('q3');
      expect(filtered.map(q => q.id)).not.toContain('q2');
    });
  });

  describe('Integration tests', () => {
    it('should support complete tag routing workflow', () => {
      // 1. Get available tags
      const availableTags = getAvailableTags(mockTagSchema);
      expect(availableTags).toContain('foundation');

      // 2. Get questions by tag
      const foundationQuestions = getQuestionsByTag(mockQuestionnaireSchema, 'foundation');
      expect(foundationQuestions.length).toBeGreaterThan(0);

      // 3. Get metadata for field
      const metadata = getFieldMetadata(mockTagSchema, foundationQuestions[0].id);
      expect(metadata).toBeDefined();

      // 4. Get related fields
      const relatedFields = getRelatedFields(mockTagSchema, foundationQuestions[0].id);
      expect(relatedFields).toBeDefined();

      // 5. Calculate weight
      const weight = getFieldWeight(mockTagSchema, foundationQuestions[0].id);
      expect(weight).toBeGreaterThan(0);
    });

    it('should support complexity-based question routing', () => {
      // 1. Get questions for base complexity
      const baseQuestions = getQuestionsByComplexity(
        mockQuestionnaireSchema,
        mockTagSchema,
        'base'
      );
      expect(baseQuestions.length).toBeGreaterThan(0);

      // 2. Get questions for standard complexity
      const standardQuestions = getQuestionsByComplexity(
        mockQuestionnaireSchema,
        mockTagSchema,
        'standard'
      );
      
      // Standard should include more questions than base
      expect(standardQuestions.length).toBeGreaterThanOrEqual(baseQuestions.length);
    });

    it('should support advanced filtering with multiple criteria', () => {
      const filtered = filterQuestions(mockQuestionnaireSchema, mockTagSchema, {
        stage: 'deep_dive',
        tags: ['security', 'operations'],
        complexityLevel: 'standard'
      });

      // Should only include deep_dive questions with specified tags at standard level
      expect(filtered.every(q => q.stage === 'deep_dive')).toBe(true);
      expect(filtered.every(q => 
        q.tags.includes('security') || q.tags.includes('operations')
      )).toBe(true);
    });
  });
});
