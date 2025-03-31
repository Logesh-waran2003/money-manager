"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentageChange } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  previousValue,
  icon,
  trend,
  prefix = "",
  suffix = "",
  isCurrency = true,
  isLoading = false,
  className,
}: StatsCardProps) {
  // Calculate percentage change if previous value is provided
  const percentageChange = previousValue !== undefined 
    ? ((value - previousValue) / Math.abs(previousValue || 1)) * 100 
    : 0;
  
  // Determine trend if not explicitly provided
  const determinedTrend = trend || (
    percentageChange > 0 ? "up" : 
    percentageChange < 0 ? "down" : 
    "neutral"
  );

  // Format the value
  const formattedValue = isCurrency 
    ? formatCurrency(value) 
    : `${prefix}${value.toLocaleString()}${suffix}`;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="opacity-70">{icon}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-9 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-bold font-mono">
            {formattedValue}
          </div>
        )}
        
        {previousValue !== undefined && !isLoading && (
          <div className="flex items-center mt-1">
            <div className={cn(
              "text-xs font-medium flex items-center",
              determinedTrend === "up" ? "text-success" : 
              determinedTrend === "down" ? "text-error" : 
              "text-muted-foreground"
            )}>
              {determinedTrend === "up" ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : determinedTrend === "down" ? (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              ) : null}
              {formatPercentageChange(value, previousValue)}
            </div>
            <div className="text-xs text-muted-foreground ml-1.5">
              vs. previous period
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
