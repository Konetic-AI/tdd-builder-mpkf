/**
 * Privacy-safe telemetry system for TDD Builder
 * 
 * Collects anonymized metrics to improve the onboarding experience:
 * - Time spent per stage
 * - Questions skipped by tag category
 * - Template usage patterns
 * - Complexity level recommendations
 * 
 * All data is anonymized and contains NO personally identifiable information.
 * Telemetry is OPT-IN only via ONBOARDING_TELEMETRY=1 environment variable.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Check if telemetry is enabled
 */
function isTelemetryEnabled() {
  return process.env.ONBOARDING_TELEMETRY === '1' || process.env.ONBOARDING_TELEMETRY === 'true';
}

/**
 * Generate a session ID (anonymized, no PII)
 */
function generateSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Telemetry session tracker
 */
class TelemetrySession {
  constructor() {
    this.sessionId = generateSessionId();
    this.startTime = Date.now();
    this.events = [];
    this.metadata = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      node_version: process.version,
      platform: process.platform
    };
    
    // Stage timings
    this.stages = {
      core: { start: null, end: null, duration: null },
      review: { start: null, end: null, duration: null },
      deep_dive: { start: null, end: null, duration: null }
    };
    
    // Question tracking
    this.questionStats = {
      total_asked: 0,
      total_answered: 0,
      total_skipped: 0,
      skipped_by_tag: {},
      answered_by_tag: {}
    };
    
    // Template usage
    this.templateUsed = null;
    
    // Complexity tracking
    this.complexityRecommended = null;
    this.complexitySelected = null;
    
