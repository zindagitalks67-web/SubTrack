import { useMemo } from 'react';
import { Sparkles, AlertTriangle, TrendingUp, DollarSign, CalendarClock, PiggyBank } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useBills } from '@/context/BillsContext';
import { useFinance } from '@/context/FinanceContext';
import { useBudget } from '@/context/BudgetContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';
import { daysUntil } from '@/utils/dateHelpers';

export function InsightsView() {
  const { t } = useTranslation();
  const { subscriptions } = useSubscriptions();
  const { bills } = useBills();
  const { transactions } = useFinance();
  const { monthlyBudget } = useBudget();

  const insights = useMemo(() => {
    const list: { id: string; icon: any; type: string; title: string; message: string }[] = [];
    const activeSubs = subscriptions.filter(s => s.active);
    const totalSubsCost = activeSubs.reduce((sum, s) => sum + s.cost, 0);
    const renewSoonCount = activeSubs.filter(s => s.nextRenewalDate && daysUntil(s.nextRenewalDate) <= 7).length;

    if (activeSubs.length > 0) 
      list.push({ id: 'subs', icon: DollarSign, type: 'info', title: t('subscriptions'), message: `${activeSubs.length} active - $${totalSubsCost.toFixed(2)}/mo` });
    if (renewSoonCount > 0) 
      list.push({ id: 'renew', icon: CalendarClock, type: 'warning', title: t('renewals'), message: `${renewSoonCount} renewing soon` });

    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalSpent = totalSubsCost + bills.reduce((sum, b) => sum + b.amount, 0) + totalExpenses;
    const remaining = monthlyBudget - totalSpent;

    if (remaining < 0) 
      list.push({ id: 'over', icon: AlertTriangle, type: 'warning', title: t('overBudget'), message: `$${Math.abs(remaining).toFixed(2)} over` });
    else 
      list.push({ id: 'left', icon: PiggyBank, type: 'success', title: t('remaining'), message: `$${remaining.toFixed(2)} left` });

    return list;
  }, [subscriptions, bills, transactions, monthlyBudget, t]);

  return (
    <div className="animate-fade-in space-y-4">
      <Header title={t('insights')} subtitle={t('aiAnalysis')} icon={Sparkles} />
      {insights.length === 0 ? (
        <GlassCard className="p-6 text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-2" />
          <p>{t('noInsights')}</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => (
            <GlassCard key={insight.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${insight.type === 'warning' ? 'bg-warning/15 text-warning' : insight.type === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-brand-blue/15 text-brand-blue'}`}>
                  <insight.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{insight.title}</p>
                  <p className="text-xs text-content-secondary">{insight.message}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}