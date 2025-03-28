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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = parseInt(params.id);
    const { accountId, amount, category, description, appUsed, time } =
      await request.json();

    if (!accountId || amount === undefined) {
      return NextResponse.json(
        { error: "Account ID and amount are required" },
        { status: 400 }
      );
    }

    // Begin a transaction to ensure data consistency
    const result = await db.transaction(async (tx) => {
      // Get the original transaction
      const originalTransactionResult = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.id, transactionId));

      if (!originalTransactionResult.length) {
        throw new Error("Transaction not found");
      }
      const originalTransaction = originalTransactionResult[0];

      // Get the original account
      const originalAccountResult = await tx
        .select()
        .from(accounts)
        .where(eq(accounts.id, originalTransaction.accountId));

      if (!originalAccountResult.length) {
        throw new Error("Original account not found");
      }
      const originalAccount = originalAccountResult[0];

      // Revert the original transaction's effect on account balance
      const originalBalance = new Decimal(originalAccount.balance.toString());
      const originalAmount = new Decimal(originalTransaction.amount.toString());
      await tx
        .update(accounts)
        .set({
          balance: originalBalance.minus(originalAmount).toString(),
        })
        .where(eq(accounts.id, originalTransaction.accountId));

      // Check if account has changed
      const isSameAccount = originalTransaction.accountId === accountId;

      // If account has changed, get the new account
      let newAccount;
      if (!isSameAccount) {
        const newAccountResult = await tx
          .select()
          .from(accounts)
          .where(eq(accounts.id, accountId));

        if (!newAccountResult.length) {
          throw new Error("New account not found");
        }
        newAccount = newAccountResult[0];
      }

      // Update the transaction
      const updatedTransaction = await tx
        .update(transactions)
        .set({
          accountId,
          amount,
          category,
          description,
          appUsed,
          time: time ? new Date(time) : undefined,
        })
        .where(eq(transactions.id, transactionId))
        .returning();

      // Update the account balance(s)
      const newAmount = new Decimal(amount.toString());

      if (isSameAccount) {
        // Update the same account with the new amount
        await tx
          .update(accounts)
          .set({
            balance: originalBalance
              .minus(originalAmount)
              .plus(newAmount)
              .toString(),
          })
          .where(eq(accounts.id, accountId));
      } else {
        // Update the new account's balance
        const newAccountBalance = new Decimal(newAccount!.balance.toString());
        await tx
          .update(accounts)
          .set({
            balance: newAccountBalance.plus(newAmount).toString(),
          })
          .where(eq(accounts.id, accountId));
      }

      return updatedTransaction[0];
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
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

    await db.transaction(async (tx) => {
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
