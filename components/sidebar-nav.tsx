"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CreditCard,
  ArrowRightLeft,
  Receipt,
  Repeat,
  Settings,
  PieChart,
  Calendar,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
  },
  {
    title: "Accounts",
    href: "/accounts",
    icon: <CreditCard className="mr-2 h-4 w-4" />,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: <Receipt className="mr-2 h-4 w-4" />,
  },
  {
    title: "Transfers",
    href: "/transfers",
    icon: <ArrowRightLeft className="mr-2 h-4 w-4" />,
  },
  {
    title: "Recurring",
    href: "/recurring",
    icon: <Repeat className="mr-2 h-4 w-4" />,
  },
  {
    title: "Categories",
    href: "/categories",
    icon: <PieChart className="mr-2 h-4 w-4" />,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: <Calendar className="mr-2 h-4 w-4" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
  },
];

interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={pathname === item.href ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            {item.icon}
            {item.title}
          </Button>
        </Link>
      ))}
    </nav>
  );
}
