import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface BudgetContextType {
  monthlyBudget: number;
  loading: boolean;
  updateBudget: (amount: number) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Fetch Budget from Supabase / LocalStorage
  const fetchBudget = useCallback(async () => {
    if (!user) {
      setMonthlyBudget(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('amount')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setMonthlyBudget(data.amount || 0);
      } else {
        // Fallback to LocalStorage
        const localBudget = localStorage.getItem(`budget_${user.id}`);
        setMonthlyBudget(localBudget ? parseFloat(localBudget) : 0);
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
      const localBudget = localStorage.getItem(`budget_${user.id}`);
      setMonthlyBudget(localBudget ? parseFloat(localBudget) : 0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update Budget
  const updateBudget = async (amount: number) => {
    if (!user) return;
    setMonthlyBudget(amount);

    // Optimistic update
    try {
      const { error } = await supabase
        .from('budgets')
        .upsert({ user_id: user.id, amount: amount });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating budget:', error);
    }

    // Always save to LocalStorage for quick access
    localStorage.setItem(`budget_${user.id}`, amount.toString());
  };

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  return (
    <BudgetContext.Provider value={{ monthlyBudget, loading, updateBudget }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};