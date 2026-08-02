import type { SubscriptionTier } from '@/types';

export const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'subtrack.subscriptions',
  FAMILY: 'subtrack.family',
  PROFILE: 'subtrack.profile',
  ALERTS_READ: 'subtrack.alerts.read',
} as const;

export const FREE_TIER_LIMIT = 3;

export interface CategoryDef {
  name: string;
  color: string;
  icon: string;
}

export const CATEGORIES: CategoryDef[] = [
  { name: 'Entertainment', color: '#a855f7', icon: 'Clapperboard' },
  { name: 'Music', color: '#22d3ee', icon: 'Music' },
  { name: 'Productivity', color: '#3b82f6', icon: 'Briefcase' },
  { name: 'Storage', color: '#22c55e', icon: 'HardDrive' },
  { name: 'Shopping', color: '#f59e0b', icon: 'ShoppingBag' },
  { name: 'News', color: '#ef4444', icon: 'Newspaper' },
  { name: 'Health', color: '#10b981', icon: 'HeartPulse' },
  { name: 'Education', color: '#f97316', icon: 'GraduationCap' },
  { name: 'Gaming', color: '#ec4899', icon: 'Gamepad2' },
  { name: 'Other', color: '#94a3b8', icon: 'Boxes' },
];

export const CATEGORY_MAP: Record<string, CategoryDef> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.name]: c }),
  {} as Record<string, CategoryDef>,
);

export function categoryColor(name: string): string {
  return CATEGORY_MAP[name]?.color ?? '#94a3b8';
}

export const BILLING_CYCLES = ['weekly', 'monthly', 'yearly'] as const;

export const BILLING_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export interface PlanDef {
  id: SubscriptionTier;
  name: string;
  price: string;
  cadence: string;
  badge?: string;
  features: string[];
  highlight?: boolean;
  accent: string;
}

export const PLANS: PlanDef[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    accent: '#6c6c8a',
    features: ['Up to 3 subscriptions', '1-day renewal alerts', 'Standard categories', 'Local storage'],
  },
  {
    id: 'premium_monthly',
    name: 'Premium',
    price: '$3.99',
    cadence: '/month',
    accent: '#3b82f6',
    features: ['Unlimited subscriptions', 'Family sharing', 'Custom reminders', 'Price-hike tracker', 'Cloud sync & export'],
  },
  {
    id: 'premium_yearly',
    name: 'Premium',
    price: '$29.99',
    cadence: '/year',
    badge: 'Save 37%',
    accent: '#22d3ee',
    features: ['Everything in Monthly', 'Save 37% vs monthly', 'Advanced analytics', 'Priority support'],
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$49.99',
    cadence: 'one-time',
    badge: 'Most Popular',
    highlight: true,
    accent: '#a855f7',
    features: ['All Premium features', 'Unlimited everything', 'Webhook + email alerts', 'Lifetime updates', 'No recurring fees'],
  },
];

export const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Free',
  premium_monthly: 'Premium',
  premium_yearly: 'Premium',
  lifetime: 'Lifetime',
};

export const RELATIONSHIPS = ['Partner', 'Spouse', 'Child', 'Sibling', 'Parent', 'Friend', 'Roommate', 'Other'];

export const AVATAR_COLORS = [
  '#a855f7',
  '#3b82f6',
  '#22d3ee',
  '#22c55e',
  '#f59e0b',
  '#ec4899',
  '#f97316',
  '#10b981',
];
