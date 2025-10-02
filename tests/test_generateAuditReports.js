/**
 * @fileoverview Jest tests for the generateAuditReports function
 * Tests cover happy path, empty inputs, malformed inputs, and large datasets
 * with mocked file I/O for deterministic testing
 */

const fs = require('fs');
const path = require('path');

// Mock fs module before importing the handler
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn()
  },
  existsSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn()
}));

// Import the handler after mocking
const { validate_and_generate_tdd } = require('../handlers/generate_tdd');

describe('generateAuditReports', () => {
  let mockProjectData;
  let mockMasterReqs;
  let mockTddOutput;
  let mockComplexity;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default test data
    mockProjectData = {
      'doc.version': '1.0',
      'project.name': 'Test Project',
      'summary.problem': 'Test problem statement',
      'summary.solution': 'Test solution description',
      'doc.created_date': '2024-01-15',
      'doc.authors': 'Test Author'
    };

    mockMasterReqs = {
      required_fields: {
        'doc.version': 'What is the TDD version?',
        'project.name': 'What is the official name for this project?',
        'summary.problem': 'In one or two sentences, what is the core problem this project solves?',
        'summary.solution': 'Describe the solution you envision at a high level.',
        'doc.created_date': 'What is the creation date for this TDD?',
        'doc.authors': 'Who are the authors of this TDD?'
      }
    };

    mockTddOutput = `# Technical Design Document: Test Project

## Stage 1: Project Foundation
### 1.1 Document Information
| Field | Value |
|---|---|
| **TDD Version** | 1.0 |
| **Date Created** | 2024-01-15 |
| **Authors** | Test Author |

### 1.2 Executive Summary
- **Problem Statement:** Test problem statement
- **Proposed Solution:** Test solution description`;

    mockComplexity = 'startup';

    // Mock template loading
    fs.promises.readFile.mockResolvedValue('Mock template content');
  });

  describe('Happy Path Tests', () => {
    test('should generate complete audit reports for fully populated data', async () => {
      const result = await validate_and_generate_tdd({
        project_data: mockProjectData,
        complexity: mockComplexity
      });

      expect(result.status).toBe('complete');
      expect(result.tdd).toContain('Gap Analysis Report');
      expect(result.tdd).toContain('MPKF Compliance Report');
      expect(result.tdd).toContain('Completeness Report');
      expect(result.metadata).toBeDefined();
      expect(result.metadata.complexity).toBe('startup');
    });

    test('should generate gap table with all fields marked as complete', async () => {
      const result = await validate_and_generate_tdd({
        project_data: mockProjectData,
        complexity: mockComplexity
      });

      const gapTable = extractSection(result.tdd, 'Gap Analysis Report');
      expect(gapTable).toContain('🟢 Complete');
      expect(gapTable).toContain('All Sections');
      expect(gapTable).toContain('🟢 **Complete**');
      expect(gapTable).not.toContain('🔴 Missing');
    });

    test('should generate compliance report with all checks passed', async () => {
      const result = await validate_and_generate_tdd({
        project_data: mockProjectData,
        complexity: mockComplexity
      });

      const complianceReport = extractSection(result.tdd, 'MPKF Compliance Report');
      expect(complianceReport).toContain('✅ Passed');
      expect(complianceReport).toContain('Pre-TDD Gating');
      expect(complianceReport).toContain('Template Population');
      expect(complianceReport).toContain('Complexity Adherence');
      expect(complianceReport).toContain('Self-Audit Executed');
    });

    test('should generate completeness report with no orphan variables', async () => {
      const result = await validate_and_generate_tdd({
        project_data: mockProjectData,
        complexity: mockComplexity
      });

      const completenessReport = extractSection(result.tdd, 'Completeness Report');
      expect(completenessReport).toContain('Orphan Variables');
      expect(completenessReport).toContain('✅ Passed');
      expect(completenessReport).toContain('No orphan variable tags remain');
    });

    test('should handle MCP-specific complexity correctly', async () => {
      const mcpProjectData = {
        ...mockProjectData,
        'security.mcp_protocol_compliance': 'Full MCP compliance',
        'security.mcp_sandboxing_model': 'Container-based sandboxing',
        'security.mcp_permission_model': 'JWT-based permissions'
      };

      const result = await validate_and_generate_tdd({
        project_data: mcpProjectData,
        complexity: 'mcp-specific'
      });

      expect(result.status).toBe('complete');
      const complianceReport = extractSection(result.tdd, 'MPKF Compliance Report');
      expect(complianceReport).toContain('MCP Section Handling');
      expect(complianceReport).toContain('✅ Passed');
  });

  describe('Empty Input Tests', () => {
    test('should handle empty project_data object', async () => {
      const result = await validate_and_generate_tdd({
        project_data: {},
        complexity: mockComplexity
      });

      expect(result.status).toBe('incomplete');
      expect(result.missing_fields).toBeDefined();
      expect(result.adhoc_questions).toBeDefined();
      expect(result.rationale).toContain('missing');
    });

    test('should handle null project_data', async () => {
      const result = await validate_and_generate_tdd({
        project_data: null,
        complexity: mockComplexity
      });

      expect(result.status).toBe('error');
      expect(result.validation_errors).toContain('project_data must be a valid object');
    });

    test('should handle undefined project_data', async () => {
      const result = await validate_and_generate_tdd({
        project_data: undefined,
        complexity: mockComplexity
      });

      expect(result.status).toBe('error');
      expect(result.validation_errors).toContain('project_data must be a valid object');
    });

    test('should handle empty complexity string', async () => {
      const result = await validate_and_generate_tdd({
        project_data: mockProjectData,
        complexity: ''
      });

      expect(result.status).toBe('error');
      expect(result.validation_errors).toContain('complexity must be a valid string');
    });

    test('should handle null complexity', async () => {
      const result = await validate_and_generate_tdd({
        project_data: mockProjectData,
        complexity: null
      });

      expect(result.status).toBe('error');
      expect(result.validation_errors).toContain('complexity must be a valid string');
    });
  });

  describe('Malformed Input Tests', () => {
    test('should handle invalid complexity level', async () => {
      const result = await validate_and_generate_tdd({
        project_data: mockProjectData,
        complexity: 'invalid-complexity'
      });

      expect(result.status).toBe('error');
      expect(result.validation_errors).toContain('complexity must be one of:');
    });

    test('should handle invalid ISO date format', async () => {
      const malformedData = {
        ...mockProjectData,
        'doc.created_date': 'invalid-date-format'
      };

      const result = await validate_and_generate_tdd({
        project_data: malformedData,
        complexity: mockComplexity
      });

      expect(result.status).toBe('error');
      expect(result.validation_errors).toContain('doc.created_date must be a valid ISO 8601 date');
    });

    test('should handle empty project name', async () => {
      const malformedData = {
        ...mockProjectData,
        'project.name': ''
      };

      const result = await validate_and_generate_tdd({
        project_data: malformedData,
        complexity: mockComplexity
      });

      expect(result.status).toBe('error');
      expect(result.validation_errors).toContain('project.name must be a non-empty string');
    });

    test('should handle whitespace-only project name', async () => {
      const malformedData = {
        ...mockProjectData,
        'project.name': '   '
      };

      const result = await validate_and_generate_tdd({
        project_data: malformedData,
        complexity: mockComplexity
      });

      expect(result.status).toBe('error');
      expect(result.validation_errors).toContain('project.name must be a non-empty string');
    });

    test('should handle non-string project name', async () => {
      const malformedData = {
        ...mockProjectData,
        'project.name': 123
      };

      const result = await validate_and_generate_tdd({
        project_data: malformedData,
        complexity: mockComplexity
      });

      expect(result.status).toBe('error');
      expect(result.validation_errors).toContain('project.name must be a non-empty string');
    });

    test('should handle empty version string', async () => {
      const malformedData = {
        ...mockProjectData,
        'doc.version': ''
      };

      const result = await validate_and_generate_tdd({
        project_data: malformedData,
        complexity: mockComplexity
      });

      expect(result.status).toBe('error');
      expect(result.validation_errors).toContain('doc.version must be a non-empty string');
    });

    test('should handle non-string version', async () => {
      const malformedData = {
        ...mockProjectData,
        'doc.version': 1.0
      };

      const result = await validate_and_generate_tdd({
        project_data: malformedData,
        complexity: mockComplexity
      });

      expect(result.status).toBe('error');
      expect(result.validation_errors).toContain('doc.version must be a non-empty string');
    });
  });

  describe('Large Dataset Tests', () => {
    test('should handle enterprise complexity with all 45+ fields', async () => {
      const largeProjectData = generateLargeProjectData();
      
      const result = await validate_and_generate_tdd({
        project_data: largeProjectData,
        complexity: 'enterprise'
      });

      expect(result.status).toBe('complete');
      expect(result.metadata.total_fields).toBeGreaterThan(45);
      expect(result.metadata.populated_fields).toBeGreaterThan(45);
      
      const gapTable = extractSection(result.tdd, 'Gap Analysis Report');
      expect(gapTable).toContain('🟢 **Complete**');
    });

    test('should handle MCP-specific complexity with 48+ fields', async () => {
      const largeProjectData = generateLargeProjectData();
      largeProjectData['security.mcp_protocol_compliance'] = 'Full MCP compliance';
      largeProjectData['security.mcp_sandboxing_model'] = 'Container-based sandboxing';
      largeProjectData['security.mcp_permission_model'] = 'JWT-based permissions';
      
      const result = await validate_and_generate_tdd({
        project_data: largeProjectData,
        complexity: 'mcp-specific'
      });

      expect(result.status).toBe('complete');
      expect(result.metadata.total_fields).toBeGreaterThan(48);
      expect(result.metadata.populated_fields).toBeGreaterThan(48);
    });

    test('should handle very long field values without performance issues', async () => {
      const longData = {
        ...mockProjectData,
        'summary.problem': 'A'.repeat(10000),
        'summary.solution': 'B'.repeat(10000),
        'context.business_goals': 'C'.repeat(10000)
      };

      const startTime = Date.now();
      const result = await validate_and_generate_tdd({
        project_data: longData,
        complexity: mockComplexity
      });
      const endTime = Date.now();

      expect(result.status).toBe('complete');
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle large number of missing fields efficiently', async () => {
      const minimalData = {
        'doc.version': '1.0',
        'project.name': 'Minimal Project'
      };

      const startTime = Date.now();
      const result = await validate_and_generate_tdd({
        project_data: minimalData,
        complexity: 'enterprise'
      });
      const endTime = Date.now();

      expect(result.status).toBe('incomplete');
      expect(result.missing_fields.length).toBeGreaterThan(40);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle template loading failure gracefully', async () => {
      fs.promises.readFile.mockRejectedValue(new Error('Template not found'));

      const result = await validate_and_generate_tdd({
        project_data: mockProjectData,
        complexity: mockComplexity
      });

      // Should fall back to embedded template
      expect(result.status).toBe('complete');
    });

    test('should handle special characters in field values', async () => {
      const specialCharData = {
        ...mockProjectData,
        'project.name': 'Project with "quotes" & <tags>',
        'summary.problem': 'Problem with \n newlines and \t tabs',
        'summary.solution': 'Solution with {{template}} syntax'
      };

      const result = await validate_and_generate_tdd({
        project_data: specialCharData,
        complexity: mockComplexity
      });

      expect(result.status).toBe('complete');
      expect(result.tdd).toContain('Project with "quotes" & <tags>');
    });

    test('should handle numeric field values correctly', async () => {
      const numericData = {
        ...mockProjectData,
        'nfr.performance': '1000 requests per second',
        'nfr.scalability': '10,000 concurrent users'
      };

      const result = await validate_and_generate_tdd({
        project_data: numericData,
        complexity: mockComplexity
      });

      expect(result.status).toBe('complete');
    });

    test('should handle boolean field values correctly', async () => {
      const booleanData = {
        ...mockProjectData,
        'security.encryption_enabled': true,
        'ops.auto_scaling': false
      };

      const result = await validate_and_generate_tdd({
        project_data: booleanData,
        complexity: mockComplexity
      });

      expect(result.status).toBe('complete');
    });

    test('should handle array field values correctly', async () => {
      const arrayData = {
        ...mockProjectData,
        'doc.authors': ['Author 1', 'Author 2', 'Author 3'],
        'context.personas': ['User A', 'User B']
      };

      const result = await validate_and_generate_tdd({
        project_data: arrayData,
        complexity: mockComplexity
      });

      expect(result.status).toBe('complete');
    });
  });

  describe('Deterministic Output Tests', () => {
    test('should produce identical output for identical inputs', async () => {
      const result1 = await validate_and_generate_tdd({
        project_data: mockProjectData,
        complexity: mockComplexity
      });

      const result2 = await validate_and_generate_tdd({
        project_data: mockProjectData,
        complexity: mockComplexity
      });

      expect(result1.tdd).toBe(result2.tdd);
      expect(result1.metadata.generation_timestamp).not.toBe(result2.metadata.generation_timestamp);
    });

    test('should produce consistent gap table structure', async () => {
      const result = await validate_and_generate_tdd({
        project_data: mockProjectData,
        complexity: mockComplexity
      });

      const gapTable = extractSection(result.tdd, 'Gap Analysis Report');
      
      // Check for consistent table structure
      expect(gapTable).toMatch(/\| Section \| Status \| Missing Elements \| Source Reference \|/);
      expect(gapTable).toMatch(/\|:---\|:---\|:---\|:---\|/);
      expect(gapTable).toContain('Pre-TDD Client Questionnaire v2.0');
    });

    test('should produce consistent compliance report structure', async () => {
      const result = await validate_and_generate_tdd({
        project_data: mockProjectData,
        complexity: mockComplexity
      });

      const complianceReport = extractSection(result.tdd, 'MPKF Compliance Report');
      
      // Check for consistent table structure
      expect(complianceReport).toMatch(/\| Audit Item \| Status \| Notes \|/);
      expect(complianceReport).toMatch(/\|:---\|:---\|:---\|/);
      expect(complianceReport).toContain('Pre-TDD Gating');
      expect(complianceReport).toContain('Template Population');
      expect(complianceReport).toContain('Complexity Adherence');
    });
  });
});

