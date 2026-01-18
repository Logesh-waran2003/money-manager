import { ManualTransactionModal } from "@/components/ManualTransactionModal";
import { SearchBar } from "@/components/SearchBar";
import { TransactionList } from "@/components/TransactionList";
import { AmountText } from "@/components/ui/AmountText";
import { NotificationBadge } from "@/components/ui/NotificationBadge";
import { Theme } from "@/constants/theme";
import { useUnprocessedContext } from "@/contexts/UnprocessedContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useSearch } from "@/hooks/useSearch";
import { useUnprocessedCount } from "@/hooks/useUnprocessedCount";
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
  const { count: unprocessedCount, refresh: refreshCount } =
    useUnprocessedCount(triggerRefresh);
  useNotifications(unprocessedCount);

  const {
    searchQuery,
    setSearchQuery,
    filteredData: searchedTransactions,
  } = useSearch(transactions, (item) => [
    item.merchant || "",
    item.amount?.toString() || "",
    item.category || "",
    item.remarks || "",
  ]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      refreshCount();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      setCount(unprocessedCount);
    }, [unprocessedCount]),
  );

  const loadData = async () => {
    try {
      const db = await getDb();

      // 1. Fetch recent transactions
      const txns: any[] = await db.getAllAsync(
        "SELECT * FROM transactions ORDER BY date DESC LIMIT 20",
      );
      setTransactions(txns);

      // 2. Fetch total balance from all accounts
      const accountsList: any[] = await db.getAllAsync(
        "SELECT * FROM accounts",
      );
      setAccounts(accountsList);
      const total = accountsList.reduce(
        (acc, curr) => acc + (curr.balance || 0),
        0,
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
          <Text style={styles.greeting}>Financial Overview</Text>
          <TouchableOpacity
            onPress={() => router.push("/inbox")}
            style={styles.inboxButton}
            hitSlop={8}
          >
            <Ionicons
              name="mail-outline"
              size={24}
              color={Theme.colors.textPrimary}
            />
            <NotificationBadge count={count} style={styles.badge} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.label}>Net Worth</Text>
          <AmountText value={totalBalance} size="xxxl" style={styles.balance} />
          {/* <View style={styles.trendRow}>
            <Text style={styles.trendText}>+12.5% vs last month</Text>
          </View> */}
        </View>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search transactions..."
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push("/analytics")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <TransactionList data={searchedTransactions} />
        </View>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setManualModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color={Theme.colors.primaryForeground} />
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
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.xl,
  },
  greeting: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    fontFamily: Theme.typography.fontFamily.medium,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  inboxButton: {
    padding: 6,
    position: "relative",
  },
  badge: {
    top: -2,
    right: -2,
  },
  heroSection: {
    alignItems: "flex-start",
  },
  label: {
    color: Theme.colors.textTertiary,
    fontSize: Theme.typography.sizes.base,
    marginBottom: Theme.spacing.xs,
  },
  balance: {
    marginBottom: Theme.spacing.xs,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendText: {
    color: Theme.colors.success,
    fontSize: Theme.typography.sizes.sm,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  searchContainer: {
    marginBottom: Theme.spacing.sm,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    paddingTop: Theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.sizes.lg,
    fontFamily: Theme.typography.fontFamily.semibold,
  },
  seeAll: {
    color: Theme.colors.primary,
    fontSize: Theme.typography.sizes.sm,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  listContainer: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    right: Theme.spacing.xl,
    bottom: 100, // Above tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
