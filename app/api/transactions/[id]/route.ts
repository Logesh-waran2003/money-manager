import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/transactions/[id] - Get a specific transaction
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: params.id,
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
    });

    if (!transaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check if the transaction belongs to the authenticated user
    if (transaction.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the transaction' },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/[id] - Update a transaction
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the existing transaction
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check if the transaction belongs to the authenticated user
    if (existingTransaction.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
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

    // Revert the previous transaction's effect on account balances
    if (existingTransaction.type === 'income') {
      await prisma.account.update({
        where: { id: existingTransaction.accountId },
        data: { balance: { decrement: existingTransaction.amount } },
      });
    } else if (existingTransaction.type === 'expense') {
      await prisma.account.update({
        where: { id: existingTransaction.accountId },
        data: { balance: { increment: existingTransaction.amount } },
      });
    } else if (existingTransaction.type === 'transfer' && existingTransaction.toAccountId) {
      // Increase source account balance
      await prisma.account.update({
        where: { id: existingTransaction.accountId },
        data: { balance: { increment: existingTransaction.amount } },
      });
      
      // Decrease destination account balance
      await prisma.account.update({
        where: { id: existingTransaction.toAccountId },
        data: { balance: { decrement: existingTransaction.amount } },
      });
    }

    // Update the transaction
    const updatedTransaction = await prisma.transaction.update({
      where: {
        id: params.id,
      },
      data: {
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

    // Apply the new transaction's effect on account balances
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

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the transaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Delete a transaction
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the existing transaction
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check if the transaction belongs to the authenticated user
    if (existingTransaction.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Revert the transaction's effect on account balances
    if (existingTransaction.type === 'income') {
      await prisma.account.update({
        where: { id: existingTransaction.accountId },
        data: { balance: { decrement: existingTransaction.amount } },
      });
    } else if (existingTransaction.type === 'expense') {
      await prisma.account.update({
        where: { id: existingTransaction.accountId },
        data: { balance: { increment: existingTransaction.amount } },
      });
    } else if (existingTransaction.type === 'transfer' && existingTransaction.toAccountId) {
      // Increase source account balance
      await prisma.account.update({
        where: { id: existingTransaction.accountId },
        data: { balance: { increment: existingTransaction.amount } },
      });
      
      // Decrease destination account balance
      await prisma.account.update({
        where: { id: existingTransaction.toAccountId },
        data: { balance: { decrement: existingTransaction.amount } },
      });
    }

    // Delete the transaction
    await prisma.transaction.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the transaction' },
      { status: 500 }
    );
  }
}
