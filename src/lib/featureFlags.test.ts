/**
 * @fileoverview Tests for feature flag configuration
 */

import {
  getFeatureFlags,
  isSchemaOnboardingEnabled,
  setSchemaOnboardingEnabled,
  getCurrentModeDescription,
  canUseSchemaMode,
  validateFeatureFlags
} from './featureFlags';

describe('Feature Flags', () => {
  // Store original env var
  const originalEnv = process.env.SCHEMA_DRIVEN_ONBOARDING;

  beforeEach(() => {
    // Reset to default state before each test
    delete process.env.SCHEMA_DRIVEN_ONBOARDING;
  });

  afterEach(() => {
    // Restore original env var after each test
    if (originalEnv !== undefined) {
      process.env.SCHEMA_DRIVEN_ONBOARDING = originalEnv;
    } else {
      delete process.env.SCHEMA_DRIVEN_ONBOARDING;
    }
  });

  describe('getFeatureFlags', () => {
    it('should return false for SCHEMA_DRIVEN_ONBOARDING by default', () => {
      const flags = getFeatureFlags();
      expect(flags.SCHEMA_DRIVEN_ONBOARDING).toBe(false);
    });

    it('should return true when env var is set to "true"', () => {
      process.env.SCHEMA_DRIVEN_ONBOARDING = 'true';
      const flags = getFeatureFlags();
      expect(flags.SCHEMA_DRIVEN_ONBOARDING).toBe(true);
    });

    it('should return false when env var is set to anything other than "true"', () => {
      process.env.SCHEMA_DRIVEN_ONBOARDING = 'false';
      expect(getFeatureFlags().SCHEMA_DRIVEN_ONBOARDING).toBe(false);

      process.env.SCHEMA_DRIVEN_ONBOARDING = '1';
      expect(getFeatureFlags().SCHEMA_DRIVEN_ONBOARDING).toBe(false);

      process.env.SCHEMA_DRIVEN_ONBOARDING = 'yes';
      expect(getFeatureFlags().SCHEMA_DRIVEN_ONBOARDING).toBe(false);
    });
  });

  describe('isSchemaOnboardingEnabled', () => {
    it('should return false by default', () => {
      expect(isSchemaOnboardingEnabled()).toBe(false);
    });

    it('should return true when env var is "true"', () => {
      process.env.SCHEMA_DRIVEN_ONBOARDING = 'true';
      expect(isSchemaOnboardingEnabled()).toBe(true);
    });

    it('should return false when env var is "false"', () => {
      process.env.SCHEMA_DRIVEN_ONBOARDING = 'false';
      expect(isSchemaOnboardingEnabled()).toBe(false);
    });
  });

  describe('setSchemaOnboardingEnabled', () => {
    it('should set env var to "true" when enabled', () => {
      setSchemaOnboardingEnabled(true);
      expect(process.env.SCHEMA_DRIVEN_ONBOARDING).toBe('true');
      expect(isSchemaOnboardingEnabled()).toBe(true);
    });

    it('should set env var to "false" when disabled', () => {
      setSchemaOnboardingEnabled(false);
      expect(process.env.SCHEMA_DRIVEN_ONBOARDING).toBe('false');
      expect(isSchemaOnboardingEnabled()).toBe(false);
    });

    it('should allow toggling between states', () => {
      setSchemaOnboardingEnabled(true);
      expect(isSchemaOnboardingEnabled()).toBe(true);

      setSchemaOnboardingEnabled(false);
      expect(isSchemaOnboardingEnabled()).toBe(false);

      setSchemaOnboardingEnabled(true);
      expect(isSchemaOnboardingEnabled()).toBe(true);
    });
  });

  describe('getCurrentModeDescription', () => {
    it('should return legacy mode description by default', () => {
      const description = getCurrentModeDescription();
      expect(description).toContain('Legacy Mode');
      expect(description.toLowerCase()).toContain('hardcoded');
    });

    it('should return schema-driven mode description when enabled', () => {
      process.env.SCHEMA_DRIVEN_ONBOARDING = 'true';
      const description = getCurrentModeDescription();
      expect(description).toContain('Schema-Driven Mode');
      expect(description.toLowerCase()).toContain('schema');
    });
  });

  describe('canUseSchemaMode', () => {
    it('should check for TypeScript module availability', () => {
      const canUse = canUseSchemaMode();
      // This will depend on whether modules are built or not
      expect(typeof canUse).toBe('boolean');
    });
  });

  describe('validateFeatureFlags', () => {
    it('should not throw when schema mode is disabled', () => {
      process.env.SCHEMA_DRIVEN_ONBOARDING = 'false';
      expect(() => validateFeatureFlags()).not.toThrow();
    });

    it('should not throw when schema mode is enabled and modules are available', () => {
      if (canUseSchemaMode()) {
        process.env.SCHEMA_DRIVEN_ONBOARDING = 'true';
        expect(() => validateFeatureFlags()).not.toThrow();
      }
    });

    it('should throw when schema mode is enabled but modules are unavailable', () => {
      // Only test if modules are actually unavailable
      if (!canUseSchemaMode()) {
        process.env.SCHEMA_DRIVEN_ONBOARDING = 'true';
        expect(() => validateFeatureFlags()).toThrow(/required TypeScript modules/);
      }
    });
  });

  describe('Integration scenarios', () => {
    it('should support CLI --legacy flag override pattern', () => {
      // Simulate env var being set
      process.env.SCHEMA_DRIVEN_ONBOARDING = 'true';
      expect(isSchemaOnboardingEnabled()).toBe(true);

      // Simulate --legacy flag setting it to false
      setSchemaOnboardingEnabled(false);
      expect(isSchemaOnboardingEnabled()).toBe(false);
    });

    it('should support gradual migration pattern', () => {
      // Start in legacy mode
      expect(isSchemaOnboardingEnabled()).toBe(false);

      // Enable schema mode for testing
      setSchemaOnboardingEnabled(true);
      expect(isSchemaOnboardingEnabled()).toBe(true);
      expect(getCurrentModeDescription()).toContain('Schema-Driven');

      // Can revert back to legacy
      setSchemaOnboardingEnabled(false);
      expect(isSchemaOnboardingEnabled()).toBe(false);
      expect(getCurrentModeDescription()).toContain('Legacy');
    });
  });

  describe('Default behavior', () => {
    it('should default to legacy mode for backward compatibility', () => {
      delete process.env.SCHEMA_DRIVEN_ONBOARDING;
      expect(isSchemaOnboardingEnabled()).toBe(false);
    });

    it('should require explicit "true" string to enable schema mode', () => {
      // Various truthy values that should NOT enable schema mode
      const falsyVariations = ['True', 'TRUE', '1', 'yes', 'on', 'enabled'];
      
      falsyVariations.forEach(value => {
        process.env.SCHEMA_DRIVEN_ONBOARDING = value;
        expect(isSchemaOnboardingEnabled()).toBe(false);
      });

      // Only exact "true" string should work
      process.env.SCHEMA_DRIVEN_ONBOARDING = 'true';
      expect(isSchemaOnboardingEnabled()).toBe(true);
    });
  });
});

