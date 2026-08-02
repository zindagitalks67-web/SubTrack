import { useMemo } from 'react';
import type { Subscription, AppAlert } from '@/types';
import {
  totalMonthlySpend,
  totalAnnualSpend,
  categoryBreakdown,
  monthlyForecast,
  buildAlerts,
} from '@/utils/calculations';

export function useAnalytics(subscriptions: Subscription[], reminderDays: number) {
  const monthly = useMemo(() => totalMonthlySpend(subscriptions), [subscriptions]);
  const annual = useMemo(() => totalAnnualSpend(subscriptions), [subscriptions]);
  const categories = useMemo(() => categoryBreakdown(subscriptions), [subscriptions]);
  const forecast = useMemo(() => monthlyForecast(subscriptions, 6), [subscriptions]);
  const alerts: AppAlert[] = useMemo(
    () => buildAlerts(subscriptions, reminderDays),
    [subscriptions, reminderDays],
  );

  const activeCount = useMemo(() => subscriptions.filter((s) => s.active).length, [subscriptions]);
  const sharedCount = useMemo(() => subscriptions.filter((s) => s.active && s.shared).length, [subscriptions]);
  const hikesCount = useMemo(
    () => subscriptions.filter((s) => s.priceHistory.some((h) => h.newPrice > h.oldPrice)).length,
    [subscriptions],
  );

  return {
    monthly,
    annual,
    categories,
    forecast,
    alerts,
    activeCount,
    sharedCount,
    hikesCount,
  };
}
