/**
 * Detection Configuration
 * Centralized configuration for SMS transaction detection
 */

// Bank definitions
export const BANKS = [
  "HDFC Bank",
  "Axis Bank",
  "SBI",
  "ICICI Bank",
  "Kotak Bank",
  "Other",
] as const;

// Category definitions
export const CATEGORIES = [
  { id: "food_dining", label: "Food & Dining" },
  { id: "transportation", label: "Transportation" },
  { id: "shopping", label: "Shopping" },
  { id: "utilities", label: "Utilities" },
  { id: "financial", label: "Financial" },
  { id: "personal", label: "Personal" },
  { id: "healthcare", label: "Healthcare" },
  { id: "entertainment", label: "Entertainment" },
  { id: "others", label: "Others" },
] as const;

export type CategoryId = typeof CATEGORIES[number]["id"];

// Bank SMS patterns
export const BANK_PATTERNS = {
  hdfc: {
    name: "HDFC Bank",
    senderPattern: /HDFCBK/i,
    bankPattern: /HDFC/i,
    upiSentPattern: /To\s+([A-Z\s]+?)(?:\s+On\s|\s+Ref\s)/i,
    upiCreditPattern: /from VPA\s+([^@\s]+)/i,
  },
  axis: {
    name: "Axis Bank",
    senderPattern: /AXISBK/i,
    bankPattern: /Axis/i,
    merchantPattern: /IST\s+([A-Z\s]+?)(?:\s+Avl\s|$)/i,
  },
  sbi: {
    name: "SBI",
    senderPattern: /SBI/i,
    bankPattern: /SBI/i,
    merchantPattern: /at\s+([A-Z\s]+?)(?:\s+on\s|\s+-SBI)/i,
  },
  icici: {
    name: "ICICI Bank",
    senderPattern: /ICICI/i,
    bankPattern: /ICICI/i,
  },
} as const;

// Merchant keyword patterns by category
export const MERCHANT_PATTERNS: Record<CategoryId, RegExp> = {
  food_dining: /hotel|restaurant|cafe|food|kitchen|mess|canteen|santhi|anandh|kumar/i,
  transportation: /redbus|uber|ola|taxi|bus|train|metro|petrol|fuel/i,
  shopping: /amazon|flipkart|myntra|westside|deconstruct|shopping|mall|store/i,
  utilities: /airtel|jio|bsnl|recharge|mobile|data|electricity|gas|water/i,
  financial: /chit fund|loan|insurance|investment|mutual fund|sip/i,
  personal: /^[A-Z\s]+$/,
  healthcare: /hospital|clinic|medical|pharmacy|doctor|health/i,
  entertainment: /movie|cinema|netflix|spotify|game|entertainment/i,
  others: /.*/,
};

// Special merchant names
export const SPECIAL_MERCHANTS = {
  amazonPay: { pattern: /AMAZON PAY/i, name: "Amazon Pay" },
  redbus: { pattern: /redbus/i, name: "RedBus" },
  deconstruct: { pattern: /The Deconstruct/i, name: "The Deconstruct" },
  gokwik: { pattern: /GoKwik/i, name: "GoKwik" },
} as const;

// Transaction validation patterns
export const VALIDATION_PATTERNS = {
  otp: /OTP|One Time Password|verification code/i,
  promotional: /offer|discount|sale|click|apply now|t&c|terms|conditions/i,
  alerts: /alert.*limit|balance.*alert|due.*alert/i,
  transactionKeywords: /spent|debited|credited|sent|received|paid|withdrawn|deposited|refund/i,
  creditKeywords: /credited|credit alert|received|refund|salary|deposited/i,
  debitKeywords: /debited|spent|paid|withdrawn|purchase|sent/i,
} as const;

// Amount extraction pattern
export const AMOUNT_REGEX = /(?:Rs\.?\s*|INR\s*|₹\s*)([\d,]+(?:\.\d{1,2})?)/i;

// Account/Card extraction patterns
export const ACCOUNT_PATTERNS = {
  account: /A\/[Cc]\s*[*X]+(\d{4})/,
  card: /[Cc]ard\s+(?:ending|no\.?)\s*[*X]*(\d{4})/,
  cardDirect: /[Cc]ard\s+(\d{4})/,
} as const;

// Balance/Limit extraction patterns
export const BALANCE_PATTERNS = {
  balance: /(?:Available.*balance|balance):\s*(?:Rs\.?\s*|INR\s*|₹\s*)([\d,]+(?:\.\d{1,2})?)/i,
  limit: /(?:Avl Limit|Available.*Limit):\s*(?:Rs\.?\s*|INR\s*|₹\s*)([\d,]+(?:\.\d{1,2})?)/i,
} as const;

// Reference and date patterns
export const METADATA_PATTERNS = {
  reference: /Ref[:\s]+(\d+)/i,
  date: /On\s+(\d{2}[-\/]\d{2}[-\/]\d{2,4})/i,
} as const;

// Payment method patterns
export const PAYMENT_METHOD_PATTERNS = {
  upi: /UPI/i,
  card: /Card/i,
  wallet: /wallet/i,
  bankTransfer: /NEFT|IMPS|RTGS/i,
} as const;
