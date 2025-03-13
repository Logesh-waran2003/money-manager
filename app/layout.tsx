import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Use Inter font instead of Geist which might be causing issues
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Money Manager",
  description: "Track and manage your finances",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
