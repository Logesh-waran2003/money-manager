import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

/**
 * POST /api/recurring-payments/[id]/update-due-date
 * 
 * Updates the next due date for a recurring payment based on its frequency
 * This endpoint is typically called after a transaction is created for a recurring payment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the recurring payment exists
    const recurringPayment = await prisma.recurringPayment.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!recurringPayment) {
      return NextResponse.json({ error: 'Recurring payment not found' }, { status: 404 });
    }

    // Verify ownership
    if (recurringPayment.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Calculate the next due date based on frequency
    const currentDueDate = new Date(recurringPayment.nextDueDate);
    let nextDueDate = new Date(currentDueDate);

    switch (recurringPayment.frequency.toLowerCase()) {
      case 'daily':
        nextDueDate.setDate(currentDueDate.getDate() + 1);
        break;
      case 'weekly':
        nextDueDate.setDate(currentDueDate.getDate() + 7);
        break;
      case 'monthly':
        nextDueDate.setMonth(currentDueDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDueDate.setMonth(currentDueDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDueDate.setFullYear(currentDueDate.getFullYear() + 1);
        break;
      case 'custom':
        if (recurringPayment.customIntervalDays && recurringPayment.customIntervalDays > 0) {
          nextDueDate.setDate(currentDueDate.getDate() + recurringPayment.customIntervalDays);
        } else {
          // Default to monthly if custom days is invalid
          nextDueDate.setMonth(currentDueDate.getMonth() + 1);
        }
        break;
      default:
        // Default to monthly for unknown frequency
        nextDueDate.setMonth(currentDueDate.getMonth() + 1);
    }

    // Update the recurring payment with the new due date
    const updatedPayment = await prisma.recurringPayment.update({
      where: {
        id: params.id,
      },
      data: {
        nextDueDate: nextDueDate,
      },
      include: {
        account: true,
        category: true,
      },
    });

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('Error updating recurring payment due date:', error);
    return NextResponse.json({ error: 'Failed to update recurring payment due date' }, { status: 500 });
  }
}
