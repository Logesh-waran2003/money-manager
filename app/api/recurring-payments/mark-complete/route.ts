import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { calculateNextDueDate } from "@/lib/utils/recurring-payment-utils";

// POST to mark a recurring payment as complete and update the next due date
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.recurringPaymentId) {
      return NextResponse.json(
        { error: "Missing recurring payment ID" },
        { status: 400 }
      );
    }

    // Get the recurring payment
    const recurringPayment = await prisma.recurringPayment.findUnique({
      where: {
        id: data.recurringPaymentId,
        userId: user.id, // Ensure the payment belongs to the user
      },
    });

    if (!recurringPayment) {
      return NextResponse.json(
        { error: "Recurring payment not found" },
        { status: 404 }
      );
    }

    // Calculate the next due date based on the transaction date or current date
    const transactionDate = data.transactionDate
      ? new Date(data.transactionDate)
      : new Date();
    const nextDueDate = calculateNextDueDate(
      recurringPayment.frequency,
      transactionDate,
      recurringPayment.customIntervalDays !== null
        ? recurringPayment.customIntervalDays
        : undefined
    );

    // Update the recurring payment with the new next due date
    const updatedPayment = await prisma.recurringPayment.update({
      where: { id: data.recurringPaymentId },
      data: { nextDueDate },
    });

    return NextResponse.json({
      message: "Recurring payment updated successfully",
      nextDueDate: updatedPayment.nextDueDate,
    });
  } catch (error) {
    console.error("Error updating recurring payment:", error);
    return NextResponse.json(
      { error: "Failed to update recurring payment" },
      { status: 500 }
    );
  }
}
