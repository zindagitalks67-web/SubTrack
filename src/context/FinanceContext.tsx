import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
  paymentMethod?: string;
  notes?: string;
  user_id?: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (txn: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]); // ✅ Always array
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      // ✅ Safe normalization (data null/undefined check)
      const normalized = (data || []).map((txn: any) => ({
        id: txn.id,
        type: txn.type,
        amount: txn.amount,
        currency: txn.currency,
        category: txn.category || 'Other',
        description: txn.description || '',
        date: txn.date,
        paymentMethod: txn.payment_method || null, // ✅ snake_case -> camelCase
        notes: txn.notes || '',
        user_id: txn.user_id,
      }));

      setTransactions(normalized);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]); // ✅ Ensure array
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTransactions(); }, [user, fetchTransactions]);

  // ✅ FIX: Add Transaction (camelCase -> snake_case mapping)
  const addTransaction = async (txn: Omit<Transaction, 'id'>) => {
    if (!user) throw new Error('Not authenticated');
    
    const dbTxn = {
      type: txn.type,
      amount: txn.amount,
      currency: txn.currency,
      category: txn.category,
      description: txn.description,
      date: txn.date,
      payment_method: txn.paymentMethod || null, // ✅ paymentMethod -> payment_method
      notes: txn.notes || '',
      user_id: user.id,
    };

    const { data, error } = await supabase.from('transactions').insert([dbTxn]).select().single();
    if (error) throw error;
    if (data) setTransactions(prev => [data, ...prev]);
  };

  // ✅ FIX: Update Transaction
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const dbUpdates: any = {};
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.currency) dbUpdates.currency = updates.currency;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.date) dbUpdates.date = updates.date;
    if (updates.paymentMethod) dbUpdates.payment_method = updates.paymentMethod; // ✅
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { data, error } = await supabase.from('transactions').update(dbUpdates).eq('id', id).select().single();
    if (error) throw error;
    if (data) setTransactions(prev => prev.map(t => t.id === id ? data : t));
  };

  const deleteTransaction = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <FinanceContext.Provider value={{ transactions, loading, addTransaction, updateTransaction, deleteTransaction }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};