import { NextResponse } from "next/server";
import { db } from "@/db";
import { paymentApps } from "@/db/schema";

export async function GET() {
  try {
    const allPaymentApps = await db.select().from(paymentApps);
    return NextResponse.json(allPaymentApps);
  } catch (error) {
    console.error("Failed to fetch payment apps:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment apps" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Payment app name is required" },
        { status: 400 }
      );
    }

    const newPaymentApp = await db
      .insert(paymentApps)
      .values({ name })
      .returning();

    return NextResponse.json(newPaymentApp[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create payment app:", error);
    return NextResponse.json(
      { error: "Failed to create payment app" },
      { status: 500 }
    );
  }
}
