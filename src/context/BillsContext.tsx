import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Bill {
  id: string;
  name: string;
  provider?: string;
  amount: number;
  currency: string;
  dueDate: string;
  category: string;
  autoPay: boolean;
  paid: boolean;
  notes?: string;
  user_id?: string;
}

interface BillsContextType {
  bills: Bill[];
  loading: boolean;
  addBill: (bill: Omit<Bill, 'id'>) => Promise<void>;
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
}

const BillsContext = createContext<BillsContextType | undefined>(undefined);

export const BillsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = useCallback(async () => {
    if (!user) { setBills([]); setLoading(false); return; }
    try {
      const { data, error } = await supabase.from('bills').select('*').eq('user_id', user.id);
      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchBills(); }, [user, fetchBills]);

  const addBill = async (bill: Omit<Bill, 'id'>) => {
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase.from('bills').insert([{ ...bill, user_id: user.id }]).select().single();
    if (error) throw error;
    setBills(prev => [data, ...prev]);
  };

  const updateBill = async (id: string, updates: Partial<Bill>) => {
    const { data, error } = await supabase.from('bills').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setBills(prev => prev.map(b => b.id === id ? data : b));
  };

  const deleteBill = async (id: string) => {
    await supabase.from('bills').delete().eq('id', id);
    setBills(prev => prev.filter(b => b.id !== id));
  };

  return (
    <BillsContext.Provider value={{ bills, loading, addBill, updateBill, deleteBill }}>
      {children}
    </BillsContext.Provider>
  );
};

export const useBills = () => {
  const context = useContext(BillsContext);
  if (!context) throw new Error('useBills must be used within a BillsProvider');
  return context;
};