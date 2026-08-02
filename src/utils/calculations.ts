import type { Subscription, FamilyMember, AppAlert } from '@/types';
import { daysUntil } from './dateHelpers';
import { categoryColor } from './constants';

export const WEEKS_PER_MONTH = 4.333;

export function normalizedMonthly(cost: number, cycle: 'weekly' | 'monthly' | 'yearly'): number {
  switch (cycle) {
    case 'weekly':
      return cost * WEEKS_PER_MONTH;
    case 'monthly':
      return cost;
    case 'yearly':
      return cost / 12;
  }
}

export function annualCost(cost: number, cycle: 'weekly' | 'monthly' | 'yearly'): number {
  return normalizedMonthly(cost, cycle) * 12;
}

export function totalMonthlySpend(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + normalizedMonthly(s.cost, s.billingCycle), 0);
}

export function totalAnnualSpend(subscriptions: Subscription[]): number {
  return totalMonthlySpend(subscriptions) * 12;
}

export function priceHikePercent(oldPrice: number, newPrice: number): number {
  if (oldPrice <= 0) return 0;
  return ((newPrice - oldPrice) / oldPrice) * 100;
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactCurrency(amount: number, currency = 'USD'): string {
  if (Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  }
  return formatCurrency(amount, currency);
}

export interface SharedSplit {
  totalMembers: number;
  yourShare: number;
  perMember: number;
}

export function sharedSplit(subscription: Subscription): SharedSplit {
  const totalMembers = subscription.familyMemberIds.length + 1;
  const monthly = normalizedMonthly(subscription.cost, subscription.billingCycle);
  const perMember = totalMembers > 0 ? monthly / totalMembers : monthly;
  return { totalMembers, yourShare: perMember, perMember };
}

export interface CategoryStat {
  category: string;
  monthly: number;
  count: number;
  color: string;
}

export function categoryBreakdown(subscriptions: Subscription[]): CategoryStat[] {
  const map = new Map<string, { monthly: number; count: number }>();
  for (const s of subscriptions) {
    if (!s.active) continue;
    const entry = map.get(s.category) ?? { monthly: 0, count: 0 };
    entry.monthly += normalizedMonthly(s.cost, s.billingCycle);
    entry.count += 1;
    map.set(s.category, entry);
  }
  return Array.from(map.entries())
    .map(([category, v]) => ({ category, monthly: v.monthly, count: v.count, color: categoryColor(category) }))
    .sort((a, b) => b.monthly - a.monthly);
}

export interface ForecastPoint {
  month: string;
  monthKey: string;
  amount: number;
}

export function monthlyForecast(subscriptions: Subscription[], months = 6): ForecastPoint[] {
  const now = new Date();
  const points: ForecastPoint[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    let amount = 0;
    for (const s of subscriptions) {
      if (!s.active) continue;
      const monthly = normalizedMonthly(s.cost, s.billingCycle);
      if (s.billingCycle === 'monthly' || s.billingCycle === 'weekly') {
        amount += monthly;
      } else {
        const renewal = new Date(s.nextRenewalDate);
        if (renewal.getFullYear() === d.getFullYear() && renewal.getMonth() === d.getMonth()) {
          amount += s.cost;
        } else {
          amount += monthly;
        }
      }
    }
    points.push({
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      monthKey,
      amount: Math.round(amount * 100) / 100,
    });
  }
  return points;
}

export function buildAlerts(subscriptions: Subscription[], reminderDays: number): AppAlert[] {
  const alerts: AppAlert[] = [];
  for (const s of subscriptions) {
    if (!s.active) continue;
    const days = daysUntil(s.nextRenewalDate);
    if (days <= reminderDays) {
      alerts.push({
        id: `renewal-${s.id}`,
        kind: 'renewal',
        subscriptionId: s.id,
        subscriptionName: s.name,
        title: 'Upcoming renewal',
        message:
          days < 0
            ? `${s.name} renewed ${Math.abs(days)} day(s) ago — review the charge.`
            : days === 0
              ? `${s.name} renews today.`
              : `${s.name} renews in ${days} day(s).`,
        date: s.nextRenewalDate,
        read: false,
      });
    }
    if (s.priceHistory.length > 0) {
      const latest = s.priceHistory[s.priceHistory.length - 1];
      const pct = priceHikePercent(latest.oldPrice, latest.newPrice);
      if (pct > 0) {
        alerts.push({
          id: `hike-${s.id}-${latest.id}`,
          kind: 'price_hike',
          subscriptionId: s.id,
          subscriptionName: s.name,
          title: 'Price hike detected',
          message: `${s.name} increased by ${pct.toFixed(1)}% (${formatCurrency(latest.oldPrice)} → ${formatCurrency(latest.newPrice)}).`,
          date: latest.changedAt,
          percentIncrease: pct,
          read: false,
        });
      }
    }
  }
  return alerts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function isDuplicate(
  subscriptions: Subscription[],
  name: string,
  category: string,
  excludeId?: string,
): boolean {
  const norm = name.trim().toLowerCase();
  return subscriptions.some(
    (s) =>
      s.id !== excludeId &&
      s.active &&
      s.name.trim().toLowerCase() === norm &&
      s.category === category,
  );
}
