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

    // Get the account to check its type
    const account = await prisma.account.findUnique({
      where: { id: data.accountId },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
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

    // Update account balances based on transaction type and account type
    if (data.type === 'expense') {
      // For credit cards, spending money increases the balance (debt)
      if (account.type === 'credit') {
        await prisma.account.update({
          where: { id: data.accountId },
          data: { balance: { increment: data.amount } },
        });
      } else {
        // For regular accounts, spending money decreases the balance
        await prisma.account.update({
          where: { id: data.accountId },
          data: { balance: { decrement: data.amount } },
        });
      }
    } else if (data.type === 'income') {
      // For credit cards, receiving money (payment) decreases the balance (debt)
      if (account.type === 'credit') {
        await prisma.account.update({
          where: { id: data.accountId },
          data: { balance: { decrement: data.amount } },
        });
      } else {
        // For regular accounts, receiving money increases the balance
        await prisma.account.update({
          where: { id: data.accountId },
          data: { balance: { increment: data.amount } },
        });
      }
    } else if (data.type === 'transfer' && data.toAccountId) {
      const toAccount = await prisma.account.findUnique({
        where: { id: data.toAccountId },
      });

      if (!toAccount) {
        return NextResponse.json({ error: 'Destination account not found' }, { status: 404 });
      }

      // Handle transfers based on account types
      if (account.type === 'credit' && toAccount.type === 'credit') {
        // Credit to credit: source decreases (payment), destination increases (debt)
        await prisma.account.update({
          where: { id: data.accountId },
          data: { balance: { decrement: data.amount } },
        });
        await prisma.account.update({
          where: { id: data.toAccountId },
          data: { balance: { increment: data.amount } },
        });
      } else if (account.type === 'credit') {
        // Credit to regular: source increases (cash advance), destination increases (deposit)
        await prisma.account.update({
          where: { id: data.accountId },
          data: { balance: { increment: data.amount } },
        });
        await prisma.account.update({
          where: { id: data.toAccountId },
          data: { balance: { increment: data.amount } },
        });
      } else if (toAccount.type === 'credit') {
        // Regular to credit: source decreases (withdrawal), destination decreases (payment)
        await prisma.account.update({
          where: { id: data.accountId },
          data: { balance: { decrement: data.amount } },
        });
        await prisma.account.update({
          where: { id: data.toAccountId },
          data: { balance: { decrement: data.amount } },
        });
      } else {
        // Regular to regular: source decreases, destination increases
        await prisma.account.update({
          where: { id: data.accountId },
          data: { balance: { decrement: data.amount } },
        });
        await prisma.account.update({
          where: { id: data.toAccountId },
          data: { balance: { increment: data.amount } },
        });
      }
    } else if (data.type === 'credit') {
      if (data.creditType === 'borrowed') {
        // For borrowing money (making a purchase), increase the balance (debt)
        await prisma.account.update({
          where: { id: data.accountId },
          data: { balance: { increment: data.amount } },
        });
      } else if (data.creditType === 'lent') {
        // For lending money (making a payment), decrease the balance (debt)
        await prisma.account.update({
          where: { id: data.accountId },
          data: { balance: { decrement: data.amount } },
        });
      }
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
