import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEV_USER_ID } from "@/lib/auth";

// GET a specific account by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = DEV_USER_ID;
    const account = await prisma.account.findUnique({
      where: { id: params.id, userId },
    });
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 }
    );
  }
}

// UPDATE an account by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = DEV_USER_ID;
    const data = await request.json();
    const updated = await prisma.account.updateMany({
      where: { id: params.id, userId },
      data,
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    const account = await prisma.account.findUnique({
      where: { id: params.id, userId },
    });
    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}

// DELETE an account by ID (or deactivate it)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = DEV_USER_ID;
    // Soft delete: set isActive to false
    const updated = await prisma.account.updateMany({
      where: { id: params.id, userId },
      data: { isActive: false },
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
