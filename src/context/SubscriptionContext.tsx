import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { Subscription, FamilyMember, UserProfile, SubscriptionTier } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePaywall } from '@/hooks/usePaywall';
import { useAnalytics } from '@/hooks/useAnalytics';
import { uid } from '@/utils/dateHelpers';
import { computeNextRenewal } from '@/utils/dateHelpers';
import { isDuplicate } from '@/utils/calculations';
import { createMockFamily, createMockSubscriptions, createMockProfile } from '@/utils/mockData';
import { useToastContext } from './ToastContext';

export interface SubscriptionDraft {
  id?: string;
  name: string;
  category: string;
  cost: number;
  billingCycle: Subscription['billingCycle'];
  startDate: string;
  active: boolean;
  shared: boolean;
  familyMemberIds: string[];
  notes?: string;
}

interface SubscriptionContextValue {
  subscriptions: Subscription[];
  family: FamilyMember[];
  profile: UserProfile;
  monthly: number;
  annual: number;
  categories: ReturnType<typeof useAnalytics>['categories'];
  forecast: ReturnType<typeof useAnalytics>['forecast'];
  alerts: ReturnType<typeof useAnalytics>['alerts'];
  activeCount: number;
  sharedCount: number;
  hikesCount: number;
  paywall: ReturnType<typeof usePaywall>;
  addSubscription: (draft: SubscriptionDraft) => { ok: boolean };
  updateSubscription: (id: string, draft: SubscriptionDraft) => { ok: boolean };
  deleteSubscription: (id: string) => void;
  toggleActive: (id: string) => void;
  addFamilyMember: (m: Pick<FamilyMember, 'name' | 'email' | 'relationship'>) => { ok: boolean };
  removeFamilyMember: (id: string) => void;
  upgradeTier: (tier: SubscriptionTier) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  resetData: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { pushToast } = useToastContext();
  const [subscriptions, setSubscriptions, resetSubs] = useLocalStorage<Subscription[]>(
    'subscriptions',
    createMockSubscriptions,
  );
  const [family, setFamily, resetFamily] = useLocalStorage<FamilyMember[]>(
    'family',
    createMockFamily,
  );
  const [profile, setProfile, resetProfile] = useLocalStorage<UserProfile>(
    'profile',
    createMockProfile,
  );

  const paywall = usePaywall(profile.tier);
  const analytics = useAnalytics(subscriptions, profile.reminderDays);

  const addSubscription = useCallback(
    (draft: SubscriptionDraft): { ok: boolean } => {
      if (draft.cost <= 0) {
        pushToast('error', 'Cost must be greater than zero.');
        return { ok: false };
      }
      if (!draft.name.trim() || !draft.category) {
        pushToast('error', 'Please complete all required fields.');
        return { ok: false };
      }
      const activeCount = subscriptions.filter((s) => s.active).length;
      const isEditingActive = draft.id && subscriptions.find((s) => s.id === draft.id)?.active;
      if (!isEditingActive && !paywall.guardAdd(activeCount)) {
        return { ok: false };
      }
      if (isDuplicate(subscriptions, draft.name, draft.category, draft.id)) {
        pushToast('warning', 'A subscription with this name and category already exists.');
        return { ok: false };
      }

      const nextRenewal = computeNextRenewal(draft.startDate, draft.billingCycle);
      const nowIso = new Date().toISOString();

      if (draft.id) {
        setSubscriptions((prev) =>
          prev.map((s) => {
            if (s.id !== draft.id) return s;
            const priceChanged = draft.cost > s.cost;
            const newHistory = priceChanged
              ? [
                  ...s.priceHistory,
                  {
                    id: uid(),
                    oldPrice: s.cost,
                    newPrice: draft.cost,
                    changedAt: nowIso,
                  },
                ]
              : s.priceHistory;
            return {
              ...s,
              name: draft.name.trim(),
              category: draft.category,
              cost: draft.cost,
              billingCycle: draft.billingCycle,
              startDate: draft.startDate,
              active: draft.active,
              shared: draft.shared,
              familyMemberIds: draft.shared ? draft.familyMemberIds : [],
              notes: draft.notes,
              nextRenewalDate: nextRenewal,
              priceHistory: newHistory,
            };
          }),
        );
        pushToast('success', 'Subscription updated.');
        return { ok: true };
      }

      const newSub: Subscription = {
        id: uid(),
        name: draft.name.trim(),
        category: draft.category,
        cost: draft.cost,
        billingCycle: draft.billingCycle,
        startDate: draft.startDate,
        nextRenewalDate: nextRenewal,
        active: draft.active,
        shared: draft.shared,
        familyMemberIds: draft.shared ? draft.familyMemberIds : [],
        priceHistory: [],
        notes: draft.notes,
        createdAt: nowIso,
      };
      setSubscriptions((prev) => [newSub, ...prev]);
      pushToast('success', `${newSub.name} added.`);
      return { ok: true };
    },
    [subscriptions, paywall, pushToast, setSubscriptions],
  );

