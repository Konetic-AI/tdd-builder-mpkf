import { AnswerMap } from './rulesEngine';
import { TagSchema } from './schemaLoader';
import { calculateAnsweredWeight } from './tagRouter';

/**
 * Complexity level thresholds (based on number of questions or weighted score)
 */
export const COMPLEXITY_THRESHOLDS = {
  base: 4,
  minimal: 10,
  standard: 20,
  comprehensive: 35,
  enterprise: 48
};

/**
 * Complexity level type
 */
export type ComplexityLevel = 'base' | 'minimal' | 'standard' | 'comprehensive' | 'enterprise';

/**
 * Risk factors that influence complexity
 */
export interface RiskFactors {
  handlesPII: boolean;
  handlesPHI: boolean;
  requiresCompliance: boolean;
  multiRegion: boolean;
  handlesPayments: boolean;
  highAvailability: boolean;
  largeScale: boolean;
  multiTenant: boolean;
  externalIntegrations: number;
  regulatedIndustry: boolean;
}

/**
 * Detects risk factors from answers
 * @param answers - Answer map
 * @param _tagSchema - Optional tag schema for industry tag detection (reserved for future use)
 * @returns RiskFactors object
 */
export function detectRiskFactors(answers: AnswerMap, _tagSchema?: any): RiskFactors {
  // Detect regulated industries from tags or answers
  const regulatedIndustries = ['healthcare', 'finance', 'fintech', 'banking', 'insurance', 'government'];
  const regulatedIndustry = Boolean(
    answers['project.industry'] && 
    typeof answers['project.industry'] === 'string' &&
    regulatedIndustries.some(industry => 
      answers['project.industry'].toLowerCase().includes(industry)
    )
  );

  // Detect PHI (Protected Health Information) - healthcare-specific
  const handlesPHI = Boolean(
    answers['privacy.regulations'] &&
    Array.isArray(answers['privacy.regulations']) &&
    (answers['privacy.regulations'].includes('hipaa') || 
     answers['privacy.regulations'].includes('hitech'))
  );

  return {
    handlesPII: answers['privacy.pii'] === true,
    handlesPHI,
    requiresCompliance: Boolean(
      answers['privacy.regulations'] && 
      Array.isArray(answers['privacy.regulations']) &&
      answers['privacy.regulations'].length > 0 &&
      !answers['privacy.regulations'].includes('none')
    ),
    multiRegion: Boolean(
      answers['cloud.regions'] && 
      Array.isArray(answers['cloud.regions']) && 
      answers['cloud.regions'].length > 1
    ),
    handlesPayments: Boolean(
      answers['privacy.regulations'] &&
      Array.isArray(answers['privacy.regulations']) &&
      answers['privacy.regulations'].includes('pci-dss')
    ),
    highAvailability: Boolean(
      answers['operations.sla'] &&
      (answers['operations.sla'] === '99.99' || answers['operations.sla'] === '99.999')
    ),
    largeScale: Boolean(
      answers['architecture.scale'] &&
      (answers['architecture.scale'] === 'large' || answers['architecture.scale'] === 'massive')
    ),
    multiTenant: Boolean(
      answers['deployment.model'] === 'hybrid' ||
      answers['architecture.multitenancy'] === true
    ),
    externalIntegrations: 0, // Would need additional questions to determine this
    regulatedIndustry
  };
}

/**
 * Calculates a complexity score based on risk factors
 * @param riskFactors - Risk factors object
 * @returns Numeric complexity score
 */
export function calculateComplexityScore(riskFactors: RiskFactors): number {
  let score = COMPLEXITY_THRESHOLDS.base;
  
  // Add points for each risk factor (weighted by impact)
  if (riskFactors.handlesPII) score += 6;
  if (riskFactors.handlesPHI) score += 8;  // PHI is higher risk than PII
  if (riskFactors.requiresCompliance) score += 8;
  if (riskFactors.multiRegion) score += 5;
  if (riskFactors.handlesPayments) score += 7;  // Payments are high-risk
  if (riskFactors.highAvailability) score += 5;
  if (riskFactors.largeScale) score += 6;
  if (riskFactors.multiTenant) score += 5;
  if (riskFactors.regulatedIndustry) score += 7;  // Regulated industries add significant complexity
  
  // Add points for external integrations
  score += riskFactors.externalIntegrations * 2;
  
  return score;
}

/**
 * Maps a complexity score to a complexity level
 * @param score - Numeric complexity score
 * @returns Complexity level name
 */
export function scoreToLevel(score: number): ComplexityLevel {
  if (score >= COMPLEXITY_THRESHOLDS.enterprise) return 'enterprise';
  if (score >= COMPLEXITY_THRESHOLDS.comprehensive) return 'comprehensive';
  if (score >= COMPLEXITY_THRESHOLDS.standard) return 'standard';
  if (score >= COMPLEXITY_THRESHOLDS.minimal) return 'minimal';
  return 'base';
}

/**
 * Recommends a complexity level based on answers
 * @param answers - Answer map
 * @param tagSchema - Optional tag schema for weighted calculation
 * @returns Recommended complexity level
 */
export function recommendLevel(
  answers: AnswerMap,
  tagSchema?: TagSchema
): ComplexityLevel {
  // Detect risk factors
  const riskFactors = detectRiskFactors(answers, tagSchema);
  
  // Calculate base score from risk factors
  const riskScore = calculateComplexityScore(riskFactors);
  
  // If tag schema is provided, factor in answered question weights
  if (tagSchema) {
    const answeredFieldIds = Object.keys(answers);
    const answeredWeight = calculateAnsweredWeight(tagSchema, answeredFieldIds);
    
    // Combine risk score and answered weight
    const totalScore = riskScore + answeredWeight;
    return scoreToLevel(totalScore);
  }
  
  // Return level based on risk score alone
  return scoreToLevel(riskScore);
}

