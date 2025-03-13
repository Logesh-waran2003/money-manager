import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface AccountCardProps {
  id: number;
  name: string;
  type: "debit" | "credit";
  balance: string;
  description?: string;
}

export default function AccountCard({
  id,
  name,
  type,
  balance,
  description,
}: AccountCardProps) {
  return (
    <Link href={`/accounts/${id}`}>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{name}</h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
              {type}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <p
            className={`text-xl font-bold ${
              parseFloat(balance) < 0 ? "text-red-500" : "text-green-500"
            }`}
          >
            {formatCurrency(balance)}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}
