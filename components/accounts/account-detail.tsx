"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon, AlertTriangleIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Account {
  id: number;
  name: string;
  type: "debit" | "credit";
  balance: string;
  description?: string;
}

export default function AccountDetail({ id }: { id: string }) {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccount() {
      try {
        const response = await fetch(`/api/accounts/${id}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch account: ${response.status}`);
        }

        const data = await response.json();
        setAccount(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching account:", err);
        setError(err instanceof Error ? err.message : "Failed to load account");
        setLoading(false);
      }
    }

    fetchAccount();
  }, [id]);

  async function handleDeleteAccount() {
    if (!account) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account");
      }

      router.push("/accounts");
      router.refresh();
    } catch (err) {
      console.error("Error deleting account:", err);
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete account"
      );
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p>Loading account details...</p>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        <p>{error || "Account not found"}</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-bold">{account.name}</CardTitle>
          <div className="flex gap-2">
            <Link href={`/accounts/${id}/edit`}>
              <Button variant="outline" size="sm">
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2Icon className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Account Type
              </p>
              <p className="text-lg font-medium capitalize">{account.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Balance
              </p>
              <p
                className={`text-xl font-bold ${
                  parseFloat(account.balance) < 0
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {formatCurrency(account.balance)}
              </p>
            </div>
            {account.description && (
              <div className="col-span-full">
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="text-md">{account.description}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={() => router.push(`/transactions/new?accountId=${id}`)}
            >
              Add Transaction
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/transfers/new`)}
            >
              Make Transfer
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="h-5 w-5 text-red-500" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this account? This action cannot
              be undone.
              {parseFloat(account.balance) !== 0 && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
                  Warning: This account has a balance of{" "}
                  {formatCurrency(account.balance)}. Deleting it may cause
                  inconsistencies in your financial records.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className="bg-red-50 p-3 rounded-md text-red-800 text-sm">
              {deleteError}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
