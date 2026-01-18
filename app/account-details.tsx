import { AmountText } from "@/components/ui/AmountText";
import { Theme } from "@/constants/theme";
import { getDb } from "@/services/db";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const accountId = Array.isArray(id) ? id[0] : id;
  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [editBalanceVisible, setEditBalanceVisible] = useState(false);
  const [newBalance, setNewBalance] = useState("");

  useEffect(() => {
    loadAccountData();
  }, [accountId]);

  const loadAccountData = async () => {
    const db = await getDb();

    // Get account details
    const accountData: any = await db.getFirstAsync(
      "SELECT * FROM accounts WHERE id = ?",
      [accountId],
    );
    setAccount(accountData);

    // Get transactions for this account
    const txns: any[] = await db.getAllAsync(
      "SELECT * FROM transactions WHERE account_id = ? ORDER BY date DESC LIMIT 50",
      [accountId],
    );
    setTransactions(txns);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete ${account?.nickname}? This will not delete transactions.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const db = await getDb();
            await db.runAsync("DELETE FROM accounts WHERE id = ?", [accountId]);
            router.back();
          },
        },
      ],
    );
  };

  const handleUpdateBalance = async () => {
    if (!newBalance) {
      Alert.alert("Error", "Please enter a balance");
      return;
    }

    try {
      const db = await getDb();
      await db.runAsync("UPDATE accounts SET balance = ? WHERE id = ?", [
        parseFloat(newBalance),
        accountId,
      ]);
      setEditBalanceVisible(false);
      loadAccountData();
    } catch (error) {
      Alert.alert("Error", "Failed to update balance");
    }
  };

  if (!account) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

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

  const renderCard = () => {
    const isCredit = account.account_type === "credit_card";
    const bankColor = getBankColor(account.bank_name);

    return (
      <View style={[styles.card, { backgroundColor: bankColor }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardBank}>{account.bank_name}</Text>
            <Text style={[styles.cardLabel, { marginTop: 4, opacity: 0.8 }]}>
              {account.nickname}
            </Text>
          </View>
          <Ionicons
            name={isCredit ? "card" : "wallet"}
            size={24}
            color="rgba(255,255,255,0.8)"
          />
        </View>

        <View style={styles.cardBody}>
          {isCredit ? <View style={styles.chip} /> : <View />}
          {isCredit && (
            <Ionicons
              name="wifi"
              size={20}
              color="rgba(255,255,255,0.6)"
              style={{ marginLeft: 12 }}
            />
          )}
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.cardLabel}>BALANCE</Text>
            <AmountText
              value={account.balance || 0}
              style={styles.cardBalance}
              showSign={false} // Only show sign if negative (handled by updated AmountText)
            />
          </View>

          {account.account_type !== "cash" && (
            <Text style={styles.cardNumber}>•••• {account.account_last4}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setNewBalance(account.balance?.toString() || "0");
            setEditBalanceVisible(true);
          }}
        >
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Theme.colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {account.nickname}
        </Text>
        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={styles.headerBtn}
        >
          <Ionicons name="trash-outline" size={20} color={Theme.colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>{renderCard()}</View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>

        {transactions.length > 0 ? (
          <View style={styles.txnList}>
            {transactions.map((txn, index) => (
              <View
                key={txn.id}
                style={[
                  styles.txnItem,
                  index === transactions.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.txnIcon}>
                  <Ionicons
                    name={txn.type === "credit" ? "arrow-down" : "arrow-up"}
                    size={16}
                    color={
                      txn.type === "credit"
                        ? Theme.colors.success
                        : Theme.colors.textSecondary
                    }
                  />
                </View>
                <View style={styles.txnContent}>
                  <Text style={styles.txnMerchant}>
                    {txn.merchant || "Unknown"}
                  </Text>
                  <Text style={styles.txnCategory}>{txn.category}</Text>
                </View>
                <AmountText
                  value={txn.amount}
                  type={txn.type === "debit" ? "expense" : "income"}
                  size="sm"
                  style={{ fontFamily: Theme.typography.fontFamily.medium }}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="receipt-outline"
              size={48}
              color={Theme.colors.textTertiary}
            />
            <Text style={styles.emptyText}>No recent transactions</Text>
          </View>
        )}
      </ScrollView>

      {/* Edit Balance Modal */}
      <Modal
        visible={editBalanceVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setEditBalanceVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Balance</Text>
            <Text style={styles.modalSubtitle}>
              Enter the specific current balance.
            </Text>

            <TextInput
              style={styles.input}
              value={newBalance}
              onChangeText={setNewBalance}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={Theme.colors.textTertiary}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: Theme.colors.surfaceHighlight },
                ]}
                onPress={() => setEditBalanceVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: Theme.colors.primary },
                ]}
                onPress={handleUpdateBalance}
              >
                <Text style={[styles.modalBtnText, { color: "white" }]}>
                  Update
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: Theme.colors.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderSubtle,
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    padding: 20,
    alignItems: "center",
  },
  card: {
    width: "100%",
    aspectRatio: 1.58,
    borderRadius: 16,
    padding: 20,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardBank: {
    fontSize: Theme.typography.sizes.lg,
    fontFamily: Theme.typography.fontFamily.bold,
    color: "white",
    textTransform: "uppercase",
  },
  cardLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    width: 40,
    height: 28,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardBalance: {
    fontSize: Theme.typography.sizes.xl,
    fontFamily: Theme.typography.fontFamily.bold,
    color: "white",
  },
  cardNumber: {
    fontSize: Theme.typography.sizes.md,
    fontFamily: Theme.typography.fontFamily.mono,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 2,
  },
  editButton: {
    position: "absolute",
    right: 16,
    top: 16,
    opacity: 0, // Hidden touch area for now, or maybe make it visible
    // Actually, relying on the header delete and modal for balance update is better.
    // But the original design had an edit button on the card.
    // Let's make it visible but subtle
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    opacity: 1,
  },

  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: Theme.typography.sizes.md,
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.textPrimary,
  },
  txnList: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: 20,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.borderSubtle,
    overflow: "hidden",
  },
  txnItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderSubtle,
  },
  txnIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.surfaceHighlight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  txnContent: {
    flex: 1,
  },
  txnMerchant: {
    fontSize: Theme.typography.sizes.base,
    fontFamily: Theme.typography.fontFamily.medium,
    color: Theme.colors.textPrimary,
  },
  txnCategory: {
    fontSize: Theme.typography.sizes.xs,
    color: Theme.colors.textSecondary,
    textTransform: "capitalize",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: Theme.colors.textTertiary,
    marginTop: 12,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: Theme.colors.borderSubtle,
  },
  modalTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: 12,
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.sizes.xl,
    textAlign: "center",
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Theme.borderRadius.md,
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: Theme.typography.sizes.base,
    fontFamily: Theme.typography.fontFamily.medium,
    color: Theme.colors.textPrimary,
  },
});
