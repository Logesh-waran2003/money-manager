import { applyMapping } from "@/services/api";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReviewScreen() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editMerchant, setEditMerchant] = useState("");
  const [editCategory, setEditCategory] = useState("");

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      // In a real scenario, we would fetch from the API
      // const data = await getAiSuggestions();
      // setSuggestions(data);

      // Mock data for now as the API might not be live or reachable
      setSuggestions([
        {
          transaction_id: "1",
          original_text: "UBER *TRIP 1234",
          suggested_merchant: "Uber",
          suggested_category: "Transport",
        },
        {
          transaction_id: "2",
          original_text: "STARBUCKS COFFEE",
          suggested_merchant: "Starbucks",
          suggested_category: "Food & Drink",
        },
        {
          transaction_id: "3",
          original_text: "AMZN Mktp US",
          suggested_merchant: "Amazon",
          suggested_category: "Shopping",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch suggestions", error);
      Alert.alert("Error", "Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (item: any) => {
    try {
      await applyMapping({
        transaction_id: item.transaction_id,
        new_category: item.suggested_category,
        new_merchant: item.suggested_merchant,
        create_rule: true,
      });
      setSuggestions((prev) =>
        prev.filter((i) => i.transaction_id !== item.transaction_id)
      );
    } catch (error) {
      console.error("Failed to apply mapping", error);
      // For demo purposes, remove it anyway
      setSuggestions((prev) =>
        prev.filter((i) => i.transaction_id !== item.transaction_id)
      );
    }
  };

  const handleRejectEdit = (item: any) => {
    setSelectedItem(item);
    setEditMerchant(item.suggested_merchant);
    setEditCategory(item.suggested_category);
    setModalVisible(true);
  };

  const saveEdit = async () => {
    if (!selectedItem) return;

    try {
      await applyMapping({
        transaction_id: selectedItem.transaction_id,
        new_category: editCategory,
        new_merchant: editMerchant,
        create_rule: true,
      });
      setSuggestions((prev) =>
        prev.filter((i) => i.transaction_id !== selectedItem.transaction_id)
      );
      setModalVisible(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to save edit", error);
      // For demo purposes, remove it anyway
      setSuggestions((prev) =>
        prev.filter((i) => i.transaction_id !== selectedItem.transaction_id)
      );
      setModalVisible(false);
      setSelectedItem(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.originalTextLabel}>Original Text</Text>
        <Text style={styles.originalText}>{item.original_text}</Text>
      </View>

      <View style={styles.suggestionContainer}>
        <View style={styles.suggestionRow}>
          <Text style={styles.suggestionLabel}>Merchant:</Text>
          <Text style={styles.suggestionValue}>{item.suggested_merchant}</Text>
        </View>
        <View style={styles.suggestionRow}>
          <Text style={styles.suggestionLabel}>Category:</Text>
          <Text style={styles.suggestionValue}>{item.suggested_category}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => handleRejectEdit(item)}
        >
          <Text style={styles.buttonText}>Reject / Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => handleAccept(item)}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Intelligence</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#a855f7" />
        </View>
      ) : (
        <FlatList
          data={suggestions}
          renderItem={renderItem}
          keyExtractor={(item) => item.transaction_id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No suggestions available</Text>
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Mapping</Text>

            <Text style={styles.inputLabel}>Merchant</Text>
            <TextInput
              style={styles.input}
              value={editMerchant}
              onChangeText={setEditMerchant}
              placeholderTextColor="#71717a"
            />

            <Text style={styles.inputLabel}>Category</Text>
            <TextInput
              style={styles.input}
              value={editCategory}
              onChangeText={setEditCategory}
              placeholderTextColor="#71717a"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={saveEdit}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B", // zinc-950
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
    color: "#a855f7", // purple-500
    textShadowColor: "rgba(168, 85, 247, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#18181b", // zinc-900
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#27272a", // zinc-800
  },
  cardHeader: {
    marginBottom: 12,
  },
  originalTextLabel: {
    color: "#71717a", // zinc-500
    fontSize: 12,
    marginBottom: 4,
  },
  originalText: {
    color: "#a1a1aa", // zinc-400
    fontSize: 14,
  },
  suggestionContainer: {
    marginBottom: 16,
  },
  suggestionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  suggestionLabel: {
    color: "#e4e4e7", // zinc-200
    fontSize: 16,
  },
  suggestionValue: {
    color: "#4ade80", // green-400 (neon green-ish)
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#22c55e", // green-500
  },
  rejectButton: {
    backgroundColor: "#ef4444", // red-500
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyText: {
    color: "#71717a",
    textAlign: "center",
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#18181b",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  inputLabel: {
    color: "#a1a1aa",
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#27272a",
    color: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: "#52525b", // zinc-600
  },
  saveButton: {
    backgroundColor: "#a855f7", // purple-500
  },
});
