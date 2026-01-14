import { UnprocessedSms, getSmartDetails } from "@/services/SmsService";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";

interface SmsListItemProps {
  item: UnprocessedSms;
  onPress: (sms: UnprocessedSms) => void;
  onIgnore: (smsId: string) => void;
  onRestore?: (smsId: string) => void;
}

const formatDate = (timestamp: string) => {
  const date = new Date(parseInt(timestamp));
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const SmsListItem: React.FC<SmsListItemProps> = ({
  item,
  onPress,
  onIgnore,
  onRestore,
}) => {
  const parsed = useMemo(
    () => getSmartDetails(item.body, item.address),
    [item.body, item.address]
  );
  const isTransaction = parsed.isTransaction;
  const isCredit = parsed.type === "credit";

  const renderRightActions = () => {
    if (item.isProcessed) return null;

    if (item.isIgnored) {
      return (
        <View style={[styles.rightAction, styles.restoreAction]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onRestore?.(item.id)}
          >
            <Ionicons name="refresh-outline" size={24} color="white" />
            <Text style={styles.actionText}>Restore</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.rightAction}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onIgnore(item.id)}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
          <Text style={styles.actionText}>Spam</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <Pressable
        style={({ pressed }) => [
          styles.smsItem,
          pressed && styles.smsItemPressed,
          isTransaction &&
            (isCredit ? styles.creditBorder : styles.debitBorder),
          item.isIgnored && styles.ignoredItem,
        ]}
        onPress={() => !item.isProcessed && onPress(item)}
      >
        <View style={styles.contentContainer}>
          {/* Icon Column */}
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconCircle,
                !isTransaction
                  ? styles.iconUnknown
                  : isCredit
                  ? styles.iconCredit
                  : styles.iconDebit,
                item.isProcessed && styles.iconProcessed, // Optional: dim icon if processed
              ]}
            >
              <Ionicons
                name={
                  !isTransaction
                    ? "alert"
                    : isCredit
                    ? "arrow-down"
                    : "arrow-up"
                }
                size={20}
                color={
                  !isTransaction
                    ? "#fbbf24" // Amber
                    : isCredit
                    ? "#22c55e"
                    : "#ef4444" // Green or Red
                }
              />
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.headerRow}>
              <Text style={styles.sender} numberOfLines={1}>
                {parsed.merchant || item.address}
              </Text>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
            </View>

            {isTransaction ? (
              <View style={styles.transactionDetails}>
                <Text
                  style={[
                    styles.amount,
                    isCredit ? styles.amountCredit : styles.amountDebit,
                  ]}
                >
                  {isCredit ? "+" : "-"}₹{parsed.amount}
                </Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{parsed.category}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.bodyPreview} numberOfLines={2}>
                {item.body}
              </Text>
            )}

            {isTransaction && (
              <View style={styles.accountRow}>
                <Text style={styles.accountText} numberOfLines={1}>
                  {parsed.bank} {parsed.account ? `• ${parsed.account}` : ""}
                </Text>
                {item.isProcessed && (
                  <View style={styles.processedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#22c55e"
                    />
                    <Text style={styles.processedText}>Added</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  smsItem: {
    backgroundColor: "#18181b",
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  smsItemPressed: {
    backgroundColor: "#27272a",
  },
  creditBorder: {
    borderLeftWidth: 4,
    borderLeftColor: "#22c55e",
  },
  debitBorder: {
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  contentContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#27272a",
  },
  iconCredit: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  iconDebit: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  iconUnknown: {
    backgroundColor: "rgba(251, 191, 36, 0.1)",
  },
  mainContent: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sender: {
    color: "#e4e4e7",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  date: {
    color: "#71717a",
    fontSize: 12,
  },
  transactionDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  amountCredit: {
    color: "#22c55e",
  },
  amountDebit: {
    color: "#e4e4e7", // White for debit to separate from error red, but clean
  },
  categoryBadge: {
    backgroundColor: "#27272a",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  categoryText: {
    color: "#a1a1aa",
    fontSize: 10,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  accountText: {
    color: "#71717a",
    fontSize: 12,
  },
  accountRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  processedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  processedText: {
    color: "#22c55e",
    fontSize: 10,
    fontWeight: "600",
  },
  bodyPreview: {
    color: "#71717a",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  rightAction: {
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    marginBottom: 12,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  actionText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  restoreAction: {
    backgroundColor: "#3b82f6", // Blue
  },
  ignoredItem: {
    opacity: 0.5,
  },
  iconProcessed: {
    opacity: 0.5,
  },
});
