import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// ✅ Updated Subscription Interface
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

// ✅ Alert Type
export interface Alert {
  id: string;
  kind: 'renewal' | 'price_hike' | 'overdue';
  title: string;
  message: string;
  date: string;
  subscriptionId: string;
  percentIncrease?: number;
}

// ✅ Family Member Type
export interface FamilyMember {
  id: string;
  name: string;
  email?: string;
  relationship: string;
  avatarColor: string;
}

// ✅ Paywall Type
export interface PaywallState {
  isOpen: boolean;
  isPaid: boolean;
  open: (feature: string) => void;
  close: () => void;
  upgradeTier: (tier: 'monthly' | 'yearly' | 'lifetime') => void;
}

// ✅ Profile Type
export interface UserProfile {
  name: string;
  currency: string;
  reminderDays: number;
  tier: string;
  email?: string;
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
  profile: UserProfile;
  alerts: Alert[];
  family: FamilyMember[];
  paywall: PaywallState;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addSubscription: (sub: Omit<Subscription, 'id' | 'user_id'>) => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  fetchSubscriptions: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  
  // ✅ Paywall state
  const [paywall, setPaywall] = useState<PaywallState>({
    isOpen: false,
    isPaid: false,
    open: (feature) => setPaywall((p) => ({ ...p, isOpen: true })),
    close: () => setPaywall((p) => ({ ...p, isOpen: false })),
    upgradeTier: (tier) => {
      setPaywall((p) => ({ ...p, isPaid: true, isOpen: false }));
      updateProfile({ tier: tier });
    },
  });

