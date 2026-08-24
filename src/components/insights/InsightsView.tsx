import { useMemo } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, CalendarClock } from 'lucide-react';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useBills } from '@/context/BillsContext';
import { useFinance } from '@/context/FinanceContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';

export function InsightsView() {
  const { subscriptions } = useSubscriptions();
  const { bills } = useBills();
  const { transactions } = useFinance();

  // ✅ Insight 1: Recurring Commitments
  const totalRecurring = useMemo(() => {
    const subs = subscriptions.filter(s => s.active).reduce((sum, s) => {
      if (s.billingCycle === 'yearly') return sum + s.cost / 12;
      if (s.billingCycle === 'weekly') return sum + s.cost * 4.33;
      return sum + s.cost;
    }, 0);
    const billTotal = bills.reduce((sum, b) => sum + b.amount, 0);
    return subs + billTotal;
  }, [subscriptions, bills]);

  // ✅ Insight 2: Upcoming Renewals
  const upcomingRenewals = useMemo(() => {
    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    return subscriptions.filter(s => {
      if (!s.nextRenewalDate) return false;
      const renewal = new Date(s.nextRenewalDate);
      return renewal >= now && renewal <= sevenDaysLater;
    });
  }, [subscriptions]);

  // ✅ Insight 3: Overdue Bills
  const overdueBills = useMemo(() => {
    return bills.filter(b => !b.paid && new Date(b.dueDate) < new Date());
  }, [bills]);

  // ✅ Insight 4: Total Yearly Spending
  const totalYearlySpending = useMemo(() => {
    const subsYearly = subscriptions.filter(s => s.active).reduce((sum, s) => {
      if (s.billingCycle === 'monthly') return sum + s.cost * 12;
      if (s.billingCycle === 'weekly') return sum + s.cost * 52;
      return sum + s.cost;
    }, 0);
    const billsYearly = bills.reduce((sum, b) => sum + b.amount * 12, 0);
    return subsYearly + billsYearly;
  }, [subscriptions, bills]);

  return (
    <div className="animate-fade-in space-y-4">
      <Header title="AI Insights" subtitle="Smart financial recommendations" icon={Sparkles} />

      {/* Hero Insight */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-glow">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <Sparkles className="w-6 h-6 text-white mb-2" />
          <p className="text-xs text-white/80">Your monthly recurring commitments</p>
          <p className="text-3xl font-bold text-white mt-1">${totalRecurring.toFixed(2)}</p>
          <p className="text-xs text-white/70 mt-2">
            This includes subscriptions and bills.
          </p>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="space-y-3">
        {/* Upcoming Renewals */}
        <GlassCard className="p-4 border-blue-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
              <CalendarClock className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">Renewals this week</p>
              <p className="text-xs text-content-secondary mt-1">
                {upcomingRenewals.length > 0 
                  ? `You have ${upcomingRenewals.length} subscription${upcomingRenewals.length > 1 ? 's' : ''} renewing soon (${upcomingRenewals.map(s => s.name).join(', ')}).`
                  : 'No subscriptions renewing this week. Great!'}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Overdue Bills */}
        <GlassCard className="p-4 border-red-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">Overdue bills</p>
              <p className="text-xs text-content-secondary mt-1">
                {overdueBills.length > 0 
                  ? `You have ${overdueBills.length} overdue bill${overdueBills.length > 1 ? 's' : ''}! Please pay them to avoid late fees.`
                  : 'You have no overdue bills. Excellent job!'}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Yearly Spending */}
        <GlassCard className="p-4 border-green-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">Yearly projection</p>
              <p className="text-xs text-content-secondary mt-1">
                Your projected yearly spending is <b className="text-content-primary">${totalYearlySpending.toFixed(2)}</b>.
                Consider reviewing subscriptions you don't use.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Positive Savings */}
        <GlassCard className="p-4 border-emerald-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">Good financial health</p>
              <p className="text-xs text-content-secondary mt-1">
                You have <b className="text-content-primary">{subscriptions.filter(s => s.active).length}</b> active subscriptions and <b className="text-content-primary">{bills.filter(b => !b.paid).length}</b> unpaid bills. Keep it up!
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}