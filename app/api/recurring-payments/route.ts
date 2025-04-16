import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { calculateNextDueDate } from '@/lib/utils/recurring-payment-utils';

// GET all recurring payments for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recurringPayments = await prisma.recurringPayment.findMany({
      where: { userId: user.id },
      include: {
        transactions: {
          orderBy: {
            date: 'desc',
          },
          take: 5,
        },
      },
      orderBy: { nextDueDate: 'asc' },
    });

    // Transform data to include account and category names
    const transformedPayments = await Promise.all(
      recurringPayments.map(async (payment) => {
        let accountName = null;
        let categoryName = null;

        if (payment.accountId) {
          const account = await prisma.account.findUnique({
            where: { id: payment.accountId },
            select: { name: true },
          });
          accountName = account?.name || null;
        }

        if (payment.categoryId) {
          const category = await prisma.category.findUnique({
            where: { id: payment.categoryId },
            select: { name: true },
          });
          categoryName = category?.name || null;
        }

        return {
          ...payment,
          accountName,
          categoryName,
        };
      })
    );

    return NextResponse.json(transformedPayments);
  } catch (error) {
    console.error('Error fetching recurring payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring payments' },
      { status: 500 }
    );
  }
}

// CREATE a new recurring payment
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.amount || !data.frequency || !data.nextDueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (data.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than zero' },
        { status: 400 }
      );
    }

    // Validate custom interval days if frequency is custom
    if (
      data.frequency.toLowerCase() === 'custom' &&
      (!data.customIntervalDays || data.customIntervalDays <= 0)
    ) {
      return NextResponse.json(
        { error: 'Custom interval days must be provided and greater than zero' },
        { status: 400 }
      );
    }

    // Create the recurring payment
    const recurringPayment = await prisma.recurringPayment.create({
      data: {
        userId: user.id,
        name: data.name,
        defaultAmount: data.amount, // Use amount as defaultAmount to match schema
        frequency: data.frequency,
        customIntervalDays: data.customIntervalDays,
        startDate: new Date(data.startDate || Date.now()),
        endDate: data.endDate ? new Date(data.endDate) : null,
        nextDueDate: new Date(data.nextDueDate),
        accountId: data.accountId,
        categoryId: data.categoryId,
        counterparty: data.counterparty,
        description: data.description,
        isActive: data.isActive !== undefined ? data.isActive : true,
        direction: data.direction || 'sent', // Default to 'sent' if not provided
      },
    });

    return NextResponse.json(recurringPayment);
  } catch (error) {
    console.error('Error creating recurring payment:', error);
    return NextResponse.json(
      { error: 'Failed to create recurring payment' },
      { status: 500 }
    );
  }
}
