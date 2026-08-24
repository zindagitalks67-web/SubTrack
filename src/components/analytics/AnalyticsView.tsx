import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Wallet, Calendar, CreditCard, DollarSign } from 'lucide-react';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useBills } from '@/context/BillsContext';
import { useFinance } from '@/context/FinanceContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';

export function AnalyticsView() {
  const { subscriptions } = useSubscriptions();
  const { bills } = useBills();
  const { transactions } = useFinance();

  // ✅ Summary Calculations
  const totalMonthlySubs = useMemo(() => {
    return subscriptions.filter(s => s.active).reduce((sum, s) => {
      if (s.billingCycle === 'yearly') return sum + s.cost / 12;
      if (s.billingCycle === 'weekly') return sum + s.cost * 4.33;
      return sum + s.cost;
    }, 0);
  }, [subscriptions]);

  const totalMonthlyBills = useMemo(() => {
    return bills.reduce((sum, b) => sum + b.amount, 0);
  }, [bills]);

  const totalMonthlyExpenses = useMemo(() => {
    return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalMonthlyIncome = useMemo(() => {
    return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // ✅ Category Breakdown (Subscriptions + Bills)
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    
    subscriptions.filter(s => s.active).forEach(s => {
      map.set(s.category, (map.get(s.category) || 0) + s.cost);
    });
    
    bills.forEach(b => {
      map.set(b.category, (map.get(b.category) || 0) + b.amount);
    });

    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
    return Array.from(map.entries()).map(([category, value], index) => ({
      category,
      value,
      color: colors[index % colors.length],
    }));
  }, [subscriptions, bills]);

  // ✅ Monthly Comparison (Mock logic for now)
  const savings = totalMonthlyIncome - totalMonthlyExpenses;

  return (
    <div className="animate-fade-in space-y-4">
      <Header title="Analytics" subtitle="Your financial overview" icon={TrendingUp} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4">
          <p className="text-xs text-content-secondary">Monthly Spend</p>
          <p className="text-xl font-bold text-content-primary">${(totalMonthlySubs + totalMonthlyBills + totalMonthlyExpenses).toFixed(2)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-content-secondary">Monthly Income</p>
          <p className="text-xl font-bold text-emerald-500">${totalMonthlyIncome.toFixed(2)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-content-secondary">Active Subs</p>
          <p className="text-xl font-bold text-blue-500">{subscriptions.filter(s => s.active).length}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-content-secondary">Unpaid Bills</p>
          <p className="text-xl font-bold text-orange-500">{bills.filter(b => !b.paid).length}</p>
        </GlassCard>
      </div>

      {/* Savings Status */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-brand-purple" />
          <h3 className="text-sm font-semibold">Monthly Savings</h3>
        </div>
        <p className={`text-2xl font-bold ${savings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          ${savings.toFixed(2)}
        </p>
        <p className="text-xs text-content-secondary mt-1">
          {savings >= 0 ? 'You are saving money! Keep it up!' : 'You are spending more than you earn!'}
        </p>
      </GlassCard>

      {/* Category Breakdown Pie Chart */}
      <GlassCard>
        <h3 className="font-semibold text-content-primary text-sm mb-3">Spending by Category</h3>
        {categoryData.length > 0 ? (
          <div className="flex items-center gap-4">
            <div className="relative w-32 h-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="category"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {categoryData.map((c) => (
                      <Cell key={c.category} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-content-muted">Total</span>
                <span className="text-sm font-bold text-content-primary">
                  ${(totalMonthlySubs + totalMonthlyBills + totalMonthlyExpenses).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5 min-w-0">
              {categoryData.slice(0, 5).map((c) => (
                <div key={c.category} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-content-secondary truncate flex-1">{c.category}</span>
                  <span className="text-content-primary font-medium">${c.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-content-muted py-4 text-center">No data available.</p>
        )}
      </GlassCard>
    </div>
  );
}