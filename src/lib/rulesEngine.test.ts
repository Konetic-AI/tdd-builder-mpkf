import {
  evaluateSkip,
  expandTriggers,
  filterQuestions,
  getNextQuestions,
  shouldSkipQuestion,
  getTriggeredQuestions,
  QuestionRegistry,
  AnswerMap,
  Expression
} from './rulesEngine';
import { Question } from './schemaLoader';

describe('rulesEngine', () => {
  describe('evaluateSkip', () => {
    describe('JSON expressions', () => {
      describe('eq operator', () => {
        it('should evaluate equality expressions', () => {
          const question: Question = {
            id: 'test.q',
            stage: 'core',
            type: 'text',
            question: 'Test?',
            validation: {},
            tags: ['foundation'],
            skip_if: { eq: ['deployment.model', 'cloud'] }
          };

          const answersMatch: AnswerMap = { 'deployment.model': 'cloud' };
          const answersNoMatch: AnswerMap = { 'deployment.model': 'on-premise' };

          expect(evaluateSkip(question, answersMatch)).toBe(true);
          expect(evaluateSkip(question, answersNoMatch)).toBe(false);
        });

        it('should handle different value types', () => {
          const questionBoolean: Question = {
            id: 'test.q',
            stage: 'core',
            type: 'text',
            question: 'Test?',
            validation: {},
            tags: ['foundation'],
            skip_if: { eq: ['privacy.pii', true] }
          };

          expect(evaluateSkip(questionBoolean, { 'privacy.pii': true })).toBe(true);
          expect(evaluateSkip(questionBoolean, { 'privacy.pii': false })).toBe(false);
        });
      });

      describe('neq operator', () => {
        it('should evaluate not-equal expressions', () => {
          const question: Question = {
            id: 'test.q',
            stage: 'core',
            type: 'text',
            question: 'Test?',
            validation: {},
            tags: ['foundation'],
            skip_if: { neq: ['project.type', 'web'] }
          };

          expect(evaluateSkip(question, { 'project.type': 'mobile' })).toBe(true);
          expect(evaluateSkip(question, { 'project.type': 'web' })).toBe(false);
        });
      });

      describe('has operator', () => {
        it('should check if array contains value', () => {
          const question: Question = {
            id: 'test.q',
            stage: 'core',
            type: 'text',
            question: 'Test?',
            validation: {},
            tags: ['foundation'],
            skip_if: { has: ['privacy.regulations', 'gdpr'] }
          };

          const answersWithGdpr: AnswerMap = { 
            'privacy.regulations': ['gdpr', 'ccpa'] 
          };
          const answersWithoutGdpr: AnswerMap = { 
            'privacy.regulations': ['ccpa', 'hipaa'] 
          };

          expect(evaluateSkip(question, answersWithGdpr)).toBe(true);
          expect(evaluateSkip(question, answersWithoutGdpr)).toBe(false);
        });

        it('should return false for non-array values', () => {
          const question: Question = {
            id: 'test.q',
            stage: 'core',
            type: 'text',
            question: 'Test?',
            validation: {},
            tags: ['foundation'],
            skip_if: { has: ['field', 'value'] }
          };

          expect(evaluateSkip(question, { field: 'string' })).toBe(false);
        });
      });

      describe('not operator', () => {
        it('should negate expression result', () => {
          const question: Question = {
            id: 'test.q',
            stage: 'core',
            type: 'text',
            question: 'Test?',
            validation: {},
            tags: ['foundation'],
            skip_if: { not: { eq: ['deployment.model', 'cloud'] } }
          };

          expect(evaluateSkip(question, { 'deployment.model': 'cloud' })).toBe(false);
          expect(evaluateSkip(question, { 'deployment.model': 'on-premise' })).toBe(true);
        });
      });

      describe('and operator', () => {
        it('should require all conditions to be true', () => {
          const question: Question = {
            id: 'test.q',
            stage: 'core',
            type: 'text',
            question: 'Test?',
            validation: {},
            tags: ['foundation'],
            skip_if: {
              and: [
                { eq: ['deployment.model', 'cloud'] },
                { eq: ['privacy.pii', true] }
              ]
            }
          };

          expect(evaluateSkip(question, { 
            'deployment.model': 'cloud',
            'privacy.pii': true 
          })).toBe(true);

          expect(evaluateSkip(question, { 
            'deployment.model': 'cloud',
            'privacy.pii': false 
          })).toBe(false);

          expect(evaluateSkip(question, { 
            'deployment.model': 'on-premise',
            'privacy.pii': true 
          })).toBe(false);
        });
      });

      describe('or operator', () => {
        it('should require at least one condition to be true', () => {
          const question: Question = {
            id: 'test.q',
            stage: 'core',
            type: 'text',
            question: 'Test?',
            validation: {},
            tags: ['foundation'],
            skip_if: {
              or: [
                { eq: ['deployment.model', 'cloud'] },
                { eq: ['deployment.model', 'hybrid'] }
              ]
            }
          };

          expect(evaluateSkip(question, { 'deployment.model': 'cloud' })).toBe(true);
          expect(evaluateSkip(question, { 'deployment.model': 'hybrid' })).toBe(true);
          expect(evaluateSkip(question, { 'deployment.model': 'on-premise' })).toBe(false);
        });
      });

      describe('complex expressions', () => {
        it('should handle nested logical operators', () => {
          const question: Question = {
            id: 'test.q',
            stage: 'core',
            type: 'text',
            question: 'Test?',
            validation: {},
            tags: ['foundation'],
            skip_if: {
              and: [
                { eq: ['deployment.model', 'cloud'] },
                {
                  or: [
                    { eq: ['cloud.provider', 'aws'] },
                    { eq: ['cloud.provider', 'azure'] }
                  ]
                }
              ]
            }
          };

          expect(evaluateSkip(question, {
            'deployment.model': 'cloud',
            'cloud.provider': 'aws'
          })).toBe(true);

          expect(evaluateSkip(question, {
            'deployment.model': 'cloud',
            'cloud.provider': 'gcp'
          })).toBe(false);

          expect(evaluateSkip(question, {
            'deployment.model': 'on-premise',
            'cloud.provider': 'aws'
          })).toBe(false);
        });
      });
    });

    describe('Legacy string expressions', () => {
      it('should handle equality check (==)', () => {
        const question: Question = {
          id: 'test.q',
          stage: 'core',
          type: 'text',
          question: 'Test?',
          validation: {},
          tags: ['foundation'],
          skip_if: 'deployment.model == "cloud"'
        };

        expect(evaluateSkip(question, { 'deployment.model': 'cloud' })).toBe(true);
        expect(evaluateSkip(question, { 'deployment.model': 'on-premise' })).toBe(false);
      });

      it('should handle inequality check (!=)', () => {
        const question: Question = {
          id: 'test.q',
          stage: 'core',
          type: 'text',
          question: 'Test?',
          validation: {},
          tags: ['foundation'],
          skip_if: 'project.type != "web"'
        };

        expect(evaluateSkip(question, { 'project.type': 'mobile' })).toBe(true);
        expect(evaluateSkip(question, { 'project.type': 'web' })).toBe(false);
      });

      it('should handle AND conditions (&&)', () => {
        const question: Question = {
          id: 'test.q',
          stage: 'core',
          type: 'text',
          question: 'Test?',
          validation: {},
          tags: ['foundation'],
          skip_if: 'deployment.model == "cloud" && privacy.pii == true'
        };

        expect(evaluateSkip(question, {
          'deployment.model': 'cloud',
          'privacy.pii': true
        })).toBe(true);

        expect(evaluateSkip(question, {
          'deployment.model': 'cloud',
          'privacy.pii': false
        })).toBe(false);
      });

      it('should handle OR conditions (||)', () => {
        const question: Question = {
          id: 'test.q',
          stage: 'core',
          type: 'text',
          question: 'Test?',
          validation: {},
          tags: ['foundation'],
          skip_if: 'deployment.model == "cloud" || deployment.model == "hybrid"'
        };

        expect(evaluateSkip(question, { 'deployment.model': 'cloud' })).toBe(true);
        expect(evaluateSkip(question, { 'deployment.model': 'hybrid' })).toBe(true);
        expect(evaluateSkip(question, { 'deployment.model': 'on-premise' })).toBe(false);
      });

      it('should handle simple field existence check', () => {
        const question: Question = {
          id: 'test.q',
          stage: 'core',
          type: 'text',
          question: 'Test?',
          validation: {},
          tags: ['foundation'],
          skip_if: 'deployment.model'
        };

        expect(evaluateSkip(question, { 'deployment.model': 'cloud' })).toBe(true);
        expect(evaluateSkip(question, { 'deployment.model': '' })).toBe(false);
        expect(evaluateSkip(question, {})).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should not skip when skip_if is null', () => {
        const question: Question = {
          id: 'test.q',
          stage: 'core',
          type: 'text',
          question: 'Test?',
          validation: {},
          tags: ['foundation'],
          skip_if: null
        };

        expect(evaluateSkip(question, {})).toBe(false);
      });

      it('should not skip when skip_if is undefined', () => {
        const question: Question = {
          id: 'test.q',
          stage: 'core',
          type: 'text',
          question: 'Test?',
          validation: {},
          tags: ['foundation']
        };

        expect(evaluateSkip(question, {})).toBe(false);
      });

      it('should handle evaluation errors gracefully', () => {
        const question: Question = {
          id: 'test.q',
          stage: 'core',
          type: 'text',
          question: 'Test?',
          validation: {},
          tags: ['foundation'],
          skip_if: {} as Expression // Invalid expression
        };

        // Should not throw, should return false (show question)
        expect(evaluateSkip(question, {})).toBe(false);
      });
    });
  });

  describe('expandTriggers', () => {
    const registry: QuestionRegistry = new Map();

    const triggerQuestion: Question = {
      id: 'q1',
      stage: 'core',
      type: 'select',
      question: 'Type?',
      validation: {},
      tags: ['foundation'],
      triggers: {
        'web': ['q2', 'q3'],
        'mobile': ['q4']
      }
    };

    const triggeredQ2: Question = {
      id: 'q2',
      stage: 'deep_dive',
      type: 'text',
      question: 'Web Q2',
      validation: {},
      tags: ['architecture']
    };

    const triggeredQ3: Question = {
      id: 'q3',
      stage: 'deep_dive',
      type: 'text',
      question: 'Web Q3',
      validation: {},
      tags: ['architecture']
    };

    const triggeredQ4: Question = {
      id: 'q4',
      stage: 'deep_dive',
      type: 'text',
      question: 'Mobile Q4',
      validation: {},
      tags: ['architecture']
    };

    beforeEach(() => {
      registry.clear();
      registry.set('q1', triggerQuestion);
      registry.set('q2', triggeredQ2);
      registry.set('q3', triggeredQ3);
      registry.set('q4', triggeredQ4);
    });

    it('should expand triggers for matching answer', () => {
      const triggered = expandTriggers(triggerQuestion, 'web', registry);

      expect(triggered).toHaveLength(2);
      expect(triggered[0].id).toBe('q2');
      expect(triggered[1].id).toBe('q3');
    });

    it('should expand different triggers based on answer', () => {
      const triggered = expandTriggers(triggerQuestion, 'mobile', registry);

      expect(triggered).toHaveLength(1);
      expect(triggered[0].id).toBe('q4');
    });

    it('should return empty array when no triggers match', () => {
      const triggered = expandTriggers(triggerQuestion, 'desktop', registry);

      expect(triggered).toEqual([]);
    });

    it('should return empty array when question has no triggers', () => {
      const noTriggerQ: Question = {
        id: 'q5',
        stage: 'core',
        type: 'text',
        question: 'No triggers',
        validation: {},
        tags: ['foundation']
      };

      const triggered = expandTriggers(noTriggerQ, 'any', registry);

      expect(triggered).toEqual([]);
    });

    it('should handle missing questions in registry gracefully', () => {
      const questionWithMissingTriggers: Question = {
        id: 'q6',
        stage: 'core',
        type: 'select',
        question: 'Type?',
        validation: {},
        tags: ['foundation'],
        triggers: {
          'option': ['missing1', 'q2', 'missing2']
        }
      };

      const triggered = expandTriggers(questionWithMissingTriggers, 'option', registry);

      // Should only return q2, skip missing1 and missing2
      expect(triggered).toHaveLength(1);
      expect(triggered[0].id).toBe('q2');
    });

    it('should convert answer to string for trigger key matching', () => {
      const triggered = expandTriggers(triggerQuestion, 'web', registry);

      expect(triggered).toHaveLength(2);
    });
  });

  describe('filterQuestions', () => {
    const questions: Question[] = [
      {
        id: 'q1',
        stage: 'core',
        type: 'text',
        question: 'Q1',
        validation: {},
        tags: ['foundation'],
        skip_if: null
      },
      {
        id: 'q2',
        stage: 'core',
        type: 'text',
        question: 'Q2',
        validation: {},
        tags: ['foundation'],
        skip_if: { eq: ['deployment.model', 'cloud'] }
      },
      {
        id: 'q3',
        stage: 'core',
        type: 'text',
        question: 'Q3',
        validation: {},
        tags: ['foundation'],
        skip_if: { eq: ['privacy.pii', true] }
      }
    ];

    it('should include questions without skip_if', () => {
      const filtered = filterQuestions(questions, {});

      expect(filtered).toContainEqual(questions[0]);
    });

    it('should exclude questions where skip_if evaluates to true', () => {
      const answers: AnswerMap = { 'deployment.model': 'cloud' };
      const filtered = filterQuestions(questions, answers);

      expect(filtered).toHaveLength(2);
      expect(filtered).toContainEqual(questions[0]);
      expect(filtered).toContainEqual(questions[2]);
      expect(filtered).not.toContainEqual(questions[1]);
    });

    it('should include questions where skip_if evaluates to false', () => {
      const answers: AnswerMap = { 
        'deployment.model': 'on-premise',
        'privacy.pii': false
      };
      const filtered = filterQuestions(questions, answers);

      expect(filtered).toHaveLength(3);
    });

    it('should handle multiple skip conditions', () => {
      const answers: AnswerMap = {
        'deployment.model': 'cloud',
        'privacy.pii': true
      };
      const filtered = filterQuestions(questions, answers);

      // Only q1 should remain (no skip_if)
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('q1');
    });
  });

  describe('getNextQuestions', () => {
    const questions: Question[] = [
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
        tags: ['foundation'],
        skip_if: { eq: ['deployment.model', 'cloud'] }
      },
      {
        id: 'q3',
        stage: 'deep_dive',
        type: 'text',
        question: 'Q3',
        validation: {},
        tags: ['architecture']
      }
    ];

    it('should return unanswered questions for current stage', () => {
      const answers: AnswerMap = {};
      const next = getNextQuestions(questions, answers, 'core');

      expect(next).toHaveLength(2);
      expect(next[0].id).toBe('q1');
      expect(next[1].id).toBe('q2');
    });

    it('should exclude already answered questions', () => {
      const answers: AnswerMap = { q1: 'answered' };
      const next = getNextQuestions(questions, answers, 'core');

      expect(next).toHaveLength(1);
      expect(next[0].id).toBe('q2');
    });

    it('should apply skip_if filtering', () => {
      const answers: AnswerMap = { 'deployment.model': 'cloud' };
      const next = getNextQuestions(questions, answers, 'core');

      // q2 should be skipped due to skip_if condition
      expect(next).toHaveLength(1);
      expect(next[0].id).toBe('q1');
    });

    it('should only return questions for current stage', () => {
      const answers: AnswerMap = {};
      const next = getNextQuestions(questions, answers, 'deep_dive');

      expect(next).toHaveLength(1);
      expect(next[0].id).toBe('q3');
    });

    it('should return empty array when all questions answered', () => {
      const answers: AnswerMap = { q1: 'a1', q2: 'a2' };
      const next = getNextQuestions(questions, answers, 'core');

      expect(next).toEqual([]);
    });
  });

  describe('Backwards compatibility', () => {
    describe('shouldSkipQuestion', () => {
      it('should evaluate string conditions', () => {
        const answers: AnswerMap = { 'deployment.model': 'cloud' };

        expect(shouldSkipQuestion('deployment.model == "cloud"', answers)).toBe(true);
        expect(shouldSkipQuestion('deployment.model != "cloud"', answers)).toBe(false);
      });

      it('should return false for null/undefined conditions', () => {
        expect(shouldSkipQuestion(null, {})).toBe(false);
        expect(shouldSkipQuestion(undefined, {})).toBe(false);
      });

      it('should handle errors gracefully', () => {
        expect(shouldSkipQuestion('invalid condition', {})).toBe(false);
      });
    });

    describe('getTriggeredQuestions', () => {
      const question: Question = {
        id: 'q1',
        stage: 'core',
        type: 'select',
        question: 'Type?',
        validation: {},
        tags: ['foundation'],
        triggers: {
          'web': ['q2', 'q3'],
          'mobile': ['q4']
        }
      };

      it('should return triggered question IDs for matching answer', () => {
        const triggered = getTriggeredQuestions(question, 'web');

        expect(triggered).toEqual(['q2', 'q3']);
      });

      it('should return empty array for no match', () => {
        const triggered = getTriggeredQuestions(question, 'desktop');

        expect(triggered).toEqual([]);
      });

      it('should return empty array when no triggers', () => {
        const noTriggerQ: Question = {
          id: 'q5',
          stage: 'core',
          type: 'text',
          question: 'No triggers',
          validation: {},
          tags: ['foundation']
        };

        const triggered = getTriggeredQuestions(noTriggerQ, 'any');

        expect(triggered).toEqual([]);
      });
    });
  });
});
