import { NextResponse } from "next/server";
import { db, transactions, accounts } from "@/db";
import { eq } from "drizzle-orm";
import { Decimal } from "decimal.js";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    // Filter by accountId if provided
    const query = accountId
      ? db
          .select()
          .from(transactions)
          .where(eq(transactions.accountId, parseInt(accountId)))
      : db.select().from(transactions);

    // Execute the query
    const allTransactions = await query.execute();

    return NextResponse.json(allTransactions);
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      accountId,
      amount,
      category,
      description,
      appUsed,
      time = new Date(),
    } = await request.json();

    if (!accountId || amount === undefined) {
      return NextResponse.json(
        { error: "Account ID and amount are required" },
        { status: 400 }
      );
    }

    // Begin a transaction to ensure data consistency
    const result = await db.transaction(async (tx) => {
      // Insert the transaction
      const newTransaction = await tx
        .insert(transactions)
        .values({
          accountId,
          amount,
          category,
          description,
          appUsed,
          time: new Date(time),
        })
        .returning();

      // Get the current account
      const accountResult = await tx
        .select()
        .from(accounts)
        .where(eq(accounts.id, accountId));

      if (!accountResult.length) {
        throw new Error("Account not found");
      }

      const account = accountResult[0];
      const currentBalance = new Decimal(account.balance.toString());
      const transactionAmount = new Decimal(amount.toString());

      // Update the account balance
      await tx
        .update(accounts)
        .set({
          balance: currentBalance.plus(transactionAmount).toString(),
        })
        .where(eq(accounts.id, accountId));

      return newTransaction[0];
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
