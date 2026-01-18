import { Theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Search transactions...",
}) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChangeText(debouncedValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedValue]);

  return (
    <View style={[styles.container, isFocused && styles.focused]}>
      <Ionicons
        name="search"
        size={20}
        color={isFocused ? Theme.colors.textPrimary : Theme.colors.textTertiary}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        value={debouncedValue}
        onChangeText={setDebouncedValue}
        placeholder={placeholder}
        placeholderTextColor={Theme.colors.textTertiary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        cursorColor={Theme.colors.primary}
        selectionColor={Theme.colors.info}
      />
      {debouncedValue.length > 0 && (
        <TouchableOpacity onPress={() => setDebouncedValue("")} hitSlop={8}>
          <Ionicons
            name="close-circle"
            size={20}
            color={Theme.colors.textTertiary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 10, // Fixed height feel
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  focused: {
    borderColor: Theme.colors.textSecondary,
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  icon: {
    marginRight: Theme.spacing.sm,
  },
  input: {
    flex: 1,
    color: Theme.colors.textPrimary,
    fontFamily: Theme.typography.fontFamily.medium,
    fontSize: Theme.typography.sizes.base,
    height: "100%", // Fill container
    paddingVertical: 0, // Remove native padding
  },
});
