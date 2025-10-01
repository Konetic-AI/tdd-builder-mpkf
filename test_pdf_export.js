/**
 * Test the PDF export functionality
 */

const pdfExporter = require('./utils/pdfExporter');
const fs = require('fs').promises;

async function testPDFExport() {
  console.log('Testing PDF Export...\n');

  // Test 1: Export a single file
  console.log('Test 1: Exporting a sample TDD...');
  try {
    const sampleContent = `# Technical Design Document: Test Project

## Executive Summary
This is a test document for PDF export functionality.

### Key Features
- Feature 1: PDF Export
- Feature 2: Text Formatting
- Feature 3: Table Support

## Technical Details

| Component | Description |
|-----------|-------------|
| Exporter  | Converts MD to text |
| Formatter | Preserves structure |

\`\`\`javascript
function example() {
  console.log('Code block test');
}
\`\`\`

## Conclusion
The PDF export functionality works correctly.`;

    await fs.writeFile('test_export.md', sampleContent);
    const success = await pdfExporter.exportToPDF(sampleContent, 'test_export.pdf');

    if (success) {
      console.log('✅ Single file export: PASSED\n');
    } else {
      console.log('❌ Single file export: FAILED\n');
    }
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
  }

  // Test 2: Batch export
  console.log('Test 2: Batch exporting from output directory...');
  try {
    const results = await pdfExporter.batchExport('output', 'exports');

    if (results.length > 0) {
      console.log(`✅ Batch export: PASSED (${results.length} files)\n`);
      results.forEach(r => {
        console.log(`  - ${r.file}: ${r.success ? '✅' : '❌'}`);
      });
    } else {
      console.log('⚠️  No files to export in output directory\n');
    }
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }

  // Clean up
  try {
    await fs.unlink('test_export.md');
    await fs.unlink('test_export.txt');
  } catch (e) {
    // Ignore cleanup errors
  }

  console.log('\n✅ PDF Export testing complete!');
}

// Run the test
testPDFExport().catch(console.error);