import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Bill {
  id: string;
  name: string;
  provider: string;
  amount: number;
  currency: string;
  dueDate: string;
  category: string;
  paid: boolean;
  paymentMethod?: string;
  notes?: string;
  user_id?: string;
}

interface BillsContextType {
  bills: Bill[];
  loading: boolean;
  error: string | null;
  addBill: (bill: Omit<Bill, 'id' | 'user_id'>) => Promise<void>;
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  markAsPaid: (id: string) => Promise<void>;
  fetchBills: () => Promise<void>;
}

const BillsContext = createContext<BillsContextType | undefined>(undefined);

export const BillsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = useCallback(async () => {
    if (!user) {
      setBills([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;

      const normalized = (data || []).map((bill: any) => ({
        id: bill.id,
        name: bill.name,
        provider: bill.provider || '',
        amount: bill.amount ?? 0,
        currency: bill.currency || 'USD',
        dueDate: bill.due_date || bill.dueDate || '',
        category: bill.category || 'Other',
        paid: bill.paid ?? false,
        paymentMethod: bill.payment_method || '',
        notes: bill.notes || '',
        user_id: bill.user_id,
      }));

      setBills(normalized);
    } catch (error: any) {
      console.error('Error fetching bills:', error);
      setError(error.message || 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addBill = async (bill: Omit<Bill, 'id' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');
    
    const dbBill = {
      name: bill.name,
      provider: bill.provider || '',
      amount: bill.amount,
      currency: bill.currency,
      due_date: bill.dueDate,
      category: bill.category,
      paid: bill.paid,
      payment_method: bill.paymentMethod || '',
      notes: bill.notes || '',
      user_id: user.id,
    };

    try {
      const { data, error } = await supabase.from('bills').insert([dbBill]).select().single();
      if (error) throw error;

      if (data) {
        const newBill: Bill = {
          id: data.id,
          name: data.name,
          provider: data.provider,
          amount: data.amount,
          currency: data.currency,
          dueDate: data.due_date,
          category: data.category,
          paid: data.paid,
          paymentMethod: data.payment_method,
          notes: data.notes,
          user_id: data.user_id,
        };
        setBills(prev => [newBill, ...prev]);
      }
    } catch (error) {
      throw error;
    }
  };

  const updateBill = async (id: string, updates: Partial<Bill>) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.provider !== undefined) dbUpdates.provider = updates.provider;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.currency) dbUpdates.currency = updates.currency;
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.paid !== undefined) dbUpdates.paid = updates.paid;
    if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    try {
      const { data, error } = await supabase.from('bills').update(dbUpdates).eq('id', id).eq('user_id', user?.id).select().single();
      if (error) throw error;
      if (data) {
        const updatedBill: Bill = {
          id: data.id,
          name: data.name,
          provider: data.provider,
          amount: data.amount,
          currency: data.currency,
          dueDate: data.due_date,
          category: data.category,
          paid: data.paid,
          paymentMethod: data.payment_method,
          notes: data.notes,
          user_id: data.user_id,
        };
        setBills(prev => prev.map(b => (b.id === id ? updatedBill : b)));
      }
    } catch (error) {
      throw error;
    }
  };

  const markAsPaid = async (id: string) => {
    await updateBill(id, { paid: true });
  };

  const deleteBill = async (id: string) => {
    try {
      const { error } = await supabase.from('bills').delete().eq('id', id).eq('user_id', user?.id);
      if (error) throw error;
      setBills(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return (
    <BillsContext.Provider value={{ bills, loading, error, addBill, updateBill, deleteBill, markAsPaid, fetchBills }}>
      {children}
    </BillsContext.Provider>
  );
};

export const useBills = () => {
  const context = useContext(BillsContext);
  if (context === undefined) {
    throw new Error('useBills must be used within a BillsProvider');
  }
  return context;
};