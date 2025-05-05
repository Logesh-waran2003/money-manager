"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/lib/stores/useAccountStore";
import { useTransactions } from "@/lib/stores/useTransactionStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Archive,
  CreditCard,
  Wallet,
  Landmark,
  TrendingUp,
  Star,
} from "lucide-react";
import { useAccountStore } from "@/lib/stores/account-store";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { TransactionList } from "@/components/transaction-list";

export default function AccountDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  console.log("Account details page loaded with ID:", params.id);
  const {
    data: account,
    isLoading: accountLoading,
    error: accountError,
  } = useAccount(params.id);
  const { data: allTransactions, isLoading: transactionsLoading } =
    useTransactions();

  // Fallback to old stores if TanStack Query stores don't have data
  const { accounts, fetchAccounts } = useAccountStore();
  const { transactions } = useTransactionStore();

  // Ensure accounts are loaded
  React.useEffect(() => {
    if (accounts.length === 0) {
      console.log("No accounts in store, fetching...");
      fetchAccounts();
    }
  }, [accounts, fetchAccounts]);

  const accountFromStore = accounts.find((acc) => acc.id === params.id);
  console.log("Accounts in store:", accounts.length);
  console.log("Looking for account ID:", params.id);
  console.log("Found account in store:", accountFromStore ? "yes" : "no");

  const finalAccount = account || accountFromStore;

  // Filter transactions for this account
  const accountTransactions = React.useMemo(() => {
    if (allTransactions && finalAccount) {
      return allTransactions.filter(
        (transaction) =>
          transaction.accountId === finalAccount.id ||
          transaction.toAccountId === finalAccount.id
      );
    } else if (transactions && finalAccount) {
      return transactions.filter(
        (transaction) =>
          transaction.accountId === finalAccount.id ||
          transaction.toAccountId === finalAccount.id
      );
    }
    return [];
  }, [allTransactions, transactions, finalAccount]);

  // If account is not found, show a loading state or redirect
  if (!finalAccount) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading account details...</p>
          {accountError && (
            <p className="text-destructive mt-2">
              Error: {accountError.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "credit":
        return <CreditCard className="h-5 w-5" />;
      case "debit":
        return <CreditCard className="h-5 w-5" />;
      case "cash":
        return <Wallet className="h-5 w-5" />;
      case "bank":
      default:
        return <Landmark className="h-5 w-5" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  if (accountLoading && !accountFromStore) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">Loading account details...</div>
      </div>
    );
  }

  if (accountError && !accountFromStore) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8 text-red-500">
          {accountError instanceof Error
            ? accountError.message
            : "Failed to load account"}
        </div>
      </div>
    );
  }

  if (!finalAccount) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">Account not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold flex-grow">Account Details</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              console.log(
                "Edit button clicked, navigating to:",
                `/accounts/${params.id}/edit`
              );
              // Use window.location for direct navigation instead of router.push
              window.location.href = `/accounts/${params.id}/edit`;
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="default"
            className="bg-amber-600 hover:bg-amber-700"
            onClick={() => {
              console.log(
                "Deactivate button clicked, navigating to:",
                `/accounts/${params.id}/delete`
              );
              // Use window.location for direct navigation instead of router.push
              window.location.href = `/accounts/${params.id}/delete`;
            }}
          >
            <Archive className="h-4 w-4 mr-2" />
            Deactivate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center pb-2">
              <div className="mr-2 bg-primary/10 p-2 rounded-full">
                {getAccountIcon(finalAccount.type)}
              </div>
              <div>
                <CardTitle>{finalAccount.name}</CardTitle>
                <CardDescription>
                  {finalAccount.type.charAt(0).toUpperCase() +
                    finalAccount.type.slice(1)}
                  {finalAccount.isDefault && (
                    <span className="ml-2 inline-flex items-center">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-xs">Default</span>
                    </span>
                  )}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Balance
                  </p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(
                      finalAccount.balance,
                      finalAccount.currency
                    )}
                  </p>
                </div>

                {finalAccount.type === "credit" && finalAccount.creditLimit && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Credit Limit
                    </p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(
                        finalAccount.creditLimit,
                        finalAccount.currency
                      )}
                    </p>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        Available Credit
                      </p>
                      <p className="text-lg font-medium">
                        {formatCurrency(
                          finalAccount.creditLimit - finalAccount.balance,
                          finalAccount.currency
                        )}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (finalAccount.balance /
                                finalAccount.creditLimit) *
                                100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(
                          (finalAccount.balance / finalAccount.creditLimit) *
                            100
                        )}
                        % used
                      </p>
                    </div>
                  </div>
                )}

                {finalAccount.dueDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Due Date
                    </p>
                    <p className="text-lg font-medium">
                      {new Date(finalAccount.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">
                    Account Details
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {finalAccount.institution && (
                      <>
                        <p className="text-sm">Institution</p>
                        <p className="text-sm font-medium">
                          {finalAccount.institution}
                        </p>
                      </>
                    )}
                    {finalAccount.accountNumber && (
                      <>
                        <p className="text-sm">Account Number</p>
                        <p className="text-sm font-medium">
                          xxxx{finalAccount.accountNumber.slice(-4)}
                        </p>
                      </>
                    )}
                    <p className="text-sm">Created</p>
                    <p className="text-sm font-medium">
                      {new Date(finalAccount.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() =>
                  router.push("/transaction?accountId=" + finalAccount.id)
                }
              >
                Add Transaction
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                Recent activity for this account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="incoming">Incoming</TabsTrigger>
                  <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  {transactionsLoading ? (
                    <div className="text-center py-8">
                      Loading transactions...
                    </div>
                  ) : accountTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No transactions found for this account
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() =>
                          router.push(
                            "/transaction?accountId=" + finalAccount.id
                          )
                        }
                      >
                        Add Transaction
                      </Button>
                    </div>
                  ) : (
                    <TransactionList
                      transactions={accountTransactions}
                      showAccount={false}
                      currentAccountId={finalAccount?.id}
                    />
                  )}
                </TabsContent>

                <TabsContent value="incoming">
                  {transactionsLoading ? (
                    <div className="text-center py-8">
                      Loading transactions...
                    </div>
                  ) : accountTransactions.filter(
                      (t) =>
                        t.type === "income" ||
                        (t.type === "transfer" &&
                          t.toAccountId === finalAccount?.id)
                    ).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No incoming transactions found
                      </p>
                    </div>
                  ) : (
                    <TransactionList
                      transactions={accountTransactions.filter(
                        (t) =>
                          t.type === "income" ||
                          (t.type === "transfer" &&
                            t.toAccountId === finalAccount?.id)
                      )}
                      showAccount={false}
                      currentAccountId={finalAccount?.id}
                    />
                  )}
                </TabsContent>

                <TabsContent value="outgoing">
                  {transactionsLoading ? (
                    <div className="text-center py-8">
                      Loading transactions...
                    </div>
                  ) : accountTransactions.filter(
                      (t) =>
                        t.type === "expense" ||
                        (t.type === "transfer" &&
                          t.accountId === finalAccount?.id &&
                          t.toAccountId !== finalAccount?.id)
                    ).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No outgoing transactions found
                      </p>
                    </div>
                  ) : (
                    <TransactionList
                      transactions={accountTransactions.filter(
                        (t) =>
                          t.type === "expense" ||
                          (t.type === "transfer" &&
                            t.accountId === finalAccount?.id &&
                            t.toAccountId !== finalAccount?.id)
                      )}
                      showAccount={false}
                      currentAccountId={finalAccount?.id}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
