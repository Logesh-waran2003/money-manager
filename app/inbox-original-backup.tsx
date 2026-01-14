import {
  addTransaction,
  exportSmsAnalysis,
  getSmartDetails,
  getUnprocessedSms,
  ignoreSms,
  syncPendingTransactions,
  testImprovedParsing,
  UnprocessedSms,
} from "@/services/SmsService";
import {
  createAccount,
  createMerchant,
  findAccount,
  findMerchant,
  getAllAccounts,
  updateAccountBalance,
} from "@/services/db";
import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { SafeAreaView } from "react-native-safe-area-context";

const BANKS = [
  "HDFC Bank",
  "Axis Bank",
  "SBI",
  "ICICI Bank",
  "Kotak Bank",
  "Other",
];

export default function InboxScreen() {
  const [smsList, setSmsList] = useState<UnprocessedSms[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSms, setSelectedSms] = useState<UnprocessedSms | null>(null);

  // Account creation modal
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [newAccountData, setNewAccountData] = useState<any>(null);
  const [selectedBank, setSelectedBank] = useState("");

  // Form State
  const [accounts, setAccounts] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [remarks, setRemarks] = useState("");
  const [category, setCategory] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accountNickname, setAccountNickname] = useState("");
  const [accountType, setAccountType] = useState("savings");

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
  };

  const handleSync = async () => {
    setSyncing(true);
    await syncPendingTransactions();
    Alert.alert("Sync", "Sync completed successfully.");
    setSyncing(false);
  };

  const handleTestParsing = () => {
    testImprovedParsing();
    Alert.alert(
      "Parsing Test Complete",
      "Check your terminal/console for detailed parsing results of sample SMS messages.",
      [{ text: "OK" }]
    );
  };

  const handleExportSms = async () => {
    try {
      console.log("Starting SMS export...");
      const result = await exportSmsAnalysis();

      if (result.method === "SAF") {
        Alert.alert(
          "Export Complete!",
          `Successfully exported ${result.count} banking SMS messages to your chosen location.\n\nFile: ${result.fileName}`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Export to Console",
          `Exported ${result.count} SMS to console.\n\nCopy the JSON data from your terminal and save it to a file.`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "Export Failed",
        "Could not export SMS data. Please try again."
      );
    }
  };

  const handleExport = () => {
    const { transactions, ignored } =
      require("@/services/SmsService").exportDbData();
    console.log(
      `Exported ${transactions.length} transactions and ${ignored.length} ignored items.`
    );
    Alert.alert(
      "Data Exported",
      "Check your terminal/console for the JSON dump."
    );
  };

  const openModal = async (sms: UnprocessedSms) => {
    setSelectedSms(sms);

    // Use smart parsing
    const parsed = getSmartDetails(sms.body, sms.address);

    setAmount(parsed.amount);
    setMerchant(parsed.merchant);
    setCategory(parsed.category);
    setRemarks("");

    // Check if account exists
    if (parsed.bank && parsed.account) {
      const account: any = await findAccount(parsed.bank, parsed.account);

      if (!account) {
        // Show account creation modal
        setNewAccountData({
          bank: parsed.bank,
          last4: parsed.account,
          type: parsed.cardLast4 ? "credit_card" : "savings",
          nickname: `${parsed.bank} *${parsed.account}`,
        });
        setSelectedBank(parsed.bank); // Pre-select detected bank
        setAccountNickname(`${parsed.bank} *${parsed.account}`);
        setAccountType(parsed.cardLast4 ? "credit_card" : "savings");
        setAccountModalVisible(true);
        return; // Don't open transaction modal yet
      } else {
        setAccountId(account.id);
      }
    }

    // Check/create merchant silently
    if (parsed.merchant) {
      let merchantRecord: any = await findMerchant(parsed.merchant);
      if (!merchantRecord) {
        const merchantId = Crypto.randomUUID();
        await createMerchant({
          id: merchantId,
          name: parsed.merchant,
          default_category: parsed.category,
        });
      }
    }

    setModalVisible(true);
  };

  const handleCreateAccount = async () => {
    if (!accountNickname.trim()) {
      Alert.alert("Error", "Please enter account nickname");
      return;
    }

    if (!selectedBank) {
      Alert.alert("Error", "Please select a bank");
      return;
    }

    const accountId = Crypto.randomUUID();
    await createAccount({
      id: accountId,
      bank_name: selectedBank,
      account_last4: newAccountData.last4,
      account_type: accountType,
      nickname: accountNickname,
    });

    // Refresh accounts list
    const updatedAccounts = await getAllAccounts();
    setAccounts(updatedAccounts);

    setAccountId(accountId);
    setAccountModalVisible(false);

    // Now open transaction modal
    setModalVisible(true);
  };

  const handleIgnore = async (smsId: string) => {
    try {
      await ignoreSms(smsId);
      // Small delay to allow animation to feel natural before unmounting
      setTimeout(() => {
        setSmsList((prev) => prev.filter((s) => s.id !== smsId));
      }, 200);

      // If modal was open for this item, close it
      if (selectedSms?.id === smsId) {
        setModalVisible(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to ignore SMS");
    }
  };

  const handleConfirm = async () => {
    if (!selectedSms || !amount) {
      Alert.alert("Missing Info", "Please enter amount");
      return;
    }

    if (!accountId) {
      Alert.alert("Missing Account", "Account is required");
      return;
    }

    try {
      // Find merchant_id if merchant name provided
      let merchantId = null;
      if (merchant) {
        const merchantRecord: any = await findMerchant(merchant);
        if (merchantRecord) {
          merchantId = merchantRecord.id;
        }
      }

      const parsed = getSmartDetails(selectedSms.body, selectedSms.address);
      const txnType = parsed.type;

      await addTransaction({
        id: Crypto.randomUUID(),
        mobile_id: selectedSms.id,
        amount: parseFloat(amount),
        merchant: merchant || "",
        category: category || "others",
        date: new Date(parseInt(selectedSms.date)).toISOString(),
        type: txnType,
        raw_body: selectedSms.body,
        remarks: remarks,
        account_id: accountId,
        merchant_id: merchantId,
      });

      // Update account balance
      await updateAccountBalance(accountId, parseFloat(amount), txnType);

      setSmsList((prev) => prev.filter((s) => s.id !== selectedSms.id));
      setModalVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save transaction");
    }
  };

  const renderRightActions = (
    progress: any,
    dragX: any,
    item: UnprocessedSms
  ) => {
    return (
      <View style={styles.rightAction}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleIgnore(item.id)}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
          <Text style={styles.actionText}>Spam</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }: { item: UnprocessedSms }) => {
    const parsed = getSmartDetails(item.body, item.address);
    const isTransaction = parsed.isTransaction;

    return (
      <Swipeable
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item)
        }
      >
        <TouchableOpacity style={styles.item} onPress={() => openModal(item)}>
          <View style={styles.itemHeader}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text style={styles.sender}>{item.address}</Text>
              {isTransaction ? (
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              ) : (
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color="#f59e0b"
                />
              )}
            </View>
            <Text style={styles.date}>
              {new Date(parseInt(item.date)).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
          {isTransaction && parsed.amount && (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
              <Text
                style={{ fontSize: 12, color: "#10b981", fontWeight: "600" }}
              >
                ₹{parsed.amount}
              </Text>
              {parsed.merchant && (
                <Text style={{ fontSize: 12, color: "#6b7280" }}>
                  • {parsed.merchant}
                </Text>
              )}
              {parsed.category && (
                <Text style={{ fontSize: 12, color: "#8b5cf6" }}>
                  • {parsed.category}
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Inbox</Text>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <TouchableOpacity onPress={handleTestParsing}>
            <Ionicons name="flask-outline" size={24} color="#10b981" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExportSms}>
            <Ionicons name="download-outline" size={24} color="#a855f7" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExport}>
            <Ionicons name="document-text-outline" size={24} color="#a855f7" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSync} disabled={syncing}>
            {syncing ? (
              <ActivityIndicator size="small" color="#a855f7" />
            ) : (
              <Ionicons name="cloud-upload-outline" size={24} color="#a855f7" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#a855f7" />
        </View>
      ) : (
        <FlatList
          data={smsList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No new messages</Text>
          }
        />
      )}

      {/* Account Creation Modal */}
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={accountModalVisible}
        onRequestClose={() => setAccountModalVisible(false)}
        statusBarTranslucent
      >
        <View style={{ flex: 1, backgroundColor: "#09090B" }}>
          <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContainer}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Account</Text>
                <TouchableOpacity
                  onPress={() => setAccountModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Bank Selection */}
                <Text style={styles.sectionLabel}>Bank Name</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 24 }}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {BANKS.map((bank) => (
                    <Pressable
                      key={bank}
                      style={({ pressed }) => [
                        styles.bankChip,
                        selectedBank === bank && styles.bankChipActive,
                        pressed && {
                          opacity: 0.7,
                          transform: [{ scale: 0.95 }],
                        },
                      ]}
                      onPress={() => setSelectedBank(bank)}
                    >
                      <Text
                        style={[
                          styles.bankChipText,
                          selectedBank === bank && styles.bankChipTextActive,
                        ]}
                      >
                        {bank}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* Account Display Card */}
                <Text style={styles.sectionLabel}>Detected Account</Text>
                <View style={styles.accountNumberCard}>
                  <View style={styles.cardCircle} />
                  <View style={styles.cardCircleSmall} />
                  <View style={styles.cardContent}>
                    <Ionicons
                      name="card"
                      size={32}
                      color="rgba(255,255,255,0.2)"
                      style={styles.cardIcon}
                    />
                    <Text style={styles.cardBankLabel}>
                      {selectedBank || "SELECT BANK"}
                    </Text>
                    <Text style={styles.accountNumberText}>
                      •••• {newAccountData?.last4}
                    </Text>
                  </View>
                </View>

                {/* Account Type Selection */}
                <Text style={styles.sectionLabel}>Account Type</Text>
                <View style={styles.typeButtonContainer}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.typeButtonNew,
                      accountType === "savings" && styles.typeButtonActiveNew,
                      pressed && { transform: [{ scale: 0.98 }] },
                    ]}
                    onPress={() => setAccountType("savings")}
                  >
                    <View
                      style={[
                        styles.typeIconContainer,
                        accountType === "savings" &&
                          styles.typeIconContainerActive,
                      ]}
                    >
                      <Ionicons
                        name="wallet"
                        size={24}
                        color={accountType === "savings" ? "#fff" : "#71717a"}
                      />
                    </View>
                    <Text
                      style={[
                        styles.typeButtonTextNew,
                        accountType === "savings" &&
                          styles.typeButtonTextActiveNew,
                      ]}
                    >
                      Savings
                    </Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.typeButtonNew,
                      accountType === "credit_card" &&
                        styles.typeButtonActiveNew,
                      pressed && { transform: [{ scale: 0.98 }] },
                    ]}
                    onPress={() => setAccountType("credit_card")}
                  >
                    <View
                      style={[
                        styles.typeIconContainer,
                        accountType === "credit_card" &&
                          styles.typeIconContainerActive,
                      ]}
                    >
                      <Ionicons
                        name="card"
                        size={24}
                        color={
                          accountType === "credit_card" ? "#fff" : "#71717a"
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.typeButtonTextNew,
                        accountType === "credit_card" &&
                          styles.typeButtonTextActiveNew,
                      ]}
                    >
                      Credit Card
                    </Text>
                  </Pressable>
                </View>

                {/* Nickname Input */}
                <Text style={styles.sectionLabel}>Account Nickname</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.nicknameInput}
                    value={accountNickname}
                    onChangeText={setAccountNickname}
                    placeholder="e.g., Salary Account, Shopping Card"
                    placeholderTextColor="#52525b"
                  />
                  <Text style={styles.helperText}>
                    Give this account a memorable name
                  </Text>
                </View>

                {/* Added extra padding for scroll */}
                <View style={{ height: 20 }} />
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.createAccountButton}
                  onPress={handleCreateAccount}
                  activeOpacity={0.8}
                >
                  <Text style={styles.createAccountButtonText}>
                    Create Account
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Transaction Verification Modal */}
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent
      >
        <View style={{ flex: 1, backgroundColor: "#09090B" }}>
          <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContainer}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Verify Transaction</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Transaction Status Indicator */}
                {selectedSms &&
                  (() => {
                    const parsed = getSmartDetails(
                      selectedSms.body,
                      selectedSms.address
                    );
                    return (
                      <View
                        style={{
                          backgroundColor: parsed.isTransaction
                            ? "#10b98120"
                            : "#f59e0b20",
                          padding: 12,
                          borderRadius: 8,
                          marginBottom: 16,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Ionicons
                          name={
                            parsed.isTransaction
                              ? "checkmark-circle"
                              : "alert-circle-outline"
                          }
                          size={20}
                          color={parsed.isTransaction ? "#10b981" : "#f59e0b"}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: parsed.isTransaction
                                ? "#10b981"
                                : "#f59e0b",
                              fontWeight: "600",
                              fontSize: 14,
                            }}
                          >
                            {parsed.isTransaction
                              ? "Valid Transaction"
                              : "Not a Transaction"}
                          </Text>
                          <Text
                            style={{
                              color: "#71717a",
                              fontSize: 12,
                              marginTop: 2,
                            }}
                          >
                            {parsed.isTransaction
                              ? `${parsed.bank} • ${parsed.method} • ${parsed.category}`
                              : "OTP, promotional, or alert message"}
                          </Text>
                        </View>
                      </View>
                    );
                  })()}

                <Text style={styles.label}>Original Text</Text>
                <View style={styles.originalTextBox}>
                  <Text style={styles.originalText}>{selectedSms?.body}</Text>
                </View>

                <Text style={styles.label}>Account</Text>
                <View style={styles.readOnlyField}>
                  <Text style={styles.readOnlyText}>
                    {accountId
                      ? (() => {
                          const account: any = accounts.find(
                            (a: any) => a.id === accountId
                          );
                          return account ? account.nickname : "Unknown Account";
                        })()
                      : "No account selected"}
                  </Text>
                </View>

                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#52525b"
                />

                <Text style={styles.label}>Merchant (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={merchant}
                  onChangeText={setMerchant}
                  placeholder="Merchant Name"
                  placeholderTextColor="#52525b"
                />

                <Text style={styles.label}>Category</Text>
                <TextInput
                  style={styles.input}
                  value={category}
                  onChangeText={setCategory}
                  placeholder="e.g., food_dining, shopping"
                  placeholderTextColor="#52525b"
                />

                <Text style={styles.label}>Remarks</Text>
                <TextInput
                  style={styles.input}
                  value={remarks}
                  onChangeText={setRemarks}
                  placeholder="Add a remark (optional)"
                  placeholderTextColor="#52525b"
                />
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.ignoreButton}
                  onPress={() => selectedSms && handleIgnore(selectedSms.id)}
                >
                  <Text style={styles.ignoreButtonText}>Mark as Spam</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmButtonText}>
                    Confirm Transaction
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B", // zinc-950
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  item: {
    backgroundColor: "#18181b", // zinc-900
    padding: 16,
    borderRadius: 12,
    marginBottom: 0,
    height: 100,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sender: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  date: {
    color: "#71717a", // zinc-500
    fontSize: 12,
  },
  body: {
    color: "#a1a1aa", // zinc-400
    fontSize: 14,
  },
  rightAction: {
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    borderRadius: 12,
  },
  actionButton: {
    width: 100,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    color: "white",
    fontWeight: "600",
    marginTop: 4,
  },
  emptyText: {
    color: "#71717a",
    textAlign: "center",
    marginTop: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#09090B",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  label: {
    color: "#a1a1aa",
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  originalTextBox: {
    backgroundColor: "#18181b",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  originalText: {
    color: "#71717a",
    fontSize: 14,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#3f3f46",
  },
  input: {
    backgroundColor: "#18181b",
    color: "white",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  chipContainer: {
    flexDirection: "row",
    marginBottom: 20,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#27272a",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  selectedChip: {
    backgroundColor: "#a855f7",
    borderColor: "#a855f7",
  },
  chipText: {
    color: "#a1a1aa",
  },
  selectedChipText: {
    color: "white",
    fontWeight: "600",
  },
  readOnlyField: {
    backgroundColor: "#18181b",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  readOnlyText: {
    color: "#a1a1aa",
    fontSize: 16,
  },
  bankChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  bankChipActive: {
    backgroundColor: "#a855f7",
    borderColor: "#a855f7",
  },
  bankChipText: {
    color: "#71717a",
    fontSize: 14,
    fontWeight: "700",
  },
  bankChipTextActive: {
    color: "white",
  },
  accountNumberCard: {
    backgroundColor: "#111113",
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#27272a",
    overflow: "hidden",
    position: "relative",
    height: 140,
    justifyContent: "center",
  },
  cardCircle: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(168, 85, 247, 0.1)",
  },
  cardCircleSmall: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(168, 85, 247, 0.05)",
  },
  cardContent: {
    zIndex: 1,
  },
  cardBankLabel: {
    color: "#71717a",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
  },
  cardIcon: {
    position: "absolute",
    right: 0,
    top: 5,
  },
  accountNumberText: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 4,
  },
  sectionLabel: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  typeButtonContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 28,
  },
  typeButtonNew: {
    flex: 1,
    backgroundColor: "#18181b",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#27272a",
    alignItems: "center",
    gap: 12,
  },
  typeButtonActiveNew: {
    backgroundColor: "#111113",
    borderColor: "#a855f7",
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
  },
  typeIconContainerActive: {
    backgroundColor: "#a855f7",
  },
  typeButtonTextNew: {
    color: "#71717a",
    fontSize: 14,
    fontWeight: "600",
  },
  typeButtonTextActiveNew: {
    color: "white",
  },
  inputContainer: {
    marginBottom: 24,
  },
  nicknameInput: {
    backgroundColor: "#18181b",
    color: "white",
    padding: 18,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    marginBottom: 8,
  },
  helperText: {
    color: "#52525b",
    fontSize: 12,
    marginLeft: 4,
  },
  createAccountButton: {
    backgroundColor: "#a855f7",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#a855f7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  createAccountButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  ignoreButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ignoreButtonText: {
    color: "#ef4444",
    fontWeight: "600",
  },
  confirmButton: {
    flex: 2,
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
