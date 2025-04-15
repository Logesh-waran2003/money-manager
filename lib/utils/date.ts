import { format, formatDistance, formatRelative, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';

/**
 * Format a date in a human-readable way
 * @param date The date to format
 * @param formatString The format string (default: 'PPP')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, formatString: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString);
}

/**
 * Format a date in a relative way (e.g., "today", "yesterday", "last week")
 * @param date The date to format
 * @returns Relative date string
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return 'Today';
  } else if (isYesterday(dateObj)) {
    return 'Yesterday';
  } else if (isThisWeek(dateObj)) {
    return format(dateObj, 'EEEE'); // Day of week
  } else if (isThisMonth(dateObj)) {
    return format(dateObj, 'MMM d'); // Month and day
  } else if (isThisYear(dateObj)) {
    return format(dateObj, 'MMM d'); // Month and day
  } else {
    return format(dateObj, 'MMM d, yyyy'); // Full date
  }
}

/**
 * Format a date specifically for transaction display
 * @param date The date to format
 * @returns Formatted transaction date string
 */
export function formatTransactionDate(date: Date | string): string {
  return formatRelativeDate(date);
}

/**
 * Format a date range
 * @param startDate The start date
 * @param endDate The end date
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  if (isThisYear(start) && isThisYear(end)) {
    // Same year
    if (start.getMonth() === end.getMonth()) {
      // Same month
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
    } else {
      // Different months
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
  } else {
    // Different years
    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
  }
}

/**
 * Format a time in a human-readable way
 * @param date The date to format
 * @param formatString The format string (default: 'p')
 * @returns Formatted time string
 */
export function formatTime(date: Date | string, formatString: string = 'p'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString);
}

/**
 * Format a date and time in a human-readable way
 * @param date The date to format
 * @param formatString The format string (default: 'PPp')
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string, formatString: string = 'PPp'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString);
}

/**
 * Format a duration in a human-readable way
 * @param startDate The start date
 * @param endDate The end date
 * @returns Formatted duration string
 */
export function formatDuration(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return formatDistance(start, end, { addSuffix: false });
}

/**
 * Get the first day of the month
 * @param date The date
 * @returns The first day of the month
 */
export function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get the last day of the month
 * @param date The date
 * @returns The last day of the month
 */
export function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Get the first day of the week
 * @param date The date
 * @returns The first day of the week (Sunday)
 */
export function getFirstDayOfWeek(date: Date): Date {
  const day = date.getDay();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
}

/**
 * Get the last day of the week
 * @param date The date
 * @returns The last day of the week (Saturday)
 */
export function getLastDayOfWeek(date: Date): Date {
  const day = date.getDay();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (6 - day));
}
