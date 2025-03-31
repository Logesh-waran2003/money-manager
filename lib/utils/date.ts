/**
 * Date formatting and manipulation utilities
 */

import { format, formatDistance, isToday, isYesterday, isSameWeek, isSameMonth, isSameYear } from 'date-fns';

/**
 * Format a date with a standard format
 * @param date - The date to format
 * @param formatString - Optional custom format string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number, formatString = 'MMM d, yyyy'): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return format(dateObj, formatString);
}

/**
 * Format a date for display in transaction lists
 * Uses relative formatting for recent dates
 * @param date - The date to format
 * @returns User-friendly formatted date string
 */
export function formatTransactionDate(date: Date | string | number): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  if (isToday(dateObj)) {
    return 'Today';
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  if (isSameWeek(dateObj, new Date())) {
    return format(dateObj, 'EEEE'); // Day name
  }
  
  if (isSameMonth(dateObj, new Date())) {
    return format(dateObj, 'MMM d'); // Month + day
  }
  
  if (isSameYear(dateObj, new Date())) {
    return format(dateObj, 'MMM d'); // Month + day
  }
  
  return format(dateObj, 'MMM d, yyyy'); // Full date with year
}

/**
 * Format a date as a relative time from now
 * @param date - The date to format
 * @returns Relative time string (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Get the start of the current month
 * @returns Date object for the first day of the current month
 */
export function getStartOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Get the end of the current month
 * @returns Date object for the last day of the current month
 */
export function getEndOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

/**
 * Format a date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  if (isSameMonth(startDate, endDate) && isSameYear(startDate, endDate)) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`;
  }
  
  if (isSameYear(startDate, endDate)) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  }
  
  return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
}
