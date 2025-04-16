import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create a test user
  const hashedPassword = await hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
    },
  });

  console.log(`Created user: ${user.name} (${user.email})`);

  // Create categories
  const expenseCategories = [
    { name: 'Food & Dining', color: '#FF5733', icon: 'utensils', isIncome: false, isDefault: false },
    { name: 'Transportation', color: '#33A8FF', icon: 'car', isIncome: false, isDefault: false },
    { name: 'Housing', color: '#33FF57', icon: 'home', isIncome: false, isDefault: false },
    { name: 'Entertainment', color: '#D433FF', icon: 'film', isIncome: false, isDefault: false },
    { name: 'Shopping', color: '#FF33A8', icon: 'shopping-bag', isIncome: false, isDefault: false },
    { name: 'Utilities', color: '#A8FF33', icon: 'bolt', isIncome: false, isDefault: false },
    { name: 'Healthcare', color: '#33FFA8', icon: 'heartbeat', isIncome: false, isDefault: false },
    { name: 'Personal', color: '#3357FF', icon: 'user', isIncome: false, isDefault: false },
  ];

  const incomeCategories = [
    { name: 'Salary', color: '#33FF57', icon: 'money-bill', isIncome: true, isDefault: true },
    { name: 'Freelance', color: '#33A8FF', icon: 'laptop', isIncome: true, isDefault: false },
    { name: 'Investments', color: '#FF5733', icon: 'chart-line', isIncome: true, isDefault: false },
    { name: 'Gifts', color: '#D433FF', icon: 'gift', isIncome: true, isDefault: false },
  ];

  const categories = [...expenseCategories, ...incomeCategories];

  for (const category of categories) {
    await prisma.category.create({
      data: {
        userId: user.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        isIncome: category.isIncome,
        isDefault: category.isDefault,
      },
    });
  }

  console.log(`Created ${categories.length} categories`);

  // Create accounts
  const accounts = [
    {
      name: 'Main Checking',
      type: 'bank',
      balance: 5000,
      isDefault: true,
    },
    {
      name: 'Savings',
      type: 'bank',
      balance: 10000,
      isDefault: false,
    },
    {
      name: 'Cash',
      type: 'cash',
      balance: 200,
      isDefault: false,
    },
    {
      name: 'Credit Card',
      type: 'credit',
      balance: -500,
      creditLimit: 5000,
      dueDate: new Date(2025, 4, 15), // May 15, 2025
      isDefault: false,
    },
  ];

  for (const account of accounts) {
    await prisma.account.create({
      data: {
        userId: user.id,
        ...account,
      },
    });
  }

  console.log(`Created ${accounts.length} accounts`);

  // Get created accounts and categories for reference
  const checkingAccount = await prisma.account.findFirst({
    where: { userId: user.id, name: 'Main Checking' },
  });
  
  const savingsAccount = await prisma.account.findFirst({
    where: { userId: user.id, name: 'Savings' },
  });
  
  const creditAccount = await prisma.account.findFirst({
    where: { userId: user.id, name: 'Credit Card' },
  });
  
  const foodCategory = await prisma.category.findFirst({
    where: { userId: user.id, name: 'Food & Dining' },
  });
  
  const salaryCategory = await prisma.category.findFirst({
    where: { userId: user.id, name: 'Salary' },
  });
  
  const housingCategory = await prisma.category.findFirst({
    where: { userId: user.id, name: 'Housing' },
  });

  // Create transactions
  if (checkingAccount && savingsAccount && creditAccount && foodCategory && salaryCategory && housingCategory) {
    // Regular expense
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: checkingAccount.id,
        amount: 45.75,
        description: 'Grocery shopping',
        date: new Date(2025, 3, 1), // April 1, 2025
        type: 'expense',
        categoryId: foodCategory.id,
        counterparty: 'Whole Foods',
      },
    });

    // Regular income
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: checkingAccount.id,
        amount: 3500,
        description: 'Monthly salary',
        date: new Date(2025, 3, 1), // April 1, 2025
        type: 'income',
        categoryId: salaryCategory.id,
        counterparty: 'Acme Corp',
      },
    });

    // Transfer between accounts
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: checkingAccount.id,
        toAccountId: savingsAccount.id,
        amount: 500,
        description: 'Monthly savings',
        date: new Date(2025, 3, 2), // April 2, 2025
        type: 'transfer',
      },
    });

    // Credit card expense
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: creditAccount.id,
        amount: 120.50,
        description: 'Online shopping',
        date: new Date(2025, 3, 3), // April 3, 2025
        type: 'expense',
        counterparty: 'Amazon',
        categoryId: foodCategory.id,
      },
    });

    // Recurring payment
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: checkingAccount.id,
        amount: 1200,
        description: 'Monthly rent',
        date: new Date(2025, 3, 5), // April 5, 2025
        type: 'expense',
        categoryId: housingCategory.id,
        counterparty: 'Landlord',
        recurring: true,
        recurringFrequency: 'monthly',
      },
    });

    // Credit transactions (lent)
    const lentTransaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: checkingAccount.id,
        amount: 200,
        description: 'Lent for dinner',
        date: new Date(2025, 3, 10), // April 10, 2025
        type: 'credit',
        creditType: 'lent',
        counterparty: 'John',
        isRepayment: false,
      },
    });

    // Partial repayment for the lent money
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: checkingAccount.id,
        amount: 50,
        description: 'Partial repayment for dinner',
        date: new Date(2025, 3, 15), // April 15, 2025
        type: 'credit',
        creditType: 'lent',
        counterparty: 'John',
        isRepayment: true,
        creditId: lentTransaction.id,
        isFullSettlement: false,
      },
    });

    // Credit transactions (borrowed)
    const borrowedTransaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: checkingAccount.id,
        amount: 300,
        description: 'Borrowed for car repair',
        date: new Date(2025, 3, 12), // April 12, 2025
        type: 'credit',
        creditType: 'borrowed',
        counterparty: 'Sarah',
        isRepayment: false,
      },
    });

    // Partial repayment for the borrowed money
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: checkingAccount.id,
        amount: 100,
        description: 'First repayment for car repair',
        date: new Date(2025, 3, 20), // April 20, 2025
        type: 'credit',
        creditType: 'borrowed',
        counterparty: 'Sarah',
        isRepayment: true,
        creditId: borrowedTransaction.id,
        isFullSettlement: false,
      },
    });

    console.log('Created 8 transactions');
  }

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
