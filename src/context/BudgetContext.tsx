import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface BudgetContextType {
  monthlyBudget: number;
  loading: boolean;
  setMonthlyBudget: (amount: number) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(3000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudget = async () => {
      if (!user) return;
      const { data } = await supabase.from('budgets').select('monthly_budget').eq('user_id', user.id).single();
      if (data) setMonthlyBudgetState(data.monthly_budget);
      setLoading(false);
    };
    fetchBudget();
  }, [user]);

  const setMonthlyBudget = async (amount: number) => {
    setMonthlyBudgetState(amount);
    if (!user) return;

    // Check if a budget row exists
    const { data } = await supabase.from('budgets').select('id').eq('user_id', user.id).single();

    if (data) {
      await supabase.from('budgets').update({ monthly_budget: amount }).eq('id', data.id);
    } else {
      await supabase.from('budgets').insert({ user_id: user.id, monthly_budget: amount });
    }
  };

  return (
    <BudgetContext.Provider value={{ monthlyBudget, loading, setMonthlyBudget }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) throw new Error('useBudget must be used within a BudgetProvider');
  return context;
};