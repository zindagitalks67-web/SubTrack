import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface BudgetContextType { monthlyBudget: number; loading: boolean; updateBudget: (amount: number) => Promise<void>; }
const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0); // ✅ Always number
  const [loading, setLoading] = useState(true);

  const fetchBudget = useCallback(async () => {
    if (!user) { setMonthlyBudget(0); setLoading(false); return; }
    try {
      const { data, error } = await supabase.from('budgets').select('amount').eq('user_id', user.id).maybeSingle();
      if (error) throw error;
      setMonthlyBudget(data?.amount || 0); // ✅ Safe
    } catch (error) {
      const localBudget = localStorage.getItem(`budget_${user.id}`);
      setMonthlyBudget(localBudget ? parseFloat(localBudget) || 0 : 0); // ✅ Safe
    } finally { setLoading(false); }
  }, [user]);

  const updateBudget = async (amount: number) => {
    if (!user) return;
    setMonthlyBudget(amount || 0);
    localStorage.setItem(`budget_${user.id}`, (amount || 0).toString());
    try { await supabase.from('budgets').upsert({ user_id: user.id, amount: amount || 0 }); } catch (e) { console.log('Budget update failed'); }
  };

  useEffect(() => { fetchBudget(); }, [fetchBudget]);

  return <BudgetContext.Provider value={{ monthlyBudget, loading, updateBudget }}>{children}</BudgetContext.Provider>;
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) throw new Error('useBudget must be used within a BudgetProvider');
  return context;
};