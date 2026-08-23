import { useMemo, useState } from 'react';
import { Wallet, AlertTriangle, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useBills } from '@/context/BillsContext';
import { useFinance } from '@/context/FinanceContext';
import { useBudget } from '@/context/BudgetContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';

export function BudgetView() {
  const { t } = useTranslation();
  const { monthly } = useSubscriptions();
  const { bills } = useBills();
  const { transactions } = useFinance();
  const { monthlyBudget, setMonthlyBudget } = useBudget();
  const [newBudget, setNewBudget] = useState(monthlyBudget.toString());

  const totalBills = useMemo(() => bills.reduce((sum, b) => sum + b.amount, 0), [bills]);
  const totalExpenses = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const totalSpent = monthly + totalBills + totalExpenses;
  const remaining = monthlyBudget - totalSpent;
  const percentUsed = monthlyBudget > 0 ? Math.min((totalSpent / monthlyBudget) * 100, 100) : 0;
  const isOverBudget = totalSpent > monthlyBudget;

  const handleSaveBudget = () => setMonthlyBudget(parseFloat(newBudget) || 0);

  return (
    <div className="animate-fade-in space-y-4">
      <Header title={t('budget')} subtitle={`${t('remaining')}: $${remaining.toFixed(2)}`} icon={Target} />

      <GlassCard className="p-4">
        <p className="text-sm font-semibold text-content-primary">{t('monthlyBudget')}</p>
        <div className="flex gap-2 mt-2">
          <input type="number" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} className="glass-input flex-1 px-3 py-2 text-sm" />
          <button onClick={handleSaveBudget} className="btn-primary px-4 py-2 text-sm">{t('save')}</button>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold">{t('currentSpending')}</h3>
          <span className={`text-xs ${isOverBudget ? 'text-danger' : 'text-emerald-400'}`}>
            {isOverBudget ? t('overBudget') : t('onTrack')}
          </span>
        </div>
        <p className="text-3xl font-bold">${totalSpent.toFixed(2)}</p>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-4">
          <div className={`h-2 rounded-full ${isOverBudget ? 'bg-danger' : percentUsed > 80 ? 'bg-warning' : 'bg-emerald-500'}`} style={{ width: `${percentUsed}%` }} />
        </div>
        <p className="text-[11px] text-content-muted mt-1">{percentUsed.toFixed(0)}% {t('remaining') || 'used'}</p>
      </GlassCard>
    </div>
  );
}