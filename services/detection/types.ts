/**
 * Type definitions for detection module
 */

export interface SmartDetails {
  amount: string;
  merchant: string;
  type: "debit" | "credit";
  category: string;
  bank: string;
  account: string | null;
  cardLast4: string | null;
  balance: number | null;
  limit: number | null;
  method: string;
  reference: string | null;
  transactionDate: string | null;
  isTransaction: boolean;
}

export interface AccountInfo {
  account: string | null;
  cardLast4: string | null;
  bank: string;
}

export interface BalanceInfo {
  balance: number | null;
  limit: number | null;
}
