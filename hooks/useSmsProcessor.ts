import {
  addTransaction,
  getSmartDetails,
  UnprocessedSms,
} from "@/services/SmsService";
import {
  createAccount,
  createMerchant,
  findAccount,
  findMerchant,
  updateAccountBalance,
} from "@/services/db";
import * as Crypto from "expo-crypto";
import { useState } from "react";
import { Alert } from "react-native";

/**
 * Custom hook to handle SMS transaction processing logic
 * Extracts business logic from the UI component
 */
export const useSmsProcessor = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [selectedSms, setSelectedSms] = useState<UnprocessedSms | null>(null);
  const [newAccountData, setNewAccountData] = useState<any>(null);
  const [selectedBank, setSelectedBank] = useState("");

  // Form State
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [remarks, setRemarks] = useState("");
  const [category, setCategory] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accountNickname, setAccountNickname] = useState("");
  const [accountType, setAccountType] = useState("savings");

  const [inputLast4, setInputLast4] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");

  /**
   * Opens the transaction modal and pre-fills data using smart parsing
   * Handles account detection and creation flow
   */
  const openTransactionModal = async (sms: UnprocessedSms) => {
    setSelectedSms(sms);

    // Use smart parsing
    const parsed = getSmartDetails(sms.body, sms.address);

    setAmount(parsed.amount);
    setMerchant(parsed.merchant);
    setCategory(parsed.category);
    setRemarks("");

    // Reset account state first
    setAccountId("");
    setAccountNickname("");

    // Check if account exists (for both savings accounts and cards)
    const accountLast4 = parsed.account || parsed.cardLast4;
    console.log("[openTransactionModal] parsed.bank:", parsed.bank);
    console.log("[openTransactionModal] parsed.account:", parsed.account);
    console.log("[openTransactionModal] parsed.cardLast4:", parsed.cardLast4);
    console.log("[openTransactionModal] accountLast4:", accountLast4);
    
    if (parsed.bank && accountLast4) {
      const account: any = await findAccount(parsed.bank, accountLast4);

      if (!account) {
        // Show account creation modal
        const accountData = {
          bank: parsed.bank,
          last4: accountLast4,
          type: parsed.cardLast4 ? "credit_card" : "savings",
          nickname: `${parsed.bank} *${accountLast4}`,
        };
        console.log("[openTransactionModal] Account not found, setting newAccountData:", accountData);
        
        setNewAccountData(accountData);
        setSelectedBank(parsed.bank);
        setInputLast4(accountLast4);
        setAccountNickname(`${parsed.bank} *${accountLast4}`);
        setAccountType(parsed.cardLast4 ? "credit_card" : "savings");
        setAccountModalVisible(true);
        return;
      } else {
        setAccountId(account.id);
        setAccountNickname(account.nickname);
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

  /**
   * Opens manual account creation modal with detected data pre-filled
   */
  const openManualAccountCreation = () => {
    console.log("[openManualAccountCreation] Called");
    console.log("[openManualAccountCreation] newAccountData:", newAccountData);
    console.log("[openManualAccountCreation] selectedBank:", selectedBank);
    console.log("[openManualAccountCreation] inputLast4:", inputLast4);
    console.log("[openManualAccountCreation] accountType:", accountType);
    
    setModalVisible(false);
    
    // Don't clear if we have detected data
    if (!newAccountData) {
      console.log("[openManualAccountCreation] No detected data, clearing form");
      setNewAccountData(null);
      setSelectedBank("");
      setInputLast4("");
      setAccountNickname("");
      setAccountType("savings");
    } else {
      console.log("[openManualAccountCreation] Keeping detected data");
    }
    
    setAccountModalVisible(true);
  };

  /**
   * Creates a new account and opens the transaction modal
   */
  const handleCreateAccount = async (
    onAccountCreated?: () => Promise<void>
  ) => {
    if (!accountNickname.trim()) {
      Alert.alert("Error", "Please enter account nickname");
      return;
    }

    if (!selectedBank) {
      Alert.alert("Error", "Please select a bank");
      return;
    }

    // Use detected last4 or input last4
    const accountLast4 = newAccountData ? newAccountData.last4 : inputLast4;

    if (!accountLast4 || accountLast4.length !== 4) {
      Alert.alert("Error", "Please enter valid last 4 digits");
      return;
    }

    const newAccountId = Crypto.randomUUID();
    await createAccount({
      id: newAccountId,
      bank_name: selectedBank,
      account_last4: accountLast4,
      account_type: accountType,
      nickname: accountNickname,
      balance: openingBalance ? parseFloat(openingBalance) : 0,
    });

    // Refresh accounts list in parent
    if (onAccountCreated) {
      await onAccountCreated();
    }

    setAccountId(newAccountId);
    setAccountModalVisible(false);

    // Now open transaction modal
    if (selectedSms) {
      setModalVisible(true);
    }
  };

  /**
   * Confirms and saves the transaction
   */
  const handleConfirmTransaction = async (
    onSuccess: () => void
  ): Promise<boolean> => {
    if (!selectedSms || !amount) {
      Alert.alert("Missing Info", "Please enter amount");
      return false;
    }

    if (!accountId) {
      Alert.alert("Missing Account", "Account is required");
      return false;
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

      setModalVisible(false);
      onSuccess();
      return true;
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save transaction");
      return false;
    }
  };

  /**
   * Resets all form state
   */
  const resetForm = () => {
    setSelectedSms(null);
    setAmount("");
    setMerchant("");
    setRemarks("");
    setCategory("");
    setAccountId("");
    setAccountNickname("");
    setAccountType("savings");
    setSelectedBank("");
    setInputLast4("");
    setNewAccountData(null);
    setOpeningBalance("");
  };

  /**
   * Manually selects an account
   */
  const selectAccount = (id: string, nickname: string) => {
    setAccountId(id);
    setAccountNickname(nickname);
  };

  return {
    // State
    modalVisible,
    accountModalVisible,
    selectedSms,
    newAccountData,
    selectedBank,
    amount,
    merchant,
    remarks,
    category,
    accountId,
    accountNickname,
    accountType,
    inputLast4,
    openingBalance,

    // Setters
    setModalVisible,
    setAccountModalVisible,
    setSelectedBank,
    setAmount,
    setMerchant,
    setRemarks,
    setCategory,
    setAccountNickname,
    setAccountType,
    setInputLast4,
    setOpeningBalance,

    // Actions
    openTransactionModal,
    handleCreateAccount,
    handleConfirmTransaction,
    resetForm,
    selectAccount,
    openManualAccountCreation,
  };
};
