import { NextResponse } from "next/server";
import { db, accounts } from "@/db";

export async function GET() {
  try {
    const allAccounts = await db.select().from(accounts);
    return NextResponse.json(allAccounts);
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, type, balance = 0, description } = await request.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    const newAccount = await db
      .insert(accounts)
      .values({ name, type, balance, description })
      .returning();

    return NextResponse.json(newAccount[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
