import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Wallet } from 'lucide-react';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useBills } from '@/context/BillsContext';
import { useFinance } from '@/context/FinanceContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';
import { useLanguage } from '@/context/LanguageContext';

export function AnalyticsView() {
  const { t } = useLanguage();
  const { subscriptions } = useSubscriptions();
  const { bills } = useBills();
  const { totalExpenses, totalIncome } = useFinance();

  const totalSubsMonthly = subscriptions.filter(s => s.active).reduce((sum, s) => sum + (s.cost || 0), 0);
  const totalBillsMonthly = bills.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalSpend = totalSubsMonthly + totalBillsMonthly + totalExpenses;
  const savings = totalIncome - totalSpend;

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    subscriptions.filter(s => s.active).forEach(s => map.set(s.category, (map.get(s.category) || 0) + (s.cost || 0)));
    bills.forEach(b => map.set(b.category, (map.get(b.category) || 0) + (b.amount || 0)));
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
    return Array.from(map.entries()).map(([category, value], index) => ({ category, value, color: colors[index % colors.length] }));
  }, [subscriptions, bills]);

  return (
    <div className="animate-fade-in space-y-4">
      <Header title={t('analytics')} subtitle={t('financialOverview')} icon={TrendingUp} />
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4">
          <p className="text-xs">{t('monthlySpend')}</p>
          <p className="text-xl font-bold">${totalSpend.toFixed(2)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs">{t('monthlyIncome')}</p>
          <p className="text-xl font-bold text-emerald-500">${totalIncome.toFixed(2)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs">{t('activeSubs')}</p>
          <p className="text-xl font-bold">{subscriptions.filter(s => s.active).length}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs">{t('unpaidBills')}</p>
          <p className="text-xl font-bold">{bills.filter(b => !b.paid).length}</p>
        </GlassCard>
      </div>

      <GlassCard className="p-4">
        <p className="text-sm font-semibold mb-2">{t('monthlySavings')}</p>
        <p className={`text-2xl font-bold ${savings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>${savings.toFixed(2)}</p>
        <p className="text-xs mt-1">{savings >= 0 ? t('savingMoney') : t('spendingMore')}</p>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm font-semibold mb-3">{t('spendingByCategory')}</h3>
        {categoryData.length > 0 ? (
          <div className="flex items-center gap-4">
            <div className="relative w-32 h-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="category" innerRadius={40} outerRadius={60} paddingAngle={2} stroke="none">
                    {categoryData.map((c) => <Cell key={c.category} fill={c.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px]">{t('totalLabel')}</span>
                <span className="text-sm font-bold">${totalSpend.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5 min-w-0">
              {categoryData.slice(0, 5).map((c) => (
                <div key={c.category} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="truncate flex-1">{c.category}</span>
                  <span className="font-medium">${c.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : <p className="text-sm py-4 text-center">{t('noData')}</p>}
      </GlassCard>
    </div>
  );
}