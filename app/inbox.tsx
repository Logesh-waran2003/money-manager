import { AccountCreationModal } from "@/components/inbox/AccountCreationModal";
import { SmsListItem } from "@/components/inbox/SmsListItem";
import { TransactionModal } from "@/components/inbox/TransactionModal";
import { useSmsProcessor } from "@/hooks/useSmsProcessor";
import {
  exportSmsAnalysis,
  getSmartDetails,
  getUnprocessedSms,
  ignoreSms,
  testImprovedParsing,
  unIgnoreSms,
  UnprocessedSms,
} from "@/services/SmsService";
import { getAllAccounts, saveFeedback, Account } from "@/services/db";
import { BANKS } from "@/services/config/detection";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



type FilterType = "inbox" | "transactions" | "ignored" | "all";

export default function InboxScreen() {
  const [smsList, setSmsList] = useState<UnprocessedSms[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("inbox");

  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  const processor = useSmsProcessor();

  useEffect(() => {
    loadSms();
  }, []);

  const loadSms = async () => {
    setLoading(true);
    const [list, accountsList] = await Promise.all([
      getUnprocessedSms(),
      getAllAccounts(),
    ]);
    setSmsList(list);
    setAccounts(accountsList);
    setLoading(false);
  };

  const handleTestParsing = () => {
    testImprovedParsing();
    Alert.alert(
      "Parsing Test Complete",
      "Check your terminal/console for detailed parsing results of sample SMS messages.",
      [{ text: "OK" }]
    );
  };

  const handleExportSms = async () => {
    try {
      const result = await exportSmsAnalysis();

      if (result.method === "SAF") {
        Alert.alert(
          "Export Complete!",
          `Successfully exported ${result.count} banking SMS messages to your chosen location.\n\nFile: ${result.fileName}`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Export to Console",
          `Exported ${result.count} SMS to console.\n\nCopy the JSON data from your terminal and save it to a file.`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "Export Failed",
        "Could not export SMS data. Please try again."
      );
    }
  };

  const handleIgnore = async (smsId: string) => {
    try {
      await ignoreSms(smsId);
      // Mark as ignored locally
      setSmsList((prev) =>
        prev.map((s) => (s.id === smsId ? { ...s, isIgnored: true } : s))
      );

      if (processor.selectedSms?.id === smsId) {
        processor.setModalVisible(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to ignore SMS");
    }
  };

  const handleRestore = async (smsId: string) => {
    try {
      await unIgnoreSms(smsId);
      // Unmark as ignored locally
      setSmsList((prev) =>
        prev.map((s) => (s.id === smsId ? { ...s, isIgnored: false } : s))
      );
    } catch (error) {
      Alert.alert("Error", "Failed to restore SMS");
    }
  };

  const handleConfirmTransaction = async () => {
    const success = await processor.handleConfirmTransaction(() => {
      // Mark as processed immediately so it moves to "transactions" tab
      if (processor.selectedSms) {
        setSmsList((prev) =>
          prev.map((s) =>
            s.id === processor.selectedSms!.id ? { ...s, isProcessed: true } : s
          )
        );
      }
    });

    if (success) {
      processor.resetForm();
    }
  };

  const handleCreateAccount = async () => {
    await processor.handleCreateAccount(async () => {
      const updatedAccounts = await getAllAccounts();
      setAccounts(updatedAccounts);
    });
  };

  const getAccountNickname = () => {
    if (!processor.accountId) return "No account selected";
    const account = accounts.find((a) => a.id === processor.accountId);
    return account ? account.nickname : "Unknown Account";
  };

  const handleMarkAsNotTransaction = async (
    smsId: string,
    merchant: string,
    body: string
  ) => {
    try {
      await saveFeedback({
        id: `${smsId}-feedback`,
        sms_body: body,
        merchant,
        is_transaction: false,
      });
      await ignoreSms(smsId);
      setSmsList((prev) =>
        prev.map((s) => (s.id === smsId ? { ...s, isIgnored: true } : s))
      );
      processor.setModalVisible(false);
      Alert.alert("Feedback Saved", "This SMS will be ignored in future");
    } catch (error) {
      Alert.alert("Error", "Failed to save feedback");
    }
  };

  const handleMarkAsTransaction = async (
    smsId: string,
    merchant: string,
    body: string
  ) => {
    try {
      await saveFeedback({
        id: `${smsId}-feedback`,
        sms_body: body,
        merchant,
        is_transaction: true,
      });
      Alert.alert(
        "Feedback Saved",
        "Similar SMS will be detected as transactions"
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save feedback");
    }
  };

  const toggleAccountFilter = (accountId: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setSelectedAccounts([]);
  };

  // Memoize expensive SMS parsing operations
  const parsedSmsCache = useMemo(() => {
    const cache = new Map<string, ReturnType<typeof getSmartDetails>>();
    smsList.forEach((item) => {
      cache.set(item.id, getSmartDetails(item.body, item.address));
    });
    return cache;
  }, [smsList]);

  const filteredSms = smsList.filter((item) => {
    // Status filter
    if (filter === "inbox" && (item.isIgnored || item.isProcessed))
      return false;
    if (filter === "transactions" && !item.isProcessed) return false;
    if (filter === "ignored" && !item.isIgnored) return false;

    // Date range filter
    if (fromDate) {
      const itemDate = new Date(parseInt(item.date));
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      if (itemDate < from) return false;
    }
    if (toDate) {
      const itemDate = new Date(parseInt(item.date));
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (itemDate > to) return false;
    }

    // Account filter
    if (selectedAccounts.length > 0) {
      const parsed = parsedSmsCache.get(item.id);
      if (!parsed) return false;

      const matchesKnownAccount = accounts.some(
        (acc) =>
          parsed.bank === acc.bank_name &&
          (parsed.account === acc.account_last4 ||
            parsed.cardLast4 === acc.account_last4)
      );

      // If ONLY "unknown" is selected, show only unmatched
      if (
        selectedAccounts.length === 1 &&
        selectedAccounts.includes("unknown")
      ) {
        return !matchesKnownAccount;
      }

      // If "unknown" + other accounts selected
      if (selectedAccounts.includes("unknown")) {
        if (!matchesKnownAccount) return true; // Show unmatched
      }

      // Check if SMS matches any selected account (excluding "unknown")
      const selectedAccountIds = selectedAccounts.filter(
        (id) => id !== "unknown"
      );
      if (selectedAccountIds.length > 0) {
        const matchesSelectedAccount = accounts.some(
          (acc) =>
            selectedAccountIds.includes(acc.id) &&
            parsed.bank === acc.bank_name &&
            (parsed.account === acc.account_last4 ||
              parsed.cardLast4 === acc.account_last4)
        );
        return matchesSelectedAccount;
      }
    }

    return true;
  });

  /* Enable LayoutAnimation for Android */
  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilters(!showFilters);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Inbox</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? "Syncing..." : `${filteredSms.length} transactions`}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={toggleFilters}
            style={[
              styles.iconButton,
              (fromDate || toDate || selectedAccounts.length > 0) &&
                styles.iconButtonActive,
            ]}
          >
            <Ionicons name="filter-outline" size={20} color="#a855f7" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleTestParsing}
            style={styles.iconButton}
          >
            <Ionicons name="flask-outline" size={20} color="#a855f7" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExportSms} style={styles.iconButton}>
            <Ionicons name="download-outline" size={20} color="#a855f7" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs - Moved above Advanced Filters for better context hierarchy */}
      <View style={styles.filterContainer}>
        {["inbox", "transactions", "ignored", "all"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f as FilterType)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === f && styles.filterTabTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Advanced Filters */}
      {showFilters && (
        <View style={styles.advancedFilters}>
          {/* Date Range */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Date Range</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  const today = new Date();
                  const weekAgo = new Date(
                    today.getTime() - 7 * 24 * 60 * 60 * 1000
                  );
                  setFromDate(weekAgo.toISOString().split("T")[0]);
                  setToDate(today.toISOString().split("T")[0]);
                }}
              >
                <Text style={styles.dateButtonLabel}>Last 7 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  const today = new Date();
                  const monthAgo = new Date(
                    today.getTime() - 30 * 24 * 60 * 60 * 1000
                  );
                  setFromDate(monthAgo.toISOString().split("T")[0]);
                  setToDate(today.toISOString().split("T")[0]);
                }}
              >
                <Text style={styles.dateButtonLabel}>Last 30 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  const today = new Date();
                  const start = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                  );
                  setFromDate(start.toISOString().split("T")[0]);
                  setToDate(today.toISOString().split("T")[0]);
                }}
              >
                <Text style={styles.dateButtonLabel}>This Month</Text>
              </TouchableOpacity>
            </View>
            {(fromDate || toDate) && (
              <Text style={styles.dateRangeText}>
                {fromDate || "..."} to {toDate || "..."}
              </Text>
            )}
          </View>

          {/* Account Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Accounts</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.accountChips}
            >
              <TouchableOpacity
                style={[
                  styles.accountChip,
                  selectedAccounts.includes("unknown") &&
                    styles.accountChipActive,
                ]}
                onPress={() => toggleAccountFilter("unknown")}
              >
                <Text
                  style={[
                    styles.accountChipText,
                    selectedAccounts.includes("unknown") &&
                      styles.accountChipTextActive,
                  ]}
                >
                  Unknown
                </Text>
              </TouchableOpacity>
              {accounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[
                    styles.accountChip,
                    selectedAccounts.includes(acc.id) &&
                      styles.accountChipActive,
                  ]}
                  onPress={() => toggleAccountFilter(acc.id)}
                >
                  <Text
                    style={[
                      styles.accountChipText,
                      selectedAccounts.includes(acc.id) &&
                        styles.accountChipTextActive,
                    ]}
                  >
                    {acc.nickname}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Clear Filters */}
          {(fromDate || toDate || selectedAccounts.length > 0) && (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearFilters}
            >
              <Ionicons name="close-circle" size={16} color="#ef4444" />
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* SMS List */}
      {loading && smsList.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#a855f7" />
          <Text style={styles.loadingText}>Analyzing SMS...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSms}
          renderItem={({ item }) => (
            <SmsListItem
              item={item}
              onPress={processor.openTransactionModal}
              onIgnore={handleIgnore}
              onRestore={handleRestore}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadSms}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkbox-outline" size={64} color="#3f3f46" />
              <Text style={styles.emptyText}>All caught up!</Text>
              <Text style={styles.emptySubtext}>
                No new banking transactions found
              </Text>
            </View>
          }
        />
      )}

      <AccountCreationModal
        visible={processor.accountModalVisible}
        onClose={() => processor.setAccountModalVisible(false)}
        onCreateAccount={handleCreateAccount}
        newAccountData={processor.newAccountData}
        selectedBank={processor.selectedBank}
        setSelectedBank={processor.setSelectedBank}
        accountNickname={processor.accountNickname}
        setAccountNickname={processor.setAccountNickname}
        accountType={processor.accountType}
        setAccountType={processor.setAccountType}
        banks={BANKS}
        last4={processor.inputLast4}
        setLast4={processor.setInputLast4}
        openingBalance={processor.openingBalance}
        setOpeningBalance={processor.setOpeningBalance}
      />

      {/* Transaction Verification Modal */}
      <TransactionModal
        visible={processor.modalVisible}
        onClose={() => processor.setModalVisible(false)}
        onConfirm={handleConfirmTransaction}
        selectedSms={processor.selectedSms}
        amount={processor.amount}
        setAmount={processor.setAmount}
        merchant={processor.merchant}
        setMerchant={processor.setMerchant}
        category={processor.category}
        setCategory={processor.setCategory}
        remarks={processor.remarks}
        setRemarks={processor.setRemarks}
        accountNickname={getAccountNickname()}
        accounts={accounts}
        onSelectAccount={processor.selectAccount}
        onCreateAccount={processor.openManualAccountCreation}
        onMarkAsNotTransaction={handleMarkAsNotTransaction}
        onMarkAsTransaction={handleMarkAsTransaction}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#a1a1aa",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  filterTabActive: {
    backgroundColor: "rgba(168, 85, 247, 0.2)",
    borderColor: "#a855f7",
  },
  filterTabText: {
    color: "#a1a1aa",
    fontSize: 14,
    fontWeight: "500",
  },
  filterTabTextActive: {
    color: "#a855f7",
    fontWeight: "600",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonActive: {
    backgroundColor: "rgba(168, 85, 247, 0.3)",
  },
  advancedFilters: {
    backgroundColor: "#18181b",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    color: "#e4e4e7",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: "row",
    gap: 8,
  },
  dateButton: {
    flex: 1,
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  dateButtonLabel: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "500",
  },
  dateRangeText: {
    color: "#a855f7",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  accountChips: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 16,
  },
  accountChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  accountChipActive: {
    backgroundColor: "rgba(168, 85, 247, 0.2)",
    borderColor: "#a855f7",
  },
  accountChipText: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "500",
  },
  accountChipTextActive: {
    color: "#a855f7",
    fontWeight: "600",
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    marginTop: 8,
  },
  clearFiltersText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#a1a1aa",
    marginTop: 12,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#a1a1aa",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#71717a",
    fontSize: 14,
    marginTop: 8,
  },
});
