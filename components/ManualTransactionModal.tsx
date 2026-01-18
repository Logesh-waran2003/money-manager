import { Theme } from "@/constants/theme";
import { CATEGORIES } from "@/services/config/detection";
import { updateAccountBalance } from "@/services/db";
import { addTransaction } from "@/services/SmsService";
import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
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

interface ManualTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: any[];
  onCreateAccount?: () => void;
}

const CATEGORY_IDS = CATEGORIES.map((cat) => cat.id);

export const ManualTransactionModal: React.FC<ManualTransactionModalProps> = ({
  visible,
  onClose,
  onSuccess,
  accounts,
  onCreateAccount,
}) => {
  const [amount, setAmount] = useState("0");
  const [type, setType] = useState<"debit" | "credit">("debit");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("others");
  const [remarks, setRemarks] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");

  // View states
  const [showDetails, setShowDetails] = useState(false); // If true, shows merchant/category inputs instead of numpad

  // Initialize selected account
  useEffect(() => {
    if (visible && accounts.length > 0 && !selectedAccountId) {
      // Default to first account if none selected
      setSelectedAccountId(accounts[0].id);
    }
  }, [visible, accounts]);

  const resetForm = () => {
    setAmount("0");
    setType("debit");
    setMerchant("");
    setCategory("others");
    setRemarks("");
    setShowDetails(false);
  };

  const handlePressNumber = (num: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (amount === "0" && num !== ".") {
      setAmount(num);
    } else {
      if (num === "." && amount.includes(".")) return;
      if (amount.replace(".", "").length >= 9) return; // Limit length
      setAmount(amount + num);
    }
  };

  const handleBackspace = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (amount.length === 1) {
      setAmount("0");
    } else {
      setAmount(amount.slice(0, -1));
    }
  };

  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    if (numericAmount === 0 || !selectedAccountId) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      await addTransaction({
        id: Crypto.randomUUID(),
        mobile_id: null as any,
        amount: numericAmount,
        merchant:
          merchant || (type === "credit" ? "Manual Deposit" : "Manual Expense"),
        category,
        date: new Date().toISOString(),
        type,
        raw_body: `Manual transaction: ${merchant || "Manual Entry"}`,
        remarks,
        account_id: selectedAccountId,
        merchant_id: null,
      });

      await updateAccountBalance(selectedAccountId, numericAmount, type);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to save transaction");
    }
  };

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  const renderNumpad = () => (
    <View style={styles.numpadContainer}>
      {[
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
        [".", "0", "backspace"],
      ].map((row, rowIndex) => (
        <View key={rowIndex} style={styles.numpadRow}>
          {row.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.numpadButton}
              onPress={() =>
                item === "backspace"
                  ? handleBackspace()
                  : handlePressNumber(item)
              }
            >
              {item === "backspace" ? (
                <Ionicons
                  name="backspace-outline"
                  size={28}
                  color={Theme.colors.textPrimary}
                />
              ) : (
                <Text style={styles.numpadText}>{item}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons
              name="close"
              size={24}
              color={Theme.colors.textSecondary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Transaction</Text>
          <TouchableOpacity
            onPress={() => setShowDetails(!showDetails)}
            style={styles.detailsButton}
          >
            <Text style={styles.detailsButtonText}>
              {showDetails ? "Numpad" : "Details"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Amount Display */}
          <View style={styles.amountContainer}>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencySymbol}>₹</Text>
            </View>
            <Text
              style={[
                styles.amountText,
                {
                  color:
                    type === "credit"
                      ? Theme.colors.success
                      : Theme.colors.textPrimary,
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {amount}
            </Text>
          </View>

          {/* Type Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                type === "debit" && styles.toggleButtonActive,
              ]}
              onPress={() => setType("debit")}
            >
              <Text
                style={[
                  styles.toggleText,
                  type === "debit" && styles.toggleTextActive,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                type === "credit" && styles.toggleCreditActive,
              ]}
              onPress={() => setType("credit")}
            >
              <Text
                style={[
                  styles.toggleText,
                  type === "credit" && styles.toggleTextActive,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Account Selector (Quick) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.accountScroll}
          >
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                style={[
                  styles.accountChip,
                  selectedAccountId === acc.id && styles.accountChipActive,
                ]}
                onPress={() => setSelectedAccountId(acc.id)}
              >
                <Ionicons
                  name={
                    acc.account_type === "credit_card"
                      ? "card-outline"
                      : "wallet-outline"
                  }
                  size={16}
                  color={
                    selectedAccountId === acc.id
                      ? Theme.colors.primary
                      : Theme.colors.textTertiary
                  }
                />
                <Text
                  style={[
                    styles.accountChipText,
                    selectedAccountId === acc.id &&
                      styles.accountChipTextActive,
                  ]}
                >
                  {acc.nickname}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Main Content Area (Numpad or Details) */}
          {showDetails ? (
            <View style={styles.detailsForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Merchant / Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder={
                    type === "credit"
                      ? "Salary, Refund, etc."
                      : "Uber, Amazon, etc."
                  }
                  placeholderTextColor={Theme.colors.textTertiary}
                  value={merchant}
                  onChangeText={setMerchant}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORY_IDS.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catChip,
                        category === cat && styles.catChipActive,
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.catText,
                          category === cat && styles.catTextActive,
                        ]}
                      >
                        {cat.replace(/_/g, " ")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Remarks</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Optional notes"
                  placeholderTextColor={Theme.colors.textTertiary}
                  value={remarks}
                  onChangeText={setRemarks}
                />
              </View>
            </View>
          ) : (
            renderNumpad()
          )}
        </ScrollView>

        {/* Floating Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              { opacity: parseFloat(amount) > 0 ? 1 : 0.5 },
            ]}
            onPress={handleSave}
            disabled={parseFloat(amount) === 0}
          >
            <Text style={styles.saveButtonText}>Save Transaction</Text>
            <Ionicons name="checkmark-circle" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Theme.spacing.lg,
  },
  closeButton: {
    padding: 8,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.surface,
  },
  headerTitle: {
    fontSize: Theme.typography.sizes.lg,
    fontFamily: Theme.typography.fontFamily.semibold,
    color: Theme.colors.textPrimary,
  },
  detailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.surface,
  },
  detailsButtonText: {
    fontSize: Theme.typography.sizes.sm,
    fontFamily: Theme.typography.fontFamily.medium,
    color: Theme.colors.primary,
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
  },
  amountContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30, // Space for the big amount
  },
  currencyBadge: {
    marginBottom: 8,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
  },
  currencySymbol: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  amountText: {
    fontSize: 56, // Massive
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.textPrimary,
    letterSpacing: -1,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.full,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: Theme.borderRadius.full,
  },
  toggleButtonActive: {
    backgroundColor: "rgba(239, 68, 68, 0.15)", // Light red
  },
  toggleCreditActive: {
    backgroundColor: "rgba(34, 197, 94, 0.15)", // Light green
  },
  toggleText: {
    fontSize: Theme.typography.sizes.sm,
    fontFamily: Theme.typography.fontFamily.medium,
    color: Theme.colors.textSecondary,
  },
  toggleTextActive: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.typography.fontFamily.semibold,
  },
  accountScroll: {
    flexGrow: 0,
    marginBottom: 24,
  },
  accountChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.borderSubtle,
    marginRight: 8,
  },
  accountChipActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  accountChipText: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  accountChipTextActive: {
    color: Theme.colors.textPrimary,
  },

  // Numpad Styles
  numpadContainer: {
    marginTop: 10,
    gap: 16,
  },
  numpadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  numpadButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
  },
  numpadText: {
    fontSize: 28,
    fontFamily: Theme.typography.fontFamily.medium,
    color: Theme.colors.textPrimary,
  },

  // Details Form
  detailsForm: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: Theme.typography.sizes.sm,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  input: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.sizes.base,
    borderWidth: 1,
    borderColor: Theme.colors.borderSubtle,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.borderSubtle,
  },
  catChipActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  catText: {
    fontSize: 12,
    color: Theme.colors.textTertiary,
    textTransform: "capitalize",
  },
  catTextActive: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.typography.fontFamily.medium,
  },

  footer: {
    padding: Theme.spacing.lg, // Removed Platform.OS checks as any required padding is handled by SafeAreaView
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderSubtle,
    backgroundColor: Theme.colors.background,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.full,
    gap: 8,
  },
  saveButtonText: {
    color: Theme.colors.textInverse,
    fontSize: Theme.typography.sizes.base,
    fontFamily: Theme.typography.fontFamily.bold,
  },
});
