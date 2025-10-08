/**
 * @fileoverview Tests for Luxon-based ISO-8601 date validation
 */

import { validateISODate, validateISODateDetailed } from './iso';

describe('ISO-8601 Date Validation (Luxon)', () => {
  describe('validateISODate', () => {
    describe('Valid Formats', () => {
      test('should validate date with positive timezone offset', () => {
        expect(validateISODate('2025-10-08T02:00:00+05:00')).toBe(true);
      });

      test('should validate date with negative timezone offset', () => {
        expect(validateISODate('2025-10-08T02:00:00-03:00')).toBe(true);
      });

      test('should validate date with Z (UTC) notation', () => {
        expect(validateISODate('2025-10-08T02:00:00Z')).toBe(true);
      });

      test('should validate basic date format', () => {
        expect(validateISODate('2025-01-15')).toBe(true);
      });

      test('should validate datetime without timezone', () => {
        expect(validateISODate('2025-01-15T14:30:45')).toBe(true);
      });

      test('should validate datetime with milliseconds and Z', () => {
        expect(validateISODate('2025-01-15T14:30:45.123Z')).toBe(true);
      });

      test('should validate datetime with milliseconds and timezone offset', () => {
        expect(validateISODate('2025-01-15T14:30:45.123+02:00')).toBe(true);
      });

      test('should validate various timezone offsets', () => {
        const timezones = [
          '2025-01-15T14:30:45+00:00', // UTC
          '2025-01-15T14:30:45+01:00', // CET
          '2025-01-15T14:30:45+05:30', // IST
          '2025-01-15T14:30:45-05:00', // EST
          '2025-01-15T14:30:45-08:00', // PST
          '2025-01-15T14:30:45+09:30', // ACST
          '2025-01-15T14:30:45-12:00', // IDLW
          '2025-01-15T14:30:45+14:00'  // LINT
        ];

        timezones.forEach(timezone => {
          expect(validateISODate(timezone)).toBe(true);
        });
      });

      test('should validate leap year dates', () => {
        expect(validateISODate('2020-02-29')).toBe(true);
        expect(validateISODate('2024-02-29')).toBe(true);
        expect(validateISODate('2000-02-29')).toBe(true);
      });
    });

    describe('Invalid Formats', () => {
      test('should reject non-date string', () => {
        expect(validateISODate('not-a-date')).toBe(false);
      });

      test('should reject empty string', () => {
        expect(validateISODate('')).toBe(false);
      });

      test('should reject invalid date components', () => {
        expect(validateISODate('2025-13-01')).toBe(false); // Invalid month
        expect(validateISODate('2025-02-30')).toBe(false); // Invalid day
        expect(validateISODate('2021-02-29')).toBe(false); // Non-leap year
      });

      test('should reject malformed formats', () => {
        expect(validateISODate('2025/01/15')).toBe(false);
        expect(validateISODate('15-01-2025')).toBe(false);
        expect(validateISODate('2025-01-15 14:30:45')).toBe(false); // Space instead of T
      });

      test('should reject null and undefined', () => {
        expect(validateISODate(null as any)).toBe(false);
        expect(validateISODate(undefined as any)).toBe(false);
      });

      test('should reject non-string input', () => {
        expect(validateISODate(123 as any)).toBe(false);
        expect(validateISODate({} as any)).toBe(false);
      });
    });
  });

  describe('validateISODateDetailed', () => {
    test('should return detailed result for valid date', () => {
      const result = validateISODateDetailed('2025-10-08T02:00:00+05:00');
      expect(result.isValid).toBe(true);
      expect(result.dateTime).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('should return error message for invalid date', () => {
      const result = validateISODateDetailed('not-a-date');
      expect(result.isValid).toBe(false);
      expect(result.dateTime).toBeUndefined();
      expect(result.error).toBeDefined();
    });

    test('should handle empty string', () => {
      const result = validateISODateDetailed('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Input must be a non-empty string');
    });

    test('should handle null input', () => {
      const result = validateISODateDetailed(null as any);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Input must be a non-empty string');
    });

    test('should preserve timezone information', () => {
      const result = validateISODateDetailed('2025-10-08T02:00:00+05:00');
      expect(result.isValid).toBe(true);
      expect(result.dateTime?.zoneName).toBeDefined();
    });

    test('should handle Z notation', () => {
      const result = validateISODateDetailed('2025-10-08T02:00:00Z');
      expect(result.isValid).toBe(true);
      expect(result.dateTime?.zoneName).toBe('UTC');
    });
  });

  describe('Real-world Date Scenarios', () => {
    test('should handle common business dates', () => {
      const businessDates = [
        '2025-01-01',
        '2025-12-31',
        '2025-06-15T09:00:00',
        '2025-06-15T17:30:00Z',
        '2025-06-15T12:00:00+05:30',
        '2025-06-15T00:00:00.000Z'
      ];

      businessDates.forEach(date => {
        expect(validateISODate(date)).toBe(true);
      });
    });

    test('should handle system timestamps', () => {
      const timestamps = [
        '2025-01-15T14:30:45.123Z',
        '2025-01-15T14:30:45Z',
        '2025-01-15T14:30:45.999Z'
      ];

      timestamps.forEach(timestamp => {
        expect(validateISODate(timestamp)).toBe(true);
      });
    });
  });
});

