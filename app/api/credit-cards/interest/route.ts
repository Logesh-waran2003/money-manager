import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEV_USER_ID } from "@/lib/auth";
import { calculateCreditCardInterest } from "@/lib/credit-card-utils";

// POST to calculate interest for a credit card
export async function POST(request: NextRequest) {
  try {
    const userId = DEV_USER_ID;

    const data = await request.json();

    // Validate required fields
    if (!data.accountId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the account belongs to the user and is a credit card
    const account = await prisma.account.findUnique({
      where: {
        id: data.accountId,
        userId: userId,
        type: "credit",
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Credit card account not found" },
        { status: 404 }
      );
    }

    // Calculate interest
    const date = data.date ? new Date(data.date) : new Date();
    const interestTransaction = await calculateCreditCardInterest(
      data.accountId,
      date,
      prisma
    );

    if (!interestTransaction) {
      return NextResponse.json({
        message: "No interest charged (zero balance or zero interest rate)",
      });
    }

    return NextResponse.json(interestTransaction);
  } catch (error) {
    console.error("Error calculating credit card interest:", error);
    return NextResponse.json(
      { error: "Failed to calculate interest" },
      { status: 500 }
    );
  }
}
