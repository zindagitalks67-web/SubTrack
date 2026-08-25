import { useState } from 'react';
import { Target, Wallet, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useBudget } from '@/context/BudgetContext';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useBills } from '@/context/BillsContext';
import { useFinance } from '@/context/FinanceContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';
import { useLanguage } from '@/context/LanguageContext';

export function BudgetView() {
  const { t } = useLanguage();
  const { monthlyBudget, updateBudget } = useBudget();
  const { subscriptions } = useSubscriptions();
  const { bills } = useBills();
  const { totalExpenses } = useFinance();
  const [editMode, setEditMode] = useState(false);
  const [newBudget, setNewBudget] = useState(monthlyBudget.toString());

  const totalSpent = subscriptions.filter(s => s.active).reduce((sum, s) => sum + (s.cost || 0), 0) + bills.reduce((sum, b) => sum + (b.amount || 0), 0) + totalExpenses;
  const remaining = monthlyBudget - totalSpent;
  const percentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  const handleSave = () => {
    const amount = parseFloat(newBudget) || 0;
    updateBudget(amount);
    setEditMode(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <Header title={t('budget')} subtitle={t('budgetSub')} icon={Target} />
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Wallet className="w-4 h-4" /> {t('monthlyBudget')}</h3>
          <button onClick={() => setEditMode(!editMode)} className="text-xs">✏️</button>
        </div>
        {editMode ? (
          <div className="flex gap-2">
            <input type="number" className="glass-input flex-1 px-3 py-2 text-lg font-bold" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} />
            <button onClick={handleSave} className="btn-primary px-4 py-2 text-sm">{t('save')}</button>
          </div>
        ) : <p className="text-3xl font-bold">${monthlyBudget.toFixed(2)}</p>}
      </GlassCard>

      <GlassCard>
        <div className="mb-2 flex justify-between text-sm">
          <span>{t('spentLabel')}</span>
          <span className="font-semibold">${totalSpent.toFixed(2)}</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${percentage > 100 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs">
          <span>{percentage.toFixed(0)}% {t('percentUsed')}</span>
          <span>${remaining < 0 ? 0 : remaining.toFixed(2)} {t('remainingLabel')}</span>
        </div>
      </GlassCard>

      {remaining < 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-500">{t('budgetExceeded')} ${Math.abs(remaining).toFixed(2)}!</p>
        </div>
      )}
      {remaining >= 0 && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-sm text-emerald-500">{t('budgetGood')}</p>
        </div>
      )}
    </div>
  );
}