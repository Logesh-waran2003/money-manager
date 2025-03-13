import {
  pgTable,
  serial,
  varchar,
  decimal,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const accountTypeEnum = pgEnum("account_type", ["debit", "credit"]);
export const creditTypeEnum = pgEnum("credit_type", ["lent", "borrowed"]);

// Accounts
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: accountTypeEnum("type").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  description: varchar("description", { length: 255 }),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 255 }),
  description: varchar("description", { length: 255 }),
  appUsed: varchar("app_used", { length: 255 }),
  time: timestamp("time").notNull(),
  transferId: integer("transfer_id"),
  recurringSpendId: integer("recurring_spend_id").references(
    () => recurringSpends.id
  ),
});

// Credits
export const credits = pgTable("credits", {
  id: serial("id").primaryKey(),
  type: creditTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  beneficiary: varchar("beneficiary", { length: 255 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  description: varchar("description", { length: 255 }),
});

// Credit Transactions
export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  creditId: integer("credit_id")
    .notNull()
    .references(() => credits.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  transactionId: integer("transaction_id").references(() => transactions.id),
  description: varchar("description", { length: 255 }),
});

// Recurring Spends
export const recurringSpends = pgTable("recurring_spends", {
  id: serial("id").primaryKey(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: varchar("frequency", { length: 50 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
});
