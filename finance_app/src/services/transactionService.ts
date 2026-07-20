import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, NewTransaction } from '../types';

const storageKey = (userId: string) => `transactions_${userId}`;

export async function getTransactions(userId: string): Promise<Transaction[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const data: Transaction[] = JSON.parse(raw);
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (e) {
    console.error('Error fetching transactions:', e);
    return [];
  }
}

export async function addTransaction(
  userId: string,
  data: NewTransaction
): Promise<Transaction> {
  try {
    const existing = await getTransactions(userId);
    const newTx: Transaction = {
      ...data,
      id: Date.now().toString(),
      userId,
    };
    await AsyncStorage.setItem(
      storageKey(userId),
      JSON.stringify([newTx, ...existing])
    );
    return newTx;
  } catch (e) {
    console.error('Error adding transaction:', e);
    throw e;
  }
}

export async function deleteTransaction(
  userId: string,
  transactionId: string
): Promise<void> {
  try {
    const existing = await getTransactions(userId);
    const updated = existing.filter((tx) => tx.id !== transactionId);
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting transaction:', e);
    throw e;
  }
}
