/**
 * Account and Card Extraction Module
 */
import { BANK_PATTERNS, ACCOUNT_PATTERNS } from "../config/detection";
import { AccountInfo } from "./types";

export const extractAccountInfo = (body: string): AccountInfo => {
  let bank = "Unknown";
  let account = null;
  let cardLast4 = null;

  // Detect bank
  if (BANK_PATTERNS.hdfc.bankPattern.test(body)) bank = BANK_PATTERNS.hdfc.name;
  else if (BANK_PATTERNS.axis.bankPattern.test(body)) bank = BANK_PATTERNS.axis.name;
  else if (BANK_PATTERNS.sbi.bankPattern.test(body)) bank = BANK_PATTERNS.sbi.name;
  else if (BANK_PATTERNS.icici.bankPattern.test(body)) bank = BANK_PATTERNS.icici.name;

  // Extract account number
  const accountMatch = body.match(ACCOUNT_PATTERNS.account);
  if (accountMatch) account = accountMatch[1];

  // Extract card last 4 digits
  let cardMatch = body.match(ACCOUNT_PATTERNS.card);
  if (!cardMatch) {
    cardMatch = body.match(ACCOUNT_PATTERNS.cardDirect);
  }
  if (cardMatch) cardLast4 = cardMatch[1];

  return { account, cardLast4, bank };
};
