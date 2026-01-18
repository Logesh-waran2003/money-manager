import * as FileSystem from "expo-file-system";
import { PermissionsAndroid, Platform } from "react-native";
import * as SmsReader from "sms-reader";
import { getDb, initDb } from "./db";
import { detectTransaction } from "./detection";
import type { SmartDetails } from "./detection/types";

// Initialize DB on service load
initDb();

export interface UnprocessedSms {
  id: string;
  address: string;
  body: string;
  date: string;
  isIgnored?: boolean;
  isProcessed?: boolean;
}

interface SmsMessage {
  id: string;
  address: string;
  body: string;
  date: string;
}

interface DbRow {
  mobile_id?: string;
  sms_id?: string;
}

export const getUnprocessedSms = async (): Promise<UnprocessedSms[]> => {
  try {
    // 1. Permission Check (Android Only)
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: "SMS Permission",
          message:
            "This app needs access to your SMS to track expenses automatically.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      console.log("[SmsService] SMS Permission Status:", granted);

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn("[SmsService] Permission denied for READ_SMS");
        return [];
      }
    }

    const db = await getDb();
    const smsList = await SmsReader.getSms(1000);

    if (!Array.isArray(smsList)) {
      console.warn("SmsReader returned non-array:", smsList);
      return [];
    }

    console.log(`[SmsService] Fetched ${smsList.length} SMS messages`);

    const processedResult = await db.getAllAsync<DbRow>(
      "SELECT mobile_id FROM transactions"
    );
    const processedIds = new Set(
      processedResult
        .map((row) => row.mobile_id)
        .filter((id): id is string => !!id)
    );

    const ignoredResult = await db.getAllAsync<DbRow>(
      "SELECT sms_id FROM ignored_sms"
    );
    const ignoredIds = new Set(
      ignoredResult.map((row) => row.sms_id).filter((id): id is string => !!id)
    );

    const unprocessed = smsList.filter((sms: SmsMessage) => {
      // Robustness check for individual SMS object
      if (!sms || !sms.body) return false;
      const isTransactional =
        /(?:Rs\.?|INR|₹|debited|credited|spent|paid)/i.test(sms.body);
      return isTransactional;
    });

    return unprocessed.map((sms: SmsMessage) => {
      const id = String(sms.id);
      return {
        id: id,
        address: sms.address,
        body: sms.body,
        date: sms.date,
        isIgnored: ignoredIds.has(id),
        isProcessed: processedIds.has(id),
      };
    });
  } catch (error) {
    console.error("Failed to get unprocessed SMS:", error);
    return [];
  }
};

export const getSmartDetails = (body: string, sender: string): SmartDetails => {
  return detectTransaction(body, sender);
};

export const ignoreSms = async (smsId: string) => {
  try {
    const db = await getDb();
    await db.runAsync("INSERT OR IGNORE INTO ignored_sms (sms_id) VALUES (?)", [
      smsId,
    ]);
  } catch (error) {
    console.error("Failed to ignore SMS:", error);
    throw error;
  }
};

export const unIgnoreSms = async (smsId: string) => {
  try {
    const db = await getDb();
    await db.runAsync("DELETE FROM ignored_sms WHERE sms_id = ?", [smsId]);
  } catch (error) {
    console.error("Failed to un-ignore SMS:", error);
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
    const db = await getDb();
    await db.runAsync(
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
  } catch (error) {
    console.error("Failed to add transaction:", error);
    throw error;
  }
};

export const exportSmsAnalysis = async () => {
  try {
    const smsList = await SmsReader.getSms(2000);

    const bankingSms = smsList.filter((sms: SmsMessage) => {
      const body = sms.body.toLowerCase();
      const sender = sms.address.toLowerCase();

      const isBankingSender =
        /(?:hdfc|sbi|icici|axis|kotak|paytm|phonepe|gpay|googlepay|bank|upi|razorpay|mobikwik|freecharge)/i.test(
          sender
        ) || /^[a-z]{2}-[a-z0-9]+$/i.test(sender);

      const hasBankingKeywords =
        /(?:rs\.?|inr|₹|debited|credited|spent|paid|withdrawn|deposited|upi|neft|imps|rtgs|atm|card|account|balance|transfer|refund)/i.test(
          body
        );

      if (isBankingSender || hasBankingKeywords) {
        const parsed = getSmartDetails(sms.body, sms.address);
        return parsed.isTransaction;
      }

      return false;
    });

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalSms: smsList.length,
        bankingSmsCount: bankingSms.length,
        appVersion: "1.0.0",
      },
      smsAnalysis: bankingSms
        .slice(0, 1000)
        .map((sms: SmsMessage, index: number) => {
          const { amount, merchant, type } = getSmartDetails(
            sms.body,
            sms.address
          );

          return {
            index: index + 1,
            sender: sms.address,
            date: new Date(parseInt(sms.date)).toISOString(),
            body: sms.body,
            parsing: {
              amount: amount,
              merchant: merchant,
              type: type,
              confidence: amount && merchant ? "high" : "low",
            },
            metadata: {
              bodyLength: sms.body.length,
              hasAmount: !!amount,
              hasMerchant: !!merchant,
            },
          };
        }),
    };

    const jsonContent = JSON.stringify(exportData, null, 2);

    try {
      if (
        Platform.OS === "android" &&
        (FileSystem as any).StorageAccessFramework
      ) {
        const SAF = (FileSystem as any).StorageAccessFramework;
        const permissions = await SAF.requestDirectoryPermissionsAsync();

        if (permissions.granted) {
          const fileUri = await SAF.createFileAsync(
            permissions.directoryUri,
            `sms_export_${Date.now()}.json`,
            "application/json"
          );

          await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
            encoding: (FileSystem as any).EncodingType?.UTF8 || "utf8",
          });

          return {
            success: true,
            count: bankingSms.length,
            fileName: `sms_export_${Date.now()}.json`,
            method: "SAF",
          };
        }
      }
    } catch (safError) {
      console.log("SAF not available, falling back to console output");
    }

    bankingSms.forEach((sms) => {
      console.log("[SMS_EXPORT]", JSON.stringify(sms));
    });

    return {
      success: true,
      count: bankingSms.length,
      fileName: `console_export_${Date.now()}.json`,
      method: "console",
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
      sender: "AD-AXISBK-S",
    },
    {
      body: "Sent Rs.13150.00\\nFrom HDFC Bank A/C *0931\\nTo SELVA DHANARASI CHIT FUND\\nOn 13/01/26\\nRef 117112820241\\nNot You?\\nCall 18002586161/SMS BLOCK UPI to 7308080808",
      sender: "JX-HDFCBK-S",
    },
  ];

  console.log("=== IMPROVED PARSING WITH VALIDATION TEST ===");
  testSms.forEach((sms, index) => {
    const parsed = getSmartDetails(sms.body, sms.sender);
    console.log(`\nTest ${index + 1}:`);
    console.log(`Sender: ${sms.sender}`);
    console.log(`Is Transaction: ${parsed.isTransaction}`);
    console.log(`Parsed:`, JSON.stringify(parsed, null, 2));
  });
  console.log("=== END TEST ===");
};

export const exportDbData = async () => {
  const db = await getDb();
  const transactions = await db.getAllAsync("SELECT * FROM transactions");
  const ignored = await db.getAllAsync("SELECT * FROM ignored_sms");
  console.log("=== DB EXPORT START ===");
  console.log(JSON.stringify({ transactions, ignored }, null, 2));
  console.log("=== DB EXPORT END ===");
  return { transactions, ignored };
};