    // Section skips
    this.sectionsSkipped = [];
  }
  
  /**
   * Start tracking a stage
   */
  startStage(stageName) {
    if (this.stages[stageName]) {
      this.stages[stageName].start = Date.now();
    }
  }
  
  /**
   * End tracking a stage
   */
  endStage(stageName) {
    if (this.stages[stageName] && this.stages[stageName].start) {
      this.stages[stageName].end = Date.now();
      this.stages[stageName].duration = this.stages[stageName].end - this.stages[stageName].start;
    }
  }
  
  /**
   * Track a question being asked
   */
  trackQuestionAsked(questionId, tags) {
    this.questionStats.total_asked++;
    
    // Initialize tag counters
    tags.forEach(tag => {
      if (!this.questionStats.answered_by_tag[tag]) {
        this.questionStats.answered_by_tag[tag] = 0;
      }
      if (!this.questionStats.skipped_by_tag[tag]) {
        this.questionStats.skipped_by_tag[tag] = 0;
      }
    });
  }
  
  /**
   * Track a question being answered
   */
  trackQuestionAnswered(questionId, tags, answerProvided = true) {
    if (answerProvided) {
      this.questionStats.total_answered++;
      tags.forEach(tag => {
        this.questionStats.answered_by_tag[tag] = (this.questionStats.answered_by_tag[tag] || 0) + 1;
      });
    } else {
      this.questionStats.total_skipped++;
      tags.forEach(tag => {
        this.questionStats.skipped_by_tag[tag] = (this.questionStats.skipped_by_tag[tag] || 0) + 1;
      });
    }
  }
  
  /**
   * Track template usage
   */
  trackTemplate(templateName) {
    this.templateUsed = templateName;
  }
  
  /**
   * Track complexity recommendation
   */
  trackComplexity(recommended, selected) {
    this.complexityRecommended = recommended;
    this.complexitySelected = selected;
  }
  
  /**
   * Track section skip
   */
  trackSectionSkipped(sectionName, questionCount) {
    this.sectionsSkipped.push({
      section: sectionName,
      question_count: questionCount
    });
  }
  
  /**
   * Calculate skip percentages by tag
   */
  getSkipPercentagesByTag() {
    const percentages = {};
    
    Object.keys(this.questionStats.skipped_by_tag).forEach(tag => {
      const skipped = this.questionStats.skipped_by_tag[tag] || 0;
      const answered = this.questionStats.answered_by_tag[tag] || 0;
      const total = skipped + answered;
      
      if (total > 0) {
        percentages[tag] = Math.round((skipped / total) * 100);
      }
    });
    
    return percentages;
  }
  
  /**
   * Generate telemetry report
   */
  generateReport() {
    const totalDuration = Date.now() - this.startTime;
    
    return {
      session_id: this.sessionId,
      metadata: this.metadata,
      
      // Duration metrics
      total_duration_ms: totalDuration,
      total_duration_formatted: this.formatDuration(totalDuration),
      
      // Stage timings
      stages: {
        core: {
          duration_ms: this.stages.core.duration,
          duration_formatted: this.stages.core.duration ? this.formatDuration(this.stages.core.duration) : null
        },
        review: {
          duration_ms: this.stages.review.duration,
          duration_formatted: this.stages.review.duration ? this.formatDuration(this.stages.review.duration) : null
        },
        deep_dive: {
          duration_ms: this.stages.deep_dive.duration,
          duration_formatted: this.stages.deep_dive.duration ? this.formatDuration(this.stages.deep_dive.duration) : null
        }
      },
      
      // Question statistics
      questions: {
        total_asked: this.questionStats.total_asked,
        total_answered: this.questionStats.total_answered,
        total_skipped: this.questionStats.total_skipped,
        completion_rate: this.questionStats.total_asked > 0 
          ? Math.round((this.questionStats.total_answered / this.questionStats.total_asked) * 100)
          : 0,
        skip_percentage_by_tag: this.getSkipPercentagesByTag()
      },
      
      // Template usage
      template_used: this.templateUsed,
      
      // Complexity
      complexity: {
        recommended: this.complexityRecommended,
        selected: this.complexitySelected,
        matched_recommendation: this.complexityRecommended === this.complexitySelected
      },
      
      // Section skips
      sections_skipped: this.sectionsSkipped,
      sections_skipped_count: this.sectionsSkipped.length
    };
  }
  
  /**
   * Format duration in human-readable format
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
  
  /**
   * Save telemetry report to file
   */
  async save() {
    if (!isTelemetryEnabled()) {
      return;
    }
    
    try {
      const report = this.generateReport();
      const telemetryDir = path.join(process.cwd(), '.telemetry');
      
      // Create telemetry directory if it doesn't exist
      await fs.mkdir(telemetryDir, { recursive: true });
      
      // Save report with timestamp
      const filename = `session-${this.sessionId}-${Date.now()}.json`;
      const filepath = path.join(telemetryDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(report, null, 2), 'utf8');
      
      // Also maintain an aggregate stats file
      await this.updateAggregateStats(report);
      
      return filepath;
    } catch (error) {
      // Silent fail - telemetry should never break the main flow
      console.error('Telemetry save failed (non-critical):', error.message);
    }
  }
  
  /**
   * Update aggregate statistics
   */
  async updateAggregateStats(report) {
    try {
      const telemetryDir = path.join(process.cwd(), '.telemetry');
      const aggregateFile = path.join(telemetryDir, 'aggregate-stats.json');
      
      let aggregate = {
        total_sessions: 0,
        templates_used: {},
        complexity_recommendations: {},
        avg_duration_ms: 0,
        avg_completion_rate: 0,
        most_skipped_tags: {},
        last_updated: null
      };
      
      // Load existing aggregate if it exists
      try {
        const existingData = await fs.readFile(aggregateFile, 'utf8');
        aggregate = JSON.parse(existingData);
      } catch (error) {
        // File doesn't exist yet, use defaults
      }
      
      // Update aggregate stats
      aggregate.total_sessions++;
      
      // Template usage
      if (report.template_used) {
        aggregate.templates_used[report.template_used] = (aggregate.templates_used[report.template_used] || 0) + 1;
      }
      
      // Complexity recommendations
      const complexityKey = report.complexity.recommended || 'none';
      aggregate.complexity_recommendations[complexityKey] = (aggregate.complexity_recommendations[complexityKey] || 0) + 1;
      
      // Update averages (rolling average)
      const n = aggregate.total_sessions;
      aggregate.avg_duration_ms = ((aggregate.avg_duration_ms * (n - 1)) + report.total_duration_ms) / n;
      aggregate.avg_completion_rate = ((aggregate.avg_completion_rate * (n - 1)) + report.questions.completion_rate) / n;
      
      // Track most skipped tags
      Object.entries(report.questions.skip_percentage_by_tag).forEach(([tag, percentage]) => {
        if (!aggregate.most_skipped_tags[tag]) {
          aggregate.most_skipped_tags[tag] = { total_skip_percentage: 0, count: 0 };
        }
        aggregate.most_skipped_tags[tag].total_skip_percentage += percentage;
        aggregate.most_skipped_tags[tag].count++;
      });
      
      aggregate.last_updated = new Date().toISOString();
      
      // Save updated aggregate
      await fs.writeFile(aggregateFile, JSON.stringify(aggregate, null, 2), 'utf8');
    } catch (error) {
      // Silent fail
      console.error('Aggregate stats update failed (non-critical):', error.message);
    }
  }
  
  /**
   * Display telemetry summary in console
   */
  displaySummary(colors) {
    if (!isTelemetryEnabled()) {
      return;
    }
    
    const report = this.generateReport();
    
    console.log(`\n${colors.dim}${colors.bold}━━━ Session Analytics ━━━${colors.reset}`);
    console.log(`${colors.dim}Total Duration: ${report.total_duration_formatted}${colors.reset}`);
    console.log(`${colors.dim}Completion Rate: ${report.questions.completion_rate}% (${report.questions.total_answered}/${report.questions.total_asked} questions)${colors.reset}`);
    
    if (report.template_used) {
      console.log(`${colors.dim}Template: ${report.template_used}${colors.reset}`);
    }
    
    if (report.complexity.recommended) {
      console.log(`${colors.dim}Complexity: ${report.complexity.recommended} (recommended) → ${report.complexity.selected} (selected)${colors.reset}`);
    }
    
    if (report.sections_skipped_count > 0) {
      console.log(`${colors.dim}Sections Skipped: ${report.sections_skipped_count}${colors.reset}`);
    }
    
    console.log(`${colors.dim}${colors.bold}━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  }
}

/**
 * Read aggregate statistics
 */
async function getAggregateStats() {
  try {
    const telemetryDir = path.join(process.cwd(), '.telemetry');
    const aggregateFile = path.join(telemetryDir, 'aggregate-stats.json');
    
    const data = await fs.readFile(aggregateFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

/**
 * Display aggregate insights
 */
async function displayAggregateInsights(colors) {
  if (!isTelemetryEnabled()) {
    return;
  }
  
  const aggregate = await getAggregateStats();
  
  if (!aggregate || aggregate.total_sessions === 0) {
    return;
  }
  
  console.log(`\n${colors.cyan}${colors.bold}📊 Aggregate Insights (${aggregate.total_sessions} sessions)${colors.reset}`);
  
  // Most popular templates
  if (Object.keys(aggregate.templates_used).length > 0) {
    const sortedTemplates = Object.entries(aggregate.templates_used)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    console.log(`\n${colors.cyan}Most Common Templates:${colors.reset}`);
    sortedTemplates.forEach(([template, count]) => {
      const percentage = Math.round((count / aggregate.total_sessions) * 100);
      console.log(`${colors.dim}  ${template}: ${count} times (${percentage}%)${colors.reset}`);
    });
  }
  
  // Most common complexity levels
  if (Object.keys(aggregate.complexity_recommendations).length > 0) {
    const sortedComplexity = Object.entries(aggregate.complexity_recommendations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    console.log(`\n${colors.cyan}Most Common Complexity Levels:${colors.reset}`);
    sortedComplexity.forEach(([level, count]) => {
      const percentage = Math.round((count / aggregate.total_sessions) * 100);
      console.log(`${colors.dim}  ${level}: ${count} times (${percentage}%)${colors.reset}`);
    });
  }
  
  // Most skipped tags
  if (Object.keys(aggregate.most_skipped_tags).length > 0) {
    const avgSkipByTag = Object.entries(aggregate.most_skipped_tags)
      .map(([tag, data]) => ({
        tag,
        avg_skip_percentage: Math.round(data.total_skip_percentage / data.count)
      }))
      .sort((a, b) => b.avg_skip_percentage - a.avg_skip_percentage)
      .slice(0, 3);
    
    console.log(`\n${colors.cyan}Tags With Highest Skip Rates:${colors.reset}`);
    avgSkipByTag.forEach(({ tag, avg_skip_percentage }) => {
      console.log(`${colors.dim}  ${tag}: ${avg_skip_percentage}% skipped on average${colors.reset}`);
    });
  }
  
  // Average metrics
  console.log(`\n${colors.cyan}Average Metrics:${colors.reset}`);
  console.log(`${colors.dim}  Session Duration: ${Math.round(aggregate.avg_duration_ms / 1000 / 60)} minutes${colors.reset}`);
  console.log(`${colors.dim}  Completion Rate: ${Math.round(aggregate.avg_completion_rate)}%${colors.reset}`);
  
  console.log('');
}

module.exports = {
  isTelemetryEnabled,
  TelemetrySession,
  getAggregateStats,
  displayAggregateInsights
};