/**
 * Gets the recommended number of questions for a complexity level
 * @param level - Complexity level
 * @returns Number of questions
 */
export function getQuestionCountForLevel(level: ComplexityLevel): number {
  return COMPLEXITY_THRESHOLDS[level];
}

/**
 * Checks if a complexity level is sufficient for the given answers
 * @param level - Complexity level to check
 * @param answers - Answer map
 * @param tagSchema - Optional tag schema
 * @returns True if level is sufficient, false if higher level recommended
 */
export function isLevelSufficient(
  level: ComplexityLevel,
  answers: AnswerMap,
  tagSchema?: TagSchema
): boolean {
  const recommended = recommendLevel(answers, tagSchema);
  const levels: ComplexityLevel[] = ['base', 'minimal', 'standard', 'comprehensive', 'enterprise'];
  
  const levelIndex = levels.indexOf(level);
  const recommendedIndex = levels.indexOf(recommended);
  
  return levelIndex >= recommendedIndex;
}

/**
 * Gets a description of what each complexity level entails
 * @param level - Complexity level
 * @returns Human-readable description
 */
export function getComplexityLevelDescription(level: ComplexityLevel): string {
  const descriptions: Record<ComplexityLevel, string> = {
    base: 'Basic project with minimal requirements (~4 questions)',
    minimal: 'Simple project with standard requirements (~10 questions)',
    standard: 'Typical project with moderate complexity (~20 questions)',
    comprehensive: 'Complex project with extensive requirements (~35 questions)',
    enterprise: 'Enterprise-grade project with full compliance and scale (~48+ questions)'
  };
  
  return descriptions[level];
}

/**
 * Exports complexity analysis results
 */
export interface ComplexityAnalysis {
  recommendedLevel: ComplexityLevel;
  riskFactors: RiskFactors;
  score: number;
  questionCount: number;
  description: string;
}

/**
 * Performs a full complexity analysis
 * @param answers - Answer map
 * @param tagSchema - Optional tag schema
 * @returns ComplexityAnalysis object
 */
export function analyzeComplexity(
  answers: AnswerMap,
  tagSchema?: TagSchema
): ComplexityAnalysis {
  const riskFactors = detectRiskFactors(answers, tagSchema);
  const score = calculateComplexityScore(riskFactors);
  const recommendedLevel = recommendLevel(answers, tagSchema);
  
  return {
    recommendedLevel,
    riskFactors,
    score,
    questionCount: getQuestionCountForLevel(recommendedLevel),
    description: getComplexityLevelDescription(recommendedLevel)
  };
}

/**
 * Gets the minimum required field count for a complexity level
 * Enforces minimum data completeness per level
 * @param level - Complexity level
 * @returns Minimum number of fields required
 */
export function getMinFieldCountForLevel(level: ComplexityLevel): number {
  const minFieldCounts: Record<ComplexityLevel, number> = {
    base: 4,        // Bare minimum: project name, problem, solution, version
    minimal: 8,     // Core + basic context
    standard: 15,   // Core + context + architecture basics
    comprehensive: 25, // Core + context + architecture + security + operations
    enterprise: 35  // Full TDD with all sections
  };
  
  return minFieldCounts[level];
}

/**
 * Checks if answers meet the minimum field count for a complexity level
 * @param level - Complexity level
 * @param answers - Answer map
 * @returns True if minimum field count is met
 */
export function meetsMinFieldCount(
  level: ComplexityLevel,
  answers: AnswerMap
): boolean {
  const providedFieldCount = Object.keys(answers).filter(
    key => answers[key] !== null && answers[key] !== undefined && answers[key] !== ''
  ).length;
  
  const minRequired = getMinFieldCountForLevel(level);
  return providedFieldCount >= minRequired;
}

/**
 * Gets the sections that should be revealed for a complexity level
 * Implements progressive disclosure - higher levels reveal more sections
 * @param level - Complexity level
 * @returns Array of section identifiers
 */
export function getSectionsForLevel(level: ComplexityLevel): string[] {
  // Base sections always included
  const baseSections = ['foundation', 'summary'];
  
  // Progressive section revealing based on complexity
  const sectionsByLevel: Record<ComplexityLevel, string[]> = {
    base: [...baseSections],
    minimal: [...baseSections, 'architecture'],
    standard: [...baseSections, 'architecture', 'operations', 'security'],
    comprehensive: [...baseSections, 'architecture', 'operations', 'security', 'privacy', 'implementation'],
    enterprise: [...baseSections, 'architecture', 'operations', 'security', 'privacy', 'implementation', 'risks', 'compliance']
  };
  
  return sectionsByLevel[level] || sectionsByLevel.base;
}

/**
 * Gets the tags that should be included for a complexity level
 * Maps complexity levels to relevant question tags
 * @param level - Complexity level
 * @returns Array of tag names
 */
export function getTagsForLevel(level: ComplexityLevel): string[] {
  const tagsByLevel: Record<ComplexityLevel, string[]> = {
    base: ['foundation'],
    minimal: ['foundation', 'architecture'],
    standard: ['foundation', 'architecture', 'operations'],
    comprehensive: ['foundation', 'architecture', 'operations', 'security', 'privacy'],
    enterprise: ['foundation', 'architecture', 'operations', 'security', 'privacy', 'compliance', 'risks']
  };
  
  return tagsByLevel[level] || tagsByLevel.base;
}

