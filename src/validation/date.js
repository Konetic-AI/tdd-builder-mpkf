/**
 * @fileoverview Strict ISO-8601 date validation utilities (JavaScript version)
 * Implements comprehensive validation for all ISO-8601 date and datetime formats
 * with support for leap years, timezones, and edge cases.
 */

/**
 * Validation result object
 * @typedef {Object} DateValidationResult
 * @property {boolean} isValid - Whether the date is valid
 * @property {string} [error] - Error message if invalid
 * @property {Date} [parsedDate] - Parsed Date object if valid
 * @property {string} [format] - Detected ISO-8601 format
 */

/**
 * Supported ISO-8601 formats
 */
const ISO8601_FORMATS = {
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
};

/**
 * Validates if a year is a leap year
 * @param {number} year - The year to check
 * @returns {boolean} - True if leap year
 */
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Gets the number of days in a month for a given year
 * @param {number} year - The year
 * @param {number} month - The month (1-12)
 * @returns {number} - Number of days in the month
 */
function getDaysInMonth(year, month) {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return daysInMonth[month - 1];
}

/**
 * Validates date components
 * @param {number} year - The year
 * @param {number} month - The month
 * @param {number} day - The day
 * @returns {string|null} - Error message or null if valid
 */
function validateDateComponents(year, month, day) {
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
 * @param {number} hour - The hour
 * @param {number} minute - The minute
 * @param {number} second - The second
 * @returns {string|null} - Error message or null if valid
 */
function validateTimeComponents(hour, minute, second) {
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
 * @param {string} sign - The timezone sign (+ or -)
 * @param {number} hours - The timezone hours
 * @param {number} minutes - The timezone minutes
 * @returns {string|null} - Error message or null if valid
 */
function validateTimezoneOffset(sign, hours, minutes) {
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
 * @param {number} ms - The milliseconds
 * @returns {string|null} - Error message or null if valid
 */
function validateMilliseconds(ms) {
  if (ms < 0 || ms > 999) {
    return `Milliseconds must be between 000 and 999, got ${ms.toString().padStart(3, '0')}`;
  }
  return null;
}

/**
 * Validates a date string against ISO-8601 standards
 * @param {string} dateString - The date string to validate
 * @returns {DateValidationResult} - Validation result object
 */
function validateIS8601Date(dateString) {
  // Basic input validation
  if (!dateString || typeof dateString !== 'string') {
    return {
      isValid: false,
      error: 'Date string must be a non-empty string'
    };
  }

  // Determine format using specific regex patterns
  let format = null;
  let match = null;

  // Check each format specifically
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    format = ISO8601_FORMATS.DATE;
    match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  } else if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
    format = ISO8601_FORMATS.DATETIME;
    match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
  } else if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/)) {
    format = ISO8601_FORMATS.DATETIME_MS;
    match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
  } else if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)) {
    format = ISO8601_FORMATS.DATETIME_Z;
    match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/);
  } else if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
    format = ISO8601_FORMATS.DATETIME_MS_Z;
    match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/);
  } else if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/)) {
    format = ISO8601_FORMATS.DATETIME_TZ;
    match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-])(\d{2}):(\d{2})$/);
  } else if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/)) {
    format = ISO8601_FORMATS.DATETIME_MS_TZ;
    match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})([+-])(\d{2}):(\d{2})$/);
  } else if (dateString.match(/^\d{2}:\d{2}:\d{2}$/)) {
    format = ISO8601_FORMATS.TIME;
    match = dateString.match(/^(\d{2}):(\d{2}):(\d{2})$/);
  } else if (dateString.match(/^\d{2}:\d{2}:\d{2}\.\d{3}$/)) {
    format = ISO8601_FORMATS.TIME_MS;
    match = dateString.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
  } else if (dateString.match(/^\d{2}:\d{2}:\d{2}Z$/)) {
    format = ISO8601_FORMATS.TIME_Z;
    match = dateString.match(/^(\d{2}):(\d{2}):(\d{2})Z$/);
  } else if (dateString.match(/^\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
    format = ISO8601_FORMATS.TIME_MS_Z;
    match = dateString.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/);
  } else if (dateString.match(/^\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/)) {
    format = ISO8601_FORMATS.TIME_TZ;
    match = dateString.match(/^(\d{2}):(\d{2}):(\d{2})([+-])(\d{2}):(\d{2})$/);
  } else if (dateString.match(/^\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/)) {
    format = ISO8601_FORMATS.TIME_MS_TZ;
    match = dateString.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})([+-])(\d{2}):(\d{2})$/);
  }

  if (!format || !match) {
    return {
      isValid: false,
      error: `Invalid ISO-8601 format. Supported formats: ${Object.values(ISO8601_FORMATS).join(', ')}`
    };
  }

  // Parse components based on format
  let year, month, day;
  let hour = 0, minute = 0, second = 0, milliseconds = 0;
  let timezoneSign = '+', timezoneHours = 0, timezoneMinutes = 0;

  try {
    switch (format) {
      case ISO8601_FORMATS.DATE:
        [, year, month, day] = match.map(Number);
        break;
        
      case ISO8601_FORMATS.DATETIME:
        [, year, month, day, hour, minute, second] = match.map(Number);
        break;
        
      case ISO8601_FORMATS.DATETIME_MS:
        [, year, month, day, hour, minute, second, milliseconds] = match.map(Number);
        break;
        
      case ISO8601_FORMATS.DATETIME_Z:
        [, year, month, day, hour, minute, second] = match.map(Number);
        timezoneSign = 'Z';
        break;
        
      case ISO8601_FORMATS.DATETIME_MS_Z:
        [, year, month, day, hour, minute, second, milliseconds] = match.map(Number);
        timezoneSign = 'Z';
        break;
        
      case ISO8601_FORMATS.DATETIME_TZ:
        [, year, month, day, hour, minute, second, timezoneSign, timezoneHours, timezoneMinutes] = match;
        timezoneHours = parseInt(timezoneHours, 10);
        timezoneMinutes = parseInt(timezoneMinutes, 10);
        break;
        
      case ISO8601_FORMATS.DATETIME_MS_TZ:
        [, year, month, day, hour, minute, second, milliseconds, timezoneSign, timezoneHours, timezoneMinutes] = match;
        timezoneHours = parseInt(timezoneHours, 10);
        timezoneMinutes = parseInt(timezoneMinutes, 10);
        break;
        
      default:
        // For time-only formats, use JavaScript Date parsing
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return {
            isValid: false,
            error: 'Invalid time format'
          };
        }
        return {
          isValid: true,
          format,
          parsedDate: date
        };
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to parse date string: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }

  // Validate date components (if present)
  if (format.includes('YYYY-MM-DD')) {
    const dateError = validateDateComponents(year, month, day);
    if (dateError) {
      return {
        isValid: false,
        error: dateError
      };
    }
  }

  // Validate time components (if present)
  if (format.includes('T') || format.startsWith('HH:mm')) {
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
    if (timezoneSign && timezoneSign !== '+') {
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
  let date;
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
 * @param {string} dateString - The date string to validate
 * @returns {boolean} - True if valid ISO-8601 date
 */
function isValidIS8601Date(dateString) {
  return validateIS8601Date(dateString).isValid;
}

/**
 * Determines the ISO-8601 format of a date string
 * @param {string} dateString - The date string to analyze
 * @returns {string|null} - The detected format or null if invalid
 */
function detectIS8601Format(dateString) {
  const result = validateIS8601Date(dateString);
  return result.isValid ? result.format : null;
}

/**
 * Validates multiple date fields in an object
 * @param {Object} data - The data object containing date fields
 * @param {string[]} dateFields - Array of field names to validate
 * @returns {Object} - Object with isValid boolean and errors array
 */
function validateDateFields(data, dateFields) {
  const errors = [];
  
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
 * @returns {string[]} - Array of supported format strings
 */
function getSupportedFormats() {
  return Object.values(ISO8601_FORMATS);
}

/**
 * Checks if a format is supported
 * @param {string} format - The format string to check
 * @returns {boolean} - True if format is supported
 */
function isFormatSupported(format) {
  return Object.values(ISO8601_FORMATS).includes(format);
}

// Export functions for Node.js
module.exports = {
  validateIS8601Date,
  isValidIS8601Date,
  detectIS8601Format,
  validateDateFields,
  getSupportedFormats,
  isFormatSupported,
  ISO8601_FORMATS
};