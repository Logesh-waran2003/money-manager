"use client";

import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CreditFormFieldsProps {
  creditType: string;
  setCreditType: (value: string) => void;
  counterparty: string;
  setCounterparty: (value: string) => void;
  creditDueDate: Date | undefined;
  setCreditDueDate: (date: Date | undefined) => void;
  notes: string;
  setNotes: (value: string) => void;
}

const CreditFormFields: React.FC<CreditFormFieldsProps> = ({
  creditType,
  setCreditType,
  counterparty,
  setCounterparty,
  creditDueDate,
  setCreditDueDate,
  notes,
  setNotes
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Credit Type</Label>
        <ToggleGroup 
          type="single" 
          value={creditType} 
          onValueChange={(value) => value && setCreditType(value)} 
          className="justify-start"
        >
          <ToggleGroupItem 
            value="lent" 
            aria-label="Lent money" 
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            I Lent Money
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="borrowed" 
            aria-label="Borrowed money" 
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            I Borrowed Money
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {creditType === "lent" ? "Lent To" : "Borrowed From"}
        </Label>
        <Input
          value={counterparty}
          onChange={(e) => setCounterparty(e.target.value)}
          placeholder={creditType === "lent" ? "Enter recipient name..." : "Enter lender name..."}
          className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Due Date (Optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal bg-background/50 border-border/50",
                !creditDueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {creditDueDate ? format(creditDueDate, "PPP") : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={creditDueDate}
              onSelect={setCreditDueDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Notes (Optional)</Label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional details..."
          className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
        />
      </div>
    </div>
  );
};

export default CreditFormFields;
