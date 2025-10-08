/**
 * @fileoverview Feature flag configuration for TDD Builder MPKF Tool
 * Manages feature toggles between legacy and schema-driven code paths
 */

/**
 * Feature flag configuration
 */
export interface FeatureFlags {
  /** Enable schema-driven onboarding flow (default: false for legacy compatibility) */
  SCHEMA_DRIVEN_ONBOARDING: boolean;
}

/**
 * Get the current feature flag configuration
 * Checks environment variables and CLI overrides
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    SCHEMA_DRIVEN_ONBOARDING: process.env.SCHEMA_DRIVEN_ONBOARDING === 'true'
  };
}

/**
 * Check if schema-driven onboarding is enabled
 * @returns true if schema-driven path should be used
 */
export function isSchemaOnboardingEnabled(): boolean {
  return getFeatureFlags().SCHEMA_DRIVEN_ONBOARDING;
}

/**
 * Set the schema-driven onboarding flag (for testing and CLI overrides)
 * @param enabled - Whether to enable schema-driven onboarding
 */
export function setSchemaOnboardingEnabled(enabled: boolean): void {
  process.env.SCHEMA_DRIVEN_ONBOARDING = enabled ? 'true' : 'false';
}

/**
 * Get a human-readable description of the current mode
 * @returns Description of the current operational mode
 */
export function getCurrentModeDescription(): string {
  return isSchemaOnboardingEnabled()
    ? 'Schema-Driven Mode: Using Pre-TDD Client Questionnaire v2.0 schema'
    : 'Legacy Mode: Using hardcoded question sets';
}

/**
 * Check if all required modules are available for schema-driven mode
 * @returns true if schema-driven mode dependencies are available
 */
export function canUseSchemaMode(): boolean {
  try {
    // Check if compiled TypeScript modules are available
    require('../../dist/src/lib/schemaLoader');
    require('../../dist/src/lib/rulesEngine');
    require('../../dist/src/lib/complexity');
    require('../../dist/src/lib/tagRouter');
    require('../../dist/src/lib/validateAnswer');
    require('../../dist/src/handlers/generateTdd');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate feature flag configuration
 * Throws an error if schema mode is requested but dependencies are unavailable
 */
export function validateFeatureFlags(): void {
  if (isSchemaOnboardingEnabled() && !canUseSchemaMode()) {
    throw new Error(
      'SCHEMA_DRIVEN_ONBOARDING is enabled but required TypeScript modules are not compiled. ' +
      'Please run "npm run build" to compile TypeScript modules, or set SCHEMA_DRIVEN_ONBOARDING=false.'
    );
  }
}

