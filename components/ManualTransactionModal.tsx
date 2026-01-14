import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

const CATEGORIES = [
  "food_dining",
  "shopping",
  "transportation",
  "utilities",
  "financial",
  "personal",
  "healthcare",
  "entertainment",
  "others",
];

export const ManualTransactionModal: React.FC<
  ManualTransactionModalProps
> = ({ visible, onClose, onSuccess, accounts, onCreateAccount }) => {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"debit" | "credit">("debit");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("others");
  const [remarks, setRemarks] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  const resetForm = () => {
    setAmount("");
    setType("debit");
    setMerchant("");
    setCategory("others");
    setRemarks("");
    setSelectedAccountId("");
  };

  const handleSave = async () => {
    if (!amount || !selectedAccountId) {
      Alert.alert("Error", "Please enter amount and select account");
      return;
    }

    try {
      const { addTransaction } = await import("@/services/SmsService");
      const { updateAccountBalance } = await import("@/services/db");

      await addTransaction({
        id: Crypto.randomUUID(),
        mobile_id: null as any,
        amount: parseFloat(amount),
        merchant: merchant || "Manual Entry",
        category,
        date: new Date().toISOString(),
        type,
        raw_body: `Manual transaction: ${merchant || "Manual Entry"}`,
        remarks,
        account_id: selectedAccountId,
        merchant_id: null,
      });

      await updateAccountBalance(selectedAccountId, parseFloat(amount), type);

      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to save transaction");
    }
  };

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Add Transaction</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#a1a1aa" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Type Selection */}
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === "debit" && styles.typeButtonActive,
                  ]}
                  onPress={() => setType("debit")}
                >
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={type === "debit" ? "#ef4444" : "#71717a"}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === "debit" && styles.typeButtonTextActive,
                    ]}
                  >
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === "credit" && styles.typeButtonActive,
                  ]}
                  onPress={() => setType("credit")}
                >
                  <Ionicons
                    name="arrow-down"
                    size={20}
                    color={type === "credit" ? "#22c55e" : "#71717a"}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === "credit" && styles.typeButtonTextActive,
                    ]}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Amount */}
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#52525b"
              />

              {/* Account */}
              <Text style={styles.label}>Account</Text>
              <TouchableOpacity
                style={styles.accountSelector}
                onPress={() => setShowAccountPicker(true)}
              >
                <View style={styles.accountInfo}>
                  <Ionicons name="wallet-outline" size={20} color="#a1a1aa" />
                  <Text
                    style={[
                      styles.accountSelectorText,
                      !selectedAccount && styles.placeholderText,
                    ]}
                  >
                    {selectedAccount?.nickname || "Select Account"}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#71717a" />
              </TouchableOpacity>

              {/* Merchant */}
              <Text style={styles.label}>Merchant/Description</Text>
              <TextInput
                style={styles.input}
                value={merchant}
                onChangeText={setMerchant}
                placeholder="Enter merchant name"
                placeholderTextColor="#52525b"
              />

              {/* Category */}
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat.replace("_", " ")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Remarks */}
              <Text style={styles.label}>Remarks (Optional)</Text>
              <TextInput
                style={[styles.input, styles.remarksInput]}
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Add notes..."
                placeholderTextColor="#52525b"
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>

          {/* Account Picker */}
          <Modal
            visible={showAccountPicker}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setShowAccountPicker(false)}
          >
            <TouchableOpacity
              style={styles.pickerOverlay}
              activeOpacity={1}
              onPress={() => setShowAccountPicker(false)}
            >
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerTitle}>Select Account</Text>
                <ScrollView style={styles.pickerList}>
                  {accounts.map((acc) => (
                    <TouchableOpacity
                      key={acc.id}
                      style={styles.pickerItem}
                      onPress={() => {
                        setSelectedAccountId(acc.id);
                        setShowAccountPicker(false);
                      }}
                    >
                      <View style={styles.pickerItemIcon}>
                        <Ionicons
                          name={
                            acc.account_type === "credit_card"
                              ? "card-outline"
                              : "wallet-outline"
                          }
                          size={24}
                          color="#a855f7"
                        />
                      </View>
                      <View>
                        <Text style={styles.pickerItemTitle}>
                          {acc.nickname}
                        </Text>
                        <Text style={styles.pickerItemSubtitle}>
                          {acc.bank_name} • {acc.account_type}
                        </Text>
                      </View>
                      {selectedAccountId === acc.id && (
                        <Ionicons
                          name="checkmark"
                          size={24}
                          color="#22c55e"
                          style={{ marginLeft: "auto" }}
                        />
                      )}
                    </TouchableOpacity>
                  ))}

                  {/* Add New Account Button */}
                  {onCreateAccount && (
                    <TouchableOpacity
                      style={styles.addNewAccountButton}
                      onPress={() => {
                        setShowAccountPicker(false);
                        onCreateAccount();
                      }}
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={24}
                        color="#22c55e"
                      />
                      <Text style={styles.addNewAccountText}>
                        Add New Account
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#09090B",
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  label: {
    color: "#e4e4e7",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    borderColor: "#a855f7",
  },
  typeButtonText: {
    color: "#71717a",
    fontSize: 16,
    fontWeight: "500",
  },
  typeButtonTextActive: {
    color: "#a855f7",
    fontWeight: "600",
  },
  amountInput: {
    backgroundColor: "#18181b",
    borderWidth: 2,
    borderColor: "#a855f7",
    borderRadius: 12,
    padding: 14,
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  accountSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 12,
    padding: 14,
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  accountSelectorText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  placeholderText: {
    color: "#a1a1aa",
  },
  input: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 12,
    padding: 14,
    color: "white",
    fontSize: 16,
  },
  remarksInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  categoryChipActive: {
    backgroundColor: "rgba(168, 85, 247, 0.2)",
    borderColor: "#a855f7",
  },
  categoryChipText: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  categoryChipTextActive: {
    color: "#a855f7",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#27272a",
  },
  saveButton: {
    backgroundColor: "#22c55e",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  pickerContainer: {
    backgroundColor: "#18181b",
    borderRadius: 20,
    maxHeight: "60%",
    padding: 20,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  pickerList: {
    maxHeight: 400,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    gap: 12,
  },
  pickerItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerItemTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  pickerItemSubtitle: {
    color: "#a1a1aa",
    fontSize: 13,
    marginTop: 2,
  },
  addNewAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    marginTop: 8,
    gap: 12,
  },
  addNewAccountText: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "bold",
  },
});
