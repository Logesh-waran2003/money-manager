/**
 * Category Detection Module
 */
import { MERCHANT_PATTERNS, CategoryId } from "../config/detection";

export const detectCategory = (merchant: string, body: string): CategoryId => {
  const lowerMerchant = merchant.toLowerCase();
  const lowerBody = body.toLowerCase();

  if (MERCHANT_PATTERNS.food_dining.test(merchant)) return "food_dining";
  if (MERCHANT_PATTERNS.transportation.test(lowerMerchant)) return "transportation";
  if (MERCHANT_PATTERNS.shopping.test(lowerMerchant)) return "shopping";
  
  if (
    MERCHANT_PATTERNS.utilities.test(lowerMerchant) ||
    /recharge|topup|bill/i.test(lowerBody)
  ) {
    return "utilities";
  }

  if (MERCHANT_PATTERNS.financial.test(lowerMerchant)) return "financial";

  // Personal transfers (individual names)
  if (
    /^[A-Z\s]+$/.test(merchant) &&
    merchant.split(" ").length <= 3 &&
    !/ltd|pvt|store|shop|mart|pay/i.test(merchant)
  ) {
    return "personal";
  }

  if (MERCHANT_PATTERNS.healthcare.test(lowerMerchant)) return "healthcare";
  if (MERCHANT_PATTERNS.entertainment.test(lowerMerchant)) return "entertainment";

  return "others";
};
