import { AccountCreationModal } from "@/components/inbox/AccountCreationModal";
import { AmountText } from "@/components/ui/AmountText";
import { Theme } from "@/constants/theme";
import { BANKS } from "@/services/config/detection";
import { getAllAccounts } from "@/services/db";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "@/services/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNickname, setAccountNickname] = useState("");
  const [accountType, setAccountType] = useState("savings");
  const [inputLast4, setInputLast4] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const router = useRouter();

  const [notifyNewTransactions, setNotifyNewTransactions] = useState(true);
  const [notifyPendingVerification, setNotifyPendingVerification] =
    useState(true);
  const [notifyWeeklySummary, setNotifyWeeklySummary] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
      loadNotificationSettings();
    }, [])
  );

  const loadNotificationSettings = async () => {
    const settings = await getNotificationSettings();
    setNotifyNewTransactions(settings.notifyNewTransactions);
    setNotifyPendingVerification(settings.notifyPendingVerification);
    setNotifyWeeklySummary(settings.notifyWeeklySummary);
  };

  const handleToggleNotification = async (key: string, value: boolean) => {
    await updateNotificationSettings(key, value);
    if (key === "notify_new_transactions") setNotifyNewTransactions(value);
    if (key === "notify_pending_verification")
      setNotifyPendingVerification(value);
    if (key === "notify_weekly_summary") setNotifyWeeklySummary(value);
  };

  const loadAccounts = async () => {
    const accountsList = await getAllAccounts();
    setAccounts(accountsList);
  };

  const handleCreateAccount = async () => {
    const isCash = accountType === "cash";

    if (!isCash) {
      if (!accountNickname.trim() || !selectedBank || inputLast4.length !== 4) {
        Alert.alert("Incomplete", "Please fill all fields properly");
        return;
      }
    } else {
      if (!accountNickname.trim()) {
        Alert.alert("Incomplete", "Please enter a nickname");
        return;
      }
    }

    try {
      const { createAccount } = await import("@/services/db");
      const Crypto = await import("expo-crypto");

      await createAccount({
        id: Crypto.randomUUID(),
        bank_name: isCash ? "Cash" : selectedBank,
        account_last4: isCash
          ? Math.floor(1000 + Math.random() * 9000).toString()
          : inputLast4,
        account_type: accountType,
        nickname: accountNickname,
        balance: openingBalance ? parseFloat(openingBalance) : 0,
      });

      setAccountModalVisible(false);
      resetForm();
      loadAccounts();
    } catch (error) {
      console.error("Failed to create account", error);
    }
  };

  const resetForm = () => {
    setSelectedBank("");
    setAccountNickname("");
    setAccountType("savings");
    setInputLast4("");
    setOpeningBalance("");
  };

  const bankAccounts = accounts.filter((a) => a.account_type !== "credit_card");
  const creditCards = accounts.filter((a) => a.account_type === "credit_card");

  const getBankColor = (bankName: string) => {
    const name = bankName.toLowerCase();
    if (name.includes("hdfc")) return "#004c8f";
    if (name.includes("sbi")) return "#1e3a8a";
    if (name.includes("axis")) return "#97144d";
    if (name.includes("icici")) return "#c1541f";
    if (name.includes("kotak")) return "#da251c";
    if (name.includes("cash")) return Theme.colors.success;
    return Theme.colors.surfaceHighlight;
  };

  const renderAccountItem = (account: any, isCard = false) => (
    <TouchableOpacity
      key={account.id}
      style={styles.accountItem}
      onPress={() =>
        router.push({
          pathname: "/account-details",
          params: { id: account.id },
        })
      }
    >
      <View style={styles.accountIconContainer}>
        <View
          style={[
            styles.bankIcon,
            {
              backgroundColor: isCard
                ? getBankColor(account.bank_name)
                : Theme.colors.surfaceHighlight,
            },
          ]}
        >
          <Ionicons
            name={
              isCard
                ? "card"
                : account.account_type === "cash"
                ? "cash"
                : "business"
            }
            size={18}
            color={isCard ? "white" : Theme.colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.accountInfo}>
        <Text style={styles.accountName} numberOfLines={1}>
          {account.nickname}
        </Text>
        <Text style={styles.accountDetail}>
          {account.bank_name}{" "}
          {account.account_type !== "cash" && `• ${account.account_last4}`}
        </Text>
      </View>

      <View style={styles.accountBalance}>
        <AmountText value={account.balance || 0} size="md" />
      </View>

      <Ionicons
        name="chevron-forward"
        size={16}
        color={Theme.colors.textTertiary}
      />
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string, action?: React.ReactNode) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Accounts Group */}
        <View style={styles.group}>
          {renderSectionHeader(
            "Accounts",
            <TouchableOpacity onPress={() => setAccountModalVisible(true)}>
              <Text style={styles.actionText}>Add New</Text>
            </TouchableOpacity>
          )}

          <View style={styles.card}>
            {bankAccounts.length > 0 && (
              <View>
                <Text style={styles.subHeader}>Bank Accounts</Text>
                {bankAccounts.map((acc) => renderAccountItem(acc))}
              </View>
            )}

            {creditCards.length > 0 && (
              <View
                style={bankAccounts.length > 0 ? styles.divider : undefined}
              >
                <Text
                  style={[
                    styles.subHeader,
                    bankAccounts.length > 0 && { marginTop: 16 },
                  ]}
                >
                  Credit Cards
                </Text>
                {creditCards.map((acc) => renderAccountItem(acc, true))}
              </View>
            )}

            {accounts.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No accounts added yet</Text>
              </View>
            )}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.group}>
          {renderSectionHeader("Preferences")}
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>New Transactions</Text>
                <Text style={styles.settingDesc}>
                  Notify when banking SMS detected
                </Text>
              </View>
              <Switch
                value={notifyNewTransactions}
                onValueChange={(val) =>
                  handleToggleNotification("notify_new_transactions", val)
                }
                trackColor={{
                  false: Theme.colors.surfaceHighlight,
                  true: Theme.colors.primary,
                }}
                thumbColor="white"
              />
            </View>
            <View style={[styles.divider, { marginVertical: 0 }]} />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Pending Review</Text>
                <Text style={styles.settingDesc}>
                  Daily reminder for unprocessed items
                </Text>
              </View>
              <Switch
                value={notifyPendingVerification}
                onValueChange={(val) =>
                  handleToggleNotification("notify_pending_verification", val)
                }
                trackColor={{
                  false: Theme.colors.surfaceHighlight,
                  true: Theme.colors.primary,
                }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.group}>
          {renderSectionHeader("Data")}
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Export Data to JSON</Text>
              <Ionicons
                name="download-outline"
                size={20}
                color={Theme.colors.textSecondary}
              />
            </TouchableOpacity>
            <View style={[styles.divider, { marginVertical: 0 }]} />
            <TouchableOpacity style={styles.settingRow}>
              <Text
                style={[styles.settingLabel, { color: Theme.colors.error }]}
              >
                Clear All Data
              </Text>
              <Ionicons
                name="trash-outline"
                size={20}
                color={Theme.colors.error}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.versionText}>Version 1.0.0 • Offline Mode</Text>
      </ScrollView>

      <AccountCreationModal
        visible={accountModalVisible}
        onClose={() => {
          setAccountModalVisible(false);
          resetForm();
        }}
        onCreateAccount={handleCreateAccount}
        newAccountData={null}
        selectedBank={selectedBank}
        setSelectedBank={setSelectedBank}
        accountNickname={accountNickname}
        setAccountNickname={setAccountNickname}
        accountType={accountType}
        setAccountType={setAccountType}
        banks={[...BANKS]}
        last4={inputLast4}
        setLast4={setInputLast4}
        openingBalance={openingBalance}
        setOpeningBalance={setOpeningBalance}
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
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  headerTitle: {
    fontSize: Theme.typography.sizes.xxl,
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  group: {
    marginBottom: 24,
    paddingHorizontal: Theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.sm,
    fontFamily: Theme.typography.fontFamily.medium,
    color: Theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  actionText: {
    fontSize: Theme.typography.sizes.sm,
    fontFamily: Theme.typography.fontFamily.medium,
    color: Theme.colors.primary,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.borderSubtle,
    overflow: "hidden",
  },
  subHeader: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.textTertiary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: "uppercase",
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  accountIconContainer: {
    marginRight: 12,
  },
  bankIcon: {
    width: 32,
    height: 32,
    borderRadius: Theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: Theme.typography.sizes.base,
    fontFamily: Theme.typography.fontFamily.medium,
    color: Theme.colors.textPrimary,
  },
  accountDetail: {
    fontSize: Theme.typography.sizes.xs,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  accountBalance: {
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.borderSubtle,
    marginVertical: 8,
    marginLeft: 16,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: Theme.colors.textTertiary,
    fontStyle: "italic",
  },

  // Settings Rows
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16,
  },
  settingLabel: {
    fontSize: Theme.typography.sizes.base,
    fontFamily: Theme.typography.fontFamily.medium,
    color: Theme.colors.textPrimary,
  },
  settingDesc: {
    fontSize: Theme.typography.sizes.xs,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  versionText: {
    textAlign: "center",
    color: Theme.colors.textTertiary,
    fontSize: 12,
    marginTop: 20,
  },
});
