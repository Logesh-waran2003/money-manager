import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * AI Intelligence Review Screen
 * This feature requires backend integration and will be available in a future update.
 */
export default function ReviewScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Intelligence</Text>
      </View>

      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={64} color="#3f3f46" />
        <Text style={styles.title}>Coming Soon</Text>
        <Text style={styles.subtitle}>
          AI-powered merchant and category suggestions will be available when
          backend integration is added.
        </Text>
        <Text style={styles.description}>
          For now, all transactions are processed locally on your device using
          smart SMS parsing.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#a855f7",
    textShadowColor: "rgba(168, 85, 247, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    color: "#e4e4e7",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 12,
  },
  subtitle: {
    color: "#a1a1aa",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
  },
  description: {
    color: "#71717a",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
