import * as SQLite from "expo-sqlite";

// Database interfaces
export interface Account {
  id: string;
  bank_name: string;
  account_last4: string;
  account_type: string;
  nickname: string;
  balance: number;
  created_at: string;
}

export interface Merchant {
  id: string;
  name: string;
  default_category: string;
  created_at: string;
}

interface SmsFeedback {
  id: string;
  sms_body: string;
  merchant: string;
  is_transaction: number;
  created_at: string;
}

// Open database asynchronously
const dbPromise = SQLite.openDatabaseAsync("money_manager_v5.db");

/**
 * Initialize Database and handle migrations
 */
export const initDb = async () => {
  const db = await dbPromise;

  // 1. Core Tables
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      amount REAL,
      merchant TEXT,
      category TEXT,
      date TEXT,
      mobile_id TEXT UNIQUE,
      type TEXT,
      raw_body TEXT,
      remarks TEXT,
      sync_status TEXT DEFAULT 'pending',
      account_id TEXT,
      merchant_id TEXT
    );
    CREATE TABLE IF NOT EXISTS ignored_sms (
      sms_id TEXT PRIMARY KEY
    );
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      bank_name TEXT NOT NULL,
      account_last4 TEXT NOT NULL,
      account_type TEXT,
      nickname TEXT,
      balance REAL DEFAULT 0,
      created_at TEXT,
      UNIQUE(bank_name, account_last4)
    );
    CREATE TABLE IF NOT EXISTS merchants (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      default_category TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS sms_feedback (
      id TEXT PRIMARY KEY,
      sms_body TEXT NOT NULL,
      merchant TEXT,
      is_transaction INTEGER NOT NULL,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      notify_new_transactions INTEGER DEFAULT 1,
      notify_pending_verification INTEGER DEFAULT 1,
      notify_weekly_summary INTEGER DEFAULT 0
    );
    INSERT OR IGNORE INTO settings (id) VALUES (1);
    
    -- Performance indexes
    CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
    CREATE INDEX IF NOT EXISTS idx_transactions_merchant_id ON transactions(merchant_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant);
    CREATE INDEX IF NOT EXISTS idx_transactions_remarks ON transactions(remarks);
    CREATE INDEX IF NOT EXISTS idx_sms_feedback_merchant ON sms_feedback(merchant);
  `);

  console.log("Database initialized with indexes");
};

// Export the promise so others can wait for it
export const getDb = async () => await dbPromise;

// --- Account management ---

export const findAccount = async (bankName: string, accountLast4: string): Promise<Account | null> => {
  const db = await dbPromise;
  return await db.getFirstAsync<Account>(
    "SELECT * FROM accounts WHERE bank_name = ? AND account_last4 = ?",
    [bankName, accountLast4]
  );
};

export const createAccount = async (account: {
  id: string;
  bank_name: string;
  account_last4: string;
  account_type: string;
  nickname: string;
  balance?: number;
}): Promise<void> => {
  const db = await dbPromise;
  await db.runAsync(
    "INSERT INTO accounts (id, bank_name, account_last4, account_type, nickname, balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      account.id,
      account.bank_name,
      account.account_last4,
      account.account_type,
      account.nickname,
      account.balance || 0,
      new Date().toISOString(),
    ]
  );
};

export const getAllAccounts = async (): Promise<Account[]> => {
  const db = await dbPromise;
  return await db.getAllAsync<Account>(
    "SELECT * FROM accounts ORDER BY created_at DESC"
  );
};

/**
 * ATOMIC BALANCE UPDATE
 * Fixes race condition by letting SQL handle the math
 */
export const updateAccountBalance = async (
  accountId: string,
  amount: number,
  type: "debit" | "credit"
): Promise<void> => {
  const db = await dbPromise;
  const adjustment = type === "debit" ? -amount : amount;

  await db.runAsync("UPDATE accounts SET balance = balance + ? WHERE id = ?", [
    adjustment,
    accountId,
  ]);
};

// --- Merchant management ---

export const findMerchant = async (name: string): Promise<Merchant | null> => {
  const db = await dbPromise;
  return await db.getFirstAsync<Merchant>("SELECT * FROM merchants WHERE name = ?", [
    name,
  ]);
};

export const createMerchant = async (merchant: {
  id: string;
  name: string;
  default_category: string;
}): Promise<void> => {
  const db = await dbPromise;
  await db.runAsync(
    "INSERT OR IGNORE INTO merchants (id, name, default_category, created_at) VALUES (?, ?, ?, ?)",
    [
      merchant.id,
      merchant.name,
      merchant.default_category,
      new Date().toISOString(),
    ]
  );
};

export const getAllMerchants = async (): Promise<Merchant[]> => {
  const db = await dbPromise;
  return await db.getAllAsync<Merchant>("SELECT * FROM merchants ORDER BY name ASC");
};

// --- SMS Feedback management ---

export const saveFeedback = async (feedback: {
  id: string;
  sms_body: string;
  merchant: string;
  is_transaction: boolean;
}): Promise<void> => {
  const db = await dbPromise;
  await db.runAsync(
    "INSERT INTO sms_feedback (id, sms_body, merchant, is_transaction, created_at) VALUES (?, ?, ?, ?, ?)",
    [
      feedback.id,
      feedback.sms_body,
      feedback.merchant,
      feedback.is_transaction ? 1 : 0,
      new Date().toISOString(),
    ]
  );
};

export const checkFeedback = async (merchant: string): Promise<boolean | null> => {
  const db = await dbPromise;
  const result = await db.getFirstAsync<SmsFeedback>(
    "SELECT is_transaction FROM sms_feedback WHERE merchant = ? ORDER BY created_at DESC LIMIT 1",
    [merchant]
  );
  return result ? result.is_transaction === 1 : null;
};
