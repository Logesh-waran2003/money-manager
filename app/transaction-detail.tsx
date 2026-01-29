import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getDb } from '@/services/db';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '@/services/config/detection';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    try {
      const db = await getDb();
      const txn: any = await db.getFirstAsync(
        'SELECT * FROM transactions WHERE id = ?',
        [id]
      );
      setTransaction(txn);
    } catch (error) {
      console.error('Failed to load transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const db = await getDb();
      await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
      setShowDeleteModal(false);
      router.back();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Transaction not found</Text>
      </View>
    );
  }

  const categoryLabel = CATEGORIES.find(c => c.id === transaction.category)?.label || transaction.category;
  const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.amountSection}>
        <Text style={styles.amountLabel}>Amount</Text>
        <Text style={[styles.amount, transaction.type === 'credit' && styles.amountCredit]}>
          {transaction.type === 'credit' ? '+' : '-'}₹{Math.abs(transaction.amount).toFixed(2)}
        </Text>
      </View>

      <View style={styles.detailsCard}>
        <DetailRow icon="business" label="Merchant" value={transaction.merchant} />
        <DetailRow icon="calendar" label="Date" value={formattedDate} />
        <DetailRow icon="pricetag" label="Category" value={categoryLabel} />
        <DetailRow 
          icon={transaction.type === 'credit' ? 'arrow-down' : 'arrow-up'} 
          label="Type" 
          value={transaction.type === 'credit' ? 'Credit' : 'Debit'} 
        />
        {transaction.remarks && (
          <DetailRow icon="document-text" label="Note" value={transaction.remarks} />
        )}
      </View>

      <View style={styles.actions}>
        <Pressable 
          style={styles.deleteButton}
          onPress={() => setShowDeleteModal(true)}
        >
          <Ionicons name="trash" size={20} color="#ef4444" />
          <Text style={styles.deleteButtonText}>Delete Transaction</Text>
        </Pressable>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="warning" size={48} color="#ef4444" />
            </View>
            <Text style={styles.modalTitle}>Delete Transaction?</Text>
            <Text style={styles.modalMessage}>
              This action cannot be undone. The transaction will be permanently deleted.
            </Text>
            <View style={styles.modalActions}>
              <Pressable 
                style={styles.modalCancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={styles.modalDeleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.modalDeleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLeft}>
        <Ionicons name={icon} size={20} color="#71717a" />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  amountLabel: {
    color: '#71717a',
    fontSize: 14,
    marginBottom: 8,
  },
  amount: {
    color: '#ef4444',
    fontSize: 48,
    fontWeight: '700',
  },
  amountCredit: {
    color: '#10b981',
  },
  detailsCard: {
    backgroundColor: '#18181b',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  actions: {
    padding: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: '#a1a1aa',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#18181b',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  modalIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalMessage: {
    color: '#a1a1aa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#27272a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDeleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
