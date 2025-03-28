import { Metadata } from "next";
import { notFound } from "next/navigation";
import AccountForm from "@/components/accounts/account-form";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Edit Account | Money Manager",
  description: "Update your account details",
};

async function getAccount(id: string) {
  // Get the host from headers to build the absolute URL
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  const response = await fetch(`${protocol}://${host}/api/accounts/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function EditAccountPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const account = await getAccount(id);

  if (!account) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Account</h1>
        <p className="text-muted-foreground">
          Update the details of your account
        </p>
      </div>

      <div className="max-w-2xl">
        <AccountForm initialValues={account} accountId={params.id} />
      </div>
    </div>
  );
}
