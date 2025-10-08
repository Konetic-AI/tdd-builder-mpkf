/**
 * @fileoverview Unit tests for the TypeScript TDD generation handler.
 * Tests schema-based question loading and compatibility with simple/base path.
 */

import {
  loadQuestionnaire,
  getQuestionFlow,
  applyTriggers,
  filterByTags,
  getMpkfRequirements,
  validateProjectDataAgainstSchema,
  ProjectData
} from './generateTdd';

describe('generateTdd', () => {
  describe('loadQuestionnaire', () => {
    it('should load questionnaire schema successfully', () => {
      const questionnaire = loadQuestionnaire();
      
      expect(questionnaire).toBeDefined();
      expect(questionnaire.version).toBe('2.0');
      expect(questionnaire.stages).toContain('core');
      expect(questionnaire.complexity_levels).toContain('base');
      expect(questionnaire.questions).toBeInstanceOf(Array);
      expect(questionnaire.questions.length).toBeGreaterThan(0);
    });

    it('should handle custom base path', () => {
      expect(() => loadQuestionnaire('schemas')).not.toThrow();
    });
  });

  describe('getQuestionFlow', () => {
    it('should return questions for simple complexity (mapped to base)', () => {
      const questions = getQuestionFlow({ complexity: 'simple' });
      
      expect(questions).toBeInstanceOf(Array);
      expect(questions.length).toBeGreaterThan(0);
      
      // Should include basic foundation questions for base complexity
      const questionIds = questions.map(q => q.id);
      expect(questionIds).toContain('doc.version');
      expect(questionIds).toContain('project.name');
      expect(questionIds).toContain('summary.problem');
      expect(questionIds).toContain('summary.solution');
    });

    it('should filter questions by tags', () => {
      const questions = getQuestionFlow({ 
        complexity: 'simple', 
        tags: ['foundation'] 
      });
      
      expect(questions).toBeInstanceOf(Array);
      questions.forEach(question => {
        expect(question.tags).toContain('foundation');
      });
    });

    it('should handle all complexity levels', () => {
      const complexities = ['simple', 'startup', 'enterprise', 'mcp-specific', 'mcp'];
      
      complexities.forEach(complexity => {
        expect(() => getQuestionFlow({ complexity })).not.toThrow();
        const questions = getQuestionFlow({ complexity });
        expect(questions).toBeInstanceOf(Array);
      });
    });
  });

  describe('applyTriggers', () => {
    it('should expand follow-up questions based on answers', () => {
      const answers: ProjectData = {
        'deployment.model': 'cloud',
        'privacy.pii': true
      };
      
      const result = applyTriggers(answers);
      
      expect(result).toBeDefined();
      expect(result.questions).toBeInstanceOf(Array);
      expect(result.applied_triggers).toBeInstanceOf(Array);
    });

    it('should handle boolean triggers', () => {
      const answers: ProjectData = {
        'privacy.pii': true
      };
      
      const result = applyTriggers(answers);
      
      expect(result.applied_triggers.length).toBeGreaterThan(0);
    });

    it('should handle string triggers', () => {
      const answers: ProjectData = {
        'deployment.model': 'cloud'
      };
      
      const result = applyTriggers(answers);
      
      expect(result.applied_triggers.length).toBeGreaterThan(0);
    });
  });

  describe('filterByTags', () => {
    it('should filter questions by selected tags', () => {
      const questions = getQuestionFlow({ complexity: 'simple' });
      const filtered = filterByTags(questions, ['foundation']);
      
      expect(filtered).toBeInstanceOf(Array);
      filtered.forEach(question => {
        expect(question.tags).toContain('foundation');
      });
    });

    it('should return all questions when no tags specified', () => {
      const questions = getQuestionFlow({ complexity: 'simple' });
      const filtered = filterByTags(questions, []);
      
      expect(filtered).toEqual(questions);
    });
  });

  describe('getMpkfRequirements', () => {
    it('should return requirements for simple complexity', () => {
      const requirements = getMpkfRequirements('simple');
      
      expect(requirements).toBeDefined();
      expect(requirements.required_fields).toBeDefined();
      expect(typeof requirements.required_fields).toBe('object');
      
      // Should include the 4 basic required fields
      expect(requirements.required_fields['doc.version']).toBeDefined();
      expect(requirements.required_fields['project.name']).toBeDefined();
      expect(requirements.required_fields['summary.problem']).toBeDefined();
      expect(requirements.required_fields['summary.solution']).toBeDefined();
    });

    it('should return requirements for all complexity levels', () => {
      const complexities = ['simple', 'startup', 'enterprise', 'mcp-specific', 'mcp'];
      
      complexities.forEach(complexity => {
        const requirements = getMpkfRequirements(complexity);
        expect(requirements).toBeDefined();
        expect(requirements.required_fields).toBeDefined();
        expect(Object.keys(requirements.required_fields).length).toBeGreaterThan(0);
      });
    });

    it('should fallback to hardcoded requirements on error', () => {
      // This test ensures backward compatibility
      const requirements = getMpkfRequirements('simple', 'nonexistent-path');
      
      expect(requirements).toBeDefined();
      expect(requirements.required_fields).toBeDefined();
      expect(requirements.required_fields['doc.version']).toBeDefined();
      expect(requirements.required_fields['project.name']).toBeDefined();
    });
  });

  describe('validateProjectDataAgainstSchema', () => {
    it('should validate complete simple project data', () => {
      const projectData: ProjectData = {
        'doc.version': '1.0-simple',
        'project.name': 'Simple Internal Dashboard',
        'summary.problem': 'Business team lacks visibility into key daily metrics.',
        'summary.solution': 'Build a simple, non-critical internal web dashboard.'
      };
      
      const result = validateProjectDataAgainstSchema(projectData, 'simple');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.missing_fields).toHaveLength(0);
    });

    it('should identify missing required fields', () => {
      const projectData: ProjectData = {
        'doc.version': '1.0-simple',
        'project.name': 'Simple Internal Dashboard'
        // Missing summary.problem and summary.solution
      };
      
      const result = validateProjectDataAgainstSchema(projectData, 'simple');
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.missing_fields.length).toBeGreaterThan(0);
      expect(result.missing_fields).toContain('summary.problem');
      expect(result.missing_fields).toContain('summary.solution');
    });

    it('should handle empty project data', () => {
      const projectData: ProjectData = {};
      
      const result = validateProjectDataAgainstSchema(projectData, 'simple');
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.missing_fields.length).toBeGreaterThan(0);
    });
  });

  describe('Compatibility with existing system', () => {
    it('should maintain same required fields for simple complexity', () => {
      const requirements = getMpkfRequirements('simple');
      const requiredFields = requirements.required_fields;
      
      // Verify the 4 core fields that should always be present for simple
      expect(requiredFields['doc.version']).toBeDefined();
      expect(requiredFields['project.name']).toBeDefined();
      expect(requiredFields['summary.problem']).toBeDefined();
      expect(requiredFields['summary.solution']).toBeDefined();
      
      // Verify these are the expected questions
      expect(requiredFields['doc.version']).toContain('TDD version');
      expect(requiredFields['project.name']).toContain('official name');
      expect(requiredFields['summary.problem']).toContain('core problem');
      expect(requiredFields['summary.solution']).toContain('solution you envision');
    });

    it('should produce same output format as hardcoded version', () => {
      const requirements = getMpkfRequirements('simple');
      
      // Verify the structure matches what the original system expects
      expect(requirements).toHaveProperty('required_fields');
      expect(typeof requirements.required_fields).toBe('object');
      
      // Verify all values are strings (questions)
      Object.values(requirements.required_fields).forEach(question => {
        expect(typeof question).toBe('string');
        expect(question.length).toBeGreaterThan(0);
      });
    });
  });
});
