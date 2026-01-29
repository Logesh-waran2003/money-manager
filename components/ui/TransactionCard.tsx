import { AmountText } from "@/components/ui/AmountText";
import { Theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface TransactionCardProps {
  id?: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  type: "debit" | "credit";
}

export function TransactionCard({
  id,
  merchant,
  amount,
  date,
  category,
  type,
}: TransactionCardProps) {
  const router = useRouter();

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
    <Pressable
      style={styles.pressable}
      onPress={() => {
        if (id) {
          router.push(`/transaction-detail?id=${id}`);
        }
      }}
    >
      {({ pressed }) => (
        <View style={[styles.card, pressed && styles.cardPressed]}>
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

              <View style={{ flex: 1 }}>
                <Text
                  style={styles.merchantText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
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
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
  },
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
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
