import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getCurrentUser } from '../../../services/authService';
import { getTransactions, deleteTransaction } from '../../../services/transactionService';
import { Transaction } from '../../../types';

const CATEGORY_EMOJIS: Record<string, string> = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Entertainment: '🎮',
  Health: '💊',
  Salary: '💰',
  Other: '🏷️',
};

export function HistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const user = getCurrentUser();
  const userId = user?.uid || '';

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const txs = await getTransactions(userId);
      setTransactions(txs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDelete = async (txId: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(userId, txId);
              await loadData();
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'Failed to delete transaction.');
            }
          },
        },
      ]
    );
  };

  // Filter list based on type and search query
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType =
        filterType === 'all' ? true : tx.type === filterType;
      
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === ''
          ? true
          : tx.category.toLowerCase().includes(query) ||
            (tx.note && tx.note.toLowerCase().includes(query));

      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchQuery]);

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === 'income';
    const emoji = CATEGORY_EMOJIS[item.category] || '🏷️';
    const dateStr = new Date(item.date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return (
      <TouchableOpacity
        style={styles.txCard}
        onPress={() => handleDelete(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.txLeft}>
          <Text style={styles.txEmoji}>{emoji}</Text>
          <View style={styles.txInfo}>
            <Text style={styles.txNote} numberOfLines={1}>
              {item.note || item.category}
            </Text>
            <View style={styles.txMetaRow}>
              <Text style={styles.txCategory}>{item.category}</Text>
              <Text style={styles.txBullet}>•</Text>
              <Text style={styles.txDate}>{dateStr}</Text>
            </View>
          </View>
        </View>

        <View style={styles.txRight}>
          <Text
            style={[
              styles.txAmount,
              { color: isIncome ? '#10B981' : '#EF4444' },
            ]}
          >
            {isIncome ? '+' : '-'} {formatCurrency(item.amount)}
          </Text>
          <Ionicons
            name="trash-outline"
            size={16}
            color="#475569"
            style={styles.trashIcon}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes or categories..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            maxLength={30}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.pillsRow}>
          <TouchableOpacity
            style={[
              styles.pill,
              filterType === 'all' && styles.activePill,
            ]}
            onPress={() => setFilterType('all')}
          >
            <Text
              style={[
                styles.pillText,
                filterType === 'all' && styles.activePillText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pill,
              filterType === 'income' && styles.activePill,
            ]}
            onPress={() => setFilterType('income')}
          >
            <Text
              style={[
                styles.pillText,
                filterType === 'income' && styles.activePillText,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pill,
              filterType === 'expense' && styles.activePill,
            ]}
            onPress={() => setFilterType('expense')}
          >
            <Text
              style={[
                styles.pillText,
                filterType === 'expense' && styles.activePillText,
              ]}
            >
              Expenses
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transactions List */}
      {loading && transactions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color="#475569" />
              <Text style={styles.emptyText}>No matching transactions found.</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
  },
  filterSection: {
    padding: 20,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    padding: 0,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  activePill: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activePillText: {
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  txEmoji: {
    fontSize: 26,
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txNote: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txCategory: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  txBullet: {
    fontSize: 10,
    color: '#475569',
    marginHorizontal: 6,
  },
  txDate: {
    fontSize: 12,
    color: '#64748B',
  },
  txRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  trashIcon: {
    marginTop: 2,
  },
  listSeparator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
    textAlign: 'center',
  },
});
export default HistoryScreen;
