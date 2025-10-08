/**
 * PDF Export utility for TDD documents
 * Uses Puppeteer for headless PDF generation
 * Falls back to formatted text export if Puppeteer is unavailable
 * 
 * Environment Variables:
 * - EXPORT_PATH: Configurable export directory (default: ./exports)
 */

const fs = require('fs').promises;
const path = require('path');

class PDFExporter {
  constructor() {
    this.puppeteer = null;
    this.browser = null;
    this.isInitialized = false;
    this.exportPath = process.env.EXPORT_PATH || './exports';
  }

  /**
   * Initialize Puppeteer browser instance
   * Gracefully handles Puppeteer not being installed
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      this.puppeteer = require('puppeteer');
      this.browser = await this.puppeteer.launch({
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
      this.isInitialized = true;
    } catch (error) {
      // Puppeteer is optional - fall back to text export without failing
      console.warn('PDF exporter: Puppeteer not available; using text export fallback.');
      this.isInitialized = false;
    }
  }

  /**
   * Clean up browser instance
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
    }
  }

  /**
   * Export markdown to PDF format using Puppeteer
   * Falls back to formatted text export if Puppeteer unavailable or errors occur
   * @param {string} markdownContent - The markdown content
   * @param {string} outputPath - Where to save the file
   * @returns {Promise<boolean>} - Success status
   */
  async exportToPDF(markdownContent, outputPath) {
    await this.initialize();

    if (!this.isInitialized) {
      return this.exportAsFormattedText(markdownContent, outputPath);
    }

    try {
      const page = await this.browser.newPage();
      
      // Convert markdown to HTML
      const html = this.markdownToHtml(markdownContent);
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Generate PDF with proper formatting
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%; color: #666;">Technical Design Document</div>',
        footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%; color: #666;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
      });

      await page.close();
      
      // Ensure output directory exists (handles any path safely)
      const outputDir = path.dirname(outputPath);
      try {
        await fs.mkdir(outputDir, { recursive: true });
      } catch (mkdirError) {
        // If mkdir fails due to permissions, try using EXPORT_PATH
        console.warn(`Cannot create directory ${outputDir}, using EXPORT_PATH`);
        const safePath = path.join(this.exportPath, path.basename(outputPath));
        await fs.mkdir(this.exportPath, { recursive: true });
        await fs.writeFile(safePath, pdfBuffer);
        console.log(`✅ PDF exported to: ${safePath}`);
        return true;
      }
      
      // Write PDF file
      await fs.writeFile(outputPath, pdfBuffer);
      
      console.log(`✅ PDF exported to: ${outputPath}`);
      return true;
    } catch (error) {
      console.warn('PDF generation failed, falling back to text export');
      return this.exportAsFormattedText(markdownContent, outputPath);
    }
  }

  /**
   * Convert markdown to HTML for PDF generation
   * @param {string} markdown - The markdown content
   * @returns {string} - HTML content
   */
  markdownToHtml(markdown) {
    // Basic markdown to HTML conversion
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      
      // Lists
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      
      // Line breaks
      .replace(/\n/g, '<br>')
      
      // Tables (basic support)
      .replace(/\|(.+)\|/g, (match, content) => {
        const cells = content.split('|').map(cell => `<td>${cell.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      });

    // Wrap in proper HTML structure
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Technical Design Document</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    h2 { color: #34495e; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; }
    h3 { color: #7f8c8d; }
    code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; font-family: 'Monaco', 'Consolas', monospace; }
    pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    ul { padding-left: 20px; }
    li { margin: 5px 0; }
    hr { border: none; border-top: 1px solid #eee; margin: 30px 0; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
  }

  /**
   * Export as formatted text file
   * Preserves structure better than basic text
   * Uses safe paths with automatic directory creation
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

      // Determine safe output path
      const txtPath = outputPath.replace('.pdf', '.txt');
      const outputDir = path.dirname(txtPath);
      
      try {
        // Try to create the requested directory
        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(txtPath, formattedContent, 'utf8');
        console.log(`✅ Document exported to: ${txtPath}`);
        return true;
      } catch (dirError) {
        // If directory creation fails, use EXPORT_PATH as fallback
        console.warn(`Cannot write to ${outputDir}, using EXPORT_PATH`);
        await fs.mkdir(this.exportPath, { recursive: true });
        const safePath = path.join(this.exportPath, path.basename(txtPath));
        await fs.writeFile(safePath, formattedContent, 'utf8');
        console.log(`✅ Document exported to: ${safePath}`);
        return true;
      }
    } catch (error) {
      console.error('Export failed:', error);
      return false;
    }
  }

  /**
   * Batch export multiple files
   * Uses safe paths with automatic fallback to EXPORT_PATH
   */
  async batchExport(inputDir, outputDir) {
    try {
      const files = await fs.readdir(inputDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));

      if (mdFiles.length === 0) {
        console.log('No markdown files found in', inputDir);
        return [];
      }

      // Try to create output directory, fall back to EXPORT_PATH if needed
      try {
        await fs.mkdir(outputDir, { recursive: true });
      } catch (error) {
        console.warn(`Cannot create ${outputDir}, using EXPORT_PATH`);
        outputDir = this.exportPath;
        await fs.mkdir(outputDir, { recursive: true });
      }

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

  /**
   * Test if PDF export is available (for testing purposes)
   * @returns {Promise<boolean>} - True if PDF export is available
   */
  async testPdfAvailability() {
    try {
      await this.initialize();
      return this.isInitialized;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new PDFExporter();