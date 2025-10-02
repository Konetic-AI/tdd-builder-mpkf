/**
 * @fileoverview Comprehensive unit tests for ISO-8601 date validation (JavaScript version)
 * Tests valid/invalid dates, leap years, timezones, and edge cases
 */

const {
  validateIS8601Date,
  isValidIS8601Date,
  detectIS8601Format,
  validateDateFields,
  getSupportedFormats,
  isFormatSupported,
  ISO8601_FORMATS
} = require('./date');

describe('ISO-8601 Date Validation', () => {
  describe('validateIS8601Date', () => {
    describe('Valid Date Formats', () => {
      test('should validate basic date format (YYYY-MM-DD)', () => {
        const result = validateIS8601Date('2025-01-15');
        expect(result.isValid).toBe(true);
        expect(result.format).toBe(ISO8601_FORMATS.DATE);
        expect(result.parsedDate).toBeInstanceOf(Date);
        expect(result.parsedDate.getFullYear()).toBe(2025);
        expect(result.parsedDate.getMonth()).toBe(0); // January is 0
        expect(result.parsedDate.getDate()).toBe(15);
      });

      test('should validate datetime format (YYYY-MM-DDTHH:mm:ss)', () => {
        const result = validateIS8601Date('2025-01-15T14:30:45');
        expect(result.isValid).toBe(true);
        expect(result.format).toBe(ISO8601_FORMATS.DATETIME);
        expect(result.parsedDate).toBeInstanceOf(Date);
      });

      test('should validate datetime with milliseconds (YYYY-MM-DDTHH:mm:ss.sss)', () => {
        const result = validateIS8601Date('2025-01-15T14:30:45.123');
        expect(result.isValid).toBe(true);
        expect(result.format).toBe(ISO8601_FORMATS.DATETIME_MS);
        expect(result.parsedDate).toBeInstanceOf(Date);
      });

      test('should validate datetime with Z timezone (YYYY-MM-DDTHH:mm:ssZ)', () => {
        const result = validateIS8601Date('2025-01-15T14:30:45Z');
        expect(result.isValid).toBe(true);
        expect(result.format).toBe(ISO8601_FORMATS.DATETIME_Z);
        expect(result.parsedDate).toBeInstanceOf(Date);
      });

      test('should validate datetime with milliseconds and Z (YYYY-MM-DDTHH:mm:ss.sssZ)', () => {
        const result = validateIS8601Date('2025-01-15T14:30:45.123Z');
        expect(result.isValid).toBe(true);
        expect(result.format).toBe(ISO8601_FORMATS.DATETIME_MS_Z);
        expect(result.parsedDate).toBeInstanceOf(Date);
      });

      test('should validate datetime with positive timezone offset', () => {
        const result = validateIS8601Date('2025-01-15T14:30:45+05:30');
        expect(result.isValid).toBe(true);
        expect(result.format).toBe(ISO8601_FORMATS.DATETIME_TZ);
        expect(result.parsedDate).toBeInstanceOf(Date);
      });

      test('should validate datetime with negative timezone offset', () => {
        const result = validateIS8601Date('2025-01-15T14:30:45-08:00');
        expect(result.isValid).toBe(true);
        expect(result.format).toBe(ISO8601_FORMATS.DATETIME_TZ);
        expect(result.parsedDate).toBeInstanceOf(Date);
      });

      test('should validate datetime with milliseconds and timezone', () => {
        const result = validateIS8601Date('2025-01-15T14:30:45.123+02:00');
        expect(result.isValid).toBe(true);
        expect(result.format).toBe(ISO8601_FORMATS.DATETIME_MS_TZ);
        expect(result.parsedDate).toBeInstanceOf(Date);
      });
    });

    describe('Leap Year Validation', () => {
      test('should validate leap year dates', () => {
        const leapYears = ['2020-02-29', '2000-02-29', '2024-02-29'];
        
        leapYears.forEach(date => {
          const result = validateIS8601Date(date);
          expect(result.isValid).toBe(true);
          expect(result.error).toBeUndefined();
        });
      });

      test('should reject invalid leap year dates', () => {
        const invalidLeapYears = ['2021-02-29', '2022-02-29', '1900-02-29'];
        
        invalidLeapYears.forEach(date => {
          const result = validateIS8601Date(date);
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('Day must be between 01 and 28');
        });
      });

      test('should handle century leap years correctly', () => {
        // 2000 is a leap year (divisible by 400)
        expect(validateIS8601Date('2000-02-29').isValid).toBe(true);
        
        // 1900 is not a leap year (divisible by 100 but not 400)
        expect(validateIS8601Date('1900-02-29').isValid).toBe(false);
        
        // 2100 is not a leap year (divisible by 100 but not 400)
        expect(validateIS8601Date('2100-02-29').isValid).toBe(false);
      });
    });

    describe('Invalid Date Formats', () => {
      test('should reject invalid month values', () => {
        const invalidMonths = ['2025-00-15', '2025-13-15', '2025-99-15'];
        
        invalidMonths.forEach(date => {
          const result = validateIS8601Date(date);
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('Month must be between 01 and 12');
        });
      });

      test('should reject invalid day values', () => {
        const invalidDays = ['2025-01-00', '2025-01-32', '2025-04-31'];
        
        invalidDays.forEach(date => {
          const result = validateIS8601Date(date);
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('Day must be between 01 and');
        });
      });

      test('should reject invalid year values', () => {
        const invalidYears = ['1899-01-15', '2101-01-15', '999-01-15'];
        
        invalidYears.forEach(date => {
          const result = validateIS8601Date(date);
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('Year must be between 1900 and 2100');
        });
      });

      test('should reject invalid hour values', () => {
        const invalidHours = ['2025-01-15T24:30:45', '2025-01-15T99:30:45', '2025-01-15T-1:30:45'];
        
        invalidHours.forEach(date => {
          const result = validateIS8601Date(date);
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('Hour must be between 00 and 23');
        });
      });

      test('should reject invalid minute values', () => {
        const invalidMinutes = ['2025-01-15T14:60:45', '2025-01-15T14:99:45', '2025-01-15T14:-1:45'];
        
        invalidMinutes.forEach(date => {
          const result = validateIS8601Date(date);
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('Minute must be between 00 and 59');
        });
      });

      test('should reject invalid second values', () => {
        const invalidSeconds = ['2025-01-15T14:30:60', '2025-01-15T14:30:99', '2025-01-15T14:30:-1'];
        
        invalidSeconds.forEach(date => {
          const result = validateIS8601Date(date);
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('Second must be between 00 and 59');
        });
      });

      test('should reject invalid millisecond values', () => {
        const invalidMilliseconds = ['2025-01-15T14:30:45.1000', '2025-01-15T14:30:45.9999', '2025-01-15T14:30:45.-1'];
        
        invalidMilliseconds.forEach(date => {
          const result = validateIS8601Date(date);
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('Milliseconds must be between 000 and 999');
        });
      });

      test('should reject invalid timezone offset values', () => {
        const invalidTimezones = ['2025-01-15T14:30:45+25:00', '2025-01-15T14:30:45+15:00', '2025-01-15T14:30:45+05:60'];
        
        invalidTimezones.forEach(date => {
          const result = validateIS8601Date(date);
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('Timezone');
        });
      });

      test('should reject malformed date strings', () => {
        const malformedDates = [
          '2025/01/15',
          '15-01-2025',
          '2025-1-15',
          '2025-01-15 14:30:45',
          '2025-01-15T14:30',
          '2025-01-15T14:30:45.',
          '2025-01-15T14:30:45Z+05:00',
          '2025-01-15T14:30:45+05',
          'not-a-date',
          '',
          '2025-13-45'
        ];
        
        malformedDates.forEach(date => {
          const result = validateIS8601Date(date);
          expect(result.isValid).toBe(false);
          expect(result.error).toBeDefined();
        });
      });
    });

    describe('Edge Cases', () => {
      test('should handle minimum valid date', () => {
        const result = validateIS8601Date('1900-01-01');
        expect(result.isValid).toBe(true);
      });

      test('should handle maximum valid date', () => {
        const result = validateIS8601Date('2100-12-31');
        expect(result.isValid).toBe(true);
      });

      test('should handle midnight time', () => {
        const result = validateIS8601Date('2025-01-15T00:00:00');
        expect(result.isValid).toBe(true);
      });

      test('should handle end of day time', () => {
        const result = validateIS8601Date('2025-01-15T23:59:59');
        expect(result.isValid).toBe(true);
      });

      test('should handle maximum timezone offset', () => {
        const result = validateIS8601Date('2025-01-15T14:30:45+14:00');
        expect(result.isValid).toBe(true);
      });

      test('should handle minimum timezone offset', () => {
        const result = validateIS8601Date('2025-01-15T14:30:45-12:00');
        expect(result.isValid).toBe(true);
      });

      test('should reject timezone offset exceeding 14 hours', () => {
        const result = validateIS8601Date('2025-01-15T14:30:45+15:00');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Total timezone offset cannot exceed 14 hours');
      });
    });

    describe('Input Validation', () => {
      test('should reject null input', () => {
        const result = validateIS8601Date(null);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Date string must be a non-empty string');
      });

      test('should reject undefined input', () => {
        const result = validateIS8601Date(undefined);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Date string must be a non-empty string');
      });

      test('should reject empty string', () => {
        const result = validateIS8601Date('');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Date string must be a non-empty string');
      });

      test('should reject non-string input', () => {
        const result = validateIS8601Date(123);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Date string must be a non-empty string');
      });
    });
  });

  describe('isValidIS8601Date', () => {
    test('should return true for valid dates', () => {
      expect(isValidIS8601Date('2025-01-15')).toBe(true);
      expect(isValidIS8601Date('2025-01-15T14:30:45')).toBe(true);
      expect(isValidIS8601Date('2025-01-15T14:30:45.123Z')).toBe(true);
    });

    test('should return false for invalid dates', () => {
      expect(isValidIS8601Date('2025-13-45')).toBe(false);
      expect(isValidIS8601Date('not-a-date')).toBe(false);
      expect(isValidIS8601Date('')).toBe(false);
    });
  });

  describe('detectIS8601Format', () => {
    test('should detect correct formats', () => {
      expect(detectIS8601Format('2025-01-15')).toBe(ISO8601_FORMATS.DATE);
      expect(detectIS8601Format('2025-01-15T14:30:45')).toBe(ISO8601_FORMATS.DATETIME);
      expect(detectIS8601Format('2025-01-15T14:30:45.123')).toBe(ISO8601_FORMATS.DATETIME_MS);
      expect(detectIS8601Format('2025-01-15T14:30:45Z')).toBe(ISO8601_FORMATS.DATETIME_Z);
      expect(detectIS8601Format('2025-01-15T14:30:45.123Z')).toBe(ISO8601_FORMATS.DATETIME_MS_Z);
      expect(detectIS8601Format('2025-01-15T14:30:45+05:30')).toBe(ISO8601_FORMATS.DATETIME_TZ);
      expect(detectIS8601Format('2025-01-15T14:30:45.123+05:30')).toBe(ISO8601_FORMATS.DATETIME_MS_TZ);
    });

    test('should return null for invalid formats', () => {
      expect(detectIS8601Format('2025/01/15')).toBeNull();
      expect(detectIS8601Format('not-a-date')).toBeNull();
      expect(detectIS8601Format('')).toBeNull();
      expect(detectIS8601Format(null)).toBeNull();
    });
  });

  describe('validateDateFields', () => {
    test('should validate multiple date fields', () => {
      const data = {
        'doc.created_date': '2025-01-15',
        'doc.updated_date': '2025-01-16',
        'project.start_date': '2025-02-01',
        'invalid_date': '2025-13-45',
        'empty_date': '',
        'null_date': null
      };

      const result = validateDateFields(data, ['doc.created_date', 'doc.updated_date', 'project.start_date', 'invalid_date']);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('invalid_date');
    });

    test('should return valid for all valid dates', () => {
      const data = {
        'doc.created_date': '2025-01-15',
        'doc.updated_date': '2025-01-16',
        'project.start_date': '2025-02-01'
      };

      const result = validateDateFields(data, ['doc.created_date', 'doc.updated_date', 'project.start_date']);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should skip undefined/null/empty values', () => {
      const data = {
        'doc.created_date': '2025-01-15',
        'doc.updated_date': undefined,
        'project.start_date': null,
        'project.end_date': ''
      };

      const result = validateDateFields(data, ['doc.created_date', 'doc.updated_date', 'project.start_date', 'project.end_date']);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('getSupportedFormats', () => {
    test('should return all supported formats', () => {
      const formats = getSupportedFormats();
      expect(formats).toContain(ISO8601_FORMATS.DATE);
      expect(formats).toContain(ISO8601_FORMATS.DATETIME);
      expect(formats).toContain(ISO8601_FORMATS.DATETIME_MS);
      expect(formats).toContain(ISO8601_FORMATS.DATETIME_Z);
      expect(formats).toContain(ISO8601_FORMATS.DATETIME_MS_Z);
      expect(formats).toContain(ISO8601_FORMATS.DATETIME_TZ);
      expect(formats).toContain(ISO8601_FORMATS.DATETIME_MS_TZ);
      expect(formats).toHaveLength(13); // All formats
    });
  });

  describe('isFormatSupported', () => {
    test('should return true for supported formats', () => {
      expect(isFormatSupported(ISO8601_FORMATS.DATE)).toBe(true);
      expect(isFormatSupported(ISO8601_FORMATS.DATETIME)).toBe(true);
      expect(isFormatSupported(ISO8601_FORMATS.DATETIME_Z)).toBe(true);
    });

    test('should return false for unsupported formats', () => {
      expect(isFormatSupported('YYYY/MM/DD')).toBe(false);
      expect(isFormatSupported('MM-DD-YYYY')).toBe(false);
      expect(isFormatSupported('invalid-format')).toBe(false);
    });
  });

  describe('Timezone Edge Cases', () => {
    test('should handle various timezone offsets', () => {
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
        const result = validateIS8601Date(timezone);
        expect(result.isValid).toBe(true);
      });
    });

    test('should handle fractional timezone offsets correctly', () => {
      // Note: ISO-8601 doesn't support fractional timezone offsets like +05:30:45
      // But we should handle the standard +05:30 format
      const result = validateIS8601Date('2025-01-15T14:30:45+05:30');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Real-world Date Scenarios', () => {
    test('should handle common business dates', () => {
      const businessDates = [
        '2025-01-01', // New Year
        '2025-02-29', // Leap year
        '2025-12-31', // New Year's Eve
        '2025-06-15T09:00:00', // Business start time
        '2025-06-15T17:30:00Z', // Business end time UTC
        '2025-06-15T12:00:00+05:30', // Noon IST
        '2025-06-15T00:00:00.000Z' // Midnight UTC
      ];

      businessDates.forEach(date => {
        const result = validateIS8601Date(date);
        expect(result.isValid).toBe(true);
      });
    });

    test('should handle system timestamps', () => {
      const timestamps = [
        '2025-01-15T14:30:45.123Z', // ISO timestamp with milliseconds
        '2025-01-15T14:30:45Z', // ISO timestamp without milliseconds
        '2025-01-15T14:30:45.999Z' // ISO timestamp with maximum milliseconds
      ];

      timestamps.forEach(timestamp => {
        const result = validateIS8601Date(timestamp);
        expect(result.isValid).toBe(true);
      });
    });
  });
});
