import { TransactionList } from "@/components/TransactionList";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Alert, PermissionsAndroid, Platform, Text, View } from "react-native";
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
      const smsList = SmsReader.getSms(50);
      const parsed = await Promise.all(
        smsList.map(async (sms: any) => {
          const base = parseSms(sms);
          // In a real app, we would batch this or run it in background
          // For demo, we'll just categorize the first few or leave it for now to avoid rate limits/latency
          // let category = await categorizeTransaction(base.merchant, base.rawBody);
          return { ...base, isNew: true }; // Mark all as new for the demo breathing effect
        })
      );
      setTransactions(parsed);
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
    <SafeAreaView className="flex-1 bg-zinc-950" edges={["top"]}>
      <View className="px-6 py-4">
        <Text className="text-zinc-400 text-sm font-medium uppercase tracking-widest mb-1">
          Total Balance
        </Text>
        <Text className="text-white text-4xl font-bold tracking-tighter mb-6">
          {/* Simple sum for demo */}₹
          {transactions
            .reduce((acc, curr) => {
              const val = parseFloat(curr.amount.replace(/[^0-9.-]+/g, ""));
              return curr.type === "credit" ? acc + val : acc - val;
            }, 0)
            .toFixed(2)}
        </Text>

        <Text className="text-white text-lg font-semibold mb-4">
          Recent Transactions
        </Text>
      </View>

      <View className="flex-1">
        <TransactionList data={transactions} />
      </View>
    </SafeAreaView>
  );
}
