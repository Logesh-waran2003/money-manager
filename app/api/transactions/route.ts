import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/transactions - Get all transactions for the authenticated user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build the where clause
    const where: any = {
      userId: session.user.id,
    };

    if (accountId) {
      where.OR = [
        { accountId },
        { toAccountId: accountId },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate) {
      where.date = {
        ...where.date,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      where.date = {
        ...where.date,
        lte: new Date(endDate),
      };
    }

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
      include: {
        account: {
          select: {
            name: true,
            type: true,
          },
        },
        category: {
          select: {
            name: true,
            icon: true,
            color: true,
          },
        },
      },
      skip: offset,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.transaction.count({ where });

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching transactions' },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      accountId,
      amount,
      description,
      date,
      type,
      categoryId,
      counterparty,
      appUsed,
      notes,
      toAccountId,
      recurringPaymentId,
      creditId,
    } = await request.json();

    // Validate required fields
    if (!accountId || amount === undefined || !date || !type) {
      return NextResponse.json(
        { message: 'Account, amount, date, and type are required' },
        { status: 400 }
      );
    }

    // Validate that the account belongs to the user
    const account = await prisma.account.findUnique({
      where: {
        id: accountId,
      },
    });

    if (!account || account.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Invalid account' },
        { status: 400 }
      );
    }

    // For transfers, validate the destination account
    if (type === 'transfer' && toAccountId) {
      const toAccount = await prisma.account.findUnique({
        where: {
          id: toAccountId,
        },
      });

      if (!toAccount || toAccount.userId !== session.user.id) {
        return NextResponse.json(
          { message: 'Invalid destination account' },
          { status: 400 }
        );
      }
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        accountId,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        type,
        categoryId,
        counterparty,
        appUsed,
        notes,
        toAccountId,
        recurringPaymentId,
        creditId,
      },
    });

    // Update account balances
    if (type === 'income') {
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: { increment: parseFloat(amount) } },
      });
    } else if (type === 'expense') {
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: { decrement: parseFloat(amount) } },
      });
    } else if (type === 'transfer' && toAccountId) {
      // Decrease source account balance
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: { decrement: parseFloat(amount) } },
      });
      
      // Increase destination account balance
      await prisma.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: parseFloat(amount) } },
      });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the transaction' },
      { status: 500 }
    );
  }
}
