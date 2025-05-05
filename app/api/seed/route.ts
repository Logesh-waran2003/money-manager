import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEV_USER_ID } from "@/lib/auth";

// This is a development-only endpoint to seed the database with initial data
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not allowed in production" },
      { status: 403 }
    );
  }

  try {
    // Get or create a test user
    const user = await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        id: DEV_USER_ID,
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password_would_go_here", // In a real app, this would be hashed
      },
    });

    // Create some accounts
    const accounts = await Promise.all([
      prisma.account.upsert({
        where: {
          id: "checking",
        },
        update: {},
        create: {
          id: "checking",
          name: "Checking Account",
          type: "bank",
          balance: 1000,
          currency: "USD",
          userId: DEV_USER_ID,
        },
      }),
      prisma.account.upsert({
        where: {
          id: "savings",
        },
        update: {},
        create: {
          id: "savings",
          name: "Savings Account",
          type: "bank",
          balance: 5000,
          currency: "USD",
          userId: DEV_USER_ID,
        },
      }),
      prisma.account.upsert({
        where: {
          id: "credit-card",
        },
        update: {},
        create: {
          id: "credit-card",
          name: "Credit Card",
          type: "credit",
          balance: 0,
          currency: "USD",
          creditLimit: 5000,
          userId: DEV_USER_ID,
        },
      }),
      prisma.account.upsert({
        where: {
          id: "investment",
        },
        update: {},
        create: {
          id: "investment",
          name: "Investment Account",
          type: "investment",
          balance: 10000,
          currency: "USD",
          userId: DEV_USER_ID,
        },
      }),
    ]);

    // Create some categories
    const incomeCategories = [
      { id: "income-salary", name: "Salary", isIncome: true, color: "#4CAF50" },
      {
        id: "income-freelance",
        name: "Freelance",
        isIncome: true,
        color: "#2196F3",
      },
      {
        id: "income-investments",
        name: "Investments",
        isIncome: true,
        color: "#9C27B0",
      },
      { id: "income-gifts", name: "Gifts", isIncome: true, color: "#E91E63" },
      {
        id: "income-other",
        name: "Other Income",
        isIncome: true,
        color: "#607D8B",
      },
    ];

    const expenseCategories = [
      {
        id: "expense-housing",
        name: "Housing",
        isIncome: false,
        color: "#FF5722",
      },
      {
        id: "expense-food",
        name: "Food & Dining",
        isIncome: false,
        color: "#FF9800",
      },
      {
        id: "expense-transportation",
        name: "Transportation",
        isIncome: false,
        color: "#795548",
      },
      {
        id: "expense-utilities",
        name: "Utilities",
        isIncome: false,
        color: "#607D8B",
      },
      {
        id: "expense-entertainment",
        name: "Entertainment",
        isIncome: false,
        color: "#9C27B0",
      },
      {
        id: "expense-shopping",
        name: "Shopping",
        isIncome: false,
        color: "#2196F3",
      },
      {
        id: "expense-health",
        name: "Health & Medical",
        isIncome: false,
        color: "#F44336",
      },
      {
        id: "expense-personal",
        name: "Personal Care",
        isIncome: false,
        color: "#E91E63",
      },
      {
        id: "expense-education",
        name: "Education",
        isIncome: false,
        color: "#3F51B5",
      },
      {
        id: "expense-other",
        name: "Other Expenses",
        isIncome: false,
        color: "#607D8B",
      },
    ];

    const categories = await Promise.all([
      ...incomeCategories.map((cat) =>
        prisma.category.upsert({
          where: { id: cat.id },
          update: {},
          create: {
            id: cat.id,
            name: cat.name,
            isIncome: cat.isIncome,
            color: cat.color,
            userId: DEV_USER_ID,
          },
        })
      ),
      ...expenseCategories.map((cat) =>
        prisma.category.upsert({
          where: { id: cat.id },
          update: {},
          create: {
            id: cat.id,
            name: cat.name,
            isIncome: cat.isIncome,
            color: cat.color,
            userId: DEV_USER_ID,
          },
        })
      ),
    ]);

    return NextResponse.json({
      message: "Database seeded successfully",
      user,
      accounts,
      categories: categories.length,
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
