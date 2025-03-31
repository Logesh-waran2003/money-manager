/**
 * Form validation utilities
 */

/**
 * Validate an email address
 * @param email - The email to validate
 * @returns True if the email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a password
 * @param password - The password to validate
 * @returns True if the password meets requirements
 */
export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Get password strength score (0-4)
 * @param password - The password to check
 * @returns Score from 0 (weak) to 4 (strong)
 */
export function getPasswordStrength(password: string): number {
  if (!password) return 0;
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Complexity checks
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  return Math.min(4, Math.floor(score / 1.5));
}

/**
 * Validate a currency amount
 * @param amount - The amount to validate
 * @returns True if the amount is valid
 */
export function isValidCurrencyAmount(amount: string | number): boolean {
  if (typeof amount === 'number') {
    return !isNaN(amount) && isFinite(amount);
  }
  
  // Allow empty string for form inputs that are being typed
  if (amount === '') return true;
  
  // Remove currency symbols, commas, etc.
  const cleanedAmount = amount.replace(/[^0-9.-]/g, '');
  const numAmount = parseFloat(cleanedAmount);
  
  return !isNaN(numAmount) && isFinite(numAmount);
}

/**
 * Validate a required field
 * @param value - The value to check
 * @returns True if the value is not empty
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  
  return Boolean(value);
}

/**
 * Validate a date
 * @param date - The date to validate
 * @returns True if the date is valid
 */
export function isValidDate(date: Date | string | number): boolean {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return !isNaN(dateObj.getTime());
}
