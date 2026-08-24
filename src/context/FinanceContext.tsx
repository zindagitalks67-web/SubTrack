import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TransactionType;
  name: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  notes?: string;
  user_id?: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  loading: boolean;
  totalExpenses: number;
  totalIncome: number;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchTransactions: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      // Normalize snake_case to camelCase
      const normalized = (data || []).map((txn: any) => ({
        id: txn.id,
        type: txn.type as TransactionType,
        name: txn.name,
        amount: txn.amount ?? 0,
        currency: txn.currency || 'USD',
        category: txn.category || 'Other',
        date: txn.date || new Date().toISOString().split('T')[0],
        notes: txn.notes || '',
        user_id: txn.user_id,
      }));

      setTransactions(normalized);
      localStorage.setItem('transactions', JSON.stringify(normalized));
    } catch (error) {
      // Fallback to LocalStorage
      const localData = localStorage.getItem('transactions');
      if (localData) {
        try { setTransactions(JSON.parse(localData)); } catch (e) { setTransactions([]); }
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');
    
    const dbTransaction = {
      type: transaction.type,
      name: transaction.name,
      amount: transaction.amount,
      currency: transaction.currency,
      category: transaction.category,
      date: transaction.date,
      notes: transaction.notes || '',
      user_id: user.id,
    };

    try {
      const { data, error } = await supabase.from('transactions').insert([dbTransaction]).select().single();
      if (error) throw error;

      if (data) {
        const newTransaction: Transaction = {
          id: data.id,
          type: data.type,
          name: data.name,
          amount: data.amount,
          currency: data.currency,
          category: data.category,
          date: data.date,
          notes: data.notes,
          user_id: data.user_id,
        };
        setTransactions(prev => [newTransaction, ...prev]);
        localStorage.setItem('transactions', JSON.stringify([newTransaction, ...transactions]));
      }
    } catch (error) {
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const dbUpdates: any = {};
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.currency) dbUpdates.currency = updates.currency;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.date) dbUpdates.date = updates.date;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    try {
      const { data, error } = await supabase.from('transactions').update(dbUpdates).eq('id', id).eq('user_id', user?.id).select().single();
      if (error) throw error;

      if (data) {
        const updatedTransaction: Transaction = {
          id: data.id,
          type: data.type,
          name: data.name,
          amount: data.amount,
          currency: data.currency,
          category: data.category,
          date: data.date,
          notes: data.notes,
          user_id: data.user_id,
        };
        setTransactions(prev => prev.map(t => (t.id === id ? updatedTransaction : t)));
        localStorage.setItem('transactions', JSON.stringify(transactions.map(t => (t.id === id ? updatedTransaction : t))));
      }
    } catch (error) {
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user?.id);
      if (error) throw error;
      setTransactions(prev => prev.filter(t => t.id !== id));
      localStorage.setItem('transactions', JSON.stringify(transactions.filter(t => t.id !== id)));
    } catch (error) {
      throw error;
    }
  };

  // Derived Calculations
  const totalExpenses = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), [transactions]);

  useEffect(() => {
    fetchTransactions();
  }, [user, fetchTransactions]);

  return (
    <FinanceContext.Provider value={{ transactions, loading, totalExpenses, totalIncome, addTransaction, updateTransaction, deleteTransaction, fetchTransactions }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};