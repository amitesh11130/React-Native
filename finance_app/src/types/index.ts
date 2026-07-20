export type TransactionType = 'expense' | 'income';

export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Salary'
  | 'Other';

export interface Transaction {
  id: string;
  amount: number;
  category: Category;
  note: string;
  type: TransactionType;
  date: string; // ISO string
  userId: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'userId'>;
