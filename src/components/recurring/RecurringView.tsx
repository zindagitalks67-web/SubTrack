import { useMemo } from 'react';
import { TrendingUp, Wallet, CalendarClock, AlertTriangle } from 'lucide-react';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useBills } from '@/context/BillsContext';
import { useFinance } from '@/context/FinanceContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';

export function RecurringView() {
  const { subscriptions } = useSubscriptions();
  const { bills } = useBills();
  const { transactions } = useFinance();

  const recurringItems = useMemo(() => {
    const items: { name: string; amount: number; currency: string; frequency: string; icon: string }[] = [];
    subscriptions.filter(s => s.active).forEach(s => {
      const cost = s.billingCycle === 'yearly' ? (s.cost || 0) / 12 : s.billingCycle === 'weekly' ? (s.cost || 0) * 4.33 : (s.cost || 0);
      items.push({ name: s.name, amount: cost, currency: s.currency, frequency: s.billingCycle, icon: 'sub' });
    });
    bills.filter(b => !b.paid).forEach(b => {
      items.push({ name: b.name, amount: b.amount || 0, currency: b.currency, frequency: 'monthly', icon: 'bill' });
    });
    return items;
  }, [subscriptions, bills]);

  const totalMonthlyRecurring = useMemo(() => recurringItems.reduce((sum, item) => sum + (item.amount || 0), 0), [recurringItems]); // ✅ Safe
  const totalYearlyRecurring = (totalMonthlyRecurring || 0) * 12;

  const upcomingRecurring = useMemo(() => {
    const now = new Date(); const sevenDaysLater = new Date(now); sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    return subscriptions.filter(s => s.active && s.nextRenewalDate).filter(s => {
      const renewal = new Date(s.nextRenewalDate!);
      return renewal >= now && renewal <= sevenDaysLater;
    });
  }, [subscriptions]);

  return (
    <div className="animate-fade-in space-y-4">
      <Header title="Recurring Payments" subtitle="Your fixed financial commitments" icon={TrendingUp} />
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-glow">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <p className="text-xs text-white/70 font-medium uppercase tracking-wide">Monthly Recurring</p>
          <p className="text-4xl font-bold text-white mt-1">${(totalMonthlyRecurring || 0).toFixed(2)}</p> {/* ✅ Safe */}
          <p className="text-xs text-white/60 mt-2">Yearly: ${(totalYearlyRecurring || 0).toFixed(2)}</p> {/* ✅ Safe */}
        </div>
      </div>
      {/* ... baaki render same ... */}
    </div>
  );
}