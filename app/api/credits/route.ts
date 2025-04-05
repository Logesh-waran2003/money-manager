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

// POST /api/credits/repay - Record a repayment for a credit transaction
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const data = await req.json();
    
    // Validate required fields
    if (!data.creditId || !data.amount || !data.accountId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Get the original credit transaction to verify ownership and details
    const originalCredit = await db.transaction.findUnique({
      where: {
        id: data.creditId,
        userId // Ensure the user owns this credit
      },
      include: {
        repayments: true
      }
    });
    
    if (!originalCredit) {
      return NextResponse.json(
        { error: "Credit transaction not found" },
        { status: 404 }
      );
    }
    
    // Calculate current balance
    const totalRepaid = originalCredit.repayments.reduce(
      (sum, repayment) => sum + repayment.amount, 
      0
    );
    const currentBalance = originalCredit.amount - totalRepaid;
    
    // Check if already fully settled
    if (originalCredit.repayments.some(r => r.isFullSettlement)) {
      return NextResponse.json(
        { error: "This credit has already been fully settled" },
        { status: 400 }
      );
    }
    
    // Create the repayment transaction
    const repayment = await db.transaction.create({
      data: {
        userId,
        accountId: data.accountId,
        amount: data.amount,
        description: data.description || `Repayment for ${originalCredit.description}`,
        date: data.date || new Date(),
        type: "credit",
        creditType: originalCredit.creditType, // Same as original
        counterparty: originalCredit.counterparty, // Same as original
        isRepayment: true,
        creditId: data.creditId, // Reference to original credit
        isFullSettlement: data.isFullSettlement || false,
        categoryId: data.categoryId
      }
    });
    
    // If marked as fully settled, update the remaining balance info
    let remainingBalance = currentBalance - data.amount;
    
    return NextResponse.json({
      repayment,
      originalCredit: {
        ...originalCredit,
        currentBalance: remainingBalance,
        isSettled: data.isFullSettlement || remainingBalance <= 0
      }
    });
  } catch (error) {
    console.error("Error recording repayment:", error);
    return NextResponse.json(
      { error: "Failed to record repayment" },
      { status: 500 }
    );
  }
}
