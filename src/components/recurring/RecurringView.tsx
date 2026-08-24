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
  const { transactions } = useFinance(); // (Optional, agar use karna ho)

  // ✅ Recurring Payments (Subscriptions + Bills)
  const recurringItems = useMemo(() => {
    const items: { name: string; amount: number; currency: string; frequency: string; icon: string }[] = [];

    subscriptions.filter(s => s.active).forEach(s => {
      const cost = s.billingCycle === 'yearly' ? s.cost / 12 : s.billingCycle === 'weekly' ? s.cost * 4.33 : s.cost;
      items.push({
        name: s.name,
        amount: cost,
        currency: s.currency,
        frequency: s.billingCycle,
        icon: 'sub'
      });
    });

    bills.filter(b => !b.paid).forEach(b => {
      items.push({
        name: b.name,
        amount: b.amount,
        currency: b.currency,
        frequency: 'monthly',
        icon: 'bill'
      });
    });

    return items;
  }, [subscriptions, bills]);

  // ✅ Total Monthly Recurring
  const totalMonthlyRecurring = recurringItems.reduce((sum, item) => sum + item.amount, 0);
  const totalYearlyRecurring = totalMonthlyRecurring * 12;

  // ✅ Upcoming Recurring (within next 7 days)
  const upcomingRecurring = useMemo(() => {
    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    
    return subscriptions
      .filter(s => s.active && s.nextRenewalDate) // Filter null
      .filter(s => {
        const renewal = new Date(s.nextRenewalDate!); // ✅ Non-null assertion
        return renewal >= now && renewal <= sevenDaysLater;
      });
  }, [subscriptions]);

  return (
    <div className="animate-fade-in space-y-4">
      <Header title="Recurring Payments" subtitle="Your fixed financial commitments" icon={TrendingUp} />

      {/* Total Monthly & Yearly */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-glow">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <p className="text-xs text-white/70 font-medium uppercase tracking-wide">Monthly Recurring</p>
          <p className="text-4xl font-bold text-white mt-1">${totalMonthlyRecurring.toFixed(2)}</p>
          <p className="text-xs text-white/60 mt-2">Yearly: ${totalYearlyRecurring.toFixed(2)}</p>
        </div>
      </div>

      {/* List of Recurring Items */}
      <div className="space-y-2">
        {recurringItems.map((item, idx) => (
          <GlassCard key={idx} className="p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.icon === 'sub' ? 'bg-purple-500/15 text-purple-500' : 'bg-orange-500/15 text-orange-500'}`}>
              {item.icon === 'sub' ? <Wallet className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-content-primary truncate">{item.name}</p>
              <p className="text-[10px] text-content-muted capitalize">{item.frequency}</p>
            </div>
            <p className="text-sm font-bold text-content-primary">
              {item.currency} {item.amount.toFixed(2)}
            </p>
          </GlassCard>
        ))}
        {recurringItems.length === 0 && (
          <p className="text-center text-sm text-content-muted py-4">No recurring payments found.</p>
        )}
      </div>

      {/* Upcoming Renewals Alert */}
      {upcomingRecurring.length > 0 && (
        <GlassCard className="border-amber-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-content-primary">Renewals this week</p>
              <p className="text-xs text-content-secondary mt-1">
                You have {upcomingRecurring.length} subscription(s) renewing soon: {upcomingRecurring.map(s => s.name).join(', ')}.
              </p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}