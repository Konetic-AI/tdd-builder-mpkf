/**
 * PDF Export utility for TDD documents
 * Works with or without markdown-pdf
 */

const fs = require('fs').promises;
const path = require('path');

class PDFExporter {
  constructor() {
    this.hasMarkdownPdf = false;
    // Don't try to require markdown-pdf since it won't install
    console.log('PDF Exporter: Using text export mode (markdown-pdf not available)');
  }

  /**
   * Export markdown to PDF/text format
   * @param {string} markdownContent - The markdown content
   * @param {string} outputPath - Where to save the file
   * @returns {Promise<boolean>} - Success status
   */
  async exportToPDF(markdownContent, outputPath) {
    return this.exportAsFormattedText(markdownContent, outputPath);
  }

  /**
   * Export as formatted text file
   * Preserves structure better than basic text
   */
  async exportAsFormattedText(markdownContent, outputPath) {
    try {
      // Convert markdown to formatted text
      let formattedContent = markdownContent;

      // Add visual separators for headers
      formattedContent = formattedContent.replace(/^# (.+)$/gm, '\n════════════════════════════════\n$1\n════════════════════════════════');
      formattedContent = formattedContent.replace(/^## (.+)$/gm, '\n────────────────────────────────\n$1\n────────────────────────────────');
      formattedContent = formattedContent.replace(/^### (.+)$/gm, '\n▶ $1');

      // Format tables
      formattedContent = formattedContent.replace(/\|/g, ' │ ');

      // Clean up code blocks
      formattedContent = formattedContent.replace(/```[\s\S]*?```/g, (match) => {
        return match.replace(/```\w*\n?/g, '---CODE---\n').replace(/```/g, '\n---END CODE---');
      });

      // Remove other markdown syntax
      formattedContent = formattedContent
        .replace(/\*\*(.+?)\*\*/g, '[$1]')  // Bold to brackets
        .replace(/\*(.+?)\*/g, '$1')         // Remove italics
        .replace(/`(.+?)`/g, '"$1"')         // Code to quotes
        .replace(/^\- /gm, '• ');            // Lists to bullets

      // Save as .txt file (since we can't create real PDFs)
      const txtPath = outputPath.replace('.pdf', '.txt');
      await fs.writeFile(txtPath, formattedContent, 'utf8');

      console.log(`✅ Document exported to: ${txtPath}`);
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      return false;
    }
  }

  /**
   * Batch export multiple files
   */
  async batchExport(inputDir, outputDir) {
    try {
      const files = await fs.readdir(inputDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));

      if (mdFiles.length === 0) {
        console.log('No markdown files found in', inputDir);
        return [];
      }

      await fs.mkdir(outputDir, { recursive: true });

      const results = [];
      for (const file of mdFiles) {
        console.log(`Exporting ${file}...`);
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file.replace('.md', '.pdf'));
        const content = await fs.readFile(inputPath, 'utf8');

        const success = await this.exportToPDF(content, outputPath);
        results.push({ file, success });
      }

      return results;
    } catch (error) {
      console.error('Batch export failed:', error);
      return [];
    }
  }
}

module.exports = new PDFExporter();