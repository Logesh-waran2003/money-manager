import { AmountText } from "@/components/ui/AmountText";
import { Theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface TransactionCardProps {
  id?: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  type: "debit" | "credit";
}

export function TransactionCard({
  merchant,
  amount,
  date,
  category,
  type,
}: TransactionCardProps) {
  const formattedDate = (() => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return date;
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
      if (isToday) return "Today";
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return date;
    }
  })();

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={type === "credit" ? "arrow-down" : "arrow-up"}
              size={18}
              color={
                type === "credit"
                  ? Theme.colors.success
                  : Theme.colors.textSecondary
              }
            />
          </View>

          <View>
            <Text style={styles.merchantText} numberOfLines={1}>
              {merchant || "Unknown Merchant"}
            </Text>
            <Text style={styles.dateText}>
              {formattedDate} • {category}
            </Text>
          </View>
        </View>

        <AmountText
          value={amount}
          type={type === "credit" ? "income" : "expense"}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    marginBottom: 12,
    padding: 16,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.borderSubtle,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.surfaceHighlight,
    alignItems: "center",
    justifyContent: "center",
  },
  merchantText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.base,
    letterSpacing: -0.2,
  },
  dateText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    fontFamily: Theme.typography.fontFamily.sans, // changed from regular
    marginTop: 2,
    textTransform: "capitalize",
  },
});
