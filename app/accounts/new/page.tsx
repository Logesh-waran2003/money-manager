"use client";

import React, { useState } from "react";
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
import { useCreateAccount } from "@/lib/stores/useAccountStore";
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

export default function NewAccountPage() {
  const router = useRouter();
  const { mutate: createAccount, isLoading, error } = useCreateAccount();
  const [accountType, setAccountType] = useState("bank");

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "bank",
      balance: "0",
      accountNumber: "",
      institution: "",
      notes: "",
      creditLimit: "",
      dueDate: "",
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

  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Convert balance to number
    const balance = parseFloat(values.balance);
    
    // Prepare account data
    const accountData: any = {
      name: values.name,
      type: values.type,
      balance,
      currency: "USD", // Default to USD
      accountNumber: values.accountNumber || undefined,
      institution: values.institution || undefined,
      notes: values.notes || undefined,
      isDefault: false,
    };
    
    // Add credit card specific fields if applicable
    if (values.type === "credit" && values.creditLimit) {
      accountData.creditLimit = parseFloat(values.creditLimit);
      
      if (values.dueDate) {
        accountData.dueDate = new Date(values.dueDate);
      }
    }

    // Create account using the mutation
    createAccount(accountData, {
      onSuccess: () => {
        router.push("/accounts");
      }
    });
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add New Account</CardTitle>
          <CardDescription>
            Create a new account to track your finances
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{(error as Error).message}</AlertDescription>
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bank">Bank Account</SelectItem>
                          <SelectItem value="credit">Credit Card</SelectItem>
                          <SelectItem value="debit">Debit Card</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
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
                        />
                      </FormControl>
                      <FormDescription>
                        {accountType === "credit" 
                          ? "Enter the current outstanding balance on this card" 
                          : "Enter the current balance of this account"}
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
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
