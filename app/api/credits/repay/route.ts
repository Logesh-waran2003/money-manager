import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

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
