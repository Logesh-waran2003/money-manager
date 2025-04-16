import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

// GET /api/credits - Get all credit transactions for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // 'lent' or 'borrowed'

    // Build the query
    const query: any = {
      where: {
        userId,
      },
      include: {
        transactions: {
          where: {
            isRepayment: true,
          },
          orderBy: {
            date: "desc",
          },
          include: {
            account: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    };

    // Add credit type filter if provided
    if (type === "lent" || type === "borrowed") {
      query.where.type = type;
    }

    // Get credit records
    type CreditWithTransactions = Awaited<
      ReturnType<typeof prisma.credit.findFirst>
    > & {
      transactions: Array<{
        id: string;
        amount: number;
        date: Date;
        isRepayment: boolean;
        isFullSettlement: boolean;
        account?: { name: string } | null;
      }>;
    };

    // Ensure transactions are always included in the query
    // (no extra logic here, just keep the include as originally intended)
    // The query.include is already set above, so nothing more is needed.

    const credits = await prisma.credit.findMany(query);

    // Transform the data to include calculated fields
    const transformedCredits = credits.map((credit) => {
      // Calculate total repaid amount
      const totalRepaid = credit.transactions.reduce(
        (sum: number, repayment: any) => sum + repayment.amount,
        0
      );

      // Calculate current balance (use stored value or calculate)
      const currentBalance =
        credit.currentBalance ?? credit.amount - totalRepaid;

      // Determine if the credit is fully settled
      const isSettled =
        credit.isFullySettled ||
        credit.transactions.some((r: any) => r.isFullSettlement) ||
        Math.abs(currentBalance) < 0.01; // Consider settled if balance is near zero

      // Calculate days until due and overdue status
      let daysUntilDue: number | null = null;
      let isOverdue = false;
      if (credit.dueDate) {
        const today = new Date();
        const dueDate = new Date(credit.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isOverdue = daysUntilDue < 0;
      }

      return {
        id: credit.id,
        amount: credit.amount,
        currentBalance,
        description: credit.name,
        date: credit.createdAt.toISOString(),
        counterparty: credit.counterparty,
        creditType: credit.type as "lent" | "borrowed",
        dueDate: credit.dueDate ? credit.dueDate.toISOString() : undefined,
        isSettled,
        totalRepaid,
        daysUntilDue,
        isOverdue,
        repayments: credit.transactions.map((repayment: any) => ({
          id: repayment.id,
          amount: repayment.amount,
          date: repayment.date.toISOString(),
          isFullSettlement: repayment.isFullSettlement,
          accountName: repayment.account?.name || "",
        })),
      };
    });

    return NextResponse.json(transformedCredits);
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}

// POST /api/credits - Create a new credit transaction
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const data = await request.json();

    // Validate required fields
    if (
      !data.accountId ||
      !data.amount ||
      !data.creditType ||
      !data.counterparty
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (data.amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than zero" },
        { status: 400 }
      );
    }

    // Use a transaction to ensure both operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Credit record
      const credit = await tx.credit.create({
        data: {
          userId,
          name:
            data.description ||
            `${data.creditType === "lent" ? "Lent to" : "Borrowed from"} ${
              data.counterparty
            }`,
          amount: data.amount,
          type: data.creditType,
          counterparty: data.counterparty,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          notes: data.notes,
          isPaid: false,
          isFullySettled: false,
          currentBalance: data.amount, // This field does exist in the database
        },
      });

      // 2. Create the Transaction record that references the Credit
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: data.accountId,
          amount: data.amount,
          date: new Date(data.date || Date.now()),
          type: "credit",
          creditType: data.creditType,
          counterparty: data.counterparty,
          description: data.description,
          creditId: credit.id, // Link to the newly created Credit
          categoryId: data.categoryId,
          appUsed: data.appUsed,
          notes: data.notes,
          direction: data.creditType === "lent" ? "sent" : "received", // Set direction based on credit type
        },
      });

      // 3. Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          // If lending money, decrease balance; if borrowing, increase balance
          balance: {
            [data.creditType === "lent" ? "decrement" : "increment"]:
              data.amount,
          },
        },
      });

      return { credit, transaction };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating credit:", error);
    return NextResponse.json(
      { error: "Failed to create credit" },
      { status: 500 }
    );
  }
}
