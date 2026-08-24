import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface AdminData {
  subscriptions: any[];
  bills: any[];
  transactions: any[];
}

interface AdminContextType {
  adminData: AdminData;
  loading: boolean;
  fetchAllData: () => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [adminData, setAdminData] = useState<AdminData>({ subscriptions: [], bills: [], transactions: [] });
  const [loading, setLoading] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!user || !isAdmin) return; // Only admins can fetch
    setLoading(true);
    try {
      const [subsRes, billsRes, txnsRes] = await Promise.all([
        supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('bills').select('*').order('due_date', { ascending: true }),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
      ]);

      if (subsRes.error) throw subsRes.error;
      if (billsRes.error) throw billsRes.error;
      if (txnsRes.error) throw txnsRes.error;

      setAdminData({
        subscriptions: subsRes.data || [],
        bills: billsRes.data || [],
        transactions: txnsRes.data || [],
      });
    } catch (error) {
      console.error('Admin fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const deleteSubscription = async (id: string) => {
    await supabase.from('subscriptions').delete().eq('id', id);
    fetchAllData();
  };

  const deleteBill = async (id: string) => {
    await supabase.from('bills').delete().eq('id', id);
    fetchAllData();
  };

  const deleteTransaction = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id);
    fetchAllData();
  };

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return (
    <AdminContext.Provider value={{ adminData, loading, fetchAllData, deleteSubscription, deleteBill, deleteTransaction }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};