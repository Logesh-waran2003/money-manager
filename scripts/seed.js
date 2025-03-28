// Seed script to populate the database with initial data
const { db, accounts, transactions } = require('../db');

async function seed() {
  try {
    console.log('Seeding database...');

    // Create accounts
    const accountsData = [
      {
        name: 'Main Checking',
        type: 'debit',
        balance: '5000.00',
        description: 'Primary checking account'
      },
      {
        name: 'Savings',
        type: 'debit',
        balance: '10000.00',
        description: 'Emergency fund'
      },
      {
        name: 'Credit Card',
        type: 'credit',
        balance: '-1500.00',
        description: 'Monthly expenses'
      }
    ];

    console.log('Creating accounts...');
    const createdAccounts = await db.insert(accounts).values(accountsData).returning();
    console.log(`Created ${createdAccounts.length} accounts`);

    // Create transactions
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const transactionsData = [
      {
        accountId: createdAccounts[0].id,
        amount: '-50.00',
        category: 'Food',
        description: 'Grocery shopping',
        time: yesterday,
        appUsed: 'Supermarket App'
      },
      {
        accountId: createdAccounts[0].id,
        amount: '-30.00',
        category: 'Entertainment',
        description: 'Movie tickets',
        time: twoDaysAgo,
        appUsed: 'Cinema App'
      },
      {
        accountId: createdAccounts[1].id,
        amount: '1000.00',
        category: 'Income',
        description: 'Salary deposit',
        time: threeDaysAgo,
        appUsed: 'Bank App'
      },
      {
        accountId: createdAccounts[2].id,
        amount: '-120.00',
        category: 'Shopping',
        description: 'Online purchase',
        time: now,
        appUsed: 'E-commerce'
      }
    ];

    console.log('Creating transactions...');
    const createdTransactions = await db.insert(transactions).values(transactionsData).returning();
    console.log(`Created ${createdTransactions.length} transactions`);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error during seeding:', error);
    process.exit(1);
  });
