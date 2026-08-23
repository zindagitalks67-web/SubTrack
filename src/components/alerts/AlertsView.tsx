import { useMemo, useState } from 'react';
import { Bell, CalendarClock, TrendingUp } from 'lucide-react';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { GlassCard } from '@/components/common/GlassCard';
import { CATEGORY_MAP } from '@/utils/constants';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatDate, daysUntil } from '@/utils/dateHelpers';

export function AlertsView() {
  const { alerts, subscriptions, profile, updateProfile } = useSubscriptions();
  const [filter, setFilter] = useState<string>('all');

  // ✅ SAFETY: `alerts` agar undefined hua toh `[]` use karo
  const safeAlerts = useMemo(() => alerts || [], [alerts]);
  const safeSubscriptions = useMemo(() => subscriptions || [], [subscriptions]);

  const filtered = useMemo(
    () => (filter === 'all' ? safeAlerts : safeAlerts.filter((a: any) => a.kind === filter)),
    [safeAlerts, filter],
  );

  const renewalCount = safeAlerts.filter((a: any) => a.kind === 'renewal').length;
  const hikeCount = safeAlerts.filter((a: any) => a.kind === 'price_hike').length;

  return (
    <div className="animate-fade-in space-y-4">
      <Header title="Alerts" subtitle={`${safeAlerts.length} active alerts`} icon={Bell} />

      {/* Reminder Setting */}
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
              <button key={d} onClick={() => updateProfile({ reminderDays: d })} className="chip px-3 py-1.5 border transition-all">
                {d}d
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        {[
          { k: 'all', label: 'All', count: safeAlerts.length },
          { k: 'renewal', label: 'Renewals', count: renewalCount },
          { k: 'price_hike', label: 'Price hikes', count: hikeCount },
        ].map((f) => (
          <button key={f.k} onClick={() => setFilter(f.k)} className="chip px-3 py-1.5 border transition-all">
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Alert List */}
      {filtered.length === 0 ? (
        <EmptyState icon={Bell} title="You are all caught up" description="No alerts match this filter." />
      ) : (
        <div className="space-y-2">
          {filtered.map((a: any) => (
            <GlassCard key={a.id} className="p-3">
              <p className="text-sm font-medium text-content-primary">{a.title}</p>
              <p className="text-xs text-content-secondary mt-1">{a.message}</p>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}