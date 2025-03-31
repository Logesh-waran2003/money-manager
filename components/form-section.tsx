"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function FormSection({ children, title, className }: FormSectionProps) {
  return (
    <div className={cn("rounded-lg bg-background/30 border border-border/30 p-3", className)}>
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
