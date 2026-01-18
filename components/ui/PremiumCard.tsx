import { Theme } from "@/constants/theme";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

interface PremiumCardProps extends ViewProps {
  variant?: "default" | "outlined" | "ghost";
  padding?: keyof typeof Theme.spacing;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  style,
  variant = "default",
  padding = "lg",
  ...props
}) => {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        { padding: Theme.spacing[padding] },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Theme.borderRadius.lg,
  },
  default: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  outlined: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
});
