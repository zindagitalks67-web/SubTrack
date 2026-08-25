import { useMemo } from 'react';
import { TrendingUp, Wallet, CalendarClock, AlertTriangle } from 'lucide-react';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useBills } from '@/context/BillsContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';
import { useLanguage } from '@/context/LanguageContext';

export function RecurringView() {
  const { t } = useLanguage();
  const { subscriptions } = useSubscriptions();
  const { bills } = useBills();

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

  const totalMonthlyRecurring = recurringItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalYearlyRecurring = (totalMonthlyRecurring || 0) * 12;

  const upcomingRecurring = useMemo(() => {
    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    return subscriptions.filter(s => s.active && s.nextRenewalDate).filter(s => {
      const renewal = new Date(s.nextRenewalDate!);
      return renewal >= now && renewal <= sevenDaysLater;
    });
  }, [subscriptions]);

  return (
    <div className="animate-fade-in space-y-4">
      <Header title={t('recurringPayments')} subtitle={t('fixedCommitments')} icon={TrendingUp} />
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-glow">
        <div className="relative">
          <p className="text-xs text-white/70">{t('monthlyRecurring')}</p>
          <p className="text-4xl font-bold text-white mt-1">${(totalMonthlyRecurring || 0).toFixed(2)}</p>
          <p className="text-xs text-white/60 mt-2">{t('yearlyRecurring')}: ${(totalYearlyRecurring || 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-2">
        {recurringItems.length === 0 ? <p className="text-center text-sm py-4">{t('noRecurringFound')}</p> : recurringItems.map((item, idx) => (
          <GlassCard key={idx} className="p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.icon === 'sub' ? 'bg-purple-500/15 text-purple-500' : 'bg-orange-500/15 text-orange-500'}`}>
              {item.icon === 'sub' ? <Wallet className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-[10px] capitalize">{item.frequency}</p>
            </div>
            <p className="text-sm font-bold">{item.currency} {item.amount.toFixed(2)}</p>
          </GlassCard>
        ))}
      </div>

      {upcomingRecurring.length > 0 && (
        <GlassCard className="border-amber-500/20 p-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{t('renewalsThisWeek')}</p>
              <p className="text-xs mt-1">{upcomingRecurring.map(s => s.name).join(', ')}</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}