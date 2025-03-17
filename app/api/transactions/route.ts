import { NextResponse } from "next/server";
import { db, transactions, accounts, categories, paymentApps } from "@/db";
import { eq, isNotNull, asc, desc } from "drizzle-orm";
import { Decimal } from "decimal.js";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const withTransfers = searchParams.get("withTransfers") === "true";
    const sortBy = searchParams.get("sortBy") || "time";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build the query using method chaining with $
    let queryBuilder = db
      .select({
        id: transactions.id,
        accountId: transactions.accountId,
        amount: transactions.amount,
        categoryId: transactions.categoryId,
        categoryName: categories.name, // Select category name
        description: transactions.description,
        paymentAppId: transactions.paymentAppId,
        paymentAppName: paymentApps.name, // Select payment app name
        time: transactions.time,
        transferId: transactions.transferId,
        recurringSpendId: transactions.recurringSpendId,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .leftJoin(paymentApps, eq(transactions.paymentAppId, paymentApps.id))
      .$dynamic();

    // Apply filters
    if (accountId) {
      queryBuilder = queryBuilder.where(
        eq(transactions.accountId, parseInt(accountId))
      );
    }

    if (withTransfers) {
      queryBuilder = queryBuilder.where(isNotNull(transactions.transferId));
    }

    // Apply sorting
    if (sortBy === "time") {
      if (sortOrder === "asc") {
        queryBuilder = queryBuilder.orderBy(asc(transactions.time));
      } else {
        queryBuilder = queryBuilder.orderBy(desc(transactions.time));
      }
    }

    // Execute the query
    const allTransactions = await queryBuilder;

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
      categoryId, // Changed from category to categoryId
      description,
      paymentAppId, // Changed from appUsed to paymentAppId
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
          categoryId, // Using categoryId directly
          description,
          paymentAppId, // Changed from appUsed to paymentAppId
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
