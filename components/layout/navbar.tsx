"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  CreditCard,
  Receipt,
  ArrowLeftRight,
  Repeat,
  PieChart,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Accounts", href: "/accounts", icon: CreditCard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Transfers", href: "/transfers", icon: ArrowLeftRight },
  { name: "Recurring", href: "/recurring", icon: Repeat },
  { name: "Insights", href: "/insights", icon: PieChart },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                Money Manager
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-2">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, always visible at the bottom on small screens */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item, index) => {
            if (index >= 5) return null; // Only show 5 items on mobile

            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 text-xs font-medium rounded-md",
                  isActive
                    ? "text-blue-700"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
