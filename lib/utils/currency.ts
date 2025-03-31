/**
 * Currency formatting utilities
 */

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string,
  currency = 'USD',
  locale = 'en-US'
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '$0.00';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

/**
 * Parse a currency string into a number
 * @param currencyString - The currency string to parse
 * @returns The parsed number
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbols, commas, and other non-numeric characters except decimal point
  const cleanedString = currencyString.replace(/[^0-9.-]/g, '');
  const parsedValue = parseFloat(cleanedString);
  
  return isNaN(parsedValue) ? 0 : parsedValue;
}

/**
 * Format a number as a percentage
 * @param value - The value to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Calculate the difference between two amounts and return it as a formatted string
 * @param current - Current amount
 * @param previous - Previous amount
 * @returns Formatted difference with sign
 */
export function formatDifference(current: number, previous: number): string {
  const difference = current - previous;
  const sign = difference >= 0 ? '+' : '';
  return `${sign}${formatCurrency(difference)}`;
}

/**
 * Calculate the percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Formatted percentage change with sign
 */
export function formatPercentageChange(current: number, previous: number): string {
  if (previous === 0) return '+0%';
  
  const change = ((current - previous) / Math.abs(previous)) * 100;
  const sign = change >= 0 ? '+' : '';
  
  return `${sign}${change.toFixed(1)}%`;
}
