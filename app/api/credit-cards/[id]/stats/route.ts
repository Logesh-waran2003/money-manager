import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEV_USER_ID } from "@/lib/auth";
import {
  getAvailableCredit,
  getCreditUtilization,
} from "@/lib/credit-card-utils";

// GET credit card statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = DEV_USER_ID;

    // Verify the account belongs to the user and is a credit card
    const account = await prisma.account.findUnique({
      where: {
        id: params.id,
        userId,
        type: "credit",
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Credit card account not found" },
        { status: 404 }
      );
    }

    // Get credit card statistics
    const availableCredit = await getAvailableCredit(params.id, prisma);
    const utilization = await getCreditUtilization(params.id, prisma);

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        accountId: params.id,
        userId,
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
      include: {
        category: true,
      },
    });

    // Calculate total spent this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlySpending = await prisma.transaction.aggregate({
      where: {
        accountId: params.id,
        userId,
        type: "credit",
        creditType: "borrowed",
        date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate payment due information
    const daysUntilDue = account.dueDate
      ? Math.ceil(
          (account.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

    return NextResponse.json({
      balance: account.balance,
      availableCredit,
      utilization,
      creditLimit: account.creditLimit,
      dueDate: account.dueDate,
      daysUntilDue,
      minimumPayment: account.minimumPayment,
      interestRate: account.interestRate,
      statementDate: account.statementDate,
      monthlySpending: monthlySpending._sum.amount || 0,
      recentTransactions,
    });
  } catch (error) {
    console.error("Error fetching credit card stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit card statistics" },
      { status: 500 }
    );
  }
}
