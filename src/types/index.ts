export type BillingCycle = 'weekly' | 'monthly' | 'yearly';

export type SubscriptionTier = 'free' | 'premium_monthly' | 'premium_yearly' | 'lifetime';

export type AlertKind = 'renewal' | 'price_hike';

export type ViewKey = 'dashboard' | 'subscriptions' | 'alerts' | 'family' | 'settings';

export interface PriceHistoryEntry {
  id: string;
  oldPrice: number;
  newPrice: number;
  changedAt: string;
}

export interface Subscription {
  id: string;
  name: string;
  category: string;
  cost: number;
  billingCycle: BillingCycle;
  startDate: string;
  nextRenewalDate: string;
  active: boolean;
  shared: boolean;
  familyMemberIds: string[];
  priceHistory: PriceHistoryEntry[];
  notes?: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  email?: string;
  relationship?: string;
  avatarColor: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  tier: SubscriptionTier;
  reminderDays: number;
  currency: string;
}

export interface AppAlert {
  id: string;
  kind: AlertKind;
  subscriptionId: string;
  subscriptionName: string;
  title: string;
  message: string;
  date: string;
  percentIncrease?: number;
  read: boolean;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface CategoryStat {
  category: string;
  monthly: number;
  count: number;
  color: string;
}

export interface ForecastPoint {
  month: string;
  monthKey: string;
  amount: number;
}
export interface SharedMember {
  id: string;
  name: string;
  email?: string;
  amount: number;
  hasPaid: boolean;
}

// In your existing Subscription interface, ensure these fields are supported:
// sharedWith?: SharedMember[];
// isShared?: boolean;