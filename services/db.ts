import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("money_manager_v4.db");

export const initDb = () => {
  db.execSync(`
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
  `);
};

export const getDb = () => db;

// Account management
export const findAccount = (bankName: string, accountLast4: string) => {
  return db.getFirstSync(
    "SELECT * FROM accounts WHERE bank_name = ? AND account_last4 = ?",
    [bankName, accountLast4]
  );
};

export const createAccount = (account: {
  id: string;
  bank_name: string;
  account_last4: string;
  account_type: string;
  nickname: string;
}) => {
  db.runSync(
    "INSERT INTO accounts (id, bank_name, account_last4, account_type, nickname, balance, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)",
    [account.id, account.bank_name, account.account_last4, account.account_type, account.nickname, new Date().toISOString()]
  );
};

export const getAllAccounts = () => {
  return db.getAllSync("SELECT * FROM accounts ORDER BY created_at DESC");
};

export const updateAccountBalance = (accountId: string, amount: number, type: 'debit' | 'credit') => {
  const account: any = db.getFirstSync("SELECT balance FROM accounts WHERE id = ?", [accountId]);
  if (account) {
    const newBalance = type === 'debit' ? account.balance - amount : account.balance + amount;
    db.runSync("UPDATE accounts SET balance = ? WHERE id = ?", [newBalance, accountId]);
  }
};

// Merchant management
export const findMerchant = (name: string) => {
  return db.getFirstSync("SELECT * FROM merchants WHERE name = ?", [name]);
};

export const createMerchant = (merchant: {
  id: string;
  name: string;
  default_category: string;
}) => {
  db.runSync(
    "INSERT OR IGNORE INTO merchants (id, name, default_category, created_at) VALUES (?, ?, ?, ?)",
    [merchant.id, merchant.name, merchant.default_category, new Date().toISOString()]
  );
};

export const getAllMerchants = () => {
  return db.getAllSync("SELECT * FROM merchants ORDER BY name ASC");
};
