import Link from "next/link";
import Dashboard from "@/components/dashboard";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-8">Money Manager</h1>

      <Dashboard />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/accounts"
          className="p-6 border rounded-lg hover:bg-slate-50 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Accounts</h2>
          <p>Manage your bank accounts and wallets</p>
        </Link>

        <Link
          href="/transactions"
          className="p-6 border rounded-lg hover:bg-slate-50 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Transactions</h2>
          <p>Record and track your income and expenses</p>
        </Link>
      </div>
    </main>
  );
}
