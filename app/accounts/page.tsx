import Link from "next/link";
import { Metadata } from "next";
import AccountList from "../../components/accounts/account-list";

export const metadata: Metadata = {
  title: "Accounts | Money Manager",
  description: "Manage your financial accounts",
};

export default function AccountsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Accounts</h1>
        <Link
          href="/accounts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Account
        </Link>
      </div>

      <AccountList />
    </div>
  );
}
