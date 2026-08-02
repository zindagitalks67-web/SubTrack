import { useSubscriptions } from '@/context/SubscriptionContext';
import { GlassCard } from '@/components/common/GlassCard';
import { formatCurrency } from '@/utils/calculations';
import { PieChart } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: 'bg-purple-500',
  Music: 'bg-pink-500',
  Productivity: 'bg-blue-500',
  Storage: 'bg-cyan-500',
  Gaming: 'bg-emerald-500',
  Utilities: 'bg-amber-500',
  Other: 'bg-slate-500',
};

export function SpendingBreakdown() {
  const { subscriptions, profile } = useSubscriptions();

  // Calculate total monthly spend per category
  const categoryTotals = subscriptions
    .filter((s) => s.active)
    .reduce((acc, sub) => {
      const cat = sub.category || 'Other';
      const monthlyCost = sub.billingCycle === 'yearly' ? sub.cost / 12 : sub.cost;
      acc[cat] = (acc[cat] || 0) + monthlyCost;
      return acc;
    }, {} as Record<string, number>);

  const totalMonthly = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);

  if (subscriptions.length === 0) return null;

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-4 h-4 text-brand-purple" />
        <h3 className="font-semibold text-content-primary text-sm">Category Breakdown</h3>
      </div>

      <div className="space-y-3">
        {sortedCategories.map(([category, amount]) => {
          const percentage = totalMonthly > 0 ? Math.round((amount / totalMonthly) * 100) : 0;
          const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;

          return (
            <div key={category} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-content-primary font-medium">{category}</span>
                <span className="text-content-secondary font-mono">
                  {formatCurrency(amount, profile.currency)}/mo ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${colorClass} transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}