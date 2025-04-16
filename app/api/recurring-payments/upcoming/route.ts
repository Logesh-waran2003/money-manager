import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { betterAuthInstance } from "@/lib/better-auth";
import { getAuthUser } from "@/lib/auth";

// GET upcoming recurring payments for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const daysParam = searchParams.get("days");
    const days = daysParam ? parseInt(daysParam, 10) : 7; // Default to 7 days

    // Calculate the date range
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);

    // Get active recurring payments due within the specified date range
    const upcomingPayments = await prisma.recurringPayment.findMany({
      where: {
        userId: user.id,
        isActive: true,
        nextDueDate: {
          gte: today,
          lte: endDate,
        },
      },
      orderBy: {
        nextDueDate: "asc",
      },
      include: {
        transactions: {
          orderBy: {
            date: "desc",
          },
          take: 1,
        },
      },
    });

    // Transform data to include account and category names
    const transformedPayments = await Promise.all(
      upcomingPayments.map(async (payment) => {
        let accountName = null;
        let categoryName = null;

        if (payment.accountId) {
          const account = await prisma.account.findUnique({
            where: { id: payment.accountId },
            select: { name: true },
          });
          accountName = account?.name || null;
        }

        if (payment.categoryId) {
          const category = await prisma.category.findUnique({
            where: { id: payment.categoryId },
            select: { name: true },
          });
          categoryName = category?.name || null;
        }

        // Calculate days until due
        const dueDate = new Date(payment.nextDueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          ...payment,
          accountName,
          categoryName,
          daysUntilDue,
        };
      })
    );

    return NextResponse.json(transformedPayments);
  } catch (error) {
    console.error("Error fetching upcoming recurring payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming recurring payments" },
      { status: 500 }
    );
  }
}
