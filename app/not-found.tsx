import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found | Money Manager",
  description: "The page you're looking for doesn't exist",
};

export default function NotFound() {
  return (
    <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <h2 className="text-3xl font-semibold mt-4 mb-6 text-gray-600">
        Page Not Found
      </h2>
      <p className="text-lg text-gray-500 mb-8 text-center max-w-md">
        {`The page you're looking for doesn't exist or has been moved.`}
      </p>
      <Link href="/">
        <Button>
          <HomeIcon className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
