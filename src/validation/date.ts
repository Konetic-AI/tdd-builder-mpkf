/**
 * @fileoverview Strict ISO-8601 date validation utilities
 * Implements comprehensive validation for all ISO-8601 date and datetime formats
 * with support for leap years, timezones, and edge cases.
 */

/**
 * Validation result interface
 */
export interface DateValidationResult {
  isValid: boolean;
  error?: string;
  parsedDate?: Date;
  format?: string;
}

/**
 * Supported ISO-8601 formats
 */
export const ISO8601_FORMATS = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DDTHH:mm:ss',
  DATETIME_MS: 'YYYY-MM-DDTHH:mm:ss.sss',
  DATETIME_Z: 'YYYY-MM-DDTHH:mm:ssZ',
  DATETIME_MS_Z: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  DATETIME_TZ: 'YYYY-MM-DDTHH:mm:ss±HH:mm',
  DATETIME_MS_TZ: 'YYYY-MM-DDTHH:mm:ss.sss±HH:mm',
  TIME: 'HH:mm:ss',
  TIME_MS: 'HH:mm:ss.sss',
  TIME_Z: 'HH:mm:ssZ',
  TIME_MS_Z: 'HH:mm:ss.sssZ',
  TIME_TZ: 'HH:mm:ss±HH:mm',
  TIME_MS_TZ: 'HH:mm:ss.sss±HH:mm'
} as const;

/**
 * Regular expressions for ISO-8601 formats
 */
const ISO8601_PATTERNS = {
  // Date formats
  DATE: /^(\d{4})-(\d{2})-(\d{2})$/,
  
  // DateTime formats
  DATETIME: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/,
  DATETIME_MS: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/,
  
  // DateTime with UTC timezone (Z)
  DATETIME_Z: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/,
  DATETIME_MS_Z: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/,
  
  // DateTime with timezone offset
  DATETIME_TZ: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-]\d{2}):(\d{2})$/,
  DATETIME_MS_TZ: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})([+-]\d{2}):(\d{2})$/,
  
  // Time formats (for completeness)
  TIME: /^(\d{2}):(\d{2}):(\d{2})$/,
  TIME_MS: /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/,
  TIME_Z: /^(\d{2}):(\d{2}):(\d{2})Z$/,
  TIME_MS_Z: /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/,
  TIME_TZ: /^(\d{2}):(\d{2}):(\d{2})([+-]\d{2}):(\d{2})$/,
  TIME_MS_TZ: /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})([+-]\d{2}):(\d{2})$/
} as const;

/**
 * Validates if a year is a leap year
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Gets the number of days in a month for a given year
 */
function getDaysInMonth(year: number, month: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return daysInMonth[month - 1];
}

/**
 * Validates date components
 */
function validateDateComponents(year: number, month: number, day: number): string | null {
  // Validate year range (reasonable bounds)
  if (year < 1900 || year > 2100) {
    return `Year must be between 1900 and 2100, got ${year}`;
  }
  
  // Validate month
  if (month < 1 || month > 12) {
    return `Month must be between 01 and 12, got ${month.toString().padStart(2, '0')}`;
  }
  
  // Validate day
  const maxDays = getDaysInMonth(year, month);
  if (day < 1 || day > maxDays) {
    return `Day must be between 01 and ${maxDays.toString().padStart(2, '0')} for ${year}-${month.toString().padStart(2, '0')}, got ${day.toString().padStart(2, '0')}`;
  }
  
  return null;
}

/**
 * Validates time components
 */
function validateTimeComponents(hour: number, minute: number, second: number): string | null {
  if (hour < 0 || hour > 23) {
    return `Hour must be between 00 and 23, got ${hour.toString().padStart(2, '0')}`;
  }
  
  if (minute < 0 || minute > 59) {
    return `Minute must be between 00 and 59, got ${minute.toString().padStart(2, '0')}`;
  }
  
  if (second < 0 || second > 59) {
    return `Second must be between 00 and 59, got ${second.toString().padStart(2, '0')}`;
  }
  
  return null;
}

/**
 * Validates timezone offset components
 */
