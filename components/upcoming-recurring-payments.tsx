"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  nextDueDate: Date;
  counterparty?: string;
}

interface UpcomingRecurringPaymentsProps {
  payments: RecurringPayment[];
  isLoading?: boolean;
}

const UpcomingRecurringPayments: React.FC<UpcomingRecurringPaymentsProps> = ({
  payments,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                <div className="flex flex-col">
                  <span className="font-medium">{payment.name}</span>
                  {payment.counterparty && (
                    <span className="text-sm text-muted-foreground">{payment.counterparty}</span>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-semibold">${payment.amount.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">
                    Due {format(payment.nextDueDate, "MMM d")}
                  </span>
                </div>
              </div>
            ))}
            
            <div className="pt-2">
              <Link href="/recurring-payments">
                <Button variant="ghost" size="sm" className="w-full">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No upcoming payments
            <div className="mt-2">
              <Link href="/recurring-payments">
                <Button variant="outline" size="sm">
                  Add Recurring Payment
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingRecurringPayments;
