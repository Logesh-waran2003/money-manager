import { TransactionList } from "@/components/TransactionList";
import { getDb, initDb } from "@/services/db";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Ensure DB is initialized
initDb();
const db = getDb();

export default function HomeScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = () => {
    try {
      const result = db.getAllSync(
        "SELECT * FROM transactions ORDER BY date DESC LIMIT 20"
      );
      setTransactions(result);
    } catch (error) {
      console.error("Failed to load transactions", error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.label}>Total Balance</Text>
          <TouchableOpacity
            onPress={() => router.push("/inbox")}
            style={styles.inboxButton}
          >
            <Ionicons name="mail-unread-outline" size={20} color="#a855f7" />
          </TouchableOpacity>
        </View>

        <Text style={styles.balance}>
          {/* Simple sum for demo */}₹
          {transactions
            .reduce((acc, curr) => {
              return curr.type === "credit"
                ? acc + curr.amount
                : acc - curr.amount;
            }, 0)
            .toFixed(2)}
        </Text>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
      </View>

      <View style={styles.listContainer}>
        <TransactionList data={transactions} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B", // zinc-950
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  inboxButton: {
    padding: 8,
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    borderRadius: 20,
  },
  label: {
    color: "#a1a1aa", // zinc-400
    fontSize: 14,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 2, // tracking-widest
  },
  balance: {
    color: "white",
    fontSize: 36, // 4xl
    fontWeight: "bold",
    letterSpacing: -1.5, // tracking-tighter
    marginBottom: 24,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18, // lg
    fontWeight: "600",
    marginBottom: 16,
  },
  listContainer: {
    flex: 1,
  },
});