function validateTimezoneOffset(sign: string, hours: number, minutes: number): string | null {
  if (hours < 0 || hours > 23) {
    return `Timezone hours must be between 00 and 23, got ${hours.toString().padStart(2, '0')}`;
  }
  
  if (minutes < 0 || minutes > 59) {
    return `Timezone minutes must be between 00 and 59, got ${minutes.toString().padStart(2, '0')}`;
  }
  
  // Validate total offset (should be <= 14 hours)
  const totalOffsetMinutes = hours * 60 + minutes;
  if (totalOffsetMinutes > 14 * 60) {
    return `Total timezone offset cannot exceed 14 hours, got ${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  return null;
}

/**
 * Validates milliseconds component
 */
function validateMilliseconds(ms: number): string | null {
  if (ms < 0 || ms > 999) {
    return `Milliseconds must be between 000 and 999, got ${ms.toString().padStart(3, '0')}`;
  }
  return null;
}

/**
 * Determines the ISO-8601 format of a date string
 */
export function detectIS8601Format(dateString: string): string | null {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }
  
  // Check each pattern and return the corresponding format
  if (ISO8601_PATTERNS.DATE.test(dateString)) return ISO8601_FORMATS.DATE;
  if (ISO8601_PATTERNS.DATETIME.test(dateString)) return ISO8601_FORMATS.DATETIME;
  if (ISO8601_PATTERNS.DATETIME_MS.test(dateString)) return ISO8601_FORMATS.DATETIME_MS;
  if (ISO8601_PATTERNS.DATETIME_Z.test(dateString)) return ISO8601_FORMATS.DATETIME_Z;
  if (ISO8601_PATTERNS.DATETIME_MS_Z.test(dateString)) return ISO8601_FORMATS.DATETIME_MS_Z;
  if (ISO8601_PATTERNS.DATETIME_TZ.test(dateString)) return ISO8601_FORMATS.DATETIME_TZ;
  if (ISO8601_PATTERNS.DATETIME_MS_TZ.test(dateString)) return ISO8601_FORMATS.DATETIME_MS_TZ;
  if (ISO8601_PATTERNS.TIME.test(dateString)) return ISO8601_FORMATS.TIME;
  if (ISO8601_PATTERNS.TIME_MS.test(dateString)) return ISO8601_FORMATS.TIME_MS;
  if (ISO8601_PATTERNS.TIME_Z.test(dateString)) return ISO8601_FORMATS.TIME_Z;
  if (ISO8601_PATTERNS.TIME_MS_Z.test(dateString)) return ISO8601_FORMATS.TIME_MS_Z;
  if (ISO8601_PATTERNS.TIME_TZ.test(dateString)) return ISO8601_FORMATS.TIME_TZ;
  if (ISO8601_PATTERNS.TIME_MS_TZ.test(dateString)) return ISO8601_FORMATS.TIME_MS_TZ;
  
  return null;
}

/**
 * Validates a date string against ISO-8601 standards
 */
export function validateIS8601Date(dateString: string): DateValidationResult {
  // Basic input validation
  if (!dateString || typeof dateString !== 'string') {
    return {
      isValid: false,
      error: 'Date string must be a non-empty string'
    };
  }
  
  // Detect format
  const format = detectIS8601Format(dateString);
  if (!format) {
    return {
      isValid: false,
      error: `Invalid ISO-8601 format. Supported formats: ${Object.values(ISO8601_FORMATS).join(', ')}`
    };
  }
  
  // Parse based on format
  let year: number, month: number, day: number;
  let hour: number = 0, minute: number = 0, second: number = 0, milliseconds: number = 0;
  let timezoneSign: string = '+', timezoneHours: number = 0, timezoneMinutes: number = 0;
  
  try {
    switch (format) {
      case ISO8601_FORMATS.DATE: {
        const match = dateString.match(ISO8601_PATTERNS.DATE);
        if (!match) throw new Error('Failed to parse date');
        [, year, month, day] = match.map(Number);
        break;
      }
      
      case ISO8601_FORMATS.DATETIME: {
        const match = dateString.match(ISO8601_PATTERNS.DATETIME);
        if (!match) throw new Error('Failed to parse datetime');
        [, year, month, day, hour, minute, second] = match.map(Number);
        break;
      }
      
      case ISO8601_FORMATS.DATETIME_MS: {
        const match = dateString.match(ISO8601_PATTERNS.DATETIME_MS);
        if (!match) throw new Error('Failed to parse datetime with milliseconds');
        [, year, month, day, hour, minute, second, milliseconds] = match.map(Number);
        break;
      }
      
      case ISO8601_FORMATS.DATETIME_Z: {
        const match = dateString.match(ISO8601_PATTERNS.DATETIME_Z);
        if (!match) throw new Error('Failed to parse datetime with Z');
        [, year, month, day, hour, minute, second] = match.map(Number);
        timezoneSign = 'Z';
        break;
      }
      
      case ISO8601_FORMATS.DATETIME_MS_Z: {
        const match = dateString.match(ISO8601_PATTERNS.DATETIME_MS_Z);
        if (!match) throw new Error('Failed to parse datetime with milliseconds and Z');
        [, year, month, day, hour, minute, second, milliseconds] = match.map(Number);
        timezoneSign = 'Z';
        break;
      }
      
      case ISO8601_FORMATS.DATETIME_TZ: {
        const match = dateString.match(ISO8601_PATTERNS.DATETIME_TZ);
        if (!match) throw new Error('Failed to parse datetime with timezone');
        timezoneSign = match[7];
        [, year, month, day, hour, minute, second, , timezoneHours, timezoneMinutes] = match.map(Number);
        break;
      }
      
      case ISO8601_FORMATS.DATETIME_MS_TZ: {
        const match = dateString.match(ISO8601_PATTERNS.DATETIME_MS_TZ);
        if (!match) throw new Error('Failed to parse datetime with milliseconds and timezone');
        timezoneSign = match[8];
        [, year, month, day, hour, minute, second, milliseconds, , timezoneHours, timezoneMinutes] = match.map(Number);
        break;
      }
      
      default:
        // For time-only formats, we'll create a date with today's date
        return {
          isValid: true,
          format,
          parsedDate: new Date(dateString) // Let JavaScript handle time-only parsing
        };
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to parse date string: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
  
  // Validate date components
  const dateError = validateDateComponents(year, month, day);
  if (dateError) {
    return {
      isValid: false,
      error: dateError
    };
  }
  
  // Validate time components (if present)
  if (format.includes('T')) {
    const timeError = validateTimeComponents(hour, minute, second);
    if (timeError) {
      return {
        isValid: false,
        error: timeError
      };
    }
    
    // Validate milliseconds (if present)
    if (format.includes('.')) {
      const msError = validateMilliseconds(milliseconds);
      if (msError) {
        return {
          isValid: false,
          error: msError
        };
      }
    }
    
    // Validate timezone (if present)
    if (timezoneSign !== '+') {
      if (timezoneSign === 'Z') {
        // UTC timezone is always valid
      } else {
        const tzError = validateTimezoneOffset(timezoneSign, timezoneHours, timezoneMinutes);
        if (tzError) {
          return {
            isValid: false,
            error: tzError
          };
        }
      }
    }
  }
  
  // Create the date object
  let date: Date;
  try {
    date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: 'Invalid date - JavaScript Date constructor could not parse the string'
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to create Date object: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
  
  return {
    isValid: true,
    format,
    parsedDate: date
  };
}

/**
 * Convenience function that returns only boolean validation result
 */
export function isValidIS8601Date(dateString: string): boolean {
  return validateIS8601Date(dateString).isValid;
}

/**
 * Validates multiple date fields in an object
 */
export function validateDateFields(
  data: Record<string, any>,
  dateFields: string[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const field of dateFields) {
    const value = data[field];
    if (value !== undefined && value !== null && value !== '') {
      const result = validateIS8601Date(value);
      if (!result.isValid) {
        errors.push(`${field}: ${result.error}`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gets a list of all supported ISO-8601 formats
 */
export function getSupportedFormats(): string[] {
  return Object.values(ISO8601_FORMATS);
}

/**
 * Checks if a format is supported
 */
export function isFormatSupported(format: string): boolean {
  return Object.values(ISO8601_FORMATS).includes(format as any);
}
