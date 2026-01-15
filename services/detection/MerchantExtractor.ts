/**
 * Merchant Extraction Module
 */
import { BANK_PATTERNS, SPECIAL_MERCHANTS } from "../config/detection";

export const extractMerchant = (body: string, sender: string): string => {
  const cleanBody = body.replace(/\\n/g, " ").replace(/\s+/g, " ").trim();

  // HDFC Bank patterns
  if (BANK_PATTERNS.hdfc.bankPattern.test(body) || BANK_PATTERNS.hdfc.senderPattern.test(sender)) {
    const upiSentMatch = cleanBody.match(BANK_PATTERNS.hdfc.upiSentPattern);
    if (upiSentMatch?.[1]) return upiSentMatch[1].trim();

    const upiCreditMatch = cleanBody.match(BANK_PATTERNS.hdfc.upiCreditPattern);
    if (upiCreditMatch?.[1]) return upiCreditMatch[1].trim();
  }

  // Axis Bank patterns
  if (BANK_PATTERNS.axis.bankPattern.test(body) || BANK_PATTERNS.axis.senderPattern.test(sender)) {
    const axisMatch = cleanBody.match(BANK_PATTERNS.axis.merchantPattern);
    if (axisMatch?.[1] && !axisMatch[1].includes("Not you")) {
      return axisMatch[1].trim();
    }
  }

  // SBI Bank patterns
  if (BANK_PATTERNS.sbi.bankPattern.test(body)) {
    const sbiMatch = cleanBody.match(BANK_PATTERNS.sbi.merchantPattern);
    if (sbiMatch?.[1]) return sbiMatch[1].trim();
  }

  // Special merchants
  if (SPECIAL_MERCHANTS.amazonPay.pattern.test(cleanBody)) return SPECIAL_MERCHANTS.amazonPay.name;
  if (SPECIAL_MERCHANTS.redbus.pattern.test(cleanBody)) return SPECIAL_MERCHANTS.redbus.name;
  if (SPECIAL_MERCHANTS.deconstruct.pattern.test(cleanBody)) return SPECIAL_MERCHANTS.deconstruct.name;
  if (SPECIAL_MERCHANTS.gokwik.pattern.test(cleanBody)) return SPECIAL_MERCHANTS.gokwik.name;

  // Generic UPI patterns
  const genericUpiMatch = cleanBody.match(/(?:paid to|sent.*?to)\s+([A-Z\s]+?)(?:\s+(?:via|on|using)|$)/i);
  if (genericUpiMatch?.[1]) return genericUpiMatch[1].trim();

  // Fallback: Clean sender ID
  if (sender.includes("-P")) return "Promotional";
  return sender.replace(/^[A-Z]{2}-?/, "").replace(/-[A-Z]$/, "");
};
