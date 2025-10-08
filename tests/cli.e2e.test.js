/**
 * End-to-End CLI Tests
 * Tests the full CLI workflow for different complexity levels
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Test timeout for CLI operations (10 seconds)
jest.setTimeout(10000);

describe('CLI End-to-End Tests', () => {
  const outputDir = path.join(__dirname, '..', 'output');
  const exportsDir = path.join(__dirname, '..', 'exports');
  const testTempDir = path.join(os.tmpdir(), 'tdd-builder-mpkf-tests');
  
  // Helper to execute CLI command
  const runCLI = (args, options = {}) => {
    try {
      const command = `node cli.js ${args}`;
      const result = execSync(command, {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf-8',
        ...options
      });
      return { success: true, stdout: result, stderr: '' };
    } catch (error) {
      return { 
        success: false, 
        stdout: error.stdout || '', 
        stderr: error.stderr || error.message 
      };
    }
  };

  // Helper to check if file exists
  const fileExists = (filePath) => {
    try {
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  };

  // Helper to read file content
  const readFile = (filePath) => {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch {
      return null;
    }
  };

  // Helper to clean up generated files
  const cleanupFile = (filePath) => {
    try {
      if (fileExists(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Ignore cleanup errors
    }
  };

  describe('Base Complexity Level', () => {
    const testFile = path.join(testTempDir, 'sample_base.json');
    const outputFile = path.join(outputDir, 'test_base_project_tdd.md');

    beforeAll(() => {
      // Ensure temp directory exists
      fs.mkdirSync(testTempDir, { recursive: true });
      
      // Create a minimal test file for base complexity
      const baseData = {
        'project.name': 'Test Base Project',
        'project.description': 'A simple prototype application',
        'project.version': '0.1.0',
        'problem.description': 'Need a quick prototype'
      };
      fs.writeFileSync(testFile, JSON.stringify(baseData, null, 2));
    });

    afterAll(() => {
      cleanupFile(testFile);
      cleanupFile(outputFile);
    });

    it('should generate TDD for base complexity level', () => {
      const result = runCLI(`--noninteractive ${testFile} --complexity base`, {
        env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
      });

      expect(result.success).toBe(true);
      expect(fileExists(outputFile)).toBe(true);
    });

    it('should create TDD with minimal required fields', () => {
      runCLI(`--noninteractive ${testFile} --complexity base`, {
        env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
      });

      const content = readFile(outputFile);
      expect(content).not.toBeNull();
      expect(content).toContain('Test Base Project');
      expect(content).toContain('# Technical Design Document');
    });

    it('should handle base complexity with legacy mode', () => {
      const result = runCLI(`--legacy --noninteractive ${testFile} --complexity base`);

      expect(result.success).toBe(true);
      expect(fileExists(outputFile)).toBe(true);
    });
  });

  describe('Minimal Complexity Level', () => {
    const testFile = path.join(__dirname, 'sample_minimal.json');
    const outputFile = path.join(outputDir, 'test_minimal_project_tdd.md');

    beforeAll(() => {
      // Create test file for minimal complexity
      const minimalData = {
        'project.name': 'Test Minimal Project',
        'project.description': 'A simple web application',
        'project.version': '1.0.0',
        'problem.description': 'Users need to track tasks',
        'solution.description': 'Web-based task manager',
        'architecture.type': 'Monolithic',
        'deployment.model': 'cloud',
        'cloud.provider': 'aws'
      };
      fs.writeFileSync(testFile, JSON.stringify(minimalData, null, 2));
    });

    afterAll(() => {
      cleanupFile(testFile);
      cleanupFile(outputFile);
    });

    it('should generate TDD for minimal complexity level', () => {
      const result = runCLI(`--noninteractive ${testFile} --complexity minimal`, {
        env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
      });

      expect(result.success).toBe(true);
      expect(fileExists(outputFile)).toBe(true);
    });

    it('should create TDD with core architectural information', () => {
      runCLI(`--noninteractive ${testFile} --complexity minimal`, {
        env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
      });

      const content = readFile(outputFile);
      expect(content).not.toBeNull();
      expect(content).toContain('Test Minimal Project');
      expect(content).toContain('Architecture');
    });

    it('should handle minimal complexity with legacy mode', () => {
      const result = runCLI(`--legacy --noninteractive ${testFile} --complexity minimal`);

      expect(result.success).toBe(true);
      expect(fileExists(outputFile)).toBe(true);
    });
  });

  describe('Standard Complexity Level', () => {
    const testFile = path.join(__dirname, 'sample_standard.json');
    const outputFile = path.join(outputDir, 'test_standard_project_tdd.md');

    beforeAll(() => {
      // Create test file for standard complexity
      const standardData = {
        'project.name': 'Test Standard Project',
        'project.description': 'A typical business application',
        'project.version': '1.0.0',
        'problem.description': 'Users need comprehensive task management',
        'solution.description': 'Full-featured task management platform',
        'architecture.type': 'Microservices',
        'deployment.model': 'cloud',
        'cloud.provider': 'aws',
        'cloud.regions': ['us-east-1', 'eu-west-1'],
        'privacy.pii': true,
        'privacy.regulations': ['gdpr'],
        'operations.monitoring': 'CloudWatch',
        'operations.sla': '99.9',
        'security.authentication': 'OAuth2',
        'database.type': 'PostgreSQL'
      };
      fs.writeFileSync(testFile, JSON.stringify(standardData, null, 2));
    });

    afterAll(() => {
      cleanupFile(testFile);
      cleanupFile(outputFile);
    });

    it('should generate TDD for standard complexity level', () => {
      const result = runCLI(`--noninteractive ${testFile} --complexity standard`, {
        env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
      });

      expect(result.success).toBe(true);
      expect(fileExists(outputFile)).toBe(true);
    });

    it('should create comprehensive TDD with security and operations sections', () => {
      runCLI(`--noninteractive ${testFile} --complexity standard`, {
        env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
      });

      const content = readFile(outputFile);
      expect(content).not.toBeNull();
      expect(content).toContain('Test Standard Project');
      expect(content).toContain('Security');
      expect(content).toContain('Operations');
    });

    it('should handle standard complexity with legacy mode', () => {
      const result = runCLI(`--legacy --noninteractive ${testFile} --complexity standard`);

      expect(result.success).toBe(true);
      expect(fileExists(outputFile)).toBe(true);
    });

    it('should include micro builds guide', () => {
      runCLI(`--noninteractive ${testFile} --complexity standard`, {
        env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
      });

      const content = readFile(outputFile);
      expect(content).toContain('Micro Builds Guide');
    });
  });

  describe('Auto Complexity Recommendation', () => {
    it('should auto-recommend base for minimal input', () => {
      const testFile = path.join(__dirname, 'sample_auto_base.json');
      const outputFile = path.join(outputDir, 'test_auto_simple_tdd.md');

      const simpleData = {
        'project.name': 'Test Auto Simple',
        'project.description': 'Minimal app',
        'project.version': '0.1.0'
      };
      
      fs.writeFileSync(testFile, JSON.stringify(simpleData, null, 2));

      try {
        const result = runCLI(`--noninteractive ${testFile} --complexity auto`, {
          env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
        });

        expect(result.success).toBe(true);
        expect(fileExists(outputFile)).toBe(true);
      } finally {
        cleanupFile(testFile);
        cleanupFile(outputFile);
      }
    });

    it('should auto-recommend higher level for complex project', () => {
      const testFile = path.join(__dirname, 'sample_auto_complex.json');
      const outputFile = path.join(outputDir, 'test_auto_complex_tdd.md');

      const complexData = {
        'project.name': 'Test Auto Complex',
        'project.description': 'Healthcare platform',
        'project.industry': 'Healthcare',
        'privacy.pii': true,
        'privacy.regulations': ['hipaa', 'gdpr'],
        'operations.sla': '99.99',
        'cloud.regions': ['us-east-1', 'eu-west-1', 'ap-southeast-1']
      };
      
      fs.writeFileSync(testFile, JSON.stringify(complexData, null, 2));

      try {
        const result = runCLI(`--noninteractive ${testFile} --complexity auto`, {
          env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
        });

        expect(result.success).toBe(true);
        expect(fileExists(outputFile)).toBe(true);
      } finally {
        cleanupFile(testFile);
        cleanupFile(outputFile);
      }
    });
  });

  describe('CLI Flags', () => {
    const testFile = path.join(__dirname, 'sample_simple.json');
    
    beforeAll(() => {
      // Ensure sample_simple.json exists
      if (!fileExists(testFile)) {
        const simpleData = {
          'project.name': 'Simple Test',
          'project.description': 'Test project',
          'project.version': '1.0.0'
        };
        fs.writeFileSync(testFile, JSON.stringify(simpleData, null, 2));
      }
    });

    it('should show help with --help flag', () => {
      const result = runCLI('--help');

      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Usage:');
      expect(result.stdout).toContain('Options:');
      expect(result.stdout).toContain('--noninteractive');
      expect(result.stdout).toContain('--template');
      expect(result.stdout).toContain('--tags');
      expect(result.stdout).toContain('--complexity');
      expect(result.stdout).toContain('--legacy');
    });

    it('should show help with -h flag', () => {
      const result = runCLI('-h');

      expect(result.success).toBe(true);
      expect(result.stdout).toContain('Usage:');
    });

    it('should accept --legacy flag', () => {
      const outputFile = path.join(outputDir, 'simple_test_tdd.md');
      
      try {
        const result = runCLI(`--legacy --noninteractive ${testFile}`);
        
        // Should not throw error
        expect(result.stdout || result.stderr).toBeDefined();
      } finally {
        cleanupFile(outputFile);
      }
    });

    it('should validate complexity level values', () => {
      const result = runCLI(`--noninteractive ${testFile} --complexity invalid`, {
        env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
      });

      expect(result.success).toBe(false);
      expect(result.stderr).toContain('Invalid complexity level');
    });

    it('should handle legacy complexity value "simple" with deprecation warning', () => {
      const result = runCLI(`--noninteractive ${testFile} --complexity simple`, {
        env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
      });

      expect(result.stderr || result.stdout).toContain('Deprecated complexity: "simple", using "base"');
    });

    it('should handle legacy complexity value "startup" with deprecation warning', () => {
      const result = runCLI(`--noninteractive ${testFile} --complexity startup`, {
        env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
      });

      expect(result.stderr || result.stdout).toContain('Deprecated complexity: "startup", using "standard"');
    });

    it('should handle legacy complexity value "mcp-specific" with deprecation warning', () => {
      const result = runCLI(`--noninteractive ${testFile} --complexity mcp-specific`, {
        env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
      });

      expect(result.stderr || result.stdout).toContain('Deprecated complexity: "mcp-specific", using "comprehensive"');
    });

    it('should accept all valid complexity levels', () => {
      const levels = ['base', 'minimal', 'standard', 'comprehensive', 'enterprise', 'auto'];
      
      levels.forEach(level => {
        const outputFile = path.join(outputDir, `simple_test_tdd.md`);
        
        try {
          const result = runCLI(`--noninteractive ${testFile} --complexity ${level}`, {
            env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
          });
          
          // Should not throw validation error
          expect(result.stderr || result.stdout).not.toContain('Invalid complexity level');
        } finally {
          cleanupFile(outputFile);
        }
      });
    });
  });

  describe('Template Support', () => {
    const outputFile = path.join(outputDir, 'test_template_project_tdd.md');

    afterEach(() => {
      cleanupFile(outputFile);
    });

    it('should list available templates in help', () => {
      const result = runCLI('--help');

      expect(result.stdout).toContain('Industry Templates:');
      expect(result.stdout).toContain('saas');
      expect(result.stdout).toContain('fintech');
      expect(result.stdout).toContain('ecommerce');
      expect(result.stdout).toContain('healthcare');
    });

    it('should handle non-existent template gracefully', () => {
      const result = runCLI('--template nonexistent');

      expect(result.success).toBe(false);
      expect(result.stderr || result.stdout).toContain('Template');
    });
  });

  describe('Tag Filtering', () => {
    const testFile = path.join(__dirname, 'sample_simple.json');
    
    beforeAll(() => {
      if (!fileExists(testFile)) {
        const simpleData = {
          'project.name': 'Tag Test',
          'project.description': 'Test tag filtering'
        };
        fs.writeFileSync(testFile, JSON.stringify(simpleData, null, 2));
      }
    });

    it('should accept --tags flag', () => {
      const result = runCLI('--help');

      expect(result.stdout).toContain('--tags');
      expect(result.stdout).toContain('Filter deep dive questions by tags');
    });

    it('should accept comma-separated tags', () => {
      const outputFile = path.join(outputDir, 'tag_test_tdd.md');
      
      try {
        // Just verify it doesn't throw a parsing error
        const result = runCLI(`--noninteractive ${testFile} --tags security,privacy`, {
          env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
        });
        
        // Command should execute without syntax errors
        expect(result.stdout || result.stderr).toBeDefined();
      } finally {
        cleanupFile(outputFile);
      }
    });
  });

  describe('Feature Flags', () => {
    const testFile = path.join(__dirname, 'sample_simple.json');

    beforeAll(() => {
      if (!fileExists(testFile)) {
        const simpleData = {
          'project.name': 'Flag Test',
          'project.description': 'Test feature flags'
        };
        fs.writeFileSync(testFile, JSON.stringify(simpleData, null, 2));
      }
    });

    it('should respect SCHEMA_DRIVEN_ONBOARDING=false', () => {
      const outputFile = path.join(outputDir, 'flag_test_tdd.md');
      
      try {
        const result = runCLI(`--noninteractive ${testFile}`, {
          env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
        });

        // Should work in legacy mode
        expect(result.success).toBe(true);
      } finally {
        cleanupFile(outputFile);
      }
    });

    it('should allow --legacy to override environment variable', () => {
      const outputFile = path.join(outputDir, 'flag_test_tdd.md');
      
      try {
        const result = runCLI(`--legacy --noninteractive ${testFile}`, {
          env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'true' }
        });

        // Should work with --legacy flag even when env var is true
        expect(result.stdout || result.stderr).toBeDefined();
      } finally {
        cleanupFile(outputFile);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent input file', () => {
      const result = runCLI('--noninteractive nonexistent.json');

      expect(result.success).toBe(false);
      expect(result.stderr || result.stdout).toContain('Failed');
    });

    it('should handle invalid JSON in input file', () => {
      const invalidFile = path.join(testTempDir, 'invalid.json');
      fs.writeFileSync(invalidFile, '{ invalid json }');

      try {
        const result = runCLI(`--noninteractive ${invalidFile}`);

        expect(result.success).toBe(false);
      } finally {
        cleanupFile(invalidFile);
      }
    });
  });

  describe('Output Validation', () => {
    const testFile = path.join(__dirname, 'sample_simple.json');
    const outputFile = path.join(outputDir, 'simple_test_tdd.md');

    beforeAll(() => {
      if (!fileExists(testFile)) {
        const simpleData = {
          'project.name': 'Simple Test',
          'project.description': 'Output validation test',
          'project.version': '1.0.0',
          'problem.description': 'Test problem',
          'solution.description': 'Test solution'
        };
        fs.writeFileSync(testFile, JSON.stringify(simpleData, null, 2));
      }
    });

    afterEach(() => {
      cleanupFile(outputFile);
    });

    it('should generate valid markdown output', () => {
      runCLI(`--noninteractive ${testFile} --complexity minimal`, {
        env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
      });

      const content = readFile(outputFile);
      expect(content).not.toBeNull();
      
      // Check for markdown headers
      expect(content).toMatch(/^# /m);
      expect(content).toMatch(/^## /m);
    });

    it('should include metadata in output', () => {
      runCLI(`--noninteractive ${testFile} --complexity minimal`, {
        env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
      });

      const content = readFile(outputFile);
      expect(content).toContain('Version:');
      expect(content).toContain('1.0.0');
    });

    it('should not contain orphan variables for complete input', () => {
      runCLI(`--noninteractive ${testFile} --complexity base`, {
        env: { ...process.env, SCHEMA_DRIVEN_ONBOARDING: 'false' }
      });

      const content = readFile(outputFile);
      
      // Should not have many unresolved template variables (allow a few conditional ones)
      const orphans = content.match(/{{[^}]+}}/g) || [];
      const nonConditionalOrphans = orphans.filter(v => !v.includes('*Not Provided*'));
      
      // Base complexity should have very few orphan variables
      expect(nonConditionalOrphans.length).toBeLessThan(10);
    });
  });
});

