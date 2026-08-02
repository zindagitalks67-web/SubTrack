import { Users, MoreVertical, Pause, Play, TrendingUp, CalendarDays } from 'lucide-react';
import type { Subscription } from '@/types';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { CATEGORY_MAP } from '@/utils/constants';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatRelative } from '@/utils/dateHelpers';
import { normalizedMonthly, formatCurrency, sharedSplit, priceHikePercent } from '@/utils/calculations';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (s: Subscription) => void;
}

export function SubscriptionCard({ subscription: s, onEdit }: SubscriptionCardProps) {
  const { family, toggleActive, profile, paywall } = useSubscriptions();
  const cat = CATEGORY_MAP[s.category];
  const monthly = normalizedMonthly(s.cost, s.billingCycle);
  const split = sharedSplit(s);
  const members = s.familyMemberIds
    .map((id) => family.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));
  const latestHike = s.priceHistory.length > 0 ? s.priceHistory[s.priceHistory.length - 1] : null;
  const hikePct = latestHike ? priceHikePercent(latestHike.oldPrice, latestHike.newPrice) : 0;
  const currency = profile.currency;
  const isUserPremium = paywall.isPaid;

  const priceHikeBadge =
    latestHike && hikePct > 0 ? (
      <div className="flex items-center gap-1.5 text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-2.5 py-1.5">
        <TrendingUp className="w-3.5 h-3.5 shrink-0" />
        <span>
          Price hike +{hikePct.toFixed(1)}% — was {formatCurrency(latestHike.oldPrice)}
        </span>
      </div>
    ) : null;

  return (
    <div
      className={`glass-card p-4 transition-all duration-200 hover:border-white/15 ${
        !s.active ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${cat?.color}22`, color: cat?.color }}
        >
          <CategoryIcon name={cat?.icon ?? 'Boxes'} size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-content-primary truncate">{s.name}</h3>
            <button
              onClick={() => onEdit(s)}
              className="text-content-muted hover:text-content-primary transition-colors p-1 -mr-1 shrink-0"
              aria-label="Edit"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-content-secondary mt-0.5">{s.category}</p>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mt-3">
            <span className="text-xl font-bold text-content-primary">{formatCurrency(s.cost)}</span>
            <span className="text-xs text-content-muted">
              /{s.billingCycle === 'yearly' ? 'yr' : s.billingCycle === 'weekly' ? 'wk' : 'mo'}
            </span>
          </div>
          {!s.active && (
            <span className="chip bg-warning/15 text-warning mt-1.5">Paused</span>
          )}

          {/* Current Price/Month and Price Hike Badge */}
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <div className="flex items-baseline gap-1">
              <p className="text-sm font-medium text-content-primary">{formatCurrency(monthly, currency)}</p>
              <p className="text-xs text-content-muted">/mo normalized</p>
            </div>
            {priceHikeBadge}
          </div>

          {/* Remaining Renewal text layout adjust */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-content-muted whitespace-nowrap">
            <CalendarDays size={14} />
            <span className="text-content-secondary font-medium">{formatRelative(s.nextRenewalDate)}</span>
          </div>

          {/* Shared Split Cost Section improvement */}
          {s.shared && isUserPremium && members.length > 0 && (
            <div className="flex flex-col gap-1 mt-3 border-t border-white/[0.06] pt-2.5">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  {members.slice(0, 4).map((m) => (
                    <span
                      key={m.id}
                      className="w-5 h-5 rounded-full border-2 border-panel"
                      style={{ backgroundColor: m.avatarColor }}
                      title={m.name}
                    />
                  ))}
                </div>
                <span className="flex items-center gap-1 text-[11px] text-content-secondary ml-1">
                  <Users className="w-3 h-3" />
                  {split.totalMembers} share
                </span>
              </div>
              <div className="flex items-center gap-1.5 ml-1">
                <p className="text-xs text-content-muted">Your share:</p>
                <p className="text-sm font-semibold text-brand-cyan">
                  {formatCurrency(split.yourShare, currency)}/mo
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
        <button
          onClick={() => toggleActive(s.id)}
          className="btn-ghost px-3 py-1.5 text-xs flex-1"
        >
          {s.active ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Resume
            </>
          )}
        </button>
        <button onClick={() => onEdit(s)} className="btn-ghost px-3 py-1.5 text-xs flex-1">
          Edit
        </button>
      </div>
    </div>
  );
}
