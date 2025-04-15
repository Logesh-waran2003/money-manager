/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 * @param locale The locale (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number as a percentage
 * @param value The value to format as percentage
 * @param locale The locale (default: en-US)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a percentage change with a + or - sign
 * @param value The percentage change value (e.g., 0.05 for 5%)
 * @param locale The locale (default: en-US)
 * @returns Formatted percentage change string with sign (e.g., "+5.0%")
 */
export function formatPercentageChange(
  value: number,
  locale: string = 'en-US'
): string {
  const sign = value > 0 ? '+' : '';
  return sign + formatPercentage(value, locale);
}

/**
 * Parse a currency string to a number
 * @param value The currency string to parse
 * @returns The parsed number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols, commas, and spaces
  const cleanValue = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleanValue);
}

/**
 * Get currency symbol for a currency code
 * @param currencyCode The currency code
 * @param locale The locale (default: en-US)
 * @returns The currency symbol
 */
export function getCurrencySymbol(
  currencyCode: string,
  locale: string = 'en-US'
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  const parts = formatter.formatToParts(0);
  const currencySymbol = parts.find(part => part.type === 'currency')?.value || currencyCode;
  
  return currencySymbol;
}

/**
 * Calculate the difference between two amounts and format as currency with sign
 * @param current The current amount
 * @param previous The previous amount
 * @param currency The currency code (default: USD)
 * @param locale The locale (default: en-US)
 * @returns Formatted currency difference with sign
 */
export function formatCurrencyDifference(
  current: number,
  previous: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const difference = current - previous;
  const sign = difference > 0 ? '+' : '';
  return sign + formatCurrency(difference, currency, locale);
}

/**
 * Format a large number in a compact way (e.g., 1.2K, 1.5M)
 * @param value The number to format
 * @param locale The locale (default: en-US)
 * @returns Formatted compact number
 */
export function formatCompactNumber(
  value: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}
