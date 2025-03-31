"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MoveRight, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function Home() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Money Manager</h1>
        <p className="text-xl text-muted-foreground mb-8">Track your finances with ease</p>
        <Link href="/transaction">
          <Button size="lg" className="group">
            Add New Transaction
            <MoveRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
