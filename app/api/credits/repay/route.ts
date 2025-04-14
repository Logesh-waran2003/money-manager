import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/credits/repay - Record a repayment for an existing credit
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.creditId || !data.accountId || !data.amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Validate amount is positive
    if (data.amount <= 0) {
      return NextResponse.json(
        { error: "Repayment amount must be greater than zero" },
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
    
    // Find the original credit transaction
    const originalCredit = await prisma.transaction.findFirst({
      where: {
        id: data.creditId,
        userId: user.id,
        type: "credit",
      },
      include: {
        repayments: true,
      },
    });
    
    if (!originalCredit) {
      return NextResponse.json(
        { error: "Credit transaction not found" },
        { status: 404 }
      );
    }
    
    // Calculate current balance before this repayment
    const totalRepaid = originalCredit.repayments.reduce(
      (sum, repayment) => sum + repayment.amount,
      0
    );
    const currentBalance = originalCredit.amount - totalRepaid;
    
    // Validate repayment amount doesn't exceed remaining balance
    if (data.amount > currentBalance && !data.isFullSettlement) {
      return NextResponse.json(
        { 
          error: "Repayment amount exceeds remaining balance. If this is intended to fully settle the debt, please mark it as a full settlement." 
        },
        { status: 400 }
      );
    }
    
    // If marked as full settlement but amount is less than balance, use the full balance amount
    const repaymentAmount = data.isFullSettlement && data.amount < currentBalance 
      ? currentBalance 
      : data.amount;
    
    // Create the repayment transaction
    const repayment = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: data.accountId,
        amount: repaymentAmount,
        date: new Date(data.date || Date.now()),
        type: "credit",
        creditId: originalCredit.id,
        isRepayment: true,
        isFullSettlement: !!data.isFullSettlement,
        description: data.description || `Repayment for ${originalCredit.counterparty}`,
        categoryId: data.categoryId,
        // Set the opposite credit type of the original
        creditType: originalCredit.creditType === "lent" ? "borrowed" : "lent",
        counterparty: originalCredit.counterparty,
      },
    });
    
    // Update account balance
    await prisma.account.update({
      where: { id: data.accountId },
      data: {
        // If original was lent, increase balance on repayment; if borrowed, decrease balance
        balance: {
          [originalCredit.creditType === "lent" ? "increment" : "decrement"]: repaymentAmount,
        },
      },
    });
    
    // Fetch the updated credit with repayments
    const updatedCredit = await prisma.transaction.findUnique({
      where: { id: originalCredit.id },
      include: {
        repayments: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });
    
    // Calculate updated balance
    const updatedTotalRepaid = updatedCredit!.repayments.reduce(
      (sum, r) => sum + r.amount,
      0
    );
    const updatedBalance = updatedCredit!.amount - updatedTotalRepaid;
    const isNowSettled = updatedCredit!.repayments.some(r => r.isFullSettlement) || 
                         Math.abs(updatedBalance) < 0.01;
    
    // Transform the data for response
    const transformedCredit = {
      id: updatedCredit!.id,
      accountId: updatedCredit!.accountId,
      amount: updatedCredit!.amount,
      currentBalance: updatedBalance,
      description: updatedCredit!.description || "",
      date: updatedCredit!.date.toISOString(),
      counterparty: updatedCredit!.counterparty || "",
      creditType: updatedCredit!.creditType as "lent" | "borrowed",
      dueDate: updatedCredit!.recurringEndDate?.toISOString(),
      isSettled: isNowSettled,
      totalRepaid: updatedTotalRepaid,
      repayments: updatedCredit!.repayments.map(r => ({
        id: r.id,
        amount: r.amount,
        date: r.date.toISOString(),
        isFullSettlement: r.isFullSettlement,
      })),
    };
    
    return NextResponse.json({
      repayment,
      originalCredit: transformedCredit,
    });
  } catch (error) {
    console.error("Error recording repayment:", error);
    return NextResponse.json(
      { error: "Failed to record repayment" },
      { status: 500 }
    );
  }
}
