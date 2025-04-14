import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/credits - Get all credit transactions for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // 'lent' or 'borrowed'
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Build the query
    const query: any = {
      where: {
        userId: user.id,
        type: "credit",
      },
      include: {
        account: true,
        repayments: {
          include: {
            account: true,
          },
          orderBy: {
            date: "desc",
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    };
    
    // Add credit type filter if provided
    if (type === "lent" || type === "borrowed") {
      query.where.creditType = type;
    }
    
    // Get credit transactions
    const credits = await prisma.transaction.findMany(query);
    
    // Transform the data to include calculated fields
    const transformedCredits = credits.map(credit => {
      // Calculate total repaid amount
      const totalRepaid = credit.repayments.reduce(
        (sum, repayment) => sum + repayment.amount,
        0
      );
      
      // Calculate current balance
      const currentBalance = credit.amount - totalRepaid;
      
      // Determine if the credit is fully settled
      const isSettled = credit.repayments.some(r => r.isFullSettlement) || 
                        Math.abs(currentBalance) < 0.01; // Consider settled if balance is near zero
      
      return {
        id: credit.id,
        accountId: credit.accountId,
        amount: credit.amount,
        currentBalance,
        description: credit.description || "",
        date: credit.date.toISOString(),
        counterparty: credit.counterparty || "",
        creditType: credit.creditType as "lent" | "borrowed",
        dueDate: credit.recurringEndDate?.toISOString(),
        isSettled,
        totalRepaid,
        repayments: credit.repayments.map(repayment => ({
          id: repayment.id,
          amount: repayment.amount,
          date: repayment.date.toISOString(),
          isFullSettlement: repayment.isFullSettlement,
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.accountId || !data.amount || !data.creditType || !data.counterparty) {
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
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Create the credit transaction
    const credit = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: data.accountId,
        amount: data.amount,
        date: new Date(data.date || Date.now()),
        type: "credit",
        creditType: data.creditType,
        counterparty: data.counterparty,
        description: data.description,
        recurringEndDate: data.dueDate ? new Date(data.dueDate) : null,
        categoryId: data.categoryId,
        appUsed: data.appUsed,
        notes: data.notes,
      },
    });
    
    // Update account balance
    await prisma.account.update({
      where: { id: data.accountId },
      data: {
        // If lending money, decrease balance; if borrowing, increase balance
        balance: {
          [data.creditType === "lent" ? "decrement" : "increment"]: data.amount,
        },
      },
    });
    
    return NextResponse.json(credit);
  } catch (error) {
    console.error("Error creating credit:", error);
    return NextResponse.json(
      { error: "Failed to create credit" },
      { status: 500 }
    );
  }
}
