import { Theme } from "@/constants/theme";
import { UnprocessedSms, getSmartDetails } from "@/services/SmsService";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { AmountText } from "../ui/AmountText";

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

import { RectButton } from "react-native-gesture-handler";

export const SmsListItem: React.FC<SmsListItemProps> = ({
  item,
  onPress,
  onIgnore,
  onRestore,
}) => {
  const swipeableRef = React.useRef<Swipeable>(null);
  const parsed = useMemo(
    () => getSmartDetails(item.body, item.address),
    [item.body, item.address],
  );
  const isTransaction = parsed.isTransaction;
  const isCredit = parsed.type === "credit";

  const renderRightActions = () => {
    if (item.isProcessed) return null;

    if (item.isIgnored) {
      return (
        <View style={[styles.rightAction, styles.restoreAction]}>
          <RectButton
            style={styles.actionButton}
            onPress={() => {
              swipeableRef.current?.close();
              onRestore?.(item.id);
            }}
          >
            <Ionicons
              name="refresh-outline"
              size={24}
              color={Theme.colors.textPrimary}
            />
            <Text style={styles.actionText}>Restore</Text>
          </RectButton>
        </View>
      );
    }

    return (
      <View style={styles.rightAction}>
        <RectButton
          style={styles.actionButton}
          onPress={() => {
            swipeableRef.current?.close();
            onIgnore(item.id);
          }}
        >
          <Ionicons
            name="trash-outline"
            size={24}
            color={Theme.colors.textPrimary}
          />
          <Text style={styles.actionText}>Spam</Text>
        </RectButton>
      </View>
    );
  };

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions}>
      <Pressable
        style={({ pressed }) => [
          styles.smsItem,
          pressed && styles.smsItemPressed,
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
                {
                  backgroundColor: !isTransaction
                    ? Theme.colors.surfaceHighlight
                    : isCredit
                      ? "rgba(16, 185, 129, 0.1)"
                      : "rgba(244, 63, 94, 0.1)",
                },
              ]}
            >
              <Ionicons
                name={
                  !isTransaction
                    ? "chatbubble-ellipses-outline"
                    : isCredit
                      ? "arrow-down"
                      : "arrow-up"
                }
                size={18}
                color={
                  !isTransaction
                    ? Theme.colors.textTertiary
                    : isCredit
                      ? Theme.colors.success
                      : Theme.colors.error
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
                <AmountText
                  value={parseFloat(parsed.amount || "0")}
                  type={isCredit ? "income" : "expense"}
                  size="lg"
                  showSign
                />
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>
                    {parsed.category || "Uncategorized"}
                  </Text>
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
                      size={12}
                      color={Theme.colors.success}
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
    backgroundColor: Theme.colors.surface,
    marginBottom: 8,
    borderRadius: Theme.borderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Theme.colors.borderSubtle,
  },
  smsItemPressed: {
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  ignoredItem: {
    opacity: 0.5,
  },
  contentContainer: {
    flexDirection: "row",
    padding: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  iconContainer: {
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
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
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.sizes.base,
    fontFamily: Theme.typography.fontFamily.medium,
    flex: 1,
    marginRight: 8,
  },
  date: {
    color: Theme.colors.textTertiary,
    fontSize: Theme.typography.sizes.xs,
    fontFamily: Theme.typography.fontFamily.sans,
  },
  transactionDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: Theme.colors.surfaceHighlight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  categoryText: {
    color: Theme.colors.textSecondary,
    fontSize: 10,
    fontFamily: Theme.typography.fontFamily.medium,
    textTransform: "capitalize",
  },
  accountText: {
    color: Theme.colors.textTertiary,
    fontSize: Theme.typography.sizes.xs,
    marginTop: 2,
  },
  accountRow: {
    marginTop: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  processedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.full,
  },
  processedText: {
    color: Theme.colors.success,
    fontSize: 10,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  bodyPreview: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 18,
    marginTop: 2,
  },
  rightAction: {
    backgroundColor: Theme.colors.error,
    width: 80,
    height: "100%",
    marginBottom: 8,
    borderTopRightRadius: Theme.borderRadius.lg,
    borderBottomRightRadius: Theme.borderRadius.lg,
    overflow: "hidden",
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    color: Theme.colors.textPrimary,
    fontSize: 12,
    marginTop: 4,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  restoreAction: {
    backgroundColor: Theme.colors.info,
  },
});
