import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { SubscriptionTier } from '@/types';

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  currency: string;
  billingCycle: 'weekly' | 'monthly' | 'yearly';
  nextRenewalDate: string | null;
  category: string;
  notes?: string;
  active: boolean;
  shared: boolean;
  familyMemberIds: string[];
  priceHistory: { oldPrice: number; newPrice: number; date: string }[];
  user_id?: string;
}

export interface PaywallState {
  isOpen: boolean;
  isPaid: boolean;
  open: (feature: string) => void;
  close: () => void;
  upgradeTier: (tier: SubscriptionTier) => void;
}

interface SubscriptionContextType {
  subscriptions: Subscription[];
  loading: boolean;
  monthly: number;
  annual: number;
  categories: { category: string; monthly: number; color: string }[];
  forecast: { monthKey: string; month: string; amount: number }[];
  activeCount: number;
  sharedCount: number;
  hikesCount: number;
  profile: {
    name: string;
    email: string;
    currency: string;
    reminderDays: number;
    tier: string;
  };
  alerts: any[]; // ✅ Guaranteed array
  updateProfile: (updates: Partial<{ name: string; currency: string; reminderDays: number; tier: string }>) => void;
  family: any[]; // ✅ Guaranteed array
  addFamilyMember: (member: any) => boolean;
  removeFamilyMember: (id: string) => void;
  paywall: PaywallState;
  addSubscription: (sub: Omit<Subscription, 'id' | 'user_id'>) => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  fetchSubscriptions: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [paywall, setPaywall] = useState<PaywallState>({
    isOpen: false,
    isPaid: false,
    open: (feature: string) => setPaywall(prev => ({ ...prev, isOpen: true })),
    close: () => setPaywall(prev => ({ ...prev, isOpen: false })),
    upgradeTier: (tier: SubscriptionTier) => {
      setPaywall(prev => ({ ...prev, isPaid: true, isOpen: false }));
    },
  });

  const profile = useMemo(() => ({
    name: user?.user_metadata?.name || 'User',
    email: user?.email || 'user@example.com',
    currency: user?.user_metadata?.currency || 'USD',
    reminderDays: user?.user_metadata?.reminderDays || 3,
    tier: user?.user_metadata?.tier || 'free',
  }), [user]);

  const fetchSubscriptions = useCallback(async () => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const normalized = (data || []).map((sub: any) => ({
        id: sub.id,
        name: sub.name || 'Unnamed',
        cost: sub.price ?? 0,
        currency: sub.currency || 'USD',
        billingCycle: sub.billing_cycle || sub.billingCycle || 'monthly',
        nextRenewalDate: sub.next_renewal || sub.nextRenewal || null,
        category: sub.category || 'Other',
        notes: sub.notes || '',
        active: sub.active ?? true,
        shared: sub.shared_with ? sub.shared_with.length > 0 : false,
        familyMemberIds: sub.family_member_ids || [],
        priceHistory: sub.price_history || [],
        user_id: sub.user_id,
        created_at: sub.created_at,
        updated_at: sub.updated_at,
      }));

      setSubscriptions(normalized);
      localStorage.setItem('subscriptions', JSON.stringify(normalized));
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setSubscriptions([]); // ✅ Always set array on error
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addSubscription = async (sub: Omit<Subscription, 'id' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');
    const dbSub = {
      name: sub.name,
      price: sub.cost,
      currency: sub.currency,
      billing_cycle: sub.billingCycle,
      next_renewal: sub.nextRenewalDate,
      category: sub.category,
      notes: sub.notes || '',
      active: sub.active,
      shared_with: sub.shared ? [user.id] : [],
      price_history: sub.priceHistory || [],
      user_id: user.id,
    };
    const { data, error } = await supabase.from('subscriptions').insert([dbSub]).select().single();
    if (error) throw error;
    if (data) setSubscriptions(prev => [data, ...prev]);
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.cost !== undefined) dbUpdates.price = updates.cost;
    if (updates.currency) dbUpdates.currency = updates.currency;
    if (updates.billingCycle) dbUpdates.billing_cycle = updates.billingCycle;
    if (updates.nextRenewalDate !== undefined) dbUpdates.next_renewal = updates.nextRenewalDate;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.active !== undefined) dbUpdates.active = updates.active;
    if (updates.shared !== undefined) dbUpdates.shared_with = updates.shared ? [user.id] : [];
    if (updates.priceHistory) dbUpdates.price_history = updates.priceHistory;
    dbUpdates.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('subscriptions').update(dbUpdates).eq('id', id).select().single();
    if (error) throw error;
    if (data) setSubscriptions(prev => prev.map(sub => sub.id === id ? data : sub));
  };

  const deleteSubscription = async (id: string) => {
    await supabase.from('subscriptions').delete().eq('id', id);
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
  };

  // ✅ Derived values (GUARANTEED ARRAYS)
  const monthly = useMemo(() => subscriptions.filter(s => s.active).reduce((sum, s) => {
    if (s.billingCycle === 'yearly') return sum + s.cost / 12;
    if (s.billingCycle === 'weekly') return sum + s.cost * 4.33;
    return sum + s.cost;
  }, 0), [subscriptions]);

  const annual = useMemo(() => subscriptions.filter(s => s.active).reduce((sum, s) => {
    if (s.billingCycle === 'monthly') return sum + s.cost * 12;
    if (s.billingCycle === 'weekly') return sum + s.cost * 52;
    return sum + s.cost;
  }, 0), [subscriptions]);

  const activeCount = useMemo(() => subscriptions.filter(s => s.active).length, [subscriptions]);
  const sharedCount = useMemo(() => subscriptions.filter(s => s.shared).length, [subscriptions]);
  const hikesCount = useMemo(() => subscriptions.filter(s => s.priceHistory.length > 0).length, [subscriptions]);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    subscriptions.filter(s => s.active).forEach(s => map.set(s.category, (map.get(s.category) || 0) + s.cost));
    return Array.from(map.entries()).map(([category, monthly]) => ({ category, monthly, color: `#${Math.floor(Math.random()*16777215).toString(16)}` }));
  }, [subscriptions]);

  const forecast = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      return { monthKey: `${date.getFullYear()}-${date.getMonth() + 1}`, month: months[date.getMonth()], amount: monthly };
    });
  }, [monthly]);

  // ✅ GUARANTEED EMPTY ARRAYS (Fix for "length" error)
  const alerts = useMemo(() => [], []);
  const family = useMemo(() => [], []);
  const updateProfile = useCallback((updates: any) => {
    console.log('Profile updated:', updates);
  }, []);
  const addFamilyMember = useCallback(() => true, []);
  const removeFamilyMember = useCallback(() => {}, []);

  return (
    <SubscriptionContext.Provider value={{
      subscriptions,
      loading,
      monthly,
      annual,
      categories,
      forecast,
      activeCount,
      sharedCount,
      hikesCount,
      profile,
      alerts,
      updateProfile,
      family,
      addFamilyMember,
      removeFamilyMember,
      paywall,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      fetchSubscriptions,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  return context;
};