import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

if (process.env.NODE_ENV !== "development") {
  console.error("Seeding is only allowed in development environment!");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Create the dummy user (matching DUMMY_USER in lib/auth.ts)
  const hashedPassword = await hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      id: "dev-user-id",
      name: "Dev User",
      email: "dev@example.com",
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: null,
      image: null,
    },
  });

  console.log(`Created user: ${user.name} (${user.email})`);

  // Create accounts
  const accounts = await prisma.$transaction([
    prisma.account.create({
      data: {
        id: "checking",
        userId: user.id,
        name: "Checking Account",
        type: "bank",
        balance: 1500,
        currency: "USD",
        isDefault: true,
        isActive: true,
      },
    }),
    prisma.account.create({
      data: {
        id: "savings",
        userId: user.id,
        name: "Savings Account",
        type: "bank",
        balance: 5000,
        currency: "USD",
        isDefault: false,
        isActive: true,
      },
    }),
    prisma.account.create({
      data: {
        id: "credit-card",
        userId: user.id,
        name: "Credit Card",
        type: "credit",
        balance: 200,
        currency: "USD",
        creditLimit: 3000,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 20)),
        isDefault: false,
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${accounts.length} accounts`);

  // Create categories
  const expenseCategories = [
    {
      name: "Food & Dining",
      color: "#FF5733",
      icon: "utensils",
      isIncome: false,
      isDefault: false,
    },
    {
      name: "Transportation",
      color: "#33A8FF",
      icon: "car",
      isIncome: false,
      isDefault: false,
    },
    {
      name: "Housing",
      color: "#33FF57",
      icon: "home",
      isIncome: false,
      isDefault: false,
    },
    {
      name: "Entertainment",
      color: "#D433FF",
      icon: "film",
      isIncome: false,
      isDefault: false,
    },
    {
      name: "Shopping",
      color: "#FF33A8",
      icon: "shopping-bag",
      isIncome: false,
      isDefault: false,
    },
    {
      name: "Utilities",
      color: "#A8FF33",
      icon: "bolt",
      isIncome: false,
      isDefault: false,
    },
    {
      name: "Healthcare",
      color: "#33FFA8",
      icon: "heartbeat",
      isIncome: false,
      isDefault: false,
    },
    {
      name: "Personal",
      color: "#3357FF",
      icon: "user",
      isIncome: false,
      isDefault: false,
    },
  ];

  const incomeCategories = [
    {
      name: "Salary",
      color: "#33FF57",
      icon: "money-bill",
      isIncome: true,
      isDefault: true,
    },
    {
      name: "Freelance",
      color: "#33A8FF",
      icon: "laptop",
      isIncome: true,
      isDefault: false,
    },
    {
      name: "Investments",
      color: "#FF5733",
      icon: "chart-line",
      isIncome: true,
      isDefault: false,
    },
    {
      name: "Gifts",
      color: "#D433FF",
      icon: "gift",
      isIncome: true,
      isDefault: false,
    },
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

  // Create transactions
  const checkingId = "checking";
  const savingsId = "savings";
  const creditCardId = "credit-card";

  await prisma.transaction.createMany({
    data: [
      {
        id: "txn-1",
        userId: user.id,
        accountId: checkingId,
        amount: 1000,
        date: new Date(),
        type: "income",
        description: "Salary for June",
        categoryId: await prisma.category
          .findFirst({ where: { userId: user.id, name: "Salary" } })
          .then((c) => c?.id),
        direction: "received",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "txn-2",
        userId: user.id,
        accountId: checkingId,
        amount: 50,
        date: new Date(),
        type: "expense",
        description: "Dinner at restaurant",
        categoryId: await prisma.category
          .findFirst({ where: { userId: user.id, name: "Food & Dining" } })
          .then((c) => c?.id),
        direction: "sent",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "txn-3",
        userId: user.id,
        accountId: savingsId,
        amount: 200,
        date: new Date(),
        type: "income",
        description: "Freelance project",
        categoryId: await prisma.category
          .findFirst({ where: { userId: user.id, name: "Freelance" } })
          .then((c) => c?.id),
        direction: "received",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "txn-4",
        userId: user.id,
        accountId: creditCardId,
        amount: 120,
        date: new Date(),
        type: "expense",
        description: "Online shopping",
        categoryId: await prisma.category
          .findFirst({ where: { userId: user.id, name: "Shopping" } })
          .then((c) => c?.id),
        direction: "sent",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "txn-5",
        userId: user.id,
        accountId: checkingId,
        amount: 75,
        date: new Date(),
        type: "expense",
        description: "Utilities bill",
        categoryId: await prisma.category
          .findFirst({ where: { userId: user.id, name: "Utilities" } })
          .then((c) => c?.id),
        direction: "sent",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });

  console.log("Created transactions");
  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
