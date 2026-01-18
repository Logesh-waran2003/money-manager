import { Theme } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View, ViewProps } from "react-native";

interface NotificationBadgeProps extends ViewProps {
  count: number;
  size?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  size = 20,
  style,
  ...props
}) => {
  if (count <= 0) return null;

  return (
    <View
      style={[
        styles.badge,
        {
          minWidth: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      {...props}
    >
      <Text style={styles.text}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Theme.colors.error,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Theme.colors.background, // Creates a "cutout" effect against the parent icon
    zIndex: 10,
  },
  text: {
    color: Theme.colors.textPrimary,
    fontSize: 10,
    fontFamily: Theme.typography.fontFamily.bold,
    lineHeight: 12, // Ensure vertical centering
  },
});
