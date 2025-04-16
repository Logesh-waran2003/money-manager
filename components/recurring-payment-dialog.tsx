"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import AccountSelector from "@/components/account-selector";
import CategorySelector from "@/components/category-selector";

interface RecurringPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSave: (data: any) => void;
}

const RecurringPaymentDialog: React.FC<RecurringPaymentDialogProps> = ({
  open,
  onOpenChange,
  initialData,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [customIntervalDays, setCustomIntervalDays] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [nextDueDate, setNextDueDate] = useState<Date>(new Date());
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setAmount(initialData.amount?.toString() || "");
      setFrequency(initialData.frequency || "Monthly");
      setCustomIntervalDays(initialData.customIntervalDays?.toString() || "");
      setStartDate(initialData.startDate || new Date());
      setEndDate(initialData.endDate || undefined);
      setNextDueDate(initialData.nextDueDate || new Date());
      setAccountId(initialData.accountId || "");
      setCategoryId(initialData.categoryId || "");
      setCounterparty(initialData.counterparty || "");
      setDescription(initialData.description || "");
      setIsActive(initialData.isActive !== undefined ? initialData.isActive : true);
    } else {
      // Default values for new payment
      setName("");
      setAmount("");
      setFrequency("Monthly");
      setCustomIntervalDays("");
      setStartDate(new Date());
      setEndDate(undefined);
      setNextDueDate(new Date());
      setAccountId("");
      setCategoryId("");
      setCounterparty("");
      setDescription("");
      setIsActive(true);
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !amount || !frequency || !nextDueDate || !accountId) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Create payment object
    const paymentData = {
      ...(initialData || {}),
      name,
      amount: parseFloat(amount),
      frequency,
      customIntervalDays: frequency === "Custom" ? parseInt(customIntervalDays) : undefined,
      startDate: startDate.toISOString(),
      endDate: endDate ? endDate.toISOString() : null,
      nextDueDate: nextDueDate.toISOString(),
      accountId,
      categoryId: categoryId || undefined,
      counterparty,
      description,
      isActive,
    };
    
    onSave(paymentData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Recurring Payment" : "Add Recurring Payment"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Payment Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Netflix, Rent, Salary, etc."
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                  <SelectItem value="Custom">Custom Interval</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {frequency === "Custom" && (
            <div className="space-y-2">
              <Label htmlFor="customInterval">Interval (Days)</Label>
              <Input
                id="customInterval"
                type="number"
                value={customIntervalDays}
                onChange={(e) => setCustomIntervalDays(e.target.value)}
                placeholder="Enter number of days (e.g., 84)"
                required
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Next Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !nextDueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextDueDate ? format(nextDueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={nextDueDate}
                    onSelect={(date) => date && setNextDueDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>No end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Account</Label>
            <AccountSelector
              selectedAccount={accountId}
              onChange={setAccountId}
              label=""
            />
          </div>
          
          <div className="space-y-2">
            <Label>Category (Optional)</Label>
            <CategorySelector
              selectedCategory={categoryId}
              onChange={setCategoryId}
              type="expense"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="counterparty">Counterparty</Label>
            <Input
              id="counterparty"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              placeholder="Netflix, Landlord, Employer, etc."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details about this payment"
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Update Payment" : "Create Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecurringPaymentDialog;
