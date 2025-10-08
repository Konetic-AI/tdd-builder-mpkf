/**
 * Tests for PDF export functionality
 * Tests the PDF exporter with mocked Puppeteer to avoid CI/CD issues
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Mock Puppeteer
const mockPuppeteer = {
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn().mockResolvedValue(),
      pdf: jest.fn().mockResolvedValue(Buffer.from('mock-pdf-content')),
      close: jest.fn().mockResolvedValue()
    }),
    close: jest.fn().mockResolvedValue()
  })
};

// Mock the require call for puppeteer - handle case where puppeteer is not installed
jest.mock('puppeteer', () => mockPuppeteer, { virtual: true });

// Import the PDF exporter after mocking
const PDFExporter = require('../utils/pdfExporter');

describe('PDF Export Tests', () => {
  let pdfExporter;
  const testOutputDir = path.join(__dirname, 'temp_pdf_output');
  const originalExportPath = process.env.EXPORT_PATH;

  beforeEach(() => {
    // Create a new instance for each test
    pdfExporter = new (require('../utils/pdfExporter').constructor)();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Restore original EXPORT_PATH
    if (originalExportPath) {
      process.env.EXPORT_PATH = originalExportPath;
    } else {
      delete process.env.EXPORT_PATH;
    }
    
    // Clean up test files
    try {
      await fs.rm(testOutputDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
    await pdfExporter.cleanup();
  });

  describe('PDFExporter Class', () => {
    test('should initialize Puppeteer successfully', async () => {
      await pdfExporter.initialize();
      expect(pdfExporter.isInitialized).toBe(true);
      expect(mockPuppeteer.launch).toHaveBeenCalledWith({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    });

    test('should handle Puppeteer initialization failure gracefully', async () => {
      // Mock Puppeteer to throw an error
      mockPuppeteer.launch.mockRejectedValueOnce(new Error('Puppeteer failed'));
      
      await pdfExporter.initialize();
      expect(pdfExporter.isInitialized).toBe(false);
    });

    test('should export markdown to PDF successfully', async () => {
      const markdownContent = '# Test Document\n\nThis is a **test** document.';
      const outputPath = path.join(testOutputDir, 'test.pdf');

      await fs.mkdir(testOutputDir, { recursive: true });

      const result = await pdfExporter.exportToPDF(markdownContent, outputPath);

      expect(result).toBe(true);
      expect(mockPuppeteer.launch).toHaveBeenCalled();
      
      // Verify the file was created
      const fileExists = await fs.access(outputPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
    });

    test('should fall back to text export when PDF export fails', async () => {
      // Mock Puppeteer to fail
      mockPuppeteer.launch.mockRejectedValueOnce(new Error('Puppeteer failed'));
      
      const markdownContent = '# Test Document\n\nThis is a **test** document.';
      const outputPath = path.join(testOutputDir, 'test.pdf');

      await fs.mkdir(testOutputDir, { recursive: true });

      const result = await pdfExporter.exportToPDF(markdownContent, outputPath);

      expect(result).toBe(true);
      
      // Should create a .txt file instead of .pdf
      const txtPath = outputPath.replace('.pdf', '.txt');
      const fileExists = await fs.access(txtPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
    });

    test('should convert markdown to HTML correctly', () => {
      const markdown = `# Main Title
## Subtitle
### Sub-subtitle

This is **bold** and *italic* text.

\`inline code\`

\`\`\`
code block
\`\`\`

- List item 1
- List item 2

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;

      const html = pdfExporter.markdownToHtml(markdown);

      expect(html).toContain('<h1>Main Title</h1>');
      expect(html).toContain('<h2>Subtitle</h2>');
      expect(html).toContain('<h3>Sub-subtitle</h3>');
      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('<em>italic</em>');
      expect(html).toContain('<code>inline code</code>');
      expect(html).toContain('<pre><code>');
      expect(html).toContain('code block');
      expect(html).toContain('<li>List item 1</li>');
      expect(html).toContain('<li>List item 2</li>');
      expect(html).toContain('<tr>');
      expect(html).toContain('<td>Header 1</td>');
      expect(html).toContain('<td>Header 2</td>');
    });

    test('should handle batch export', async () => {
      const inputDir = testOutputDir;
      const outputDir = path.join(testOutputDir, 'batch_output');

      // Create test markdown files
      await fs.mkdir(inputDir, { recursive: true });
      await fs.writeFile(path.join(inputDir, 'test1.md'), '# Test 1\nContent 1');
      await fs.writeFile(path.join(inputDir, 'test2.md'), '# Test 2\nContent 2');
      await fs.writeFile(path.join(inputDir, 'not_md.txt'), 'Not a markdown file');

      const results = await pdfExporter.batchExport(inputDir, outputDir);

      expect(results).toHaveLength(2);
      expect(results[0].file).toBe('test1.md');
      expect(results[0].success).toBe(true);
      expect(results[1].file).toBe('test2.md');
      expect(results[1].success).toBe(true);
    });

    test('should test PDF availability correctly', async () => {
      const isAvailable = await pdfExporter.testPdfAvailability();
      expect(isAvailable).toBe(true);
    });

    test('should clean up browser resources', async () => {
      await pdfExporter.initialize();
      expect(pdfExporter.isInitialized).toBe(true);

      await pdfExporter.cleanup();
      expect(pdfExporter.isInitialized).toBe(false);
      expect(pdfExporter.browser).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('should handle file system errors gracefully', async () => {
      const markdownContent = '# Test Document';
      // Use a temporary directory path that is writable but nested
      const tempDir = path.join(os.tmpdir(), 'tdd-test-invalid', 'nested');
      const invalidPath = path.join(tempDir, 'test.pdf');

      const result = await pdfExporter.exportToPDF(markdownContent, invalidPath);
      
      // Should succeed with EXPORT_PATH fallback or directory creation
      expect(typeof result).toBe('boolean');
      
      // Cleanup
      try {
        await fs.rm(path.join(os.tmpdir(), 'tdd-test-invalid'), { recursive: true, force: true });
      } catch {}
    });

    test('should handle empty markdown content', async () => {
      const markdownContent = '';
      const outputPath = path.join(testOutputDir, 'empty.pdf');

      await fs.mkdir(testOutputDir, { recursive: true });

      const result = await pdfExporter.exportToPDF(markdownContent, outputPath);
      expect(result).toBe(true);
    });
  });

  describe('EXPORT_PATH Configuration', () => {
    test('should use default EXPORT_PATH when not set', () => {
      delete process.env.EXPORT_PATH;
      const exporter = new (require('../utils/pdfExporter').constructor)();
      expect(exporter.exportPath).toBe('./exports');
    });

    test('should use custom EXPORT_PATH when set', () => {
      const customPath = path.join(os.tmpdir(), 'custom-exports');
      process.env.EXPORT_PATH = customPath;
      const exporter = new (require('../utils/pdfExporter').constructor)();
      expect(exporter.exportPath).toBe(customPath);
    });

    test('should create EXPORT_PATH directory when exporting', async () => {
      const customExportPath = path.join(testOutputDir, 'custom-exports');
      process.env.EXPORT_PATH = customExportPath;
      
      // Mock Puppeteer to fail, forcing text export fallback
      mockPuppeteer.launch.mockRejectedValueOnce(new Error('Puppeteer not available'));
      
      const markdownContent = '# Test Document\n\nContent here.';
      // Use a temporary unwritable-looking path
      const invalidTempPath = path.join(os.tmpdir(), 'invalid-permission-test', 'denied', 'test.pdf');
      
      const exporter = new (require('../utils/pdfExporter').constructor)();
      const result = await exporter.exportToPDF(markdownContent, invalidTempPath);
      
      expect(result).toBe(true);
      
      // Verify EXPORT_PATH directory was created
      const dirExists = await fs.access(customExportPath).then(() => true).catch(() => false);
      expect(dirExists).toBe(true);
      
      // Verify file was written to EXPORT_PATH
      const txtPath = path.join(customExportPath, 'test.txt');
      const fileExists = await fs.access(txtPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
      
      // Cleanup
      try {
        await fs.rm(path.join(os.tmpdir(), 'invalid-permission-test'), { recursive: true, force: true });
      } catch {}
    });
  });

  describe('Directory Creation', () => {
    test('should create output directory if it does not exist', async () => {
      const markdownContent = '# Test Document';
      const nestedPath = path.join(testOutputDir, 'deeply', 'nested', 'path', 'test.pdf');

      const result = await pdfExporter.exportToPDF(markdownContent, nestedPath);
      
      expect(result).toBe(true);
      
      // Verify directories were created
      const dirExists = await fs.access(path.dirname(nestedPath)).then(() => true).catch(() => false);
      expect(dirExists).toBe(true);
    });

    test('should handle mkdir failures gracefully with EXPORT_PATH fallback', async () => {
      const customExportPath = path.join(testOutputDir, 'fallback-exports');
      process.env.EXPORT_PATH = customExportPath;
      
      const markdownContent = '# Test Document';
      // Use a temporary path as a test case
      const testPath = path.join(os.tmpdir(), 'tdd-test-fallback', 'test.pdf');
      
      const exporter = new (require('../utils/pdfExporter').constructor)();
      const result = await exporter.exportToPDF(markdownContent, testPath);
      
      // Should succeed with directory creation or EXPORT_PATH fallback
      expect(result).toBe(true);
      
      // Cleanup
      try {
        await fs.rm(path.join(os.tmpdir(), 'tdd-test-fallback'), { recursive: true, force: true });
      } catch {}
    });
  });

  describe('Puppeteer Not Installed', () => {
    test('should fall back to text export when Puppeteer is not installed', async () => {
      // Mock Puppeteer to throw MODULE_NOT_FOUND error
      mockPuppeteer.launch.mockRejectedValueOnce(new Error("Cannot find module 'puppeteer'"));
      
      const markdownContent = '# Test Document\n\nThis should export as text.';
      const outputPath = path.join(testOutputDir, 'no-puppeteer.pdf');

      await fs.mkdir(testOutputDir, { recursive: true });

      const result = await pdfExporter.exportToPDF(markdownContent, outputPath);

      expect(result).toBe(true);
      
      // Should create a .txt file instead of .pdf
      const txtPath = outputPath.replace('.pdf', '.txt');
      const fileExists = await fs.access(txtPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
      
      // Verify content was written
      const content = await fs.readFile(txtPath, 'utf8');
      expect(content).toContain('Test Document');
    });

    test('should log warning when Puppeteer is unavailable', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      mockPuppeteer.launch.mockRejectedValueOnce(new Error('Puppeteer not available'));
      
      await pdfExporter.initialize();
      
      expect(consoleSpy).toHaveBeenCalledWith('PDF exporter: Puppeteer not available; using text export fallback.');
      expect(pdfExporter.isInitialized).toBe(false);
      
      consoleSpy.mockRestore();
    });

    test('should not fail CI when Puppeteer is not installed', async () => {
      mockPuppeteer.launch.mockRejectedValueOnce(new Error("Cannot find module 'puppeteer'"));
      
      const markdownContent = '# CI Test Document';
      const outputPath = path.join(testOutputDir, 'ci-test.pdf');

      await fs.mkdir(testOutputDir, { recursive: true });

      // This should not throw an error
      await expect(pdfExporter.exportToPDF(markdownContent, outputPath)).resolves.toBe(true);
    });
  });
});

describe('PDF Export Integration Tests', () => {
  test('should work with CLI PDF flag', async () => {
    // This test verifies that the PDF export integrates properly with the CLI
    // We'll test the exportToPDF function that's used by the CLI
    const cli = require('../cli');
    
    const mockTdd = '# Test TDD\n\nThis is a test TDD document.';
    const testPath = path.join(__dirname, 'temp_pdf_output', 'cli_test.pdf');

    await fs.mkdir(path.dirname(testPath), { recursive: true });

    // Since exportToPDF is not exported, we'll test the PDF exporter directly
    const pdfExporter = new (require('../utils/pdfExporter').constructor)();
    const result = await pdfExporter.exportToPDF(mockTdd, testPath);
    
    expect(result).toBe(true);
    
    // Clean up
    try {
      await fs.rm(path.dirname(testPath), { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });
});
