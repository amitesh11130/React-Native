import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getCurrentUser } from '../../../services/authService';
import { addTransaction } from '../../../services/transactionService';
import { Category, TransactionType } from '../../../types';

const CATEGORIES: { name: Category; emoji: string; color: string }[] = [
  { name: 'Food', emoji: '🍔', color: '#F59E0B' },
  { name: 'Transport', emoji: '🚗', color: '#3B82F6' },
  { name: 'Shopping', emoji: '🛍️', color: '#EC4899' },
  { name: 'Entertainment', emoji: '🎮', color: '#8B5CF6' },
  { name: 'Health', emoji: '💊', color: '#10B981' },
  { name: 'Salary', emoji: '💰', color: '#22C55E' },
  { name: 'Other', emoji: '🏷️', color: '#64748B' },
];

export function AddTransactionScreen() {
  const navigation = useNavigation<any>();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<Category>('Food');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      Alert.alert('Error', 'No authenticated user found.');
      return;
    }

    setSaving(true);
    try {
      await addTransaction(user.uid, {
        amount: parsedAmount,
        type,
        category,
        note: note.trim(),
        date: new Date().toISOString(),
      });

      // Clear fields
      setAmount('');
      setNote('');
      setCategory('Food');
      setType('expense');

      Alert.alert('Success', 'Transaction recorded successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save transaction.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Toggle between Expense and Income */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleTab,
              type === 'expense' && styles.activeExpenseTab,
            ]}
            onPress={() => setType('expense')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-down-circle-outline"
              size={18}
              color={type === 'expense' ? '#FFF' : '#EF4444'}
            />
            <Text
              style={[
                styles.toggleText,
                type === 'expense' && styles.activeText,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleTab,
              type === 'income' && styles.activeIncomeTab,
            ]}
            onPress={() => setType('income')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-up-circle-outline"
              size={18}
              color={type === 'income' ? '#FFF' : '#10B981'}
            />
            <Text
              style={[
                styles.toggleText,
                type === 'income' && styles.activeText,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>AMOUNT</Text>
          <View style={styles.amountInputRow}>
            <Text style={[styles.currencySymbol, { color: type === 'income' ? '#10B981' : '#EF4444' }]}>₹</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#475569"
              value={amount}
              onChangeText={setAmount}
              maxLength={10}
            />
          </View>
        </View>

        {/* Category Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryCard,
                    isSelected && {
                      borderColor: cat.color,
                      backgroundColor: `${cat.color}15`, // 15% opacity version
                    },
                  ]}
                  onPress={() => setCategory(cat.name)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      isSelected && { color: cat.color, fontWeight: '700' },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Note Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>NOTE / DESCRIPTION</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="What was this for?"
            placeholderTextColor="#475569"
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={100}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: type === 'income' ? '#10B981' : '#EF4444' },
          ]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Transaction'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  toggleTab: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  activeExpenseTab: {
    backgroundColor: '#EF4444',
  },
  activeIncomeTab: {
    backgroundColor: '#10B981',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeText: {
    color: '#FFF',
  },
  inputCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '800',
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '800',
    color: '#F8FAFC',
    padding: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '31%', // roughly 3 columns
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  noteInput: {
    fontSize: 15,
    color: '#F8FAFC',
    minHeight: 60,
    textAlignVertical: 'top',
    padding: 0,
    marginTop: 4,
  },
  saveButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
export default AddTransactionScreen;
