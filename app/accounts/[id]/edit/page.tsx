"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { isValidCurrencyAmount } from "@/lib/utils/validation";

// Define form schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Account name is required" }),
  type: z.enum(["bank", "credit", "cash", "investment"]),
  balance: z.string().refine(isValidCurrencyAmount, {
    message: "Please enter a valid amount",
  }),
  currency: z.string().min(1, { message: "Currency is required" }),
  accountNumber: z.string().optional(),
  institution: z.string().optional(),
  notes: z.string().optional(),
});

export default function EditAccountPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accounts, updateAccount } = useAccountStore();
  
  // Find the account to edit
  const account = accounts.find(acc => acc.id === accountId);
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "bank",
      balance: "0",
      currency: "USD",
      accountNumber: "",
      institution: "",
      notes: "",
    },
  });
  
  // Populate form with account data when it's available
  useEffect(() => {
    if (account) {
      form.reset({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        currency: account.currency,
        accountNumber: account.accountNumber || "",
        institution: account.institution || "",
        notes: account.notes || "",
      });
    } else {
      // If account not found, redirect to accounts page
      router.push("/accounts");
    }
  }, [account, form, router]);

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      // Convert balance to number
      const balance = parseFloat(values.balance.replace(/[^0-9.-]/g, ""));

      // Update the account
      updateAccount(accountId, {
        name: values.name,
        type: values.type,
        balance,
        currency: values.currency,
        accountNumber: values.accountNumber,
        institution: values.institution,
        notes: values.notes,
      });
      
      // Redirect to accounts page
      router.push("/accounts");
    } catch (err) {
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
                      <Select 
                        disabled={isLoading} 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bank">Bank Account</SelectItem>
                          <SelectItem value="credit">Credit Card</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="investment">Investment</SelectItem>
                        </SelectContent>
                      </Select>
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
                          disabled={isLoading} 
                          {...field} 
                          onChange={(e) => {
                            // Allow only numbers, decimal point, and negative sign
                            const value = e.target.value.replace(/[^0-9.-]/g, "");
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the current balance of this account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select 
                        disabled={isLoading} 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Bank name" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Last 4 digits" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormDescription>
                        For your reference only
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
