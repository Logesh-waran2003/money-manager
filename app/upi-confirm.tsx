import { CATEGORIES, CategoryId } from "@/services/config/detection";
import { getDb } from "@/services/db";
import { TransactionService } from "@/services/TransactionService";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UpiConfirmScreen() {
  const params = useLocalSearchParams<{
    merchant: string;
    amount: string;
    note: string;
  }>();

  console.log(
    "📝 UPI Confirm Screen - Received params:",
    JSON.stringify(params, null, 2),
  );

  const [merchant, setMerchant] = useState(params.merchant || "");
  const [amount, setAmount] = useState(params.amount || "");
  const [note, setNote] = useState(params.note || "");
  const [category, setCategory] = useState<CategoryId>("others");
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [upiApp, setUpiApp] = useState("GPay");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const upiApps = [
    "GPay",
    "PhonePe",
    "Paytm",
    "Amazon Pay",
    "BHIM",
    "WhatsApp",
    "Other",
  ];

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, []),
  );

  const loadAccounts = async () => {
    try {
      const db = await getDb();
      const accountsList: any[] = await db.getAllAsync(
        "SELECT * FROM accounts",
      );
      setAccounts(accountsList);
      if (accountsList.length > 0 && !selectedAccount) {
        setSelectedAccount(accountsList[0].id);
      }
    } catch (error) {
      console.error("Failed to load accounts:", error);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "bank":
      case "savings":
      case "current":
        return "business";
      case "wallet":
        return "wallet";
      case "credit_card":
      case "card":
        return "card";
      case "cash":
        return "cash";
      default:
        return "wallet-outline";
    }
  };

  const handleSave = async () => {
    if (!merchant.trim() || !amount.trim()) {
      console.log("⚠️ Validation failed: merchant or amount missing");
      return;
    }

    if (!selectedAccount) {
      return;
    }

    console.log("💾 Saving transaction:", {
      merchant: merchant.trim(),
      amount: parseFloat(amount),
      category,
      note: note.trim() || undefined,
      type: "debit",
      method: "upi",
      upiApp,
      accountId: selectedAccount,
    });

    setSaving(true);
    try {
      const txnId = await TransactionService.addManualTransaction({
        merchant: merchant.trim(),
        amount: parseFloat(amount),
        category,
        note: `${note.trim() ? note.trim() + " | " : ""}Paid via ${upiApp}`,
        type: "debit",
        method: "upi",
        accountId: selectedAccount,
      });

      console.log("✅ Transaction saved successfully with ID:", txnId);
      setSaving(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("❌ Failed to save transaction:", error);
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#09090B" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Confirm Transaction</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Merchant</Text>
          <TextInput
            style={styles.input}
            value={merchant}
            onChangeText={setMerchant}
            placeholder="Merchant name"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#666"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Account</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.accountList}
          >
            {accounts.map((acc) => (
              <Pressable
                key={acc.id}
                style={[
                  styles.accountCard,
                  selectedAccount === acc.id && styles.accountCardActive,
                ]}
                onPress={() => setSelectedAccount(acc.id)}
              >
                <View
                  style={[
                    styles.accountIcon,
                    selectedAccount === acc.id && styles.accountIconActive,
                  ]}
                >
                  <Ionicons
                    name={getAccountIcon(acc.account_type || "wallet") as any}
                    size={20}
                    color={selectedAccount === acc.id ? "#fff" : "#a1a1aa"}
                  />
                </View>
                <View>
                  <Text
                    style={[
                      styles.accountName,
                      selectedAccount === acc.id && styles.accountNameActive,
                    ]}
                    numberOfLines={1}
                  >
                    {acc.nickname || acc.bank_name || "Account"}
                  </Text>
                  {acc.balance !== undefined && (
                    <Text style={styles.accountBalance}>
                      ₹{Number(acc.balance).toLocaleString()}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>UPI App Used</Text>
          <View style={styles.categoryGrid}>
            {upiApps.map((app) => (
              <Pressable
                key={app}
                style={[
                  styles.categoryChip,
                  upiApp === app && styles.categoryChipActive,
                ]}
                onPress={() => setUpiApp(app)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    upiApp === app && styles.categoryTextActive,
                  ]}
                >
                  {app}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryChip,
                  category === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note"
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : "Save"}
          </Text>
        </Pressable>
      </View>

      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            </View>
            <Text style={styles.successTitle}>Transaction Saved!</Text>
            <Text style={styles.successMessage}>
              ₹{amount} paid to {merchant}
            </Text>
            <Pressable
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.replace("/(tabs)");
              }}
            >
              <Text style={styles.successButtonText}>Done</Text>
            </Pressable>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#a1a1aa",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#fff",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  categoryChipActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  categoryText: {
    fontSize: 14,
    color: "#a1a1aa",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#09090B",
    borderTopWidth: 1,
    borderTopColor: "#1d1d20",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successContent: {
    backgroundColor: "#18181b",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  successMessage: {
    color: "#a1a1aa",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  successButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  accountList: {
    gap: 12,
    paddingRight: 16,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 12,
    borderRadius: 16,
    minWidth: 140,
    marginRight: 8,
  },
  accountCardActive: {
    borderColor: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  accountIconActive: {
    backgroundColor: "#3b82f6",
  },
  accountName: {
    fontSize: 14,
    color: "#a1a1aa",
    fontWeight: "500",
  },
  accountNameActive: {
    color: "#fff",
    fontWeight: "600",
  },
  accountBalance: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 2,
  },
});