  const updateSubscription = useCallback(
    (id: string, draft: SubscriptionDraft) => {
      const result = addSubscription({ ...draft, id });
      return result;
    },
    [addSubscription],
  );

  const deleteSubscription = useCallback(
    (id: string) => {
      const sub = subscriptions.find((s) => s.id === id);
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      pushToast('info', sub ? `${sub.name} removed.` : 'Subscription removed.');
    },
    [subscriptions, pushToast, setSubscriptions],
  );

  const toggleActive = useCallback(
    (id: string) => {
      setSubscriptions((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          if (!s.active) {
            pushToast('success', `${s.name} reactivated.`);
          } else {
            pushToast('info', `${s.name} paused.`);
          }
          return { ...s, active: !s.active };
        }),
      );
    },
    [pushToast, setSubscriptions],
  );

  const addFamilyMember = useCallback(
    (m: Pick<FamilyMember, 'name' | 'email' | 'relationship'>): { ok: boolean } => {
      if (!paywall.guardFamily()) return { ok: false };
      if (!m.name.trim()) {
        pushToast('error', 'Member name is required.');
        return { ok: false };
      }
      const colors = ['#a855f7', '#3b82f6', '#22d3ee', '#22c55e', '#f59e0b', '#ec4899'];
      const member: FamilyMember = {
        id: uid(),
        name: m.name.trim(),
        email: m.email?.trim() || undefined,
        relationship: m.relationship,
        avatarColor: colors[family.length % colors.length],
        createdAt: new Date().toISOString(),
      };
      setFamily((prev) => [...prev, member]);
      pushToast('success', `${member.name} added to family.`);
      return { ok: true };
    },
    [paywall, family.length, pushToast, setFamily],
  );

  const removeFamilyMember = useCallback(
    (id: string) => {
      setFamily((prev) => prev.filter((m) => m.id !== id));
      setSubscriptions((prev) =>
        prev.map((s) => ({
          ...s,
          familyMemberIds: s.familyMemberIds.filter((fid) => fid !== id),
          shared: s.familyMemberIds.filter((fid) => fid !== id).length > 0,
        })),
      );
      pushToast('info', 'Family member removed.');
    },
    [pushToast, setFamily, setSubscriptions],
  );

  const upgradeTier = useCallback(
    (tier: SubscriptionTier) => {
      setProfile((prev) => ({ ...prev, tier }));
      const labels: Record<SubscriptionTier, string> = {
        free: 'Free',
        premium_monthly: 'Premium Monthly',
        premium_yearly: 'Premium Yearly',
        lifetime: 'Lifetime',
      };
      pushToast('success', `Upgraded to ${labels[tier]}. Enjoy SubTrack ${labels[tier]}!`);
    },
    [pushToast, setProfile],
  );

  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      setProfile((prev) => ({ ...prev, ...patch }));
    },
    [setProfile],
  );

  const resetData = useCallback(() => {
    resetSubs();
    resetFamily();
    resetProfile();
    pushToast('info', 'All data reset to defaults.');
  }, [resetSubs, resetFamily, resetProfile, pushToast]);

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      subscriptions,
      family,
      profile,
      monthly: analytics.monthly,
      annual: analytics.annual,
      categories: analytics.categories,
      forecast: analytics.forecast,
      alerts: analytics.alerts,
      activeCount: analytics.activeCount,
      sharedCount: analytics.sharedCount,
      hikesCount: analytics.hikesCount,
      paywall,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      toggleActive,
      addFamilyMember,
      removeFamilyMember,
      upgradeTier,
      updateProfile,
      resetData,
    }),
    [
      subscriptions,
      family,
      profile,
      analytics,
      paywall,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      toggleActive,
      addFamilyMember,
      removeFamilyMember,
      upgradeTier,
      updateProfile,
      resetData,
    ],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSubscriptions(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscriptions must be used within SubscriptionProvider');
  return ctx;
}
