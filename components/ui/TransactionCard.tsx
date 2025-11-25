import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface TransactionCardProps {
  merchant: string;
  amount: string;
  date: string;
  category: string;
  type: "debit" | "credit";
  isNew?: boolean;
}

export function TransactionCard({
  merchant,
  amount,
  date,
  category,
  type,
  isNew,
}: TransactionCardProps) {
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isNew) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [isNew]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.card}>
      {isNew && <Animated.View style={[styles.glow, glowStyle]} />}
      <View style={styles.row}>
        <View style={styles.leftContent}>
          {/* Category Icon Placeholder - Neon Glow */}
          <View style={styles.iconContainer}>
            <Ionicons name="cart-outline" size={20} color="#00FF94" />
          </View>

          <View>
            <Text style={styles.merchantText}>{merchant}</Text>
            <Text style={styles.dateText}>
              {date} • {category}
            </Text>
          </View>
        </View>

        <View>
          <Text
            style={[
              styles.amountText,
              { color: type === "credit" ? "#00FF94" : "white" },
            ]}
          >
            {type === "debit" ? "-" : "+"}
            {amount}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#18181b", // zinc-900
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 255, 148, 0.1)", // neon-primary/10
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#27272a", // zinc-800
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    shadowColor: "#00FF94",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  merchantText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: -0.5,
  },
  dateText: {
    color: "#71717a", // zinc-500
    fontSize: 12,
    marginTop: 2,
  },
  amountText: {
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: -1,
  },
});
