import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET a specific transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        account: true,
        toAccount: true,
        category: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
  }
}

// UPDATE a transaction by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Get the original transaction to calculate balance adjustments
    const originalTransaction = await prisma.transaction.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!originalTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Update the transaction
    const transaction = await prisma.transaction.update({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
      include: {
        account: true,
        toAccount: true,
        category: true,
      },
    });

    // Revert the original transaction's effect on account balances
    if (originalTransaction.type === 'expense') {
      await prisma.account.update({
        where: { id: originalTransaction.accountId },
        data: { balance: { increment: originalTransaction.amount } },
      });
    } else if (originalTransaction.type === 'income') {
      await prisma.account.update({
        where: { id: originalTransaction.accountId },
        data: { balance: { decrement: originalTransaction.amount } },
      });
    } else if (originalTransaction.type === 'transfer' && originalTransaction.toAccountId) {
      await prisma.account.update({
        where: { id: originalTransaction.accountId },
        data: { balance: { increment: originalTransaction.amount } },
      });
      await prisma.account.update({
        where: { id: originalTransaction.toAccountId },
        data: { balance: { decrement: originalTransaction.amount } },
      });
    } else if (originalTransaction.type === 'credit' && originalTransaction.creditType === 'borrowed') {
      await prisma.account.update({
        where: { id: originalTransaction.accountId },
        data: { balance: { decrement: originalTransaction.amount } },
      });
    } else if (originalTransaction.type === 'credit' && originalTransaction.creditType === 'lent') {
      await prisma.account.update({
        where: { id: originalTransaction.accountId },
        data: { balance: { increment: originalTransaction.amount } },
      });
    }

    // Apply the updated transaction's effect on account balances
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
      await prisma.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: data.amount } },
      });
    } else if (data.type === 'credit' && data.creditType === 'lent') {
      await prisma.account.update({
        where: { id: data.accountId },
        data: { balance: { decrement: data.amount } },
      });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

// DELETE a transaction by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the transaction before deleting to handle balance adjustments
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Delete the transaction
    await prisma.transaction.delete({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    // Update account balances
    if (transaction.type === 'expense') {
      await prisma.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: transaction.amount } },
      });
    } else if (transaction.type === 'income') {
      await prisma.account.update({
        where: { id: transaction.accountId },
        data: { balance: { decrement: transaction.amount } },
      });
    } else if (transaction.type === 'transfer' && transaction.toAccountId) {
      await prisma.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: transaction.amount } },
      });
      await prisma.account.update({
        where: { id: transaction.toAccountId },
        data: { balance: { decrement: transaction.amount } },
      });
    } else if (transaction.type === 'credit' && transaction.creditType === 'borrowed') {
      await prisma.account.update({
        where: { id: transaction.accountId },
        data: { balance: { decrement: transaction.amount } },
      });
    } else if (transaction.type === 'credit' && transaction.creditType === 'lent') {
      await prisma.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: transaction.amount } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
