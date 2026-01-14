import * as SmsReader from "sms-reader";
import * as FileSystem from 'expo-file-system';
import { syncTransactions } from "./api";
import { getDb, initDb } from "./db";
import { categorizeTransaction } from "./gemini";

// Initialize DB on service load
initDb();
const db = getDb();

export interface UnprocessedSms {
  id: string;
  address: string;
  body: string;
  date: string; // timestamp
}

// Improved Regex for Amount - handles multiple formats
const AMOUNT_REGEX = /(?:Rs\.?\s*|INR\s*|₹\s*)([\d,]+(?:\.\d{1,2})?)/i;

// Category detection based on merchant and context
const detectCategory = (merchant: string, body: string): string => {
  const lowerMerchant = merchant.toLowerCase();
  const lowerBody = body.toLowerCase();
  
  // Food & Dining
  if (/hotel|restaurant|cafe|food|kitchen|mess|canteen|santhi|anandh|kumar/i.test(merchant)) {
    return "food_dining";
  }
  
  // Transportation
  if (/redbus|uber|ola|taxi|bus|train|metro|petrol|fuel/i.test(lowerMerchant)) {
    return "transportation";
  }
  
  // Shopping & E-commerce
  if (/amazon|flipkart|myntra|westside|deconstruct|shopping|mall|store/i.test(lowerMerchant)) {
    return "shopping";
  }
  
  // Utilities & Recharge
  if (/airtel|jio|bsnl|recharge|mobile|data|electricity|gas|water/i.test(lowerMerchant) || 
      /recharge|topup|bill/i.test(lowerBody)) {
    return "utilities";
  }
  
  // Financial Services
  if (/chit fund|loan|insurance|investment|mutual fund|sip/i.test(lowerMerchant)) {
    return "financial";
  }
  
  // Personal Transfers (individual names)
  if (/^[A-Z\s]+$/.test(merchant) && merchant.split(' ').length <= 3 && 
      !/ltd|pvt|store|shop|mart|pay/i.test(merchant)) {
    return "personal";
  }
  
  // Healthcare
  if (/hospital|clinic|medical|pharmacy|doctor|health/i.test(lowerMerchant)) {
    return "healthcare";
  }
  
  // Entertainment
  if (/movie|cinema|netflix|spotify|game|entertainment/i.test(lowerMerchant)) {
    return "entertainment";
  }
  
  return "others";
};

// Extract account/card information
const extractAccountInfo = (body: string): { account: string | null, cardLast4: string | null, bank: string } => {
  let bank = "Unknown";
  let account = null;
  let cardLast4 = null;
  
  // Detect bank
  if (/HDFC/i.test(body)) bank = "HDFC Bank";
  else if (/Axis/i.test(body)) bank = "Axis Bank";
  else if (/SBI/i.test(body)) bank = "SBI";
  else if (/ICICI/i.test(body)) bank = "ICICI Bank";
  
  // Extract account number
  const accountMatch = body.match(/A\/[Cc]\s*[*X]+(\d{4})/);
  if (accountMatch) account = accountMatch[1];
  
  // Extract card last 4 digits
  const cardMatch = body.match(/[Cc]ard\s*(?:no\.|ending)?\s*[*X]+(\d{4})/);
  if (cardMatch) cardLast4 = cardMatch[1];
  
  return { account, cardLast4, bank };
};

// Extract balance/limit information
const extractBalance = (body: string): { balance: number | null, limit: number | null } => {
  const balanceMatch = body.match(/(?:Available.*balance|balance):\s*(?:Rs\.?\s*|INR\s*|₹\s*)([\d,]+(?:\.\d{1,2})?)/i);
  const limitMatch = body.match(/(?:Avl Limit|Available.*Limit):\s*(?:Rs\.?\s*|INR\s*|₹\s*)([\d,]+(?:\.\d{1,2})?)/i);
  
  const balance = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : null;
  const limit = limitMatch ? parseFloat(limitMatch[1].replace(/,/g, '')) : null;
  
  return { balance, limit };
};

