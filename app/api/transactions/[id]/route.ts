import { NextResponse } from "next/server";
import { db, transactions, accounts } from "@/db";
import { eq } from "drizzle-orm";
import { Decimal } from "decimal.js";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = parseInt(params.id);
    const transaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId));

    if (!transaction.length) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction[0]);
  } catch (error) {
    console.error("Failed to fetch transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = parseInt(params.id);

    const result = await db.transaction(async (tx) => {
      // Get the transaction
      const transactionResult = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.id, transactionId));

      if (!transactionResult.length) {
        throw new Error("Transaction not found");
      }

      const transaction = transactionResult[0];

      // Get the account
      const accountResult = await tx
        .select()
        .from(accounts)
        .where(eq(accounts.id, transaction.accountId));

      if (!accountResult.length) {
        throw new Error("Account not found");
      }

      const account = accountResult[0];

      // Revert the account balance
      const currentBalance = new Decimal(account.balance.toString());
      const transactionAmount = new Decimal(transaction.amount.toString());
      await tx
        .update(accounts)
        .set({
          balance: currentBalance.minus(transactionAmount).toString(),
        })
        .where(eq(accounts.id, transaction.accountId));

      // Delete the transaction
      const deletedTransaction = await tx
        .delete(transactions)
        .where(eq(transactions.id, transactionId))
        .returning();

      return deletedTransaction[0];
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
