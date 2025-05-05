import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEV_USER_ID } from "@/lib/auth";

// GET all accounts for the user (no auth)
export async function GET(request: NextRequest) {
  try {
    // Use hardcoded user id for now
    const userId = DEV_USER_ID;
    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

// CREATE a new account
export async function POST(request: NextRequest) {
  try {
    const userId = DEV_USER_ID;
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.type || data.balance === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If this is set as default, unset any existing default account
    if (data.isDefault) {
      await prisma.account.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Create the new account
    const account = await prisma.account.create({
      data: {
        ...data,
        userId,
        isActive: true, // Ensure new accounts are active by default
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
