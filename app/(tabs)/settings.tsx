import { AccountCreationModal } from "@/components/inbox/AccountCreationModal";
import { getAllAccounts } from "@/services/db";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
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

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [])
  );

  const loadAccounts = async () => {
    const accountsList = await getAllAccounts();
    setAccounts(accountsList);
  };

  const handleCreateAccount = async () => {
    const isCash = accountType === "cash";

    if (!isCash) {
      if (!accountNickname.trim() || !selectedBank || inputLast4.length !== 4) {
        return;
      }
    } else {
      if (!accountNickname.trim()) {
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

  const getAccountIcon = (type: string) => {
    if (type === "credit_card") return "card-outline";
    if (type === "current") return "briefcase-outline";
    if (type === "cash") return "cash-outline";
    return "wallet-outline";
  };

  const bankAccounts = accounts.filter((a) => a.account_type !== "credit_card");
  const creditCards = accounts.filter((a) => a.account_type === "credit_card");

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

  const renderAccountCard = (account: any) => (
    <TouchableOpacity
      key={account.id}
      style={styles.accountCard}
      onPress={() =>
        router.push({
          pathname: "/account-details",
          params: { id: account.id },
        })
      }
    >
      <View style={styles.accountIcon}>
        <Ionicons
          name={getAccountIcon(account.account_type)}
          size={24}
          color="#a855f7"
        />
      </View>
      <View style={styles.accountInfo}>
        <Text style={styles.accountNickname}>{account.nickname}</Text>
        <Text style={styles.accountDetails}>
          {account.account_type === "cash"
            ? "Cash in Hand"
            : `${account.bank_name} •••• ${account.account_last4}`}
        </Text>
      </View>
      <View style={styles.accountBalance}>
        <Text style={styles.balanceAmount}>
          ₹{account.balance?.toFixed(2) || "0.00"}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#71717a" />
      </View>
    </TouchableOpacity>
  );

  const renderCreditCard = (account: any) => (
    <TouchableOpacity
      key={account.id}
      activeOpacity={0.9}
      style={[
        styles.creditCard,
        { backgroundColor: getBankColor(account.bank_name) },
      ]}
      onPress={() =>
        router.push({
          pathname: "/account-details",
          params: { id: account.id },
        })
      }
    >
      {/* Glossy Overlay */}
      <View style={styles.cardOverlay} />

      {/* Top Row */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardBankName}>{account.bank_name}</Text>
        <Ionicons name="wifi" size={20} color="rgba(255,255,255,0.6)" />
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Accounts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Bank Accounts ({bankAccounts.length})
          </Text>

          {bankAccounts.map((account) => renderAccountCard(account))}

          {bankAccounts.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={48} color="#3f3f46" />
              <Text style={styles.emptyText}>No bank accounts</Text>
            </View>
          )}
        </View>

        {/* Cards Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cards ({creditCards.length})</Text>

          {creditCards.map((account) => renderCreditCard(account))}

          {creditCards.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color="#3f3f46" />
              <Text style={styles.emptyText}>No cards</Text>
            </View>
          )}
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setAccountModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#22c55e" />
            <Text style={[styles.settingText, { color: "#22c55e" }]}>
              Add Account Manually
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#71717a" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="download-outline" size={20} color="#a1a1aa" />
            <Text style={styles.settingText}>Export Data</Text>
            <Ionicons name="chevron-forward" size={20} color="#71717a" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={[styles.settingText, { color: "#ef4444" }]}>
              Clear All Data
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#71717a" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Account Creation Modal */}
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
        banks={[
          "HDFC Bank",
          "Axis Bank",
          "SBI",
          "ICICI Bank",
          "Kotak Bank",
          "Other",
        ]}
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
    backgroundColor: "#09090B",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 16,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountNickname: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  accountDetails: {
    fontSize: 14,
    color: "#71717a",
  },
  accountBalance: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#22c55e",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#a1a1aa",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#71717a",
    marginTop: 4,
    textAlign: "center",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    gap: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: "#a1a1aa",
  },
  creditCard: {
    width: "100%",
    aspectRatio: 1.586,
    borderRadius: 16,
    padding: 24,
    justifyContent: "space-between",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.9)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardChip: {
    width: 44,
    height: 32,
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
    left: 14,
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
    fontSize: 20,
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
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 1,
    maxWidth: 160,
  },
  cardBalance: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
