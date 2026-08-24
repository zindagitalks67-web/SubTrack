import { useState } from 'react';
import { Target, Wallet, TrendingUp, CheckCircle2, AlertTriangle, Pencil } from 'lucide-react';
import { useBudget } from '@/context/BudgetContext';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useBills } from '@/context/BillsContext';
import { useFinance } from '@/context/FinanceContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';

export function BudgetView() {
  const { monthlyBudget, updateBudget } = useBudget();
  const { subscriptions } = useSubscriptions();
  const { bills } = useBills();
  const { transactions } = useFinance();

  const [editMode, setEditMode] = useState(false);
  const [newBudget, setNewBudget] = useState(monthlyBudget.toString());

  // ✅ Calculate Total Monthly Spent from all contexts
  const totalSubsMonthly = subscriptions.filter(s => s.active).reduce((sum, s) => {
    if (s.billingCycle === 'yearly') return sum + s.cost / 12;
    if (s.billingCycle === 'weekly') return sum + s.cost * 4.33;
    return sum + s.cost;
  }, 0);

  const totalBillsMonthly = bills.reduce((sum, b) => sum + b.amount, 0);

  const totalExpensesMonthly = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = totalSubsMonthly + totalBillsMonthly + totalExpensesMonthly;

  const remaining = monthlyBudget - totalSpent;
  const percentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const isOverLimit = remaining < 0;
  const isWarning = percentage >= 80 && percentage < 100;

  const handleSaveBudget = async () => {
    const amount = parseFloat(newBudget) || 0;
    await updateBudget(amount);
    setEditMode(false);
  };

  const currency = 'USD'; // Aap currency dynamic bana sakte ho profile se, abhi hardcode kiya hai

  return (
    <div className="animate-fade-in space-y-4">
      <Header title="Budget" subtitle="Track your monthly spending goal" icon={Target} />

      {/* Budget Setting Card */}
      <GlassCard>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-content-primary text-sm flex items-center gap-2">
            <Wallet className="w-4 h-4 text-brand-blue" /> Monthly Budget
          </h3>
          <button onClick={() => setEditMode(!editMode)} className="p-2 hover:bg-white/10 rounded-lg text-content-secondary">
            {editMode ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Pencil className="w-4 h-4" />}
          </button>
        </div>
        {editMode ? (
          <div className="flex gap-2">
            <input
              type="number"
              className="glass-input flex-1 px-3 py-2 text-lg font-bold"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
            />
            <button onClick={handleSaveBudget} className="btn-primary px-4 py-2 text-sm">Save</button>
          </div>
        ) : (
          <p className="text-3xl font-bold text-content-primary">{currency} {monthlyBudget.toFixed(2)}</p>
        )}
      </GlassCard>

      {/* Progress Bar */}
      <GlassCard>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-content-secondary">Spent</span>
          <span className="font-semibold text-content-primary">{currency} {totalSpent.toFixed(2)}</span>
        </div>
        <div className="h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverLimit ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-content-muted">
          <span>{percentage.toFixed(0)}% used</span>
          <span>{currency} {remaining < 0 ? 0 : remaining.toFixed(2)} remaining</span>
        </div>
      </GlassCard>

      {/* Alerts */}
      {isOverLimit && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-500 font-medium">
            You have exceeded your monthly budget by {currency} {Math.abs(remaining).toFixed(2)}!
          </p>
        </div>
      )}
      {isWarning && !isOverLimit && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-500 font-medium">
            Warning! You have used {percentage.toFixed(0)}% of your budget.
          </p>
        </div>
      )}
      {!isWarning && !isOverLimit && monthlyBudget > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-sm text-emerald-500 font-medium">
            Great job! You are within your budget.
          </p>
        </div>
      )}
    </div>
  );
}