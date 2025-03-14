import { Metadata } from "next";
import { notFound } from "next/navigation";
import TransactionForm from "@/components/transactions/transaction-form";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Edit Transaction | Money Manager",
  description: "Edit an existing transaction",
};

async function getTransaction(id: string) {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  const response = await fetch(`${protocol}://${host}/api/transactions/${id}`, {
    cache: "no-store",
  });
  // const response = await fetch(`/api/transactions/${id}`, {
  //   cache: "no-store",
  // });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function EditTransactionPage({
  params,
}: {
  params: { id: string };
}) {
  const transaction = await getTransaction(params.id);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Transaction</h1>
        <p className="text-muted-foreground">
          Update the details of your transaction
        </p>
      </div>

      <div className="max-w-2xl">
        <TransactionForm
          initialValues={transaction}
          transactionId={params.id}
        />
      </div>
    </div>
  );
}
