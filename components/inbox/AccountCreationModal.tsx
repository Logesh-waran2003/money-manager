import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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

interface AccountCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateAccount: () => void;
  newAccountData: {
    bank: string;
    last4: string;
    type: string;
    nickname: string;
  } | null;
  selectedBank: string;
  setSelectedBank: (bank: string) => void;
  accountNickname: string;
  setAccountNickname: (nickname: string) => void;
  accountType: string;
  setAccountType: (type: string) => void;
  banks: string[];
  last4: string;
  setLast4: (text: string) => void;
  openingBalance: string;
  setOpeningBalance: (text: string) => void;
}

const ACCOUNT_TYPES = [
  { id: "savings", label: "Savings", icon: "wallet-outline" },
  { id: "current", label: "Current", icon: "briefcase-outline" },
  { id: "credit_card", label: "Credit Card", icon: "card-outline" },
  { id: "cash", label: "Cash", icon: "cash-outline" },
];

/**
 * Modal for creating new bank accounts
 */
export const AccountCreationModal: React.FC<AccountCreationModalProps> = ({
  visible,
  onClose,
  onCreateAccount,
  newAccountData,
  selectedBank,
  setSelectedBank,
  accountNickname,
  setAccountNickname,
  accountType,
  setAccountType,
  banks,
  last4,
  setLast4,
  openingBalance,
  setOpeningBalance,
}) => {
  const [customBankName, setCustomBankName] = useState("");

  const isManual = !newAccountData;
  const isCash = accountType === "cash";

  const handleBankSelect = (bank: string) => {
    setSelectedBank(bank);
    if (bank !== "Other") {
      setCustomBankName("");
    }
  };

  const handleCreateAccount = () => {
    // If "Other" is selected, use the custom bank name
    if (selectedBank === "Other" && customBankName.trim()) {
      setSelectedBank(customBankName.trim());
    }
    onCreateAccount();
  };

  const isOtherSelected = selectedBank === "Other";

  const canCreate = (() => {
    if (!isManual) return true; // TODO: refined checks for auto-detected

    if (isCash) {
      return accountNickname.trim().length > 0;
    }

    if (isOtherSelected) {
      return (
        customBankName.trim().length > 0 &&
        last4.length === 4 &&
        accountNickname.trim().length > 0
      );
    }

    return (
      selectedBank.length > 0 &&
      last4.length === 4 &&
      accountNickname.trim().length > 0
    );
  })();

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
            {/* Sticky Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isManual
                  ? isCash
                    ? "Add Cash Account"
                    : "Add New Account"
                  : newAccountData?.type === "credit_card"
                  ? "New Card Detected"
                  : "New Account Detected"}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#a1a1aa" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Detected Account Card - Only show if not manual */}
              {!isManual && newAccountData && (
                <View style={styles.detectedCard}>
                  <View style={styles.cardCircle}>
                    <View style={styles.cardCircleSmall} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardBankLabel}>
                      {newAccountData.type === "credit_card"
                        ? "Detected Card"
                        : "Detected Account"}
                    </Text>
                    <Text style={styles.cardBankName}>
                      {newAccountData.bank || "Unknown Bank"}
                    </Text>
                    <Text style={styles.accountNumberText}>
                      •••• {newAccountData.last4}
                    </Text>
                  </View>
                </View>
              )}

              {/* Account Type */}
              {isManual && (
                <>
                  <Text style={styles.label}>Account Type</Text>
                  <View style={styles.typeButtonsContainer}>
                    {ACCOUNT_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.typeButtonNew,
                          accountType === type.id && styles.typeButtonActiveNew,
                        ]}
                        onPress={() => setAccountType(type.id)}
                      >
                        <View
                          style={[
                            styles.typeIconContainer,
                            accountType === type.id &&
                              styles.typeIconContainerActive,
                          ]}
                        >
                          <Ionicons
                            name={type.icon as any}
                            size={20}
                            color={
                              accountType === type.id ? "#22c55e" : "#71717a"
                            }
                          />
                        </View>
                        <Text
                          style={[
                            styles.typeButtonTextNew,
                            accountType === type.id &&
                              styles.typeButtonTextActiveNew,
                          ]}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Bank Selection - Hidden for Cash */}
              {!isCash && (
                <>
                  <Text style={styles.label}>Select Bank</Text>
                  <View style={styles.bankChipsContainer}>
                    {banks.map((bank) => (
                      <TouchableOpacity
                        key={bank}
                        style={[
                          styles.bankChip,
                          selectedBank === bank && styles.bankChipActive,
                        ]}
                        onPress={() => handleBankSelect(bank)}
                      >
                        <Text
                          style={[
                            styles.bankChipText,
                            selectedBank === bank && styles.bankChipTextActive,
                          ]}
                        >
                          {bank}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Custom Bank Name Input (shown when "Other" is selected) */}
              {!isCash && isOtherSelected && (
                <>
                  <Text style={styles.label}>Bank Name</Text>
                  <TextInput
                    style={styles.input}
                    value={customBankName}
                    onChangeText={setCustomBankName}
                    placeholder="Enter bank name"
                    placeholderTextColor="#52525b"
                    autoFocus
                  />
                </>
              )}

              {/* Last 4 Digits - Only for Manual Mode and non-Cash */}
              {isManual && !isCash && (
                <>
                  <Text style={styles.label}>Last 4 Digits</Text>
                  <TextInput
                    style={styles.input}
                    value={last4}
                    onChangeText={(text) =>
                      setLast4(text.replace(/[^0-9]/g, "").slice(0, 4))
                    }
                    placeholder="XXXX"
                    placeholderTextColor="#52525b"
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </>
              )}

              {/* Opening Balance */}
              <Text style={styles.label}>Opening Balance (Optional)</Text>
              <TextInput
                style={styles.input}
                value={openingBalance}
                onChangeText={setOpeningBalance}
                placeholder="0.00"
                placeholderTextColor="#52525b"
                keyboardType="numeric"
              />

              {/* Account Nickname */}
              <Text style={styles.label}>Account Nickname</Text>
              <TextInput
                style={styles.input}
                value={accountNickname}
                onChangeText={setAccountNickname}
                placeholder={
                  isCash
                    ? "e.g., Wallet, Home Stash"
                    : "e.g., HDFC Salary Account"
                }
                placeholderTextColor="#52525b"
              />

              {/* Bottom Padding for ScrollView content */}
              <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Sticky Create Button Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.createButton,
                  !canCreate && styles.createButtonDisabled,
                ]}
                onPress={handleCreateAccount}
                disabled={!canCreate}
              >
                <Text style={styles.createButtonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    backgroundColor: "#09090B",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  closeButton: {
    padding: 4,
  },
  detectedCard: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
    position: "relative",
    overflow: "hidden",
  },
  cardCircle: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  cardCircleSmall: {
    position: "absolute",
    bottom: 10,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
  },
  cardContent: {
    zIndex: 1,
  },
  cardBankLabel: {
    color: "#22c55e",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardBankName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  accountNumberText: {
    color: "#a1a1aa",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 2,
  },
  label: {
    color: "#e4e4e7",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
  },
  bankChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  bankChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  bankChipActive: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: "#22c55e",
  },
  bankChipText: {
    color: "#a1a1aa",
    fontSize: 14,
    fontWeight: "500",
  },
  bankChipTextActive: {
    color: "#22c55e",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 12,
    padding: 14,
    color: "white",
    fontSize: 16,
    marginBottom: 16,
  },
  typeButtonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  typeButtonNew: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#3f3f46",
    borderRadius: 12,
    padding: 16,
  },
  typeButtonActiveNew: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "#22c55e",
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  typeIconContainerActive: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
  },
  typeButtonTextNew: {
    color: "#a1a1aa",
    fontSize: 16,
    fontWeight: "500",
  },
  typeButtonTextActiveNew: {
    color: "#22c55e",
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#27272a",
    opacity: 0.5,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomPadding: {
    height: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    backgroundColor: "#09090B",
  },
});
