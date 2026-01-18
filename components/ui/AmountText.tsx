import { Theme } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";

interface AmountTextProps extends TextProps {
  value: number;
  currency?: string;
  size?: keyof typeof Theme.typography.sizes;
  type?: "income" | "expense" | "neutral";
  showSign?: boolean;
}

export const AmountText: React.FC<AmountTextProps> = ({
  value,
  currency = "₹",
  size = "lg",
  type = "neutral",
  showSign = false,
  style,
  ...props
}) => {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const formattedValue = absValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const getColor = () => {
    if (type === "neutral") return Theme.colors.textPrimary;
    if (type === "income") return Theme.colors.success;
    if (type === "expense") return Theme.colors.error;
    // Auto-detect if not specified
    return isNegative ? Theme.colors.error : Theme.colors.success;
  };

  const getSign = () => {
    if (value < 0) return "-";
    if (showSign && value > 0) return "+";
    return "";
  };

  return (
    <Text
      style={[
        styles.base,
        {
          fontSize: Theme.typography.sizes[size],
          color: getColor(),
        },
        style,
      ]}
      {...props}
    >
      {getSign()}
      {currency}
      {formattedValue}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: Theme.typography.fontFamily.mono, // Critical for alignment
    fontVariant: ["tabular-nums"], // Ensure numbers line up
    fontWeight: "600",
  },
});
