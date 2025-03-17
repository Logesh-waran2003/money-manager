import { NextResponse } from "next/server";
import { db } from "@/db";
import { accounts, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Decimal } from "decimal.js";

export async function POST(request: Request) {
  try {
    const {
      fromAccountId,
      toAccountId,
      amount,
      description,
      time = new Date(),
    } = await request.json();

    if (!fromAccountId || !toAccountId || amount === undefined) {
      return NextResponse.json(
        { error: "From account, to account, and amount are required" },
        { status: 400 }
      );
    }

    if (fromAccountId === toAccountId) {
      return NextResponse.json(
        { error: "From account and to account cannot be the same" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Begin a transaction to ensure data consistency
    const result = await db.transaction(async (tx) => {
      // Create transfer ID to link both transactions
      // First transaction (debit from source account)
      const debitTransaction = await tx
        .insert(transactions)
        .values({
          accountId: fromAccountId,
          amount: `-${amount}`, // Negative amount for source account
          description: description || "Transfer to another account",
          time: new Date(time),
        })
        .returning();

      // Use the debit transaction ID as the transferId for both transactions
      const transferId = debitTransaction[0].id;

      // Second transaction (credit to destination account)
      const creditTransaction = await tx
        .insert(transactions)
        .values({
          accountId: toAccountId,
          amount: amount.toString(), // Positive amount for destination account
          description: description || "Transfer from another account",
          time: new Date(time),
          transferId, // Link with the first transaction
        })
        .returning();

      // Update debit transaction to include transferId
      await tx
        .update(transactions)
        .set({
          transferId: creditTransaction[0].id, // Link the first transaction with the second
        })
        .where(eq(transactions.id, transferId));

      // Update source account balance
      const fromAccountResult = await tx
        .select()
        .from(accounts)
        .where(eq(accounts.id, fromAccountId));

      if (!fromAccountResult.length) {
        throw new Error("Source account not found");
      }

      const fromAccount = fromAccountResult[0];
      const fromAccountBalance = new Decimal(fromAccount.balance.toString());
      const debitAmount = new Decimal(amount.toString()).negated(); // Negative amount

      await tx
        .update(accounts)
        .set({
          balance: fromAccountBalance.plus(debitAmount).toString(),
        })
        .where(eq(accounts.id, fromAccountId));

      // Update destination account balance
      const toAccountResult = await tx
        .select()
        .from(accounts)
        .where(eq(accounts.id, toAccountId));

      if (!toAccountResult.length) {
        throw new Error("Destination account not found");
      }

      const toAccount = toAccountResult[0];
      const toAccountBalance = new Decimal(toAccount.balance.toString());
      const creditAmount = new Decimal(amount.toString()); // Positive amount

      await tx
        .update(accounts)
        .set({
          balance: toAccountBalance.plus(creditAmount).toString(),
        })
        .where(eq(accounts.id, toAccountId));

      return {
        from: debitTransaction[0],
        to: creditTransaction[0],
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to create transfer:", error);
    return NextResponse.json(
      { error: "Failed to create transfer" },
      { status: 500 }
    );
  }
}
