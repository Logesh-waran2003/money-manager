import { Metadata } from "next";
import TransferForm from "@/components/transfers/transfer-form";

export const metadata: Metadata = {
  title: "New Transfer | Money Manager",
  description: "Transfer money between your accounts",
};

export default function NewTransferPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">New Transfer</h1>
        <p className="text-muted-foreground">
          Move money between your accounts
        </p>
      </div>

      <div className="max-w-2xl">
        <TransferForm />
      </div>
    </div>
  );
}