// Helper function to extract a specific section from the TDD output
function extractSection(tddOutput, sectionName) {
  const lines = tddOutput.split('\n');
  let inSection = false;
  let sectionLines = [];
  
  for (const line of lines) {
    if (line.includes(sectionName)) {
      inSection = true;
      sectionLines.push(line);
    } else if (inSection && line.startsWith('##') && !line.includes(sectionName)) {
      break;
    } else if (inSection) {
      sectionLines.push(line);
    }
  }
  
  return sectionLines.join('\n');
}

// Helper function to generate large project data for testing
function generateLargeProjectData() {
  return {
    'doc.version': '1.0',
    'project.name': 'Large Enterprise Project',
    'doc.created_date': '2024-01-15',
    'doc.authors': 'Enterprise Team',
    'doc.stakeholders': 'Business Stakeholders, Technical Stakeholders',
    'summary.problem': 'Complex enterprise problem requiring comprehensive solution',
    'summary.solution': 'Multi-tier enterprise solution with microservices architecture',
    'summary.key_decisions': 'Key architectural decisions for enterprise scale',
    'summary.success_criteria': 'Success criteria for enterprise deployment',
    'context.business_goals': 'Primary business goals for enterprise transformation',
    'context.scope_in': 'In-scope functionality for enterprise release',
    'context.scope_out': 'Out-of-scope functionality for future releases',
    'context.personas': 'Enterprise user personas and roles',
    'constraints.technical': 'Technical constraints for enterprise deployment',
    'constraints.business': 'Business constraints and budget limitations',
    'constraints.compliance': 'Compliance requirements for enterprise',
    'constraints.assumptions': 'Key assumptions for enterprise project',
    'architecture.style': 'Microservices architecture style',
    'architecture.principles': 'Enterprise architecture principles',
    'architecture.tech_stack': 'Enterprise technology stack',
    'architecture.c4_l1_description': 'C4 Level 1 system context description',
    'architecture.c4_l2_description': 'C4 Level 2 container description',
    'architecture.data_model': 'Enterprise data model description',
    'nfr.performance': 'Enterprise performance requirements',
    'nfr.scalability': 'Enterprise scalability requirements',
    'nfr.availability': 'Enterprise availability requirements',
    'nfr.maintainability': 'Enterprise maintainability requirements',
    'nfr.usability': 'Enterprise usability requirements',
    'nfr.cost': 'Enterprise cost efficiency requirements',
    'security.threat_model': 'Enterprise threat model',
    'security.auth': 'Enterprise authentication and authorization',
    'security.controls': 'Enterprise security controls',
    'security.data_classification': 'Enterprise data classification',
    'privacy.controls': 'Enterprise privacy controls',
    'privacy.residency': 'Enterprise data residency requirements',
    'privacy.retention': 'Enterprise data retention policies',
    'ops.deployment_strategy': 'Enterprise deployment strategy',
    'ops.environments': 'Enterprise environment strategy',
    'ops.logging': 'Enterprise logging approach',
    'ops.monitoring': 'Enterprise monitoring and alerting',
    'ops.disaster_recovery': 'Enterprise disaster recovery strategy',
    'implementation.methodology': 'Enterprise development methodology',
    'implementation.team': 'Enterprise team structure',
    'implementation.roadmap': 'Enterprise implementation roadmap',
    'implementation.testing_strategy': 'Enterprise testing strategy',
    'risks.technical': 'Enterprise technical risks',
    'risks.business': 'Enterprise business risks',
    'risks.mitigation': 'Enterprise risk mitigation plan',
    'debt.known': 'Known technical debt in enterprise system',
    'appendices.glossary': 'Enterprise glossary of terms',
    'appendices.references': 'Enterprise references and documentation',
    'appendices.adrs': 'Enterprise architecture decision records'
  };
}
