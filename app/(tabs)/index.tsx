import { ManualTransactionModal } from "@/components/ManualTransactionModal";
import { TransactionList } from "@/components/TransactionList";
import { SearchBar } from "@/components/SearchBar";
import { useSearch } from "@/hooks/useSearch";
import { useUnprocessedCount } from "@/hooks/useUnprocessedCount";
import { useNotifications } from "@/hooks/useNotifications";
import { useUnprocessedContext } from "@/contexts/UnprocessedContext";
import { getDb } from "@/services/db";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const router = useRouter();

  const { count, setCount, triggerRefresh } = useUnprocessedContext();
  const { count: unprocessedCount, refresh: refreshCount } = useUnprocessedCount(triggerRefresh);
  useNotifications(unprocessedCount);

  const { searchQuery, setSearchQuery, filteredData: searchedTransactions } = useSearch(
    transactions,
    (item) => [
      item.merchant || "",
      item.amount?.toString() || "",
      item.category || "",
      item.remarks || "",
    ]
  );

  useFocusEffect(
    useCallback(() => {
      loadData();
      refreshCount();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      setCount(unprocessedCount);
    }, [unprocessedCount])
  );

  const loadData = async () => {
    try {
      const db = await getDb();

      // 1. Fetch recent transactions
      const txns: any[] = await db.getAllAsync(
        "SELECT * FROM transactions ORDER BY date DESC LIMIT 20"
      );
      setTransactions(txns);

      // 2. Fetch total balance from all accounts
      const accountsList: any[] = await db.getAllAsync(
        "SELECT * FROM accounts"
      );
      setAccounts(accountsList);
      const total = accountsList.reduce(
        (acc, curr) => acc + (curr.balance || 0),
        0
      );
      setTotalBalance(total);
    } catch (error) {
      console.error("Failed to load home data", error);
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
            {count > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.balance}>₹{totalBalance.toFixed(2)}</Text>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search transactions..."
      />

      <View style={styles.listContainer}>
        <TransactionList data={searchedTransactions} />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setManualModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Manual Transaction Modal */}
      <ManualTransactionModal
        visible={manualModalVisible}
        onClose={() => setManualModalVisible(false)}
        onSuccess={loadData}
        accounts={accounts}
        onCreateAccount={() => {
          setManualModalVisible(false);
          router.push("/(tabs)/settings");
        }}
      />
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
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
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
  fab: {
    position: "absolute",
    right: 24,
    bottom: 130,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#a855f7",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#a855f7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
