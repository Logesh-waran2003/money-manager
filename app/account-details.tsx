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
      [accountId]
    );
    setAccount(accountData);

    // Get transactions for this account
    const txns: any[] = await db.getAllAsync(
      "SELECT * FROM transactions WHERE account_id = ? ORDER BY date DESC LIMIT 50",
      [accountId]
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
      ]
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
    if (name.includes("hdfc")) return "#004c8f"; // HDFC Blue
    if (name.includes("sbi")) return "#1e3a8a"; // SBI Blue
    if (name.includes("axis")) return "#97144d"; // Axis Burgundy
    if (name.includes("icici")) return "#c1541f"; // ICICI Orange
    if (name.includes("kotak")) return "#da251c"; // Kotak Red
    if (name.includes("cash")) return "#10b981"; // Emerald Green for Cash
    return "#3f3f46"; // Default Zinc
  };

  const renderHero = () => {
    if (account.account_type === "credit_card") {
      return (
        <View
          style={[
            styles.creditCard,
            { backgroundColor: getBankColor(account.bank_name) },
          ]}
        >
          {/* Glossy Overlay */}
          <View style={styles.cardOverlay} />

          {/* Top Row */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardBankName}>{account.bank_name}</Text>
            <Ionicons name="wifi" size={24} color="rgba(255,255,255,0.6)" />
          </View>

          {/* Chip */}
          <View style={styles.cardChip}>
            <View style={styles.chipLine} />
            <View style={[styles.chipLine, { left: 12 }]} />
            <View style={styles.chipBorder} />
          </View>

          {/* Number */}
          <Text style={styles.cardNumber}>
            •••• •••• •••• {account.account_last4}
          </Text>

          {/* Bottom Row */}
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>CARD HOLDER</Text>
              <Text style={styles.cardHolderName} numberOfLines={1}>
                {account.nickname}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.cardLabel}>OUTSTANDING</Text>
              <Text style={styles.cardBalance}>
                ₹{Math.abs(account.balance || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Edit Button (Absolute) */}
          <TouchableOpacity
            style={styles.cardEditButton}
            onPress={() => {
              setNewBalance(account.balance?.toString() || "0");
              setEditBalanceVisible(true);
            }}
          >
            <Ionicons name="create-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      );
    }

    // Premium Bank Account UI (Debit/Savings/Cash)
    const isCash = account.account_type === "cash";
    return (
      <View
        style={[
          styles.bankCard,
          { backgroundColor: getBankColor(account.bank_name) },
        ]}
      >
        {/* Abstract Pattern Overlay */}
        <View style={styles.bankCardOverlay} />
        <View style={styles.bankCardCircle1} />
        <View style={styles.bankCardCircle2} />

        {/* Top Row */}
        <View style={styles.bankCardHeader}>
          <View>
            <Text style={styles.bankCardType}>
              {isCash
                ? "CASH WALLET"
                : account.account_type === "current"
                ? "CURRENT ACCOUNT"
                : "SAVINGS ACCOUNT"}
            </Text>
            <Text style={styles.bankCardBankName}>{account.bank_name}</Text>
          </View>
          <View style={styles.bankCardIcon}>
            <Ionicons
              name={isCash ? "cash" : "wallet"}
              size={20}
              color="white"
            />
          </View>
        </View>

        {/* Middle - Available Balance */}
        <View style={styles.bankCardBalanceContainer}>
          <Text style={styles.bankCardLabel}>AVAILABLE BALANCE</Text>
          <View style={styles.amountRow}>
            <Text style={styles.bankCardCurrency}>₹</Text>
            <Text style={styles.bankCardBalance}>
              {account.balance?.toFixed(2) || "0.00"}
            </Text>
          </View>
        </View>

        {/* Bottom Row */}
        <View style={styles.bankCardFooter}>
          <View>
            <Text style={styles.bankCardLabel}>ACCOUNT HOLDER</Text>
            <Text style={styles.bankCardHolderName} numberOfLines={1}>
              {account.nickname}
            </Text>
          </View>
          {!isCash && (
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.bankCardLabel}>ACCOUNT NUMBER</Text>
              <Text style={styles.bankCardNumber}>
                •••• {account.account_last4}
              </Text>
            </View>
          )}
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          style={styles.cardEditButton}
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

  const getAccountIcon = (type: string) => {
    if (type === "credit_card") return "card-outline";
    if (type === "current") return "briefcase-outline";
    if (type === "cash") return "cash-outline";
    return "wallet-outline";
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{account.nickname}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Hero Card */}
        <View style={styles.heroContainer}>{renderHero()}</View>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bank</Text>
              <Text style={styles.infoValue}>{account.bank_name}</Text>
            </View>
            {account.account_type !== "cash" && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Account Number</Text>
                <Text style={styles.infoValue}>
                  •••• {account.account_last4}
                </Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>
                {account.account_type === "credit_card"
                  ? "Credit Card"
                  : account.account_type === "current"
                  ? "Current"
                  : account.account_type === "cash"
                  ? "Cash"
                  : "Savings"}
              </Text>
            </View>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Recent Transactions ({transactions.length})
          </Text>
          {transactions.map((txn) => (
            <View key={txn.id} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Ionicons
                  name={txn.type === "credit" ? "arrow-down" : "arrow-up"}
                  size={20}
                  color={txn.type === "credit" ? "#22c55e" : "#ef4444"}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionMerchant}>{txn.merchant}</Text>
                <Text style={styles.transactionCategory}>{txn.category}</Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: txn.type === "credit" ? "#22c55e" : "#ef4444" },
                ]}
              >
                {txn.type === "credit" ? "+" : "-"}₹{txn.amount.toFixed(2)}
              </Text>
            </View>
          ))}

          {transactions.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="receipt-outline" size={32} color="#52525b" />
              </View>
              <Text style={styles.emptyText}>No recent transactions</Text>
              <Text style={styles.emptySubtext}>
                Transactions will appear here once processed
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Balance Modal */}
      <Modal
        visible={editBalanceVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setEditBalanceVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Adjust Balance</Text>
            <Text style={styles.modalSubtitle}>
              Set the correct balance for this account
            </Text>
            <TextInput
              style={styles.balanceInput}
              value={newBalance}
              onChangeText={setNewBalance}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#52525b"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setEditBalanceVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleUpdateBalance}
              >
                <Text style={styles.modalButtonText}>Update</Text>
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
    backgroundColor: "#09090B",
  },
  scrollView: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#a1a1aa",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  heroContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  // Credit Card Styles
  creditCard: {
    width: "100%",
    aspectRatio: 1.586,
    borderRadius: 24,
    padding: 24,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardBankName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.9)",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  cardChip: {
    width: 48,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.1)",
    position: "relative",
    overflow: "hidden",
  },
  chipLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 15,
    width: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  chipBorder: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  cardNumber: {
    fontSize: 22,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 4,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardHolderName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 1,
    maxWidth: 180,
  },
  cardBalance: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  cardEditButton: {
    position: "absolute",
    top: 24,
    right: 54, // Positioned left of Wifi icon loop
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
  },
  // Default Balance Card Styles
  balanceCard: {
    marginHorizontal: 0, // Removed margin from here, now handled by heroContainer padding
    padding: 24,
    backgroundColor: "#18181b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    alignItems: "center",
  },
  balanceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#71717a",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },
  editBalanceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#a855f7",
  },
  editBalanceText: {
    color: "#a855f7",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  infoLabel: {
    fontSize: 14,
    color: "#71717a",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionMerchant: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: "#71717a",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#18181b",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#a1a1aa",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#71717a",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ef4444",
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#18181b",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#3f3f46",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#a1a1aa",
    marginBottom: 24,
  },
  balanceInput: {
    backgroundColor: "#09090B",
    borderWidth: 2,
    borderColor: "#a855f7",
    borderRadius: 16,
    padding: 16,
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#27272a",
  },
  modalSaveButton: {
    backgroundColor: "#a855f7", // Purple instead of green for brand consistency
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Bank Card Styles
  bankCard: {
    width: "100%",
    aspectRatio: 1.586,
    borderRadius: 24,
    padding: 24,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  bankCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  bankCardCircle1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  bankCardCircle2: {
    position: "absolute",
    bottom: -80,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  bankCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bankCardType: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  bankCardBankName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    letterSpacing: -0.5,
  },
  bankCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  bankCardBalanceContainer: {
    marginTop: 10,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  bankCardCurrency: {
    fontSize: 24,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
  },
  bankCardBalance: {
    fontSize: 42,
    fontWeight: "bold",
    color: "white",
    letterSpacing: -1,
  },
  bankCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  bankCardLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bankCardHolderName: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 1,
    maxWidth: 160,
  },
  bankCardNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 2,
    fontVariant: ["tabular-nums"],
  },
});
