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

    // Handle credit transactions with dueDate
    if (data.type === 'credit' && data.dueDate) {
      try {
        // Create a Credit record first
        const credit = await prisma.credit.create({
          data: {
            userId: user.id,
            name: data.description || `${data.creditType === 'lent' ? 'Lent to' : 'Borrowed from'} ${data.counterparty}`,
            amount: data.amount,
            type: data.creditType,
            counterparty: data.counterparty,
            dueDate: new Date(data.dueDate),
            notes: data.notes,
          }
        });
        
        // Add the creditId to the transaction data
        data.creditId = credit.id;
      } catch (error) {
        console.error("Error creating credit record:", error);
        // Continue without creating a Credit record - we'll just use the Transaction
      }
      
      // Store dueDate in recurringEndDate field for Transaction
      data.recurringEndDate = new Date(data.dueDate);
      
      // Remove dueDate from transaction data as it's not directly in the schema
      delete data.dueDate;
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

    // Update next due date for recurring payment if applicable
    if (data.recurring && data.recurringPaymentId) {
      try {
        const recurringPayment = await prisma.recurringPayment.findUnique({
          where: { id: data.recurringPaymentId }
        });
        
        if (recurringPayment) {
          // Calculate next due date based on frequency
          let nextDueDate = new Date(recurringPayment.nextDueDate);
          
          switch (recurringPayment.frequency.toLowerCase()) {
            case 'daily':
              nextDueDate.setDate(nextDueDate.getDate() + 1);
              break;
            case 'weekly':
              nextDueDate.setDate(nextDueDate.getDate() + 7);
              break;
            case 'monthly':
              nextDueDate.setMonth(nextDueDate.getMonth() + 1);
              break;
            case 'quarterly':
              nextDueDate.setMonth(nextDueDate.getMonth() + 3);
              break;
            case 'yearly':
              nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
              break;
            case 'custom':
              if (recurringPayment.customIntervalDays) {
                nextDueDate.setDate(nextDueDate.getDate() + recurringPayment.customIntervalDays);
              } else {
                // Default to monthly if custom days is invalid
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
              }
              break;
            default:
              // Default to monthly for unknown frequency
              nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          }
          
          // Update the recurring payment with the new due date
          await prisma.recurringPayment.update({
            where: { id: data.recurringPaymentId },
            data: { nextDueDate }
          });
        }
      } catch (error) {
        console.error("Error updating recurring payment next due date:", error);
        // Continue with the transaction even if updating the recurring payment fails
      }
    }

    // Set direction for transaction types that don't have it explicitly set
    if (!data.direction) {
      if (data.type === 'expense') {
        data.direction = 'sent';
      } else if (data.type === 'income') {
        data.direction = 'received';
      } else if (data.type === 'credit') {
        data.direction = data.creditType === 'lent' ? 'sent' : 'received';
      } else if (data.type === 'transfer') {
        data.direction = 'sent'; // For transfers, direction is always from source account
      }
    }

    // Update account balances based on direction and account type
    if (data.direction !== 'received') {
      // For money going out (sent)
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
    } else {
      // For money coming in (received)
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
    }
    
    // Handle special case for transfers between credit cards
    if (data.type === 'transfer' && data.toAccountId) {
      const toAccount = await prisma.account.findUnique({
        where: { id: data.toAccountId },
      });

      if (!toAccount) {
        return NextResponse.json({ error: 'Destination account not found' }, { status: 404 });
      }

      // For transfers between credit cards, adjust the balance based on account types
      if (account.type === 'credit' && toAccount.type === 'credit') {
        // Credit to credit: source decreases (payment), destination increases (debt)
        await prisma.account.update({
          where: { id: data.toAccountId },
          data: { balance: { increment: data.amount } },
        });
      } else if (account.type === 'credit' && toAccount.type !== 'credit') {
        // Credit to regular: source increases (cash advance), destination increases (deposit)
        await prisma.account.update({
          where: { id: data.toAccountId },
          data: { balance: { increment: data.amount } },
        });
      } else if (account.type !== 'credit' && toAccount.type === 'credit') {
        // Regular to credit: source decreases (withdrawal), destination decreases (payment)
        await prisma.account.update({
          where: { id: data.toAccountId },
          data: { balance: { decrement: data.amount } },
        });
      } else {
        // Regular to regular: destination increases
        await prisma.account.update({
          where: { id: data.toAccountId },
          data: { balance: { increment: data.amount } },
        });
      }
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
