import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/credits - Get all credit transactions for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const searchParams = req.nextUrl.searchParams;
    const creditType = searchParams.get("type"); // "lent" or "borrowed"
    
    // Get all credit transactions for the user
    const credits = await db.transaction.findMany({
      where: {
        userId,
        type: "credit",
        creditType: creditType || undefined, // Filter by type if provided
        // Only get parent credit transactions (not repayments)
        isRepayment: false
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        // Include all repayments for this credit
        repayments: {
          select: {
            id: true,
            amount: true,
            date: true,
            isFullSettlement: true
          }
        }
      },
      orderBy: {
        date: "desc"
      }
    });
    
    // Calculate current balance for each credit transaction
    const creditsWithBalance = credits.map(credit => {
      // Sum all repayments
      const totalRepaid = credit.repayments.reduce(
        (sum, repayment) => sum + repayment.amount, 
        0
      );
      
      // Calculate remaining balance
      const currentBalance = credit.amount - totalRepaid;
      
      // Check if fully settled
      const isSettled = credit.repayments.some(r => r.isFullSettlement) || 
                        currentBalance <= 0;
      
      return {
        ...credit,
        currentBalance,
        isSettled,
        totalRepaid
      };
    });
    
    return NextResponse.json(creditsWithBalance);
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit transactions" },
      { status: 500 }
    );
  }
}

// POST /api/credits - Create a new credit transaction
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const data = await req.json();
    
    // Validate required fields
    if (!data.accountId || !data.amount || !data.counterparty || !data.creditType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Create the credit transaction
    const credit = await db.transaction.create({
      data: {
        userId,
        accountId: data.accountId,
        amount: data.amount,
        description: data.description || "",
        date: data.date || new Date(),
        type: "credit",
        creditType: data.creditType, // "lent" or "borrowed"
        counterparty: data.counterparty,
        dueDate: data.dueDate,
        categoryId: data.categoryId,
        isRepayment: false
      }
    });
    
    return NextResponse.json(credit);
  } catch (error) {
    console.error("Error creating credit:", error);
    return NextResponse.json(
      { error: "Failed to create credit transaction" },
      { status: 500 }
    );
  }
}
