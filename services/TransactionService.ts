import { getDb } from './db';
import { CategoryId } from './config/detection';

export interface ManualTransaction {
  merchant: string;
  amount: number;
  category: CategoryId;
  note?: string;
  type: 'debit' | 'credit';
  method: 'upi' | 'cash' | 'card';
  accountId: string;
}

export const TransactionService = {
  async addManualTransaction(transaction: ManualTransaction) {
    const db = await getDb();
    const id = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const date = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO transactions (id, amount, merchant, category, date, mobile_id, type, raw_body, remarks, sync_status, account_id, merchant_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        id,
        transaction.amount,
        transaction.merchant,
        transaction.category,
        date,
        null,
        transaction.type,
        `Manual ${transaction.method.toUpperCase()} transaction`,
        transaction.note || '',
        transaction.accountId,
        null,
      ]
    );

    return id;
  },
};
