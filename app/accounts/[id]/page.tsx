import { Metadata } from "next";
import Link from "next/link";
import AccountDetail from "../../../components/accounts/account-detail";
import AccountTransactions from "../../../components/accounts/account-transactions";

export const metadata: Metadata = {
  title: "Account Details | Money Manager",
  description: "View and manage account details",
};

export default function AccountDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/accounts" className="text-blue-600 hover:underline">
          ← Back to Accounts
        </Link>
      </div>

      <AccountDetail id={params.id} />

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
        <AccountTransactions accountId={params.id} />
      </div>
    </div>
  );
}
