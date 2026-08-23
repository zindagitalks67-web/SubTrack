import { useMemo, useState } from 'react';
import { Bell, CalendarClock, TrendingUp } from 'lucide-react';
import type { AlertKind } from '@/types';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { GlassCard } from '@/components/common/GlassCard';
import { CATEGORY_MAP } from '@/utils/constants';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatDate, daysUntil } from '@/utils/dateHelpers';
import { formatCurrency } from '@/utils/calculations';

type FilterKey = 'all' | AlertKind;

export function AlertsView() {
  const { alerts, subscriptions, profile, updateProfile } = useSubscriptions();
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? alerts : alerts.filter((a) => a.kind === filter)),
    [alerts, filter],
  );

  const renewalCount = alerts.filter((a) => a.kind === 'renewal').length;
  const hikeCount = alerts.filter((a) => a.kind === 'price_hike').length;

  return (
    <div className="animate-fade-in space-y-4">
      <Header title="Alerts" subtitle={`${alerts.length} active alert${alerts.length === 1 ? '' : 's'}`} icon={Bell} />

      {/* Reminder setting */}
      <GlassCard>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-blue/15 flex items-center justify-center">
              <CalendarClock className="w-4 h-4 text-brand-blue" />
            </div>
            <div>
              <p className="text-sm font-medium text-content-primary">Reminder window</p>
              <p className="text-xs text-content-secondary">Notify before renewal</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 3, 7].map((d) => (
              <button
                key={d}
                onClick={() => updateProfile({ reminderDays: d })}
                className={`chip px-3 py-1.5 border transition-all ${
                  profile.reminderDays === d
                    ? 'border-brand-purple/60 bg-brand-gradient-soft text-content-primary'
                    : 'border-white/10 bg-white/[0.03] text-content-secondary'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        {profile.tier === 'free' && (
          <p className="text-[11px] text-content-muted mt-2">
            Custom reminders are a Premium feature — 1/3/7 days available on Free.
          </p>
        )}
      </GlassCard>

      {/* Filter chips */}
      <div className="flex items-center gap-2">
        {([
          { k: 'all', label: 'All', count: alerts.length },
          { k: 'renewal', label: 'Renewals', count: renewalCount },
          { k: 'price_hike', label: 'Price hikes', count: hikeCount },
        ] as { k: FilterKey; label: string; count: number }[]).map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={`chip px-3 py-1.5 border transition-all ${
              filter === f.k
                ? 'border-brand-purple/60 bg-brand-gradient-soft text-content-primary'
                : 'border-white/10 bg-white/[0.03] text-content-secondary'
            }`}
          >
            {f.label} <span className="text-content-muted">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Alert list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You are all caught up"
          description="No alerts match this filter. Renewal and price-hike alerts will appear here."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => {
            const sub = subscriptions.find((s) => s.id === a.subscriptionId);
            const cat = sub ? CATEGORY_MAP[sub.category] : null;
            const isHike = a.kind === 'price_hike';
            const days = daysUntil(a.date);
            return (
              <GlassCard key={a.id} className={isHike ? 'border-danger/25' : days <= 1 ? 'border-warning/25' : ''}>
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isHike ? 'bg-danger/15' : 'bg-warning/15'
                    }`}
                  >
                    {isHike ? (
                      <TrendingUp className="w-5 h-5 text-danger" />
                    ) : (
                      <CalendarClock className="w-5 h-5 text-warning" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {cat && (
                        <span
                          className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} size={12} />
                        </span>
                      )}
                      <p className="text-sm font-semibold text-content-primary truncate">{a.title}</p>
                    </div>
                    <p className="text-xs text-content-secondary mt-1 leading-relaxed">{a.message}</p>
                    <p className="text-[11px] text-content-muted mt-1">{formatDate(a.date)}</p>
                  </div>
                  {isHike && a.percentIncrease != null && (
                    <span className="chip bg-danger/15 text-danger shrink-0">+{a.percentIncrease.toFixed(1)}%</span>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}