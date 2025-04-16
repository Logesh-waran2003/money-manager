"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Calendar, ArrowLeft, Edit, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import RecurringPaymentDialog from "@/components/recurring-payment-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecurringPaymentStore } from "@/lib/stores/recurring-payment-store";

export default function RecurringPaymentsPage() {
  const { toast } = useToast();
  const { 
    recurringPayments, 
    isLoading, 
    error,
    fetchRecurringPayments,
    addRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    togglePaymentActive
  } = useRecurringPaymentStore();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch recurring payments when component mounts
  useEffect(() => {
    fetchRecurringPayments();
  }, [fetchRecurringPayments]);

  // Show error toast if API call fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await togglePaymentActive(id, isActive);
      
      toast({
        title: `Payment ${isActive ? 'activated' : 'deactivated'}`,
        description: `The recurring payment has been ${isActive ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (payment: any) => {
    setEditingPayment(payment);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this recurring payment?")) {
      try {
        await deleteRecurringPayment(id);
        
        toast({
          title: "Payment deleted",
          description: "The recurring payment has been deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete recurring payment",
          variant: "destructive",
        });
      }
    }
  };

  const handleDialogClose = async (payment?: any) => {
    if (payment) {
      try {
        if (editingPayment) {
          // Update existing payment
          await updateRecurringPayment(editingPayment.id, payment);
          
          toast({
            title: "Payment updated",
            description: "The recurring payment has been updated successfully.",
          });
        } else {
          // Add new payment
          await addRecurringPayment(payment);
          
          toast({
            title: "Payment created",
            description: "The recurring payment has been created successfully.",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      }
    }
    
    setIsDialogOpen(false);
    setEditingPayment(null);
  };

  const filteredPayments = recurringPayments
    .filter(payment => {
      if (activeTab === "active") return payment.isActive;
      if (activeTab === "inactive") return !payment.isActive;
      return true; // "all" tab
    })
    .map(payment => ({
      ...payment,
      // Ensure either defaultAmount or amount is available
      amount: payment.amount || payment.defaultAmount,
      defaultAmount: payment.defaultAmount || payment.amount
    }));

  const upcomingPayments = recurringPayments
    .filter(payment => payment.isActive)
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
    .slice(0, 3)
    .map(payment => ({
      ...payment,
      // Ensure either defaultAmount or amount is available
      amount: payment.amount || payment.defaultAmount,
      defaultAmount: payment.defaultAmount || payment.amount
    }));

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6 gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Recurring Payments</h1>
      </div>

      {/* Upcoming payments section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Payments
          </CardTitle>
          <CardDescription>
            Your next recurring payments due soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingPayments.length > 0 ? (
            <div className="space-y-3">
              {upcomingPayments.map(payment => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium">{payment.name}</span>
                    <span className="text-sm text-muted-foreground">{payment.counterparty}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="font-semibold">${payment.defaultAmount ? payment.defaultAmount.toFixed(2) : (payment.amount ? payment.amount.toFixed(2) : '0.00')}</span>
                      <span className="text-sm text-muted-foreground">
                        Due {format(new Date(payment.nextDueDate), "MMM d, yyyy")}
                      </span>
                    </div>
                    <Link 
                      href={{
                        pathname: "/transaction",
                        query: {
                          type: "recurring",
                          recurringPaymentId: payment.id,
                          amount: payment.defaultAmount || payment.amount,
                          counterparty: payment.counterparty || "",
                          description: payment.description || "",
                          accountId: payment.accountId || "",
                          categoryId: payment.categoryId || ""
                        }
                      }}
                    >
                      <Button size="sm" variant="secondary">Pay Now</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No upcoming payments
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main recurring payments list */}
      <div className="flex justify-between items-center mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading recurring payments...</div>
      ) : filteredPayments.length === 0 ? (
        <Card className="bg-muted/40">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No recurring payments found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {activeTab === "all" 
                ? "Create recurring payments to track regular expenses and income" 
                : activeTab === "active" 
                  ? "No active recurring payments found" 
                  : "No inactive recurring payments found"}
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Recurring Payment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className={payment.isActive ? "" : "opacity-70"}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {payment.name}
                      {!payment.isActive && (
                        <Badge variant="outline" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {payment.counterparty} • {payment.frequency}
                      {payment.customIntervalDays && ` (${payment.customIntervalDays} days)`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(payment)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(payment.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold">${payment.defaultAmount ? payment.defaultAmount.toFixed(2) : (payment.amount ? payment.amount.toFixed(2) : '0.00')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Due</p>
                    <p className="font-medium">{format(new Date(payment.nextDueDate), "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account</p>
                    <p>{payment.accountName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={payment.isActive} 
                        onCheckedChange={(checked) => handleToggleActive(payment.id, checked)}
                      />
                      <span>{payment.isActive ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RecurringPaymentDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={editingPayment}
        onSave={handleDialogClose}
      />
    </div>
  );
}
