/**
 * Transaction Validation Module
 */
import { VALIDATION_PATTERNS } from "../config/detection";

export const isValidTransaction = (
  body: string,
  amount: string,
  merchant: string
): boolean => {
  if (!amount || amount === "0") return false;
  if (VALIDATION_PATTERNS.otp.test(body)) return false;
  if (VALIDATION_PATTERNS.promotional.test(body)) return false;

  if (
    VALIDATION_PATTERNS.alerts.test(body) &&
    !/spent|debited|credited/i.test(body)
  ) {
    return false;
  }

  if (!VALIDATION_PATTERNS.transactionKeywords.test(body)) return false;
  if (merchant === "Promotional" || /promo|offer|sale/i.test(merchant)) return false;

  return true;
};

export const detectTransactionType = (body: string): "debit" | "credit" => {
  if (VALIDATION_PATTERNS.creditKeywords.test(body)) return "credit";
  if (VALIDATION_PATTERNS.debitKeywords.test(body)) return "debit";
  if (/sent rs|paid|spent/i.test(body)) return "debit";
  return "debit";
};
