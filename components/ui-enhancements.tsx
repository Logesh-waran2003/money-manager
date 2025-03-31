"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardGlowProps {
  children: React.ReactNode;
  className?: string;
}

export function CardGlow({ children, className }: CardGlowProps) {
  return (
    <div className={cn("relative group", className)}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/20 rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
      {children}
    </div>
  );
}

interface GradientHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientHeading({ children, className }: GradientHeadingProps) {
  return (
    <h1 
      className={cn(
        "bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 font-bold",
        className
      )}
    >
      {children}
    </h1>
  );
}

interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function AnimatedButton({ 
  children, 
  className,
  onClick,
  type = "button",
  disabled = false
}: AnimatedButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium transition-all bg-primary rounded-md text-primary-foreground hover:bg-primary/90",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/20 before:to-transparent before:translate-x-[-100%] before:animate-[shimmer_2s_infinite]",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
    >
      {children}
    </button>
  );
}

export function FloatingLabel({ 
  children, 
  label, 
  className 
}: { 
  children: React.ReactNode; 
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute -top-2.5 left-2 px-1 bg-background text-xs text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div 
      className={cn(
        "animate-in fade-in duration-500 slide-in-from-bottom-4",
        className
      )}
    >
      {children}
    </div>
  );
}
