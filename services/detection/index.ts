/**
 * Main Detection Engine
 * Orchestrates all detection modules
 */
import {
  AMOUNT_REGEX,
  BALANCE_PATTERNS,
  METADATA_PATTERNS,
  PAYMENT_METHOD_PATTERNS,
} from "../config/detection";
import { extractAccountInfo } from "./AccountExtractor";
import { detectCategory } from "./CategoryDetector";
import { extractMerchant } from "./MerchantExtractor";
import { detectTransactionType, isValidTransaction } from "./TransactionValidator";
import { SmartDetails, BalanceInfo } from "./types";

const extractBalance = (body: string): BalanceInfo => {
  const balanceMatch = body.match(BALANCE_PATTERNS.balance);
  const limitMatch = body.match(BALANCE_PATTERNS.limit);

  const balance = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, "")) : null;
  const limit = limitMatch ? parseFloat(limitMatch[1].replace(/,/g, "")) : null;

  return { balance, limit };
};

export const detectTransaction = (body: string, sender: string): SmartDetails => {
  const amountMatch = body.match(AMOUNT_REGEX);
  const amount = amountMatch ? amountMatch[1].replace(/,/g, "") : "";
  const merchant = extractMerchant(body, sender);
  const type = detectTransactionType(body);
  const category = detectCategory(merchant, body);
  const accountInfo = extractAccountInfo(body);
  const balanceInfo = extractBalance(body);

  const isTransaction = isValidTransaction(body, amount, merchant);

  const refMatch = body.match(METADATA_PATTERNS.reference);
  const reference = refMatch ? refMatch[1] : null;

  const dateMatch = body.match(METADATA_PATTERNS.date);
  const transactionDate = dateMatch ? dateMatch[1] : null;

  let method = "unknown";
  if (PAYMENT_METHOD_PATTERNS.upi.test(body)) method = "upi";
  else if (PAYMENT_METHOD_PATTERNS.card.test(body)) method = "card";
  else if (PAYMENT_METHOD_PATTERNS.wallet.test(body)) method = "wallet";
  else if (PAYMENT_METHOD_PATTERNS.bankTransfer.test(body)) method = "bank_transfer";

  return {
    amount,
    merchant,
    type,
    category,
    bank: accountInfo.bank,
    account: accountInfo.account,
    cardLast4: accountInfo.cardLast4,
    balance: balanceInfo.balance,
    limit: balanceInfo.limit,
    method,
    reference,
    transactionDate,
    isTransaction,
  };
};
