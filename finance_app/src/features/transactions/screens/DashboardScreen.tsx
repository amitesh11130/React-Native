import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getCurrentUser } from '../../../services/authService';
import { getTransactions } from '../../../services/transactionService';
import { Transaction } from '../../../types';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#F59E0B',          // Amber
  Transport: '#3B82F6',     // Blue
  Shopping: '#EC4899',      // Pink
  Entertainment: '#8B5CF6', // Purple
  Health: '#10B981',        // Emerald
  Salary: '#22C55E',        // Green
  Other: '#64748B',         // Slate
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Entertainment: '🎮',
  Health: '💊',
  Salary: '💰',
  Other: '🏷️',
};

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const user = getCurrentUser();
  const userId = user?.uid || '';
  const displayName = user?.displayName || 'User';

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

  // Compute monthly stats using useMemo
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTxs = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const income = monthlyTxs
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const expense = monthlyTxs
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      monthlyCount: monthlyTxs.length,
    };
  }, [transactions]);

  // Compute category breakdown using useMemo
  const categoryBreakdown = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const expensesOnly = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === 'expense' &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    });

    const totals: Record<string, number> = {};
    let totalExpense = 0;

    expensesOnly.forEach((tx) => {
      totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
      totalExpense += tx.amount;
    });

    return Object.keys(totals).map((cat) => ({
      category: cat,
      amount: totals[cat],
      percentage: totalExpense > 0 ? (totals[cat] / totalExpense) * 100 : 0,
      color: CATEGORY_COLORS[cat] || '#64748B',
      emoji: CATEGORY_EMOJIS[cat] || '🏷️',
    })).sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello,</Text>
          <Text style={styles.nameText}>{displayName} 👋</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Add Transaction')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>TOTAL BALANCE (THIS MONTH)</Text>
        <Text
          style={[
            styles.balanceAmount,
            { color: stats.balance >= 0 ? '#10B981' : '#EF4444' },
          ]}
        >
          {formatCurrency(stats.balance)}
        </Text>

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainerIncome}>
              <Ionicons name="trending-up-outline" size={20} color="#10B981" />
            </View>
            <View>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.incomeAmount}>{formatCurrency(stats.income)}</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconContainerExpense}>
              <Ionicons name="trending-down-outline" size={20} color="#EF4444" />
            </View>
            <View>
              <Text style={styles.statLabel}>Expenses</Text>
              <Text style={styles.expenseAmount}>{formatCurrency(stats.expense)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense Breakdown</Text>
          <View style={styles.sectionCard}>
            {categoryBreakdown.map((item) => (
              <View key={item.category} style={styles.breakdownItem}>
                <View style={styles.breakdownTextRow}>
                  <Text style={styles.breakdownLabel}>
                    {item.emoji} {item.category}
                  </Text>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency(item.amount)} ({item.percentage.toFixed(0)}%)
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="file-tray-outline" size={40} color="#475569" />
            <Text style={styles.emptyText}>No transactions recorded yet.</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('Add Transaction')}
            >
              <Text style={styles.emptyBtnText}>Add First Transaction</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.transactionListCard}>
            {recentTransactions.map((item) => {
              const isIncome = item.type === 'income';
              const emoji = CATEGORY_EMOJIS[item.category] || '🏷️';
              return (
                <View key={item.id} style={styles.txRow}>
                  <View style={styles.txLeft}>
                    <Text style={styles.txEmoji}>{emoji}</Text>
                    <View>
                      <Text style={styles.txNote} numberOfLines={1}>
                        {item.note || item.category}
                      </Text>
                      <Text style={styles.txDate}>
                        {new Date(item.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.txAmount,
                      { color: isIncome ? '#10B981' : '#EF4444' },
                    ]}
                  >
                    {isIncome ? '+' : '-'} {formatCurrency(item.amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  balanceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIconContainerIncome: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statIconContainerExpense: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  incomeAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 16,
  },
  breakdownItem: {
    gap: 6,
  },
  breakdownTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  transactionListCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  txNote: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
    maxWidth: 180,
  },
  txDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
export default DashboardScreen;
