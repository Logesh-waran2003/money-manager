import { AccountCreationModal } from "@/components/inbox/AccountCreationModal";
import { SmsListItem } from "@/components/inbox/SmsListItem";
import { TransactionModal } from "@/components/inbox/TransactionModal";
import { SearchBar } from "@/components/SearchBar";
import { Theme } from "@/constants/theme";
import { useUnprocessedContext } from "@/contexts/UnprocessedContext";
import { useSearch } from "@/hooks/useSearch";
import { useSmsProcessor } from "@/hooks/useSmsProcessor";
import { BANKS } from "@/services/config/detection";
import { Account, getAllAccounts, saveFeedback } from "@/services/db";
import {
  getSmartDetails,
  getUnprocessedSms,
  ignoreSms,
  unIgnoreSms,
  UnprocessedSms,
} from "@/services/SmsService";
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
  const { refresh: refreshUnprocessedCount } = useUnprocessedContext();

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
    refreshUnprocessedCount();
  };

  const handleIgnore = async (smsId: string) => {
    try {
      await ignoreSms(smsId);
      setSmsList((prev) =>
        prev.map((s) => (s.id === smsId ? { ...s, isIgnored: true } : s)),
      );

      if (processor.selectedSms?.id === smsId) {
        processor.setModalVisible(false);
      }
      refreshUnprocessedCount();
    } catch (error) {
      Alert.alert("Error", "Failed to ignore SMS");
    }
  };

  const handleRestore = async (smsId: string) => {
    try {
      await unIgnoreSms(smsId);
      setSmsList((prev) =>
        prev.map((s) => (s.id === smsId ? { ...s, isIgnored: false } : s)),
      );
    } catch (error) {
      Alert.alert("Error", "Failed to restore SMS");
    }
  };

  const handleConfirmTransaction = async () => {
    const success = await processor.handleConfirmTransaction(() => {
      if (processor.selectedSms) {
        setSmsList((prev) =>
          prev.map((s) =>
            s.id === processor.selectedSms!.id
              ? { ...s, isProcessed: true }
              : s,
          ),
        );
      }
      refreshUnprocessedCount();
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
    body: string,
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
        prev.map((s) => (s.id === smsId ? { ...s, isIgnored: true } : s)),
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
    body: string,
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
        "Similar SMS will be detected as transactions",
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save feedback");
    }
  };

  const toggleAccountFilter = (accountId: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId],
    );
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setSelectedAccounts([]);
  };

  const parsedSmsCache = useMemo(() => {
    const cache = new Map<string, ReturnType<typeof getSmartDetails>>();
    smsList.forEach((item) => {
      cache.set(item.id, getSmartDetails(item.body, item.address));
    });
    return cache;
  }, [smsList]);

  const filteredSms = smsList.filter((item) => {
    if (filter === "inbox" && (item.isIgnored || item.isProcessed))
      return false;
    if (filter === "transactions" && !item.isProcessed) return false;
    if (filter === "ignored" && !item.isIgnored) return false;

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

    if (selectedAccounts.length > 0) {
      const parsed = parsedSmsCache.get(item.id);
      if (!parsed) return false;

      const matchesKnownAccount = accounts.some(
        (acc) =>
          parsed.bank === acc.bank_name &&
          (parsed.account === acc.account_last4 ||
            parsed.cardLast4 === acc.account_last4),
      );

      if (
        selectedAccounts.length === 1 &&
        selectedAccounts.includes("unknown")
      ) {
        return !matchesKnownAccount;
      }

      if (selectedAccounts.includes("unknown")) {
        if (!matchesKnownAccount) return true;
      }

      const selectedAccountIds = selectedAccounts.filter(
        (id) => id !== "unknown",
      );
      if (selectedAccountIds.length > 0) {
        const matchesSelectedAccount = accounts.some(
          (acc) =>
            selectedAccountIds.includes(acc.id) &&
            parsed.bank === acc.bank_name &&
            (parsed.account === acc.account_last4 ||
              parsed.cardLast4 === acc.account_last4),
        );
        return matchesSelectedAccount;
      }
    }

    return true;
  });

  const {
    searchQuery,
    setSearchQuery,
    filteredData: searchedSms,
  } = useSearch(filteredSms, (item) => {
    const parsed = parsedSmsCache.get(item.id);
    return [
      item.body,
      item.address,
      parsed?.merchant || "",
      parsed?.amount?.toString() || "",
    ];
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
            {loading ? "Syncing..." : `${filteredSms.length} messages`}
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
            <Ionicons
              name="filter-circle-outline"
              size={24}
              color={Theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs - Pill Design */}
      {/* Filter Tabs - Segmented Style */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {["inbox", "transactions", "ignored", "all"].map((f) => {
            const isActive = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setFilter(f as FilterType)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
                {f === "inbox" && !isActive && filteredSms.length > 0 && (
                  <View style={styles.unreadBadge} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search SMS..."
        />
      </View>

      {/* Advanced Filters */}
      {showFilters && (
        <View style={styles.advancedFilters}>
          {/* Date Range */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Date Range</Text>
            <View style={styles.dateRow}>
              {[
                { label: "Last 7 Days", days: 7 },
                { label: "Last 30 Days", days: 30 },
                { label: "This Month", type: "month" },
              ].map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.dateButton}
                  onPress={() => {
                    const today = new Date();
                    let start;
                    if (opt.type === "month") {
                      start = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1,
                      );
                    } else {
                      start = new Date(
                        today.getTime() - (opt.days || 0) * 24 * 60 * 60 * 1000,
                      );
                    }
                    setFromDate(start.toISOString().split("T")[0]);
                    setToDate(today.toISOString().split("T")[0]);
                  }}
                >
                  <Text style={styles.dateButtonLabel}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {(fromDate || toDate) && (
              <Text style={styles.dateRangeText}>
                {fromDate || "..."} — {toDate || "..."}
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
              <Ionicons
                name="close-circle"
                size={16}
                color={Theme.colors.error}
              />
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* SMS List */}
      {loading && smsList.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>Analyzing SMS...</Text>
        </View>
      ) : (
        <FlatList
          data={searchedSms}
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
              <Ionicons
                name="checkbox-outline"
                size={48}
                color={Theme.colors.textTertiary}
              />
              <Text style={styles.emptyText}>
                {searchQuery ? "No results found" : "All caught up!"}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? "Try a different search term"
                  : "No new banking transactions found"}
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
        banks={[...BANKS]}
        last4={processor.inputLast4}
        setLast4={processor.setInputLast4}
        openingBalance={processor.openingBalance}
        setOpeningBalance={processor.setOpeningBalance}
      />

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
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  headerTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textTertiary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Theme.colors.borderSubtle,
  },
  iconButtonActive: {
    backgroundColor: Theme.colors.surfaceHighlight,
    borderColor: Theme.colors.primary,
  },
  tabContainer: {
    marginBottom: Theme.spacing.sm,
  },
  tabScrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xs,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.borderSubtle,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80, // Ensure minimum width for touch target
  },
  tabActive: {
    backgroundColor: Theme.colors.textPrimary,
    borderColor: Theme.colors.textPrimary,
  },
  tabText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  tabTextActive: {
    color: Theme.colors.textInverse,
    fontFamily: Theme.typography.fontFamily.semibold,
  },
  unreadBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.error,
    marginLeft: 6,
  },
  searchContainer: {
    marginBottom: Theme.spacing.sm,
  },
  advancedFilters: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    marginHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.borderSubtle,
  },
  filterSection: {
    marginBottom: Theme.spacing.md,
  },
  filterLabel: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.xs,
    fontFamily: Theme.typography.fontFamily.medium,
    marginBottom: Theme.spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
  },
  dateButton: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: 10,
    alignItems: "center",
  },
  dateButtonLabel: {
    color: Theme.colors.textSecondary,
    fontSize: 11,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  dateRangeText: {
    color: Theme.colors.primary,
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
    fontFamily: Theme.typography.fontFamily.medium,
  },
  accountChips: {
    flexDirection: "row",
    gap: 8,
  },
  accountChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  accountChipActive: {
    backgroundColor: Theme.colors.surfaceHighlight,
    borderColor: Theme.colors.primary,
  },
  accountChipText: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  accountChipTextActive: {
    color: Theme.colors.textPrimary,
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    marginTop: 4,
  },
  clearFiltersText: {
    color: Theme.colors.error,
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: Theme.colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  listContent: {
    padding: Theme.spacing.lg,
    paddingTop: 0,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.semibold,
    marginTop: 16,
  },
  emptySubtext: {
    color: Theme.colors.textTertiary,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});
