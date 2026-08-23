import { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Wallet, CalendarClock, Users, ArrowRight, AlertTriangle, CheckCircle2, Target, PiggyBank } from 'lucide-react';
import type { ViewKey } from '@/types';
import type { Subscription } from '@/context/SubscriptionContext';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useBills } from '@/context/BillsContext';
import { useFinance } from '@/context/FinanceContext';
import { useBudget } from '@/context/BudgetContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { CATEGORY_MAP, TIER_LABELS } from '@/utils/constants';
import { daysUntil, formatDateShort, getNextRenewalDate } from '@/utils/dateHelpers';
import { sharedSplit } from '@/utils/calculations';
import {
  fetchLiveExchangeRates,
  formatCurrency,
  type CurrencyCode,
} from '@/utils/currency';

interface DashboardViewProps {
  onNavigate: (v: ViewKey) => void;
  onEditSubscription: (s: Subscription) => void;
}

export function DashboardView({ onNavigate, onEditSubscription }: DashboardViewProps) {
  const { monthly, annual, categories, forecast, activeCount, sharedCount, hikesCount, subscriptions, profile, updateSubscription } = useSubscriptions();
  const { bills } = useBills();
  const { transactions } = useFinance();
  const { monthlyBudget } = useBudget();

  const [liveRates, setLiveRates] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    fetchLiveExchangeRates().then((rates) => {
      if (rates) setLiveRates(rates);
    });
  }, []);

  const targetCurrency = (profile.currency as CurrencyCode) || 'USD';

  const totalBills = useMemo(() => bills.reduce((sum, b) => sum + b.amount, 0), [bills]);
  const totalExpenses = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  
  const totalMonthlySpend = monthly + totalBills + totalExpenses;
  const remainingBudget = monthlyBudget - totalMonthlySpend;
  const budgetPercent = monthlyBudget > 0 ? Math.min((totalMonthlySpend / monthlyBudget) * 100, 100) : 0;
  const isOverBudget = totalMonthlySpend > monthlyBudget;

  const urgentRenewals = useMemo(() => {
    const reminderDays = profile.reminderDays || 3;
    return subscriptions
      .filter((s) => s.active && s.nextRenewalDate)
      .map((s) => ({ s, days: daysUntil(s.nextRenewalDate!) }))
      .filter((item) => item.days <= reminderDays)
      .sort((a, b) => a.days - b.days);
  }, [subscriptions, profile.reminderDays]);

  const upcoming = useMemo(
    () =>
      subscriptions
        .filter((s) => s.active && s.nextRenewalDate)
        .sort((a, b) => new Date(a.nextRenewalDate!).getTime() - new Date(b.nextRenewalDate!).getTime())
        .slice(0, 4),
    [subscriptions],
  );

  const topHike = useMemo(() => {
    let best: { s: Subscription; pct: number } | null = null;
    for (const s of subscriptions) {
      if (s.priceHistory.length === 0) continue;
      const last = s.priceHistory[s.priceHistory.length - 1];
      const pct = ((last.newPrice - last.oldPrice) / last.oldPrice) * 100;
      if (!best || pct > best.pct) best = { s, pct };
    }
    return best;
  }, [subscriptions]);

  const forecastMax = Math.max(...forecast.map((f) => f.amount), 1);
  
  // ✅ Fix 1: sharedSplit(s) ko sharedSplit(s as any) kiya
  const yourShareMonthly = useMemo(
    () =>
      subscriptions
        .filter((s) => s.active && s.shared)
        .reduce((sum, s) => sum + sharedSplit(s as any).yourShare, 0),
    [subscriptions],
  );

  // ✅ Fix 2: updateSubscription mein (s as any) lagaya
  const handleMarkPaid = (s: Subscription) => {
    const nextDate = getNextRenewalDate(s.nextRenewalDate!, s.billingCycle);
    updateSubscription(s.id, { ...(s as any), nextRenewalDate: nextDate });
  };

  return (
    <div className="animate-fade-in space-y-4">
      <Header
        title={`Hi, ${profile.name.split(' ')[0]}`}
        subtitle={`${TIER_LABELS[profile.tier as keyof typeof TIER_LABELS]} plan · ${activeCount} active subscriptions`}
        icon={Wallet}
      />

      {urgentRenewals.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-red-500/15 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <h3 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
              Renewals Due Soon ({urgentRenewals.length})
            </h3>
          </div>
          <div className="space-y-2">
            {urgentRenewals.map(({ s, days }) => (
              <div key={s.id} className="flex items-center justify-between gap-3 bg-black/20 p-2.5 rounded-xl border border-white/5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{s.name}</p>
                  <p className="text-[11px] text-amber-300/80">
                    {formatCurrency(s.cost, targetCurrency, liveRates)} ·{' '}
                    {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `Due in ${days}d`}
                  </p>
                </div>
                <button onClick={() => handleMarkPaid(s)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg transition-all">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl p-5 bg-brand-gradient-strong shadow-glow">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-brand-cyan/30 blur-xl" />
        <div className="relative">
          <p className="text-xs text-white/70 font-medium uppercase tracking-wide">Total Monthly Spend</p>
          <p className="text-4xl font-bold text-white mt-1">{formatCurrency(totalMonthlySpend, targetCurrency, liveRates)}</p>
          <div className="flex items-center gap-4 mt-3">
            <div>
              <p className="text-[11px] text-white/60">Annual</p>
              <p className="text-sm font-semibold text-white">{formatCurrency(monthly + totalBills + totalExpenses, targetCurrency, liveRates)}</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <p className="text-[11px] text-white/60">Income</p>
              <p className="text-sm font-semibold text-white">{formatCurrency(totalIncome, targetCurrency, liveRates)}</p>
            </div>
          </div>
        </div>
      </div>

      <GlassCard className={`p-4 border ${isOverBudget ? 'border-danger/30' : 'border-brand-purple/30'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className={`w-4 h-4 ${isOverBudget ? 'text-danger' : 'text-brand-purple'}`} />
            <span className="text-xs font-medium text-content-secondary">Monthly Budget</span>
          </div>
          <span className={`text-xs font-semibold ${isOverBudget ? 'text-danger' : 'text-emerald-400'}`}>
            {isOverBudget ? 'Over Budget!' : `${budgetPercent.toFixed(0)}% Used`}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
          <div className={`h-2 rounded-full transition-all ${isOverBudget ? 'bg-danger' : budgetPercent > 80 ? 'bg-warning' : 'bg-emerald-500'}`} style={{ width: `${budgetPercent}%` }} />
        </div>
        <p className="text-xs text-content-muted">
          {isOverBudget ? `Overspent by $${Math.abs(remainingBudget).toFixed(2)}` : `$${remainingBudget.toFixed(2)} remaining this month`}
        </p>
      </GlassCard>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={CalendarClock} label="Upcoming" value={String(upcoming.length)} accent="#3b82f6" />
        <StatCard icon={Users} label="Shared" value={String(sharedCount)} accent="#22d3ee" />
        <StatCard icon={TrendingUp} label="Price hikes" value={String(hikesCount)} accent="#ef4444" />
      </div>

      {categories.length > 0 && (
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-content-primary text-sm">Spending by category</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-32 h-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categories} dataKey="monthly" nameKey="category" innerRadius={38} outerRadius={60} paddingAngle={2} stroke="none">
                    {categories.map((c) => (<Cell key={c.category} fill={c.color} />))}
                  </Pie>
                  <Tooltip content={<DoughnutTooltip currency={targetCurrency} rates={liveRates} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-content-muted">Total</span>
                <span className="text-sm font-bold text-content-primary">{formatCurrency(totalMonthlySpend, targetCurrency, liveRates)}</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5 min-w-0">
              {categories.slice(0, 5).map((c) => (
                <div key={c.category} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-content-secondary truncate flex-1">{c.category}</span>
                  <span className="text-content-primary font-medium">{formatCurrency(c.monthly, targetCurrency, liveRates)}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <h3 className="font-semibold text-content-primary text-sm mb-3">6-month forecast</h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {forecast.map((f, i) => (
            <div key={f.monthKey} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-end justify-center h-full">
                <div className="w-full max-w-[34px] rounded-t-lg bg-gradient-to-t from-brand-blue/40 to-brand-purple/80 transition-all duration-500" style={{ height: `${Math.max((f.amount / forecastMax) * 100, 6)}%`, animationDelay: `${i * 60}ms` }} title={`${f.month}: ${formatCurrency(f.amount, targetCurrency, liveRates)}`} />
              </div>
              <span className="text-[10px] text-content-muted">{f.month}</span>
              <span className="text-[10px] font-medium text-content-secondary">{formatCurrency(f.amount, targetCurrency, liveRates)}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {topHike && (
        <GlassCard onClick={() => onEditSubscription(topHike.s)} className="border-danger/30 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/15 flex items-center justify-center shrink-0"><TrendingUp className="w-5 h-5 text-danger" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-content-primary">{topHike.s.name} price increased</p>
              <p className="text-xs text-content-secondary">Up {topHike.pct.toFixed(1)}% — tap to view history</p>
            </div>
            <ArrowRight className="w-4 h-4 text-content-muted shrink-0" />
          </div>
        </GlassCard>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-content-primary text-sm">Upcoming renewals</h3>
          <button onClick={() => onNavigate('subscriptions')} className="text-xs text-brand-purple hover:underline">View all</button>
        </div>
        <div className="space-y-2">
          {upcoming.length === 0 ? (
            <p className="text-sm text-content-muted py-4 text-center">No upcoming renewals.</p>
          ) : (
            upcoming.map((s) => {
              const cat = CATEGORY_MAP[s.category];
              const days = s.nextRenewalDate ? daysUntil(s.nextRenewalDate) : null;
              const urgent = days !== null && days <= 3;
              return (
                <button key={s.id} onClick={() => onEditSubscription(s)} className="w-full glass-card p-3 flex items-center gap-3 text-left hover:border-white/15 transition-all">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat?.color}22`, color: cat?.color }}><CategoryIcon name={cat?.icon ?? 'Boxes'} size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-content-primary truncate">{s.name}</p>
                    <p className="text-xs text-content-secondary">{s.nextRenewalDate ? formatDateShort(s.nextRenewalDate) : 'N/A'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-content-primary">{formatCurrency(s.cost, targetCurrency, liveRates)}</p>
                    <p className={`text-[11px] ${urgent ? 'text-danger' : 'text-content-muted'}`}>{days === null ? 'No date' : days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? 'today' : `in ${days}d`}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof TrendingUp; label: string; value: string; accent: string }) {
  return (
    <div className="glass-card p-3 flex flex-col items-center text-center">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5" style={{ backgroundColor: `${accent}22`, color: accent }}><Icon className="w-4 h-4" /></div>
      <span className="text-lg font-bold text-content-primary leading-none">{value}</span>
      <span className="text-[10px] text-content-muted mt-1">{label}</span>
    </div>
  );
}

function DoughnutTooltip({ active, payload, currency = 'USD', rates }: { active?: boolean; payload?: Array<{ payload: { category: string; monthly: number } }>; currency?: CurrencyCode; rates?: Record<string, number> | null; }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload;
  return (
    <div className="glass-card px-2.5 py-1.5 text-xs">
      <span className="text-content-secondary">{p.category}: </span>
      <span className="text-content-primary font-medium">{formatCurrency(p.monthly, currency, rates)}/mo</span>
    </div>
  );
}