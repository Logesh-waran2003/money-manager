import { UnprocessedSms, getSmartDetails } from "@/services/SmsService";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
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

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedSms: UnprocessedSms | null;
  amount: string;
  setAmount: (amount: string) => void;
  merchant: string;
  setMerchant: (merchant: string) => void;
  category: string;
  setCategory: (category: string) => void;
  remarks: string;
  setRemarks: (remarks: string) => void;
  accountNickname: string;
  accounts: any[];
  onSelectAccount: (id: string, nickname: string) => void;
  onCreateAccount: () => void;
  onMarkAsNotTransaction?: (
    smsId: string,
    merchant: string,
    body: string
  ) => void;
  onMarkAsTransaction?: (smsId: string, merchant: string, body: string) => void;
}

/**
 * Modal for verifying and editing transaction details
 */
export const TransactionModal: React.FC<TransactionModalProps> = ({
  visible,
  onClose,
  onConfirm,
  selectedSms,
  amount,
  setAmount,
  merchant,
  setMerchant,
  category,
  setCategory,
  remarks,
  setRemarks,
  accountNickname,
  accounts = [],
  onSelectAccount,
  onCreateAccount,
  onMarkAsNotTransaction,
  onMarkAsTransaction,
}) => {
  if (!selectedSms) return null;

  const parsed = getSmartDetails(selectedSms.body, selectedSms.address);

  /* Account Selection Logic */
  const [showAccountPicker, setShowAccountPicker] = React.useState(false);

  const handleSelectAccount = (account: any) => {
    onSelectAccount(account.id, account.nickname);
    setShowAccountPicker(false);
  };

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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Verify Transaction</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#a1a1aa" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Transaction Status Badge */}
              {(() => {
                const isTransaction = parsed.isTransaction;
                const isCredit = parsed.type === "credit";

                const statusColor = !isTransaction
                  ? "#fbbf24" // Amber
                  : isCredit
                  ? "#22c55e" // Green
                  : "#ef4444"; // Red

                const statusBg = !isTransaction
                  ? "rgba(251, 191, 36, 0.1)"
                  : isCredit
                  ? "rgba(34, 197, 94, 0.1)"
                  : "rgba(239, 68, 68, 0.1)";

                const iconName = !isTransaction
                  ? "alert"
                  : isCredit
                  ? "arrow-down"
                  : "arrow-up";

                const title = !isTransaction
                  ? "Not a Transaction"
                  : isCredit
                  ? "Credit Transaction"
                  : "Debit Transaction";

                return (
                  <View
                    style={[styles.statusBadge, { backgroundColor: statusBg }]}
                  >
                    <Ionicons name={iconName} size={24} color={statusColor} />
                    <View style={styles.statusTextContainer}>
                      <Text
                        style={[styles.statusTitle, { color: statusColor }]}
                      >
                        {title}
                      </Text>
                      <Text style={styles.statusSubtitle}>
                        {isTransaction
                          ? `${parsed.bank} • ${
                              parsed.method === "upi"
                                ? "UPI"
                                : parsed.method === "card"
                                ? "Card"
                                : "Bank"
                            } • ${parsed.amount}`
                          : "OTP, promotional, or alert message"}
                      </Text>
                    </View>
                  </View>
                );
              })()}

              {/* Original SMS Text */}
              <Text style={styles.label}>Original Text</Text>
              <View style={styles.originalTextBox}>
                <Text style={styles.originalText}>{selectedSms.body}</Text>
              </View>

              {/* Account Display - Now Interactive */}
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
                      !accountNickname && styles.placeholderText,
                    ]}
                  >
                    {accountNickname || "Select Account"}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#71717a" />
              </TouchableOpacity>

              {/* Amount Input */}
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#52525b"
              />

              {/* Merchant Input */}
              <Text style={styles.label}>Merchant</Text>
              <TextInput
                style={styles.input}
                value={merchant}
                onChangeText={setMerchant}
                placeholder="Enter merchant name"
                placeholderTextColor="#52525b"
              />

              {/* Category Selection */}
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {[
                  "food_dining",
                  "shopping",
                  "transportation",
                  "utilities",
                  "financial",
                  "personal",
                  "healthcare",
                  "entertainment",
                  "others",
                ].map((cat) => (
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

              {/* Remarks Input */}
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

            {/* Sticky Footer */}
            <View style={styles.footer}>
              {/* Left: Feedback Action */}
              <View style={{ flex: 1, marginRight: 12 }}>
                {parsed.isTransaction ? (
                  <TouchableOpacity
                    style={styles.feedbackButton}
                    onPress={() =>
                      onMarkAsNotTransaction?.(
                        selectedSms.id,
                        merchant,
                        selectedSms.body
                      )
                    }
                  >
                    <Ionicons name="ban-outline" size={20} color="#ef4444" />
                    <Text
                      style={[styles.feedbackButtonText, { color: "#ef4444" }]}
                    >
                      Not a Transaction
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.feedbackButton}
                    onPress={() =>
                      onMarkAsTransaction?.(
                        selectedSms.id,
                        merchant,
                        selectedSms.body
                      )
                    }
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color="#22c55e"
                    />
                    <Text
                      style={[styles.feedbackButtonText, { color: "#22c55e" }]}
                    >
                      Mark Real
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Right: Confirm Action */}
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onConfirm}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>

          {/* Account Picker Modal */}
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
                      onPress={() => handleSelectAccount(acc)}
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
                          {acc.nickname ||
                            `${acc.bank_name} - ${acc.account_last4}`}
                        </Text>
                        <Text style={styles.pickerItemSubtitle}>
                          {acc.bank_name} • {acc.account_type}
                        </Text>
                      </View>
                      {accountNickname === acc.nickname && (
                        <Ionicons
                          name="checkmark"
                          size={24}
                          color="#22c55e"
                          style={{ marginLeft: "auto" }}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                  {accounts.length === 0 && (
                    <Text style={styles.emptyStateText}>No accounts found</Text>
                  )}

                  {/* Add New Account Button */}
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
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

/* Styles */
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    padding: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusSubtitle: {
    color: "#71717a",
    fontSize: 12,
    marginTop: 2,
  },
  label: {
    color: "#e4e4e7",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  originalTextBox: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  originalText: {
    color: "#a1a1aa",
    fontSize: 13,
    lineHeight: 20,
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
    marginBottom: 8,
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
  amountInput: {
    backgroundColor: "#18181b",
    borderWidth: 2,
    borderColor: "#a855f7",
    borderRadius: 12,
    padding: 14,
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 12,
    padding: 14,
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  remarksInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
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
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
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
  confirmButton: {
    backgroundColor: "#22c55e",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    backgroundColor: "#09090B",
  },
  /* Picker Styles */
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
  emptyStateText: {
    color: "#71717a",
    textAlign: "center",
    marginVertical: 20,
    fontSize: 16,
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
  feedbackContainer: {
    // Leftover style, unused now
  },
  feedbackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)", // Light red bg for feedback
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  feedbackButtonText: {
    color: "#a1a1aa",
    fontSize: 14,
    fontWeight: "600",
  },
});
