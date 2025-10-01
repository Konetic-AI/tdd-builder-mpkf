# TDD Builder MPKF

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](package.json)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)](package.json)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](test_runner.js)

A powerful Node.js command-line tool that generates enterprise-grade Technical Design Documents (TDDs) compliant with the Master Project Knowledge File (MPKF) framework.

## 🚀 Features

- **MPKF-Compliant**: Generates TDDs following the official Universal Enterprise-Grade TDD Template v5.0
- **Adaptive Complexity**: Supports four complexity levels:
  - `simple` - For POCs and internal tools (4 required fields)
  - `startup` - For early-stage projects (8 required fields)  
  - `enterprise` - For production systems (45+ required fields)
  - `mcp-specific` - For AI/LLM tools using Model Context Protocol (48+ required fields)
- **Pre-TDD Validation**: Validates input data and generates targeted questions for missing information
- **Self-Auditing**: Automatically appends Gap Analysis, Compliance, and Completeness reports
- **Smart Caching**: Template caching for improved performance
- **Export Capabilities**: Export TDDs as formatted text files
- **Interactive CLI**: User-friendly command-line interface with both interactive and file-based modes

## 📁 Project Structure
tdd-builder-mpkf/
├── handlers/              # Core business logic
│   └── generate_tdd.js   # Main TDD generation handler
├── templates/            # Document templates
│   └── tdd_v5.0.md      # Official MPKF TDD template
├── tests/               # Test files and sample data
│   ├── sample_simple.json
│   ├── sample_startup.json
│   ├── sample_enterprise.json
│   ├── sample_mcp-specific.json
│   └── test_generateAuditReports.js
├── utils/               # Utility modules
│   └── pdfExporter.js   # Export functionality
├── output/              # Generated TDDs (gitignored)
├── exports/             # Exported text files (gitignored)
├── cli.js              # Interactive CLI interface
├── test_runner.js      # Main test suite
└── package.json        # Project configuration

## 🛠️ Installation
```bash
# Clone the repository
git clone https://github.com/your-username/tdd-builder-mpkf.git
cd tdd-builder-mpkf

# Install dependencies (currently none required)
npm install
📖 Usage
Interactive Mode
Start the interactive wizard to create a TDD by answering questions:
bashnode cli.js
File-Based Mode
Generate a TDD from a JSON file:
bashnode cli.js -f tests/sample_enterprise.json
Help
View all available options:
bashnode cli.js --help
🧪 Testing
Run All Tests
bashnpm test
Run Specific Complexity Tests
bashnpm run test:simple
npm run test:startup
npm run test:enterprise
npm run test:mcp
Run Audit Tests
bashnpm run test:audit
📋 Commands Reference
CommandDescriptionnpm testRun complete test suitenpm run test:simpleTest simple complexitynpm run test:startupTest startup complexitynpm run test:enterpriseTest enterprise complexitynpm run test:mcpTest MCP-specific complexitynpm run test:auditTest audit report generationnode cli.jsStart interactive modenode cli.js -f <file>Generate from JSON filenode cli.js --helpShow help informationnode test_pdf_export.jsTest export functionality
📊 Sample Output
A generated TDD includes:

9 comprehensive stages covering all aspects of technical design
Architecture diagrams in PlantUML format
Security and privacy considerations
Operations and deployment strategies
Risk management and mitigation plans
Self-audit reports for compliance verification

🔐 MPKF Compliance
This tool strictly adheres to the Master Project Knowledge File (MPKF) framework:

Uses Pre-TDD Client Questionnaire v2.0 for validation
Populates Universal Enterprise-Grade TDD Template v5.0
Implements Adaptive Complexity Model
Compatible with downstream Phoenix and Iris Gem schemas

🤝 Contributing

Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request

📄 License
This project is licensed under the MIT License.
🙏 Acknowledgments

MPKF Core Team for the foundational framework
TDD Genesis Gem contributors
Model Context Protocol community