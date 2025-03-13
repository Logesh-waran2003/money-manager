import { Metadata } from "next";
import Link from "next/link";
import AccountForm from "@/components/accounts/account-form";

export const metadata: Metadata = {
  title: "New Account | Money Manager",
  description: "Create a new financial account",
};

export default function NewAccountPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/accounts" className="text-blue-600 hover:underline">
          ← Back to Accounts
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Create New Account</h1>

      <div className="max-w-2xl">
        <AccountForm />
      </div>
    </div>
  );
}