  // ✅ Profile State
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.user_metadata?.name || 'User',
    currency: user?.user_metadata?.currency || 'USD',
    reminderDays: user?.user_metadata?.reminderDays || 3,
    tier: user?.user_metadata?.tier || 'free',
    email: user?.email || '',
  });

  // ✅ Sync profile when user changes
  useEffect(() => {
    if (user) {
      setProfile({
        name: user?.user_metadata?.name || 'User',
        currency: user?.user_metadata?.currency || 'USD',
        reminderDays: user?.user_metadata?.reminderDays || 3,
        tier: user?.user_metadata?.tier || 'free',
        email: user?.email || '',
      });
    }
  }, [user]);

  // ✅ updateProfile method
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    await updateAuthProfile(updates);
  }, [updateAuthProfile]);

  // ✅ Alerts state
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // ✅ Fetch subscriptions from Supabase
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
      }));

      setSubscriptions(normalized);

      // ✅ FIX: Generate mock alerts with correct type
      const mockAlerts: Alert[] = normalized
        .filter((s: Subscription) => s.active)
        .map((s: Subscription, index: number) => {
          const days = s.nextRenewalDate ? Math.ceil((new Date(s.nextRenewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 10;
          if (days <= 3) {
            return {
              id: `alert-${s.id}`,
              kind: 'renewal' as const, // ✅ Explicit literal type
              title: `${s.name} renewing soon`,
              message: `Your subscription will be renewed in ${days} days.`,
              date: s.nextRenewalDate || new Date().toISOString(),
              subscriptionId: s.id,
            };
          }
          if (s.priceHistory.length > 0) {
            return {
              id: `hike-${s.id}`,
              kind: 'price_hike' as const, // ✅ Explicit literal type
              title: `${s.name} price increased`,
              message: `The price for ${s.name} has increased.`,
              date: s.priceHistory[s.priceHistory.length - 1].date,
              subscriptionId: s.id,
              percentIncrease: 10,
            };
          }
          return {
            id: `due-${s.id}`,
            kind: 'overdue' as const, // ✅ Explicit literal type
            title: `${s.name} is overdue`,
            message: `Payment for ${s.name} is overdue.`,
            date: new Date().toISOString(),
            subscriptionId: s.id,
          };
        })
        .slice(0, 5);
      
      setAlerts(mockAlerts);
      localStorage.setItem('subscriptions', JSON.stringify(normalized));
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      const localData = localStorage.getItem('subscriptions');
      if (localData) {
        try { setSubscriptions(JSON.parse(localData)); } catch (e) { setSubscriptions([]); }
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ✅ CRUD functions (same as before)
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
      family_member_ids: sub.familyMemberIds || [],
      price_history: sub.priceHistory || [],
      user_id: user.id,
    };
    try {
      const { data, error } = await supabase.from('subscriptions').insert([dbSub]).select().single();
      if (error) throw error;
      if (data) {
        const newSub: Subscription = {
          id: data.id,
          name: data.name,
          cost: data.price,
          currency: data.currency,
          billingCycle: data.billing_cycle,
          nextRenewalDate: data.next_renewal,
          category: data.category,
          notes: data.notes || '',
          active: data.active,
          shared: data.shared_with ? data.shared_with.length > 0 : false,
          familyMemberIds: data.family_member_ids || [],
          priceHistory: data.price_history || [],
          user_id: data.user_id,
        };
        setSubscriptions((prev) => [newSub, ...prev]);
      }
    } catch (error) {
      console.error('Add subscription error:', error);
      throw error;
    }
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
    if (updates.shared !== undefined) dbUpdates.shared_with = updates.shared ? ['user'] : [];
    if (updates.familyMemberIds) dbUpdates.family_member_ids = updates.familyMemberIds;
    if (updates.priceHistory) dbUpdates.price_history = updates.priceHistory;
    dbUpdates.updated_at = new Date().toISOString();

    try {
      const { data, error } = await supabase.from('subscriptions').update(dbUpdates).eq('id', id).eq('user_id', user?.id).select().single();
      if (error) throw error;
      if (data) {
        const updatedSub: Subscription = {
          id: data.id,
          name: data.name,
          cost: data.price,
          currency: data.currency,
          billingCycle: data.billing_cycle,
          nextRenewalDate: data.next_renewal,
          category: data.category,
          notes: data.notes || '',
          active: data.active,
          shared: data.shared_with ? data.shared_with.length > 0 : false,
          familyMemberIds: data.family_member_ids || [],
          priceHistory: data.price_history || [],
          user_id: data.user_id,
        };
        setSubscriptions((prev) => prev.map((sub) => (sub.id === id ? updatedSub : sub)));
      }
    } catch (error) {
      console.error('Update subscription error:', error);
      throw error;
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id).eq('user_id', user?.id);
      if (error) throw error;
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
    } catch (error) {
      console.error('Delete subscription error:', error);
      throw error;
    }
  };

  // ✅ Derived values
  const monthly = useMemo(() => {
    return subscriptions.filter(s => s.active).reduce((sum, s) => {
      if (s.billingCycle === 'yearly') return sum + s.cost / 12;
      if (s.billingCycle === 'weekly') return sum + s.cost * 4.33;
      return sum + s.cost;
    }, 0);
  }, [subscriptions]);

  const annual = useMemo(() => {
    return subscriptions.filter(s => s.active).reduce((sum, s) => {
      if (s.billingCycle === 'monthly') return sum + s.cost * 12;
      if (s.billingCycle === 'weekly') return sum + s.cost * 52;
      return sum + s.cost;
    }, 0);
  }, [subscriptions]);

  const activeCount = useMemo(() => subscriptions.filter((s) => s.active).length, [subscriptions]);
  const sharedCount = useMemo(() => subscriptions.filter((s) => s.shared).length, [subscriptions]);
  const hikesCount = useMemo(() => subscriptions.filter((s) => s.priceHistory.length > 0).length, [subscriptions]);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    subscriptions.filter(s => s.active).forEach(s => {
      map.set(s.category, (map.get(s.category) || 0) + s.cost);
    });
    return Array.from(map.entries()).map(([category, monthly]) => ({
      category,
      monthly,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    }));
  }, [subscriptions]);

  const forecast = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      return { monthKey, month: months[date.getMonth()], amount: monthly };
    });
  }, [monthly]);

  useEffect(() => {
    fetchSubscriptions();
  }, [user, fetchSubscriptions]);

  return (
    <SubscriptionContext.Provider
      value={{
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
        family,
        paywall,
        updateProfile,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        fetchSubscriptions,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
};