import { TransactionList } from "@/components/TransactionList";
import { categorizeTransaction } from "@/services/gemini";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SmsReader from "sms-reader";

export default function HomeScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          {
            title: "Access SMS",
            message: "We need access to your SMS to track your expenses.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          fetchSms();
        } else {
          Alert.alert(
            "Permission Denied",
            "Cannot track expenses without SMS access."
          );
          setLoading(false);
        }
      } catch (err) {
        console.warn(err);
        setLoading(false);
      }
    } else {
      // Fallback for non-Android (dev/iOS)
      console.log("Not Android, using mock data");
      setTransactions(generateMockData());
      setLoading(false);
    }
  };

  const fetchSms = async () => {
    try {
      const smsList = SmsReader.getSms(20); // Fetch last 20

      // 1. Parse all locally first
      const parsed = smsList.map((sms: any) => parseSms(sms));

      // 2. Categorize only the top 5 to save API quota
      const categorized = await Promise.all(
        parsed.map(async (tx, index) => {
          if (index < 5 && tx.type === "debit") {
            const category = await categorizeTransaction(
              tx.merchant,
              tx.rawBody
            );
            return { ...tx, category, isNew: true };
          }
          return { ...tx, isNew: true };
        })
      );

      setTransactions(categorized);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error("Failed to read SMS", e);
    } finally {
      setLoading(false);
    }
  };

  const parseSms = (sms: any) => {
    // Basic regex to find amounts. This is a naive implementation for the "Weekend Build".
    // Real implementation would use more robust regex or the Gemini API (Phase 4).
    const amountRegex = /(?:Rs\.?|INR|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i;
    const match = sms.body.match(amountRegex);
    const amount = match ? match[1] : "0.00";

    // Determine type (Debit/Credit)
    const isCredit =
      sms.body.toLowerCase().includes("credited") ||
      sms.body.toLowerCase().includes("received");

    return {
      id: sms.id,
      merchant: sms.address, // Use sender as merchant for now
      amount: `₹${amount}`,
      date: new Date(parseInt(sms.date)).toLocaleDateString(),
      category: "Uncategorized", // Will be filled by Gemini
      type: isCredit ? "credit" : "debit",
      rawBody: sms.body, // Keep for AI processing
    };
  };

  const generateMockData = () => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i.toString(),
      merchant: i % 2 === 0 ? "Uber" : "Starbucks",
      amount: `$${(Math.random() * 100).toFixed(2)}`,
      date: "Today, 10:23 AM",
      category: i % 2 === 0 ? "Transport" : "Food",
      type: i % 5 === 0 ? "credit" : "debit",
    }));
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.label}>Total Balance</Text>
        <Text style={styles.balance}>
          {/* Simple sum for demo */}₹
          {transactions
            .reduce((acc, curr) => {
              const val = parseFloat(curr.amount.replace(/[^0-9.-]+/g, ""));
              return curr.type === "credit" ? acc + val : acc - val;
            }, 0)
            .toFixed(2)}
        </Text>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
      </View>

      <View style={styles.listContainer}>
        <TransactionList data={transactions} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B", // zinc-950
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  label: {
    color: "#a1a1aa", // zinc-400
    fontSize: 14,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 2, // tracking-widest
    marginBottom: 4,
  },
  balance: {
    color: "white",
    fontSize: 36, // 4xl
    fontWeight: "bold",
    letterSpacing: -1.5, // tracking-tighter
    marginBottom: 24,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18, // lg
    fontWeight: "600",
    marginBottom: 16,
  },
  listContainer: {
    flex: 1,
  },
});
