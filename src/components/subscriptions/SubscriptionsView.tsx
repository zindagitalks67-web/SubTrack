import { useMemo, useState } from 'react';
import { Plus, CreditCard, Search, SlidersHorizontal } from 'lucide-react';
import type { Subscription } from '@/types';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { SubscriptionCard } from './SubscriptionCard';
import { SubscriptionForm } from './SubscriptionForm';
import { CATEGORIES, FREE_TIER_LIMIT, TIER_LABELS } from '@/utils/constants';

export function SubscriptionsView() {
  const { subscriptions, profile, activeCount, paywall } = useSubscriptions();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all');

  const filtered = useMemo(() => {
    return subscriptions
      .filter((s) => {
        if (filterStatus === 'active' && !s.active) return false;
        if (filterStatus === 'paused' && s.active) return false;
        if (filterCat !== 'all' && s.category !== filterCat) return false;
        if (query.trim()) {
          const q = query.toLowerCase();
          if (!s.name.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.active !== b.active) return a.active ? -1 : 1;
        return new Date(a.nextRenewalDate).getTime() - new Date(b.nextRenewalDate).getTime();
      });
  }, [subscriptions, query, filterCat, filterStatus]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (s: Subscription) => {
    setEditing(s);
    setFormOpen(true);
  };

  const isFree = profile.tier === 'free';

  return (
    <div className="animate-fade-in">
      <Header
        title="Subscriptions"
        subtitle={`${activeCount} active${isFree ? ` of ${FREE_TIER_LIMIT} (Free)` : ` · ${TIER_LABELS[profile.tier]}`}`}
        icon={CreditCard}
        actions={
          <button onClick={openAdd} className="btn-primary px-3 py-2 text-sm" aria-label="Add subscription">
            <Plus className="w-4 h-4" /> Add
          </button>
        }
      />

      {/* Search + filter */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
          <input
            className="glass-input w-full pl-9 pr-3 py-2.5 text-sm"
            placeholder="Search subscriptions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Status chips */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar scroll-smooth w-full pb-1">
        {(['all', 'active', 'paused'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`chip px-3 py-1.5 capitalize border transition-all shrink-0 whitespace-nowrap ${
              filterStatus === st
                ? 'border-brand-purple/60 bg-brand-gradient-soft text-content-primary'
                : 'border-white/10 bg-white/[0.03] text-content-secondary'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Category chips — horizontally scrollable with edge fade */}
      <div className="relative mb-3">
        {/* Added pr-10 so the last category item is fully visible and not blocked by fade */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full pb-1 pr-10">
          <button
            onClick={() => setFilterCat('all')}
            className={`chip px-3 py-1.5 border transition-all shrink-0 whitespace-nowrap ${
              filterCat === 'all'
                ? 'border-brand-purple/60 bg-brand-gradient-soft text-content-primary'
                : 'border-white/10 bg-white/[0.03] text-content-secondary'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" /> All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.name}
              onClick={() => setFilterCat(c.name)}
              className={`chip px-3 py-1.5 border transition-all shrink-0 whitespace-nowrap ${
                filterCat === c.name
                  ? 'border-transparent text-white'
                  : 'border-white/10 bg-white/[0.03] text-content-secondary'
              }`}
              style={filterCat === c.name ? { backgroundColor: `${c.color}33`, borderColor: `${c.color}80` } : undefined}
            >
              {c.name}
            </button>
          ))}
        </div>
        {/* Right-edge fade gradient hinting more categories */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-base to-transparent" />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={subscriptions.length === 0 ? 'No subscriptions yet' : 'No matches'}
          description={
            subscriptions.length === 0
              ? 'Add your first subscription to start tracking your spend.'
              : 'Try adjusting your search or filters.'
          }
          action={
            subscriptions.length === 0 ? (
              <button onClick={openAdd} className="btn-primary text-sm">
                <Plus className="w-4 h-4" /> Add subscription
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((s) => (
            <SubscriptionCard key={s.id} subscription={s} onEdit={openEdit} />
          ))}
        </div>
      )}

      {/* Free tier banner */}
      {isFree && activeCount >= FREE_TIER_LIMIT && (
        <div className="glass-card p-4 mt-4 border-brand-purple/30 bg-brand-gradient-soft">
          <p className="text-sm text-content-primary font-medium">You have reached the free limit.</p>
          <p className="text-xs text-content-secondary mt-0.5">
            Upgrade to add unlimited subscriptions and unlock family sharing.
          </p>
          <button onClick={() => paywall.open('limit')} className="btn-primary text-sm mt-3">
            Upgrade now
          </button>
        </div>
      )}

      <SubscriptionForm open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />
    </div>
  );
}