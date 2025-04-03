/**
 * Check if a string is a valid currency amount
 * @param value - The string to check
 * @returns True if the string is a valid currency amount
 */
export function isValidCurrencyAmount(value: string): boolean {
  // Allow empty string for optional fields
  if (!value) return true;
  
  // Remove currency symbols, commas, and spaces
  const cleanValue = value.replace(/[$£€,\s]/g, '');
  
  // Check if it's a valid number with up to 2 decimal places
  const regex = /^-?\d+(\.\d{1,2})?$/;
  return regex.test(cleanValue);
}

/**
 * Check if a string is a valid email address
 * @param email - The email to validate
 * @returns True if the email is valid
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Check if a string is a valid password (min 8 chars, at least 1 letter and 1 number)
 * @param password - The password to validate
 * @returns True if the password is valid
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8 && 
         /[A-Za-z]/.test(password) && 
         /\d/.test(password);
}

/**
 * Check if a date string is valid
 * @param dateStr - The date string to validate
 * @returns True if the date is valid
 */
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Check if a string is a valid credit card number (using Luhn algorithm)
 * @param cardNumber - The credit card number to validate
 * @returns True if the card number is valid
 */
export function isValidCreditCardNumber(cardNumber: string): boolean {
  // Remove spaces and dashes
  const value = cardNumber.replace(/[\s-]/g, '');
  
  // Check if it contains only digits
  if (!/^\d+$/.test(value)) return false;
  
  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  
  // Loop through values starting from the rightmost digit
  for (let i = value.length - 1; i >= 0; i--) {
    let digit = parseInt(value.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}
