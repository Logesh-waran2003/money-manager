import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create a test user
  const hashedPassword = await hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });
  
  console.log(`Created user: ${user.name} (${user.email})`);

  // Create account types
  const accountTypes = [
    { name: 'Checking Account', type: 'bank', balance: 2500.00, isDefault: true },
    { name: 'Savings Account', type: 'bank', balance: 10000.00 },
    { name: 'Cash Wallet', type: 'cash', balance: 150.00 },
    { name: 'Credit Card', type: 'credit', balance: -450.00, creditLimit: 5000.00, dueDate: new Date(2025, 4, 15) },
    { name: 'Investment Account', type: 'investment', balance: 5000.00 },
  ];

  // Create accounts for the user
  const accounts = [];
  for (const accountData of accountTypes) {
    const account = await prisma.account.upsert({
      where: { 
        id: `${accountData.name.toLowerCase().replace(/\s/g, '-')}-${user.id}` 
      },
      update: {},
      create: {
        id: `${accountData.name.toLowerCase().replace(/\s/g, '-')}-${user.id}`,
        userId: user.id,
        name: accountData.name,
        type: accountData.type,
        balance: accountData.balance,
        currency: 'USD',
        isDefault: accountData.isDefault || false,
        creditLimit: accountData.creditLimit,
        dueDate: accountData.dueDate,
        isActive: true,
      },
    });
    accounts.push(account);
    console.log(`Created account: ${account.name} with balance $${account.balance}`);
  }

  // Create expense categories
  const expenseCategories = [
    'Food & Dining',
    'Groceries',
    'Shopping',
    'Entertainment',
    'Transportation',
    'Housing',
    'Utilities',
    'Health & Medical',
    'Personal Care',
    'Education',
    'Travel',
    'Gifts & Donations',
    'Bills & Subscriptions',
    'Other'
  ];

  for (const categoryName of expenseCategories) {
    await prisma.category.upsert({
      where: { 
        userId_name: {
          name: categoryName,
          userId: user.id
        }
      },
      update: {},
      create: {
        name: categoryName,
        isIncome: false,
        userId: user.id,
      },
    });
  }
  console.log(`Created ${expenseCategories.length} expense categories`);

  // Create income categories
  const incomeCategories = [
    'Salary',
    'Freelance',
    'Investments',
    'Gifts',
    'Refunds',
    'Other Income'
  ];

  for (const categoryName of incomeCategories) {
    await prisma.category.upsert({
      where: { 
        userId_name: {
          name: categoryName,
          userId: user.id
        }
      },
      update: {},
      create: {
        name: categoryName,
        isIncome: true,
        userId: user.id,
      },
    });
  }
  console.log(`Created ${incomeCategories.length} income categories`);

  // Get all created categories for reference
  const categories = await prisma.category.findMany({
    where: { userId: user.id }
  });

  // Create sample transactions
  const checkingAccount = accounts.find(a => a.name === 'Checking Account');
  const savingsAccount = accounts.find(a => a.name === 'Savings Account');
  const creditCard = accounts.find(a => a.name === 'Credit Card');
  const cashWallet = accounts.find(a => a.name === 'Cash Wallet');

  if (!checkingAccount || !savingsAccount || !creditCard || !cashWallet) {
    console.error('Could not find all required accounts');
    return;
  }

  // Helper function to get a random category by income status
  const getRandomCategory = (isIncome: boolean) => {
    const filteredCategories = categories.filter(c => c.isIncome === isIncome);
    return filteredCategories[Math.floor(Math.random() * filteredCategories.length)];
  };

  // Helper function to get a random date in the last 30 days
  const getRandomDate = (daysBack = 30) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    return date;
  };

  // Create expense transactions
  const expenses = [
    { 
      description: 'Grocery shopping', 
      amount: 85.47, 
      accountId: checkingAccount.id, 
      categoryId: categories.find(c => c.name === 'Groceries')?.id,
      date: getRandomDate(5),
      counterparty: 'Whole Foods'
    },
    { 
      description: 'Restaurant dinner', 
      amount: 64.20, 
      accountId: creditCard.id, 
      categoryId: categories.find(c => c.name === 'Food & Dining')?.id,
      date: getRandomDate(3),
      counterparty: 'Olive Garden'
    },
    { 
      description: 'Movie tickets', 
      amount: 32.50, 
      accountId: creditCard.id, 
      categoryId: categories.find(c => c.name === 'Entertainment')?.id,
      date: getRandomDate(7),
      counterparty: 'AMC Theaters'
    },
    { 
      description: 'Gas station', 
      amount: 45.00, 
      accountId: checkingAccount.id, 
      categoryId: categories.find(c => c.name === 'Transportation')?.id,
      date: getRandomDate(2),
      counterparty: 'Shell'
    },
    { 
      description: 'Phone bill', 
      amount: 85.99, 
      accountId: checkingAccount.id, 
      categoryId: categories.find(c => c.name === 'Bills & Subscriptions')?.id,
      date: getRandomDate(10),
      counterparty: 'Verizon'
    },
    { 
      description: 'Coffee shop', 
      amount: 5.75, 
      accountId: cashWallet.id, 
      categoryId: categories.find(c => c.name === 'Food & Dining')?.id,
      date: getRandomDate(1),
      counterparty: 'Starbucks'
    },
    { 
      description: 'Gym membership', 
      amount: 50.00, 
      accountId: creditCard.id, 
      categoryId: categories.find(c => c.name === 'Personal Care')?.id,
      date: getRandomDate(15),
      counterparty: 'LA Fitness'
    },
    { 
      description: 'Online shopping', 
      amount: 124.35, 
      accountId: creditCard.id, 
      categoryId: categories.find(c => c.name === 'Shopping')?.id,
      date: getRandomDate(8),
      counterparty: 'Amazon'
    },
    { 
      description: 'Electricity bill', 
      amount: 110.25, 
      accountId: checkingAccount.id, 
      categoryId: categories.find(c => c.name === 'Utilities')?.id,
      date: getRandomDate(12),
      counterparty: 'Power Company'
    },
    { 
      description: 'Haircut', 
      amount: 35.00, 
      accountId: cashWallet.id, 
      categoryId: categories.find(c => c.name === 'Personal Care')?.id,
      date: getRandomDate(6),
      counterparty: 'Great Clips'
    },
  ];

  for (const expense of expenses) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
        type: 'expense',
        accountId: expense.accountId,
        categoryId: expense.categoryId,
        counterparty: expense.counterparty,
      }
    });
  }
  console.log(`Created ${expenses.length} expense transactions`);

  // Create income transactions
  const incomes = [
    { 
      description: 'Salary deposit', 
      amount: 3200.00, 
      accountId: checkingAccount.id, 
      categoryId: categories.find(c => c.name === 'Salary')?.id,
      date: getRandomDate(15),
      counterparty: 'Employer Inc.'
    },
    { 
      description: 'Freelance payment', 
      amount: 450.00, 
      accountId: checkingAccount.id, 
      categoryId: categories.find(c => c.name === 'Freelance')?.id,
      date: getRandomDate(7),
      counterparty: 'Client XYZ'
    },
    { 
      description: 'Dividend payment', 
      amount: 75.25, 
      accountId: savingsAccount.id, 
      categoryId: categories.find(c => c.name === 'Investments')?.id,
      date: getRandomDate(10),
      counterparty: 'Vanguard'
    },
    { 
      description: 'Cash gift', 
      amount: 100.00, 
      accountId: cashWallet.id, 
      categoryId: categories.find(c => c.name === 'Gifts')?.id,
      date: getRandomDate(5),
      counterparty: 'Grandma'
    },
    { 
      description: 'Tax refund', 
      amount: 850.00, 
      accountId: checkingAccount.id, 
      categoryId: categories.find(c => c.name === 'Other Income')?.id,
      date: getRandomDate(20),
      counterparty: 'IRS'
    },
  ];

  for (const income of incomes) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: income.amount,
        description: income.description,
        date: income.date,
        type: 'income',
        accountId: income.accountId,
        categoryId: income.categoryId,
        counterparty: income.counterparty,
      }
    });
  }
  console.log(`Created ${incomes.length} income transactions`);

  // Create transfer transactions
  const transfers = [
    {
      description: 'Transfer to savings',
      amount: 500.00,
      fromAccountId: checkingAccount.id,
      toAccountId: savingsAccount.id,
      date: getRandomDate(8)
    },
    {
      description: 'ATM withdrawal',
      amount: 100.00,
      fromAccountId: checkingAccount.id,
      toAccountId: cashWallet.id,
      date: getRandomDate(3)
    },
    {
      description: 'Credit card payment',
      amount: 200.00,
      fromAccountId: checkingAccount.id,
      toAccountId: creditCard.id,
      date: getRandomDate(5)
    }
  ];

  for (const transfer of transfers) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: transfer.amount,
        description: transfer.description,
        date: transfer.date,
        type: 'transfer',
        accountId: transfer.fromAccountId,
        toAccountId: transfer.toAccountId,
      }
    });
  }
  console.log(`Created ${transfers.length} transfer transactions`);

  // Create credit transactions (borrowed/lent)
  const credits = [
    {
      description: 'Lent money for lunch',
      amount: 25.00,
      accountId: cashWallet.id,
      date: getRandomDate(4),
      counterparty: 'John',
      type: 'credit',
      creditType: 'lent',
    },
    {
      description: 'Borrowed for concert tickets',
      amount: 75.00,
      accountId: cashWallet.id,
      date: getRandomDate(10),
      counterparty: 'Sarah',
      type: 'credit',
      creditType: 'borrowed',
    },
    {
      description: 'Lent for emergency car repair',
      amount: 200.00,
      accountId: checkingAccount.id,
      date: getRandomDate(15),
      counterparty: 'Mike',
      type: 'credit',
      creditType: 'lent',
    }
  ];

  for (const credit of credits) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: credit.amount,
        description: credit.description,
        date: credit.date,
        type: credit.type,
        accountId: credit.accountId,
        counterparty: credit.counterparty,
        creditType: credit.creditType,
      }
    });
  }
  console.log(`Created ${credits.length} credit transactions`);

  // Create recurring transactions
  const recurring = [
    {
      description: 'Netflix subscription',
      amount: 14.99,
      accountId: creditCard.id,
      categoryId: categories.find(c => c.name === 'Bills & Subscriptions')?.id,
      date: getRandomDate(7),
      counterparty: 'Netflix',
      recurring: true,
      recurringFrequency: 'monthly'
    },
    {
      description: 'Rent payment',
      amount: 1200.00,
      accountId: checkingAccount.id,
      categoryId: categories.find(c => c.name === 'Housing')?.id,
      date: getRandomDate(15),
      counterparty: 'Landlord',
      recurring: true,
      recurringFrequency: 'monthly'
    },
    {
      description: 'Spotify subscription',
      amount: 9.99,
      accountId: creditCard.id,
      categoryId: categories.find(c => c.name === 'Bills & Subscriptions')?.id,
      date: getRandomDate(5),
      counterparty: 'Spotify',
      recurring: true,
      recurringFrequency: 'monthly'
    }
  ];

  for (const rec of recurring) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: rec.amount,
        description: rec.description,
        date: rec.date,
        type: 'expense',
        accountId: rec.accountId,
        categoryId: rec.categoryId,
        counterparty: rec.counterparty,
        recurring: rec.recurring,
        recurringFrequency: rec.recurringFrequency
      }
    });
  }
  console.log(`Created ${recurring.length} recurring transactions`);

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
