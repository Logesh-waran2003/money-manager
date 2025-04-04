"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAccountStore } from "@/lib/stores/account-store";
import { AlertCircle } from "lucide-react";

// Define form schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Account name is required" }),
  type: z.enum(["bank", "credit", "debit", "cash"]),
  balance: z.string().refine((val) => !isNaN(parseFloat(val)), {
    message: "Please enter a valid amount",
  }),
  accountNumber: z.string().optional(),
  institution: z.string().optional(),
  notes: z.string().optional(),
  // Credit card specific fields
  creditLimit: z.string().optional(),
  dueDate: z.string().optional(),
});

export default function EditAccountPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  console.log("Edit account page loaded with ID:", params.id);
  const accountId = params.id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accounts, updateAccount, fetchAccounts } = useAccountStore();
  const [accountType, setAccountType] = useState("bank");
  
  // Ensure accounts are loaded
  useEffect(() => {
    console.log("Checking if accounts need to be loaded...");
    const loadAccounts = async () => {
      console.log("Loading accounts...");
      await fetchAccounts();
      console.log("Accounts loaded, count:", accounts.length);
    };
    
    if (accounts.length === 0) {
      console.log("No accounts in store, fetching...");
      loadAccounts();
    }
  }, [accounts.length, fetchAccounts]);
  
  // Find the account to edit
  const account = accounts.find(acc => acc.id === accountId);
  console.log("Accounts in store:", accounts.length);
  console.log("Looking for account ID:", accountId);
  console.log("Found account:", account ? "yes" : "no");
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: account?.name || "",
      type: (account?.type as any) || "bank",
      balance: account ? account.balance.toString() : "0",
      accountNumber: account?.accountNumber || "",
      institution: account?.institution || "",
      notes: account?.notes || "",
      creditLimit: account?.creditLimit?.toString() || "",
      dueDate: account?.dueDate ? new Date(account.dueDate).toISOString().split('T')[0] : "",
    },
  });
  
  // Watch for account type changes
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "type") {
        setAccountType(value.type || "bank");
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
  // Populate form with account data when it's available
  useEffect(() => {
    console.log("useEffect running, account:", account ? account.id : "not found");
    
    // Add a small delay to ensure the store is properly loaded
    const timer = setTimeout(() => {
      const foundAccount = accounts.find(acc => acc.id === accountId);
      console.log("After delay, account found:", foundAccount ? foundAccount.id : "not found");
      
      if (foundAccount) {
        setAccountType(foundAccount.type);
        form.reset({
          name: foundAccount.name,
          type: foundAccount.type,
          balance: foundAccount.balance.toString(),
          accountNumber: foundAccount.accountNumber || "",
          institution: foundAccount.institution || "",
          notes: foundAccount.notes || "",
          creditLimit: foundAccount.creditLimit?.toString() || "",
          dueDate: foundAccount.dueDate ? new Date(foundAccount.dueDate).toISOString().split('T')[0] : "",
        });
      } else {
        console.log("Account not found after delay, redirecting");
        // Don't redirect automatically, let the user see the error
        setError("Account not found. Please try again or go back to accounts.");
      }
    }, 1000); // Increased timeout to give more time for accounts to load
    
    return () => clearTimeout(timer);
  }, [accounts, accountId, form, router]);

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    console.log("Submitting form with values:", values);

    try {
      // Use the existing balance, don't allow changes
      const balance = account?.balance || 0;

      // Prepare account data
      const accountData: any = {
        name: values.name,
        type: account?.type || values.type, // Keep the original type
        balance, // Keep the original balance
        currency: "USD", // Default to USD
        notes: values.notes || undefined,
      };
      
      // Only add these fields if not a cash account
      if (accountType !== "cash") {
        accountData.accountNumber = values.accountNumber || undefined;
        accountData.institution = values.institution || undefined;
      }
      
      // Add credit card specific fields if applicable
      if (accountType === "credit" && values.creditLimit) {
        accountData.creditLimit = parseFloat(values.creditLimit);
        
        if (values.dueDate) {
          accountData.dueDate = new Date(values.dueDate);
        }
      }

      console.log("Updating account with data:", accountData);

      // Update the account in local store
      updateAccount(accountId, accountData);
      
      // Make API call to update in database
      try {
        console.log("Making API call to update account...");
        const response = await fetch(`/api/accounts/${accountId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(accountData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error:", errorData);
          throw new Error(errorData.error || 'Failed to update account');
        }
        
        console.log("Account updated in database successfully");
        
        // Redirect to accounts page
        window.location.href = "/accounts";
      } catch (apiError) {
        console.error("Error updating account in database:", apiError);
        throw new Error("Failed to update account in database");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err instanceof Error ? err.message : "Failed to update account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!account) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Account not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Account</CardTitle>
          <CardDescription>
            Update your account information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Checking" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <FormControl>
                        <Input 
                          value={field.value.charAt(0).toUpperCase() + field.value.slice(1)} 
                          disabled={true}
                          readOnly
                        />
                      </FormControl>
                      <FormDescription>
                        Account type cannot be changed after creation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Balance</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0.00" 
                          disabled={true}
                          readOnly
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Balance is updated through transactions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {accountType !== "cash" && (
                  <FormField
                    control={form.control}
                    name="institution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={accountType === "credit" ? "Card issuer" : "Bank name"} 
                            disabled={isLoading} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {accountType !== "cash" && (
                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {accountType === "credit" || accountType === "debit" 
                            ? "Card Number (Last 4 digits)" 
                            : "Account Number"}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Last 4 digits" 
                            disabled={isLoading} 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          For your reference only
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {accountType === "credit" && (
                  <FormField
                    control={form.control}
                    name="creditLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Limit</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="5000.00" 
                            disabled={isLoading} 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Your total available credit
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {accountType === "credit" && (
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Due Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            disabled={isLoading} 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          When your next payment is due
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional information about this account" 
                        disabled={isLoading} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
