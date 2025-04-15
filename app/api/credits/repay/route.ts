import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/credits/repay - Record a repayment for a credit
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
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
    
    // Use a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find the credit record
      const credit = await tx.credit.findFirst({
        where: {
          id: data.creditId,
          userId
        },
        include: {
          transactions: {
            where: {
              isRepayment: true
            }
          }
        }
      });
      
      if (!credit) {
        throw new Error("Credit not found");
      }
      
      // 2. Check if already fully settled
      if (credit.isFullySettled || credit.transactions.some(t => t.isFullSettlement)) {
        throw new Error("This credit has already been fully settled");
      }
      
      // 3. Calculate current balance
      const totalRepaid = credit.transactions.reduce(
        (sum, repayment) => sum + repayment.amount,
        0
      );
      const currentBalance = credit.amount - totalRepaid;
      
      // 4. Validate repayment amount
      if (data.amount > currentBalance && !data.isFullSettlement) {
        throw new Error("Repayment amount exceeds remaining balance");
      }
      
      // If marked as full settlement but amount is less than balance, use the full balance amount
      const repaymentAmount = data.isFullSettlement && data.amount < currentBalance 
        ? currentBalance 
        : data.amount;
      
      // 5. Create the repayment transaction
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: data.accountId,
          amount: repaymentAmount,
          date: new Date(data.date || Date.now()),
          type: "credit",
          creditType: credit.type === "lent" ? "borrowed" : "lent", // Opposite of original
          counterparty: credit.counterparty,
          description: data.description || `Repayment for ${credit.name}`,
          creditId: credit.id,
          isRepayment: true,
          isFullSettlement: !!data.isFullSettlement,
          categoryId: data.categoryId
        }
      });
      
      // 6. Update the credit record
      const newBalance = currentBalance - repaymentAmount;
      const isNowFullySettled = data.isFullSettlement || newBalance <= 0;
      
      const updatedCredit = await tx.credit.update({
        where: { id: credit.id },
        data: {
          currentBalance: Math.max(0, newBalance),
          isPaid: true,
          isFullySettled: isNowFullySettled
        },
        include: {
          transactions: {
            where: {
              isRepayment: true
            },
            orderBy: {
              date: "desc"
            },
            include: {
              account: true
            }
          }
        }
      });
      
      // 7. Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          // If original was lent, increase balance on repayment; if borrowed, decrease balance
          balance: {
            [credit.type === "lent" ? "increment" : "decrement"]: repaymentAmount,
          },
        }
      });
      
      // 8. Transform the credit data for response
      const transformedCredit = {
        id: updatedCredit.id,
        amount: updatedCredit.amount,
        currentBalance: updatedCredit.currentBalance,
        description: updatedCredit.name,
        date: updatedCredit.createdAt.toISOString(),
        counterparty: updatedCredit.counterparty,
        creditType: updatedCredit.type as "lent" | "borrowed",
        dueDate: updatedCredit.dueDate?.toISOString(),
        isSettled: updatedCredit.isFullySettled,
        totalRepaid: updatedCredit.amount - updatedCredit.currentBalance,
        repayments: updatedCredit.transactions.map(r => ({
          id: r.id,
          amount: r.amount,
          date: r.date.toISOString(),
          isFullSettlement: r.isFullSettlement,
          accountName: r.account?.name || "",
        })),
      };
      
      return {
        repayment: transaction,
        originalCredit: transformedCredit,
      };
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error recording repayment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record repayment" },
      { status: 500 }
    );
  }
}
