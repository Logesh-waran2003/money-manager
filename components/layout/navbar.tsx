"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, PieChart, CreditCard, Settings, LogOut, Menu, X, ArrowLeftRight, ArrowRight } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't show navbar on auth pages
  if (["/login", "/register", "/forgot-password"].includes(pathname)) {
    return null;
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Home className="h-4 w-4 mr-2" /> },
    { href: "/transactions", label: "Transactions", icon: <PieChart className="h-4 w-4 mr-2" /> },
    { href: "/accounts", label: "Accounts", icon: <CreditCard className="h-4 w-4 mr-2" /> },
    { href: "/transfers", label: "Transfers", icon: <ArrowLeftRight className="h-4 w-4 mr-2" /> },
  ];

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Money Manager</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Open main menu</span>
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {isAuthenticated &&
            navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            
          {isAuthenticated && (
            <Link
              href="/credits"
              className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/credits"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Credits
            </Link>
          )}
          
          {isAuthenticated && (
            <Link
              href="/transaction-mock"
              className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/transaction-mock"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Transaction Mock
            </Link>
          )}
          
          {isAuthenticated && (
            <Link
              href="/credit-repayment"
              className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/credit-repayment"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Credit Repayment
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {isAuthenticated &&
              navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}
