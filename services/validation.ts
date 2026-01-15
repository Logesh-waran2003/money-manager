/**
 * Input validation utilities for transaction data
 */
import { CATEGORIES } from "./config/detection";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate transaction amount
 */
export const validateAmount = (amount: string): ValidationResult => {
  if (!amount || amount.trim() === "") {
    return { isValid: false, error: "Amount is required" };
  }

  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: "Amount must be a valid number" };
  }

  if (numAmount <= 0) {
    return { isValid: false, error: "Amount must be greater than zero" };
  }

  if (numAmount > 10000000) {
    return { isValid: false, error: "Amount exceeds maximum limit (1 crore)" };
  }

  // Check for reasonable decimal places (max 2)
  const decimalPlaces = (amount.split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { isValid: false, error: "Amount can have maximum 2 decimal places" };
  }

  return { isValid: true };
};

/**
 * Validate merchant name
 */
export const validateMerchant = (merchant: string): ValidationResult => {
  if (!merchant || merchant.trim() === "") {
    return { isValid: false, error: "Merchant name is required" };
  }

  if (merchant.length > 100) {
    return { isValid: false, error: "Merchant name too long (max 100 characters)" };
  }

  return { isValid: true };
};

/**
 * Validate category
 */
export const validateCategory = (category: string): ValidationResult => {
  const validCategories = CATEGORIES.map(c => c.id);

  if (!category || !validCategories.includes(category as any)) {
    return { isValid: false, error: "Invalid category selected" };
  }

  return { isValid: true };
};

/**
 * Validate account ID
 */
export const validateAccountId = (accountId: string): ValidationResult => {
  if (!accountId || accountId.trim() === "") {
    return { isValid: false, error: "Account must be selected" };
  }

  return { isValid: true };
};

/**
 * Validate complete transaction data
 */
export const validateTransaction = (data: {
  amount: string;
  merchant: string;
  category: string;
  accountId: string;
}): ValidationResult => {
  const amountValidation = validateAmount(data.amount);
  if (!amountValidation.isValid) return amountValidation;

  const merchantValidation = validateMerchant(data.merchant);
  if (!merchantValidation.isValid) return merchantValidation;

  const categoryValidation = validateCategory(data.category);
  if (!categoryValidation.isValid) return categoryValidation;

  const accountValidation = validateAccountId(data.accountId);
  if (!accountValidation.isValid) return accountValidation;

  return { isValid: true };
};
