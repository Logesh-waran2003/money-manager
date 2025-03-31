"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountCard } from "@/components/ui/account-card";
import { TransactionCard } from "@/components/ui/transaction-card";
import { StatsCard } from "@/components/ui/stats-card";
import { 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowLeftRight,
  CreditCard,
  Wallet,
  Building,
  BarChart3,
  Clock
} from "lucide-react";

export default function Home() {
  // This is a placeholder dashboard with mock data
  // In a real implementation, this would fetch data from the API
  
  const accounts = [
    {
      id: "1",
      name: "Main Checking",
      balance: 2543.67,
      type: "bank" as const,
      lastTransaction: {
        amount: 120.50,
        isIncome: false,
        date: "2023-04-01"
      }
    },
    {
      id: "2",
      name: "Savings",
      balance: 12750.42,
      type: "bank" as const,
      lastTransaction: {
        amount: 500.00,
        isIncome: true,
        date: "2023-03-28"
      }
    },
    {
      id: "3",
      name: "Credit Card",
      balance: -450.33,
      type: "credit" as const,
      lastTransaction: {
        amount: 45.99,
        isIncome: false,
        date: "2023-04-02"
      }
    },
    {
      id: "4",
      name: "Cash",
      balance: 150.00,
      type: "cash" as const,
      lastTransaction: {
        amount: 20.00,
        isIncome: false,
        date: "2023-03-30"
      }
    }
  ];

  const recentTransactions = [
    {
      id: "t1",
      amount: 120.50,
      description: "Weekly grocery shopping",
      date: "2023-04-01",
      type: "expense" as const,
      category: "food" as const,
      counterparty: "Whole Foods",
      accountName: "Main Checking"
    },
    {
      id: "t2",
      amount: 45.99,
      description: "Streaming subscription",
      date: "2023-04-02",
      type: "expense" as const,
      category: "entertainment" as const,
      counterparty: "Netflix",
      accountName: "Credit Card"
    },
    {
      id: "t3",
      amount: 500.00,
      description: "Salary deposit",
      date: "2023-03-28",
      type: "income" as const,
      category: "income" as const,
      counterparty: "Employer Inc.",
      accountName: "Savings"
    },
    {
      id: "t4",
      amount: 200.00,
      description: "Transfer to savings",
      date: "2023-03-27",
      type: "transfer" as const,
      category: "other" as const,
      counterparty: "Own Account",
      accountName: "Main Checking → Savings"
    },
    {
      id: "t5",
      amount: 35.00,
      description: "Dinner with friends",
      date: "2023-03-26",
      type: "expense" as const,
      category: "food" as const,
      counterparty: "Local Restaurant",
      accountName: "Credit Card"
    }
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/transaction">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            New Transaction
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Monthly Income"
          value={3250.75}
          previousValue={3100.50}
          icon={<ArrowUpRight className="h-4 w-4" />}
          trend="up"
        />
        <StatsCard
          title="Monthly Expenses"
          value={1875.42}
          previousValue={1950.30}
          icon={<ArrowDownRight className="h-4 w-4" />}
          trend="down"
        />
        <StatsCard
          title="Net Savings"
          value={1375.33}
          previousValue={1150.20}
          icon={<BarChart3 className="h-4 w-4" />}
          trend="up"
        />
      </div>

      {/* Accounts Overview */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Accounts</h2>
          <Link href="/accounts">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              id={account.id}
              name={account.name}
              balance={account.balance}
              type={account.type}
              lastTransaction={account.lastTransaction}
              onClick={() => console.log(`View account ${account.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Link href="/transactions">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  id={transaction.id}
                  amount={transaction.amount}
                  description={transaction.description}
                  date={transaction.date}
                  type={transaction.type}
                  category={transaction.category}
                  counterparty={transaction.counterparty}
                  accountName={transaction.accountName}
                  onClick={() => console.log(`View transaction ${transaction.id}`)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/transaction?type=expense">
            <Card className="hover:bg-accent/5 cursor-pointer transition-colors">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <ArrowDownRight className="h-6 w-6 mb-2 text-error" />
                <span className="font-medium">Add Expense</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/transaction?type=income">
            <Card className="hover:bg-accent/5 cursor-pointer transition-colors">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <ArrowUpRight className="h-6 w-6 mb-2 text-success" />
                <span className="font-medium">Add Income</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/transaction?type=transfer">
            <Card className="hover:bg-accent/5 cursor-pointer transition-colors">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <ArrowLeftRight className="h-6 w-6 mb-2 text-info" />
                <span className="font-medium">Transfer</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/accounts/new">
            <Card className="hover:bg-accent/5 cursor-pointer transition-colors">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Wallet className="h-6 w-6 mb-2 text-primary" />
                <span className="font-medium">Add Account</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
