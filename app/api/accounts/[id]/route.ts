import { NextResponse } from "next/server";
import { db, accounts } from "@/db";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const accountId = parseInt(params.id);
    const account = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId));

    if (!account.length) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json(account[0]);
  } catch (error) {
    console.error("Failed to fetch account:", error);
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { name, type, balance, description } = await request.json();

    const updatedData: Record<string, any> = {};
    if (name !== undefined) updatedData.name = name;
    if (type !== undefined) updatedData.type = type;
    if (balance !== undefined) updatedData.balance = balance;
    if (description !== undefined) updatedData.description = description;

    if (Object.keys(updatedData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updatedAccount = await db
      .update(accounts)
      .set(updatedData)
      .where(eq(accounts.id, id))
      .returning();

    if (!updatedAccount.length) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json(updatedAccount[0]);
  } catch (error) {
    console.error("Failed to update account:", error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const accountId = parseInt(params.id);
    const deletedAccount = await db
      .delete(accounts)
      .where(eq(accounts.id, accountId))
      .returning();

    if (!deletedAccount.length) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
