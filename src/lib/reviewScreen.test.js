/**
 * @fileoverview Unit tests for Review Screen Component
 */

const reviewScreen = require('./reviewScreen');

describe('Review Screen Component', () => {
  // Mock schema
  const mockSchema = {
    questions: [
      { id: 'project.name', question: 'What is the official name for this project?', type: 'text' },
      { id: 'doc.version', question: 'What is the TDD version?', type: 'text' },
      { id: 'summary.problem', question: 'What is the core problem?', type: 'text' },
      { id: 'summary.solution', question: 'What is the solution?', type: 'text' },
      { id: 'context.business_goals', question: 'What are the business goals?', type: 'text' },
      { id: 'architecture.style', question: 'What is your architectural approach?', type: 'text' }
    ]
  };

  // Mock answers
  const mockAnswers = {
    'project.name': 'Test Project',
    'doc.version': '1.0.0',
    'summary.problem': 'Test problem',
    'summary.solution': 'Test solution',
    'context.business_goals': 'Test goals',
    'architecture.style': 'Microservices'
  };

  describe('getSectionInfo', () => {
    it('should map doc fields to Stage 1', () => {
      const info = reviewScreen.getSectionInfo('doc.version');
      expect(info.stage).toBe(1);
      expect(info.title).toBe('Stage 1: Project Foundation');
    });

    it('should map summary fields to Stage 1', () => {
      const info = reviewScreen.getSectionInfo('summary.problem');
      expect(info.stage).toBe(1);
      expect(info.title).toBe('Stage 1: Project Foundation');
    });

    it('should map context fields to Stage 2', () => {
      const info = reviewScreen.getSectionInfo('context.business_goals');
      expect(info.stage).toBe(2);
      expect(info.title).toBe('Stage 2: Requirements & Context Analysis');
    });

    it('should map architecture fields to Stage 3', () => {
      const info = reviewScreen.getSectionInfo('architecture.style');
      expect(info.stage).toBe(3);
      expect(info.title).toBe('Stage 3: Architecture Design');
    });

    it('should map unknown fields to Other', () => {
      const info = reviewScreen.getSectionInfo('unknown.field');
      expect(info.stage).toBe(0);
      expect(info.title).toBe('Other');
    });
  });

  describe('groupAnswersBySection', () => {
    it('should group answers by TDD sections', () => {
      const grouped = reviewScreen.groupAnswersBySection(mockAnswers, mockSchema);
      
      expect(Array.isArray(grouped)).toBe(true);
      expect(grouped.length).toBeGreaterThan(0);
      
      // Check that sections are sorted by stage
      for (let i = 0; i < grouped.length - 1; i++) {
        expect(grouped[i].stage).toBeLessThanOrEqual(grouped[i + 1].stage);
      }
    });

    it('should include question text in grouped answers', () => {
      const grouped = reviewScreen.groupAnswersBySection(mockAnswers, mockSchema);
      const firstSection = grouped.find(s => s.answers.length > 0);
      
      expect(firstSection.answers[0]).toHaveProperty('fieldId');
      expect(firstSection.answers[0]).toHaveProperty('question');
      expect(firstSection.answers[0]).toHaveProperty('answer');
    });
  });

  describe('generateTddPreview', () => {
    it('should generate preview for base complexity', () => {
      const preview = reviewScreen.generateTddPreview(mockAnswers, 'base');
      
      expect(Array.isArray(preview)).toBe(true);
      expect(preview.length).toBe(2); // base includes only stages 1 and 2
      expect(preview[0].stage).toBe(1);
      expect(preview[1].stage).toBe(2);
    });

    it('should generate preview for minimal complexity', () => {
      const preview = reviewScreen.generateTddPreview(mockAnswers, 'minimal');
      
      expect(preview.length).toBe(3); // minimal includes stages 1, 2, 3
    });

    it('should generate preview for standard complexity', () => {
      const preview = reviewScreen.generateTddPreview(mockAnswers, 'standard');
      
      expect(preview.length).toBe(5); // standard includes stages 1-5
    });

    it('should generate preview for enterprise complexity', () => {
      const preview = reviewScreen.generateTddPreview(mockAnswers, 'enterprise');
      
      expect(preview.length).toBe(9); // enterprise includes all stages
    });

    it('should calculate completeness percentage', () => {
      const preview = reviewScreen.generateTddPreview(mockAnswers, 'standard');
      
      preview.forEach(stage => {
        expect(stage).toHaveProperty('completeness');
        expect(stage.completeness).toBeGreaterThanOrEqual(0);
        expect(stage.completeness).toBeLessThanOrEqual(100);
      });
    });

    it('should assign correct status based on completeness', () => {
      const preview = reviewScreen.generateTddPreview(mockAnswers, 'enterprise');
      
      preview.forEach(stage => {
        if (stage.completeness === 100) {
          expect(stage.status).toBe('complete');
        } else if (stage.completeness >= 50) {
          expect(stage.status).toBe('partial');
        } else {
          expect(stage.status).toBe('minimal');
        }
      });
    });
  });

  describe('getColors', () => {
    it('should return color object with ANSI codes', () => {
      const colors = reviewScreen.getColors();
      
      expect(colors).toHaveProperty('reset');
      expect(colors).toHaveProperty('green');
      expect(colors).toHaveProperty('red');
      expect(colors).toHaveProperty('yellow');
      expect(colors).toHaveProperty('blue');
      expect(colors).toHaveProperty('cyan');
      expect(colors).toHaveProperty('magenta');
      expect(colors).toHaveProperty('bold');
      expect(colors).toHaveProperty('dim');
    });
  });
});

