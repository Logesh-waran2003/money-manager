import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

interface Params {
  params: {
    id: string;
  };
}

// GET a specific recurring payment
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const recurringPayment = await prisma.recurringPayment.findUnique({
      where: {
        id,
        userId: user.id, // Ensure the payment belongs to the authenticated user
      },
      include: {
        transactions: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!recurringPayment) {
      return NextResponse.json(
        { error: 'Recurring payment not found' },
        { status: 404 }
      );
    }

    // Get account and category names
    let accountName = null;
    let categoryName = null;

    if (recurringPayment.accountId) {
      const account = await prisma.account.findUnique({
        where: { id: recurringPayment.accountId },
        select: { name: true },
      });
      accountName = account?.name || null;
    }

    if (recurringPayment.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: recurringPayment.categoryId },
        select: { name: true },
      });
      categoryName = category?.name || null;
    }

    // Return the payment with additional information
    return NextResponse.json({
      ...recurringPayment,
      accountName,
      categoryName,
    });
  } catch (error) {
    console.error('Error fetching recurring payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring payment' },
      { status: 500 }
    );
  }
}

// UPDATE a recurring payment
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    // Check if the recurring payment exists and belongs to the user
    const existingPayment = await prisma.recurringPayment.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Recurring payment not found' },
        { status: 404 }
      );
    }

    // Validate amount if provided
    if (data.amount !== undefined && data.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than zero' },
        { status: 400 }
      );
    }

    // Validate custom interval days if frequency is custom
    if (
      data.frequency?.toLowerCase() === 'custom' &&
      (!data.customIntervalDays || data.customIntervalDays <= 0)
    ) {
      return NextResponse.json(
        { error: 'Custom interval days must be provided and greater than zero' },
        { status: 400 }
      );
    }

    // Prepare data for update
    const updateData: any = {};
    
    // Only include fields that are provided in the request
    if (data.name !== undefined) updateData.name = data.name;
    if (data.amount !== undefined) updateData.defaultAmount = data.amount; // Map amount to defaultAmount
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.customIntervalDays !== undefined) updateData.customIntervalDays = data.customIntervalDays;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.nextDueDate !== undefined) updateData.nextDueDate = new Date(data.nextDueDate);
    if (data.accountId !== undefined) updateData.accountId = data.accountId;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.counterparty !== undefined) updateData.counterparty = data.counterparty;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.direction !== undefined) updateData.direction = data.direction;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Update the recurring payment
    const updatedPayment = await prisma.recurringPayment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('Error updating recurring payment:', error);
    return NextResponse.json(
      { error: 'Failed to update recurring payment' },
      { status: 500 }
    );
  }
}

// DELETE a recurring payment
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if the recurring payment exists and belongs to the user
    const existingPayment = await prisma.recurringPayment.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Recurring payment not found' },
        { status: 404 }
      );
    }

    // Delete the recurring payment
    await prisma.recurringPayment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recurring payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete recurring payment' },
      { status: 500 }
    );
  }
}