// Enhanced merchant extraction with bank-specific patterns
const extractMerchant = (body: string, sender: string): string => {
  const cleanBody = body.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
  
  // HDFC Bank patterns
  if (/HDFC/i.test(body) || /HDFCBK/i.test(sender)) {
    // UPI Sent: "To MERCHANT_NAME"
    const upiSentMatch = cleanBody.match(/To\s+([A-Z\s]+?)(?:\s+On\s|\s+Ref\s)/i);
    if (upiSentMatch && upiSentMatch[1]) {
      return upiSentMatch[1].trim();
    }
    
    // UPI Credit: "from VPA merchant@bank"
    const upiCreditMatch = cleanBody.match(/from VPA\s+([^@\s]+)/i);
    if (upiCreditMatch && upiCreditMatch[1]) {
      return upiCreditMatch[1].trim();
    }
    
    // Card transactions: "At MERCHANT_NAME" or "at MERCHANT_NAME"
    const cardMatch = cleanBody.match(/(?:At|at)\s+([A-Z0-9\s#]+?)(?:\s+On\s|\s+by\s|\s+Valid\s)/i);
    if (cardMatch && cardMatch[1]) {
      return cardMatch[1].trim();
    }
  }
  
  // Axis Bank patterns
  if (/Axis/i.test(body) || /AXISBK/i.test(sender)) {
    // Pattern: "IST MERCHANT_NAME Avl Limit"
    const axisMatch = cleanBody.match(/IST\s+([A-Z\s]+?)(?:\s+Avl\s|$)/i);
    if (axisMatch && axisMatch[1] && !axisMatch[1].includes('Not you')) {
      return axisMatch[1].trim();
    }
  }
  
  // SBI Bank patterns
  if (/SBI/i.test(body)) {
    const sbiMatch = cleanBody.match(/at\s+([A-Z\s]+?)(?:\s+on\s|\s+-SBI)/i);
    if (sbiMatch && sbiMatch[1]) {
      return sbiMatch[1].trim();
    }
  }
  
  // E-commerce/App specific patterns
  if (/AMAZON PAY/i.test(cleanBody)) return "Amazon Pay";
  if (/redbus/i.test(cleanBody)) return "RedBus";
  if (/The Deconstruct/i.test(cleanBody)) return "The Deconstruct";
  if (/GoKwik/i.test(cleanBody)) return "GoKwik";
  
  // Generic UPI patterns
  const genericUpiMatch = cleanBody.match(/(?:paid to|sent.*?to)\s+([A-Z\s]+?)(?:\s+(?:via|on|using)|$)/i);
  if (genericUpiMatch && genericUpiMatch[1]) {
    return genericUpiMatch[1].trim();
  }
  
  // Fallback: Clean sender ID for promotional SMS
  if (sender.includes('-P')) return "Promotional";
  return sender.replace(/^[A-Z]{2}-?/, '').replace(/-[A-Z]$/, '');
};

// Determine if SMS is actually a financial transaction
const isValidTransaction = (body: string, amount: string, merchant: string): boolean => {
  // Must have amount
  if (!amount || amount === "0") return false;
  
  // Skip OTP messages
  if (/OTP|One Time Password|verification code/i.test(body)) return false;
  
  // Skip promotional/marketing messages
  if (/offer|discount|sale|click|apply now|t&c|terms|conditions/i.test(body)) return false;
  
  // Skip alerts without actual transactions
  if (/alert.*limit|balance.*alert|due.*alert/i.test(body) && !/spent|debited|credited/i.test(body)) return false;
  
  // Must have transaction keywords
  const hasTransactionKeywords = /spent|debited|credited|sent|received|paid|withdrawn|deposited|refund/i.test(body);
  if (!hasTransactionKeywords) return false;
  
  // Skip if merchant is just promotional sender
  if (merchant === "Promotional" || /promo|offer|sale/i.test(merchant)) return false;
  
  return true;
};

// Detect transaction type from SMS content
const detectTransactionType = (body: string): "debit" | "credit" => {
  const creditKeywords = /credited|credit alert|received|refund|salary/i;
  const debitKeywords = /debited|spent|paid|withdrawn|purchase|sent/i;
  
  if (creditKeywords.test(body)) return "credit";
  if (debitKeywords.test(body)) return "debit";
  
  // Default based on common patterns
  if (/sent rs|paid|spent/i.test(body)) return "debit";
  return "debit"; // Most SMS are debit transactions
};

export const getUnprocessedSms = async (): Promise<UnprocessedSms[]> => {
  try {
    // 1. Fetch last 100 SMS from Android
    const smsList = await SmsReader.getSms(1000);

    // 2. Fetch processed mobile_ids
    const processedResult = db.getAllSync("SELECT mobile_id FROM transactions");
    const processedIds = new Set(
      processedResult.map((row: any) => row.mobile_id)
    );

    // 3. Fetch ignored sms_ids
    const ignoredResult = db.getAllSync("SELECT sms_id FROM ignored_sms");
    const ignoredIds = new Set(ignoredResult.map((row: any) => row.sms_id));

    // 4. Filter
    const unprocessed = smsList.filter((sms: any) => {
      const isProcessed = processedIds.has(sms.id);
      const isIgnored = ignoredIds.has(sms.id);

      // Basic filter for transactional SMS
      const isTransactional =
        /(?:Rs\.?|INR|₹|debited|credited|spent|paid)/i.test(sms.body);

      return !isProcessed && !isIgnored && isTransactional;
    });

    return unprocessed.map((sms: any) => ({
      id: sms.id,
      address: sms.address,
      body: sms.body,
      date: sms.date,
    }));
  } catch (error) {
    console.error("Failed to get unprocessed SMS:", error);
    return [];
  }
};

export const getSmartDetails = (body: string, sender: string) => {
  const amountMatch = body.match(AMOUNT_REGEX);
  const amount = amountMatch ? amountMatch[1].replace(/,/g, "") : "";
  const merchant = extractMerchant(body, sender);
  const type = detectTransactionType(body);
  const category = detectCategory(merchant, body);
  const accountInfo = extractAccountInfo(body);
  const balanceInfo = extractBalance(body);
  
  // Validate if this is actually a transaction
  const isTransaction = isValidTransaction(body, amount, merchant);
  
  // Extract reference number
  const refMatch = body.match(/Ref[:\s]+(\d+)/i);
  const reference = refMatch ? refMatch[1] : null;
  
  // Extract transaction date
  const dateMatch = body.match(/On\s+(\d{2}[-\/]\d{2}[-\/]\d{2,4})/i);
  const transactionDate = dateMatch ? dateMatch[1] : null;
  
  // Detect payment method
  let method = "unknown";
  if (/UPI/i.test(body)) method = "upi";
  else if (/Card/i.test(body)) method = "card";
  else if (/wallet/i.test(body)) method = "wallet";
  else if (/NEFT|IMPS|RTGS/i.test(body)) method = "bank_transfer";
  
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
    isTransaction
  };
};

export const ignoreSms = (smsId: string) => {
  try {
    db.runSync("INSERT OR IGNORE INTO ignored_sms (sms_id) VALUES (?)", [
      smsId,
    ]);
  } catch (error) {
    console.error("Failed to ignore SMS:", error);
    throw error;
  }
};

export const addTransaction = async (transaction: {
  id: string;
  mobile_id: string;
  amount: number;
  merchant: string;
  category: string;
  date: string;
  type: "debit" | "credit";
  raw_body: string;
  remarks?: string;
  account_id: string;
  merchant_id?: string | null;
}) => {
  try {
    // 1. Insert into local DB with pending status
    db.runSync(
      `INSERT OR IGNORE INTO transactions (id, amount, merchant, category, date, mobile_id, type, raw_body, remarks, sync_status, account_id, merchant_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        transaction.id,
        transaction.amount,
        transaction.merchant,
        transaction.category,
        transaction.date,
        transaction.mobile_id,
        transaction.type,
        transaction.raw_body,
        transaction.remarks || "",
        transaction.account_id,
        transaction.merchant_id || null,
      ]
    );

    // 2. Trigger Sync (Fire and Forget / Background)
    syncPendingTransactions().catch((err) =>
      console.log("Background sync trigger failed:", err)
    );
  } catch (error) {
    console.error("Failed to add transaction:", error);
    throw error;
  }
};

export const syncPendingTransactions = async () => {
  try {
    const pending = db.getAllSync(
      "SELECT * FROM transactions WHERE sync_status = 'pending'"
    );

    if (pending.length === 0) return;

    console.log(`Syncing ${pending.length} transactions...`);

    const payload = pending.map((tx: any) => ({
      mobile_id: tx.mobile_id,
      text: tx.raw_body,
      amount: tx.amount,
      date: tx.date,
      // Note: Backend currently only accepts these 4 fields based on previous schema info.
      // If backend supports remarks/merchant override, we should add them here.
    }));

    // Log payload for debugging
    // console.log("Sync Payload:", JSON.stringify(payload, null, 2));

    await syncTransactions(payload);

    // Update status to synced
    const ids = pending.map((tx: any) => `'${tx.id}'`).join(",");
    db.execSync(
      `UPDATE transactions SET sync_status = 'synced' WHERE id IN (${ids})`
    );

    console.log(`Successfully synced ${pending.length} transactions`);
  } catch (error: any) {
    console.error("Failed to sync pending transactions:", error);
    if (error.response?.data?.error === "Failed to sync transactions") {
      console.warn(
        "Backend rejected sync. Likely duplicate entries. Marking as synced to prevent blocking."
      );
      // Optional: Force mark as synced if we are sure it's duplication.
      // For now, let's leave it pending so the user can verify, but we won't crash the UI.
    }
    throw error; // Let the caller handle the alert if manual sync
  }
};

// Export SMS analysis using Android Storage Access Framework
export const exportSmsAnalysis = async () => {
  try {
    console.log("=== EXPORTING SMS ANALYSIS ===");
    
    // Get large SMS dataset
    const smsList = await SmsReader.getSms(2000);
    
    // Filter for banking SMS with improved validation
    const bankingSms = smsList.filter((sms: any) => {
      const body = sms.body.toLowerCase();
      const sender = sms.address.toLowerCase();
      
      // Check if it's from a banking source
      const isBankingSender = /(?:hdfc|sbi|icici|axis|kotak|paytm|phonepe|gpay|googlepay|bank|upi|razorpay|mobikwik|freecharge)/i.test(sender) || 
                             /^[a-z]{2}-[a-z0-9]+$/i.test(sender);
      
      // Check if it has banking keywords
      const hasBankingKeywords = /(?:rs\.?|inr|₹|debited|credited|spent|paid|withdrawn|deposited|upi|neft|imps|rtgs|atm|card|account|balance|transfer|refund)/i.test(body);
      
      // Use our validation function
      if (isBankingSender || hasBankingKeywords) {
        const parsed = getSmartDetails(sms.body, sms.address);
        return parsed.isTransaction; // Only include actual transactions
      }
      
      return false;
    });
    
    console.log(`Exporting ${bankingSms.length} banking SMS out of ${smsList.length} total`);
    
    // Create comprehensive analysis
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalSms: smsList.length,
        bankingSmsCount: bankingSms.length,
        appVersion: "1.0.0"
      },
      smsAnalysis: bankingSms.slice(0, 1000).map((sms: any, index: number) => {
        const { amount, merchant, type } = getSmartDetails(sms.body, sms.address);
        
        return {
          index: index + 1,
          sender: sms.address,
          date: new Date(parseInt(sms.date)).toISOString(),
          body: sms.body,
          parsing: {
            amount: amount,
            merchant: merchant,
            type: type,
            confidence: amount && merchant ? "high" : "low"
          },
          metadata: {
            bodyLength: sms.body.length,
            hasAmount: !!amount,
            hasMerchant: !!merchant
          }
        };
      })
    };
    
    // Create JSON content
    const jsonContent = JSON.stringify(exportData, null, 2);
    
    try {
      // Try Storage Access Framework for Android (best for large files)
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      
      if (permissions.granted) {
        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          `sms_export_${Date.now()}.json`,
          'application/json'
        );
        
        await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
          encoding: FileSystem.EncodingType.UTF8
        });
        
        console.log(`✅ File saved successfully using SAF!`);
        return { 
          success: true, 
          count: bankingSms.length,
          fileName: `sms_export_${Date.now()}.json`,
          method: 'SAF'
        };
      }
    } catch (safError) {
      console.log("SAF not available, falling back to console output");
    }
    
    // Fallback: Console output with SMS_EXPORT tags for adb logcat filtering
    bankingSms.forEach(sms => {
      console.log('[SMS_EXPORT]', JSON.stringify(sms));
    });
    
    return { 
      success: true, 
      count: bankingSms.length,
      fileName: `console_export_${Date.now()}.json`,
      method: 'console'
    };
    
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
};

export const testImprovedParsing = () => {
  const testSms = [
    {
      body: "Spent INR 80\\nAxis Bank Card no. XX9498\\n13-01-26 22:46:26 IST\\nSANTHI\\nAvl Limit: INR 59155.39\\nNot you? SMS BLOCK 9498 to 919951860002",
      sender: "AD-AXISBK-S"
    },
    {
      body: "Sent Rs.13150.00\\nFrom HDFC Bank A/C *0931\\nTo SELVA DHANARASI CHIT FUND\\nOn 13/01/26\\nRef 117112820241\\nNot You?\\nCall 18002586161/SMS BLOCK UPI to 7308080808",
      sender: "JX-HDFCBK-S"
    },
    {
      body: "OTP is 407796 for txn of INR 31103.00 at AMAZON PAY on HDFC Bank card ending 8317. Valid till 08:04. Do not share OTP for security reasons",
      sender: "JM-HDFCBK-S"
    },
    {
      body: "ADDITIONAL 20% OFF on Sale Styles worth Rs 6000+. Westside Sale just got ICONIC! In-store only. https://gs.im/WSTSID/e/VhLpRp *T&C",
      sender: "JK-WSTSID-P"
    },
    {
      body: "Credit Limit Alert! Your HDFC Bank Credit Card 8317 has reached the 70% limit. Enable Over-Limit: hdfcbk.io/HDFCBK/K/DUvfZb1whmP or pay dues to avoid declines.",
      sender: "JD-HDFCBK-S"
    }
  ];
  
  console.log("=== IMPROVED PARSING WITH VALIDATION TEST ===");
  testSms.forEach((sms, index) => {
    const parsed = getSmartDetails(sms.body, sms.sender);
    console.log(`\\nTest ${index + 1}:`);
    console.log(`Sender: ${sms.sender}`);
    console.log(`Is Transaction: ${parsed.isTransaction}`);
    console.log(`Parsed:`, JSON.stringify(parsed, null, 2));
  });
  console.log("=== END TEST ===");
};

export const exportDbData = () => {
  const transactions = db.getAllSync("SELECT * FROM transactions");
  const ignored = db.getAllSync("SELECT * FROM ignored_sms");
  console.log("=== DB EXPORT START ===");
  console.log(JSON.stringify({ transactions, ignored }, null, 2));
  console.log("=== DB EXPORT END ===");
  return { transactions, ignored };
};
