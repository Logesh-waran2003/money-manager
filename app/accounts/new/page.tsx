import { Metadata } from "next";
import AccountForm from "@/components/accounts/account-form";

export const metadata: Metadata = {
  title: "New Account | Money Manager",
  description: "Create a new financial account",
};

export default function NewAccountPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">New Account</h1>
        <p className="text-muted-foreground">
          Enter the details of your account
        </p>
      </div>

      <div className="max-w-2xl">
        <AccountForm />
      </div>
    </div>
  );
}
