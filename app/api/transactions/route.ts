import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET all transactions for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: {
        account: true,
        toAccount: true,
        category: true,
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// CREATE a new transaction
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.amount || !data.date || !data.type || !data.accountId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        userId: user.id,
        date: new Date(data.date),
      },
      include: {
        account: true,
        toAccount: true,
        category: true,
      },
    });

    // Update account balances based on transaction type
    if (data.type === 'expense') {
      await prisma.account.update({
        where: { id: data.accountId },
        data: { balance: { decrement: data.amount } },
      });
    } else if (data.type === 'income') {
      await prisma.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: data.amount } },
      });
    } else if (data.type === 'transfer' && data.toAccountId) {
      await prisma.account.update({
        where: { id: data.accountId },
        data: { balance: { decrement: data.amount } },
      });
      await prisma.account.update({
        where: { id: data.toAccountId },
        data: { balance: { increment: data.amount } },
      });
    } else if (data.type === 'credit' && data.creditType === 'borrowed') {
      // For credit card purchases, increase the balance (debt)
      await prisma.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: data.amount } },
      });
    } else if (data.type === 'credit' && data.creditType === 'lent') {
      // For credit card payments, decrease the balance (debt)
      await prisma.account.update({
        where: { id: data.accountId },
        data: { balance: { decrement: data.amount } },
      });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
