/**
 * @fileoverview Robust ISO-8601 date validation using Luxon
 * Handles timezone offsets, Z notation, and all ISO-8601 formats
 */

import { DateTime } from 'luxon';

/**
 * Validates an ISO-8601 date string using Luxon
 * Supports all ISO-8601 formats including timezone offsets
 * 
 * @param input - The date string to validate
 * @returns true if valid ISO-8601, false otherwise
 * 
 * @example
 * validateISODate('2025-10-08T02:00:00+05:00') // true
 * validateISODate('2025-10-08T02:00:00-03:00') // true
 * validateISODate('2025-10-08T02:00:00Z') // true
 * validateISODate('not-a-date') // false
 */
export function validateISODate(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  try {
    const dt = DateTime.fromISO(input, { setZone: true });
    return dt.isValid;
  } catch {
    return false;
  }
}

/**
 * Validates an ISO-8601 date string and returns detailed result
 * 
 * @param input - The date string to validate
 * @returns Validation result with parsed DateTime if valid
 */
export function validateISODateDetailed(input: string): {
  isValid: boolean;
  dateTime?: DateTime;
  error?: string;
} {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      error: 'Input must be a non-empty string'
    };
  }

  try {
    const dt = DateTime.fromISO(input, { setZone: true });
    
    if (!dt.isValid) {
      return {
        isValid: false,
        error: dt.invalidReason || 'Invalid ISO-8601 date format'
      };
    }

    return {
      isValid: true,
      dateTime: dt
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}

