import { Theme } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface ActionBtnProps extends TouchableOpacityProps {
  label: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const ActionBtn: React.FC<ActionBtnProps> = ({
  label,
  variant = "primary",
  loading = false,
  icon,
  style,
  onPress,
  disabled,
  ...props
}) => {
  const handlePress = useCallback(
    (e: any) => {
      if (disabled || loading) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.(e);
    },
    [onPress, disabled, loading]
  );

  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], disabled && styles.disabled, style]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary"
              ? Theme.colors.primaryForeground
              : Theme.colors.textPrimary
          }
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.textBase,
              styles[`text${variant}` as keyof typeof styles],
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.md,
    gap: 8,
    minHeight: 48,
  },
  primary: {
    backgroundColor: Theme.colors.primary,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  secondary: {
    backgroundColor: Theme.colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  danger: {
    backgroundColor: "rgba(244, 63, 94, 0.1)",
    borderWidth: 1,
    borderColor: Theme.colors.error,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.base,
  },
  textprimary: {
    color: Theme.colors.primaryForeground,
  },
  textsecondary: {
    color: Theme.colors.textPrimary,
  },
  textdanger: {
    color: Theme.colors.error,
  },
  textghost: {
    color: Theme.colors.textSecondary,
  },
});
