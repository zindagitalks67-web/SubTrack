import { useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useBills } from '@/context/BillsContext';
import { useFinance } from '@/context/FinanceContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';

export function AnalyticsView() {
  const { t } = useTranslation();
  const { monthly, categories } = useSubscriptions();
  const { bills } = useBills();
  const { transactions } = useFinance();

  const totalBillAmount = useMemo(() => bills.reduce((sum, b) => sum + b.amount, 0), [bills]);
  const totalExpenses = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  
  const totalSpending = monthly + totalBillAmount + totalExpenses;
  const savings = totalIncome - totalSpending;

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    categories.forEach(c => map.set(c.category, (map.get(c.category) || 0) + c.monthly));
    bills.forEach(b => map.set(b.category, (map.get(b.category) || 0) + b.amount));
    transactions.filter(t => t.type === 'expense').forEach(t => map.set(t.category, (map.get(t.category) || 0) + t.amount));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [categories, bills, transactions]);

  const trendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      const isCurrent = i === 0;
      data.push({ month: monthName, expense: isCurrent ? totalSpending : 0, income: isCurrent ? totalIncome : 0 });
    }
    return data;
  }, [totalSpending, totalIncome]);

  return (
    <div className="animate-fade-in space-y-4">
      <Header title={t('analytics')} subtitle={t('incomeVsExpense')} icon={BarChart3} />

      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">{t('income')}</span>
          </div>
          <p className="text-2xl font-bold text-content-primary">${totalIncome.toFixed(2)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-danger mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-medium">{t('expenses')}</span>
          </div>
          <p className="text-2xl font-bold text-content-primary">${totalSpending.toFixed(2)}</p>
        </GlassCard>
      </div>

      <GlassCard className="p-4 border-brand-purple/30 bg-brand-gradient-soft">
        <div className="flex items-center gap-2 mb-1">
          <PiggyBank className="w-4 h-4 text-brand-purple" />
          <span className="text-xs font-medium text-content-secondary">{t('netSavings')}</span>
        </div>
        <p className={`text-3xl font-bold ${savings >= 0 ? 'text-emerald-400' : 'text-danger'}`}>${savings.toFixed(2)}</p>
      </GlassCard>

      {categoryData.length > 0 && (
        <GlassCard>
          <h3 className="font-semibold text-content-primary text-sm mb-3">{t('categoryBreakdown')}</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-36 h-36 shrink-0">
              <div className="w-36 h-36 rounded-full border-4 border-brand-purple/30 flex items-center justify-center">
                <span className="text-sm font-bold text-content-primary">${totalSpending.toFixed(0)}</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {categoryData.slice(0, 5).map((c, i) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ['#3b82f6', '#22d3ee', '#ef4444', '#a855f7', '#f59e0b'][i % 5] }} />
                  <span className="text-content-secondary flex-1 truncate">{c.name}</span>
                  <span className="text-content-primary font-medium">${c.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <h3 className="font-semibold text-content-primary text-sm mb-3">{t('forecast')}</h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {trendData.map((f, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center h-full">
                <div className="w-full max-w-[34px] rounded-t-lg bg-gradient-to-t from-brand-blue/40 to-brand-purple/80" style={{ height: `${Math.max((f.expense / 100) * 100, 6)}%` }} />
              </div>
              <span className="text-[10px] text-content-muted">{f.month}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}