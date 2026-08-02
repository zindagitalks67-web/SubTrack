import { useState } from 'react';
import { Users, UserPlus, Trash2, Mail, Crown, Sparkles, Heart } from 'lucide-react';

import { useSubscriptions } from '@/context/SubscriptionContext';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { GlassCard } from '@/components/common/GlassCard';
import { Modal } from '@/components/common/Modal';
import { RELATIONSHIPS } from '@/utils/constants';
import { formatCurrency, sharedSplit, normalizedMonthly } from '@/utils/calculations';

export function FamilyView() {
  const { family, subscriptions, addFamilyMember, removeFamilyMember, paywall } = useSubscriptions();
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState<string>(RELATIONSHIPS[0]);

  const sharedSubs = subscriptions.filter((s) => s.active && s.shared);

  const memberShare = (memberId: string) => {
    let total = 0;
    for (const s of sharedSubs) {
      if (s.familyMemberIds.includes(memberId)) {
        total += sharedSplit(s).perMember;
      }
    }
    return total;
  };

  const handleSubmit = () => {
    const ok = addFamilyMember({ name, email, relationship });
    if (ok) {
      setName('');
      setEmail('');
      setRelationship(RELATIONSHIPS[0]);
      setAddOpen(false);
    }
  };

  const canShare = paywall.isPaid;

  return (
    <div className="animate-fade-in space-y-4">
      <Header
        title="Family"
        subtitle={`${family.length} member${family.length === 1 ? '' : 's'}`}
        icon={Users}
        actions={
          <button
            onClick={() => (canShare ? setAddOpen(true) : paywall.open('family'))}
            className="btn-primary px-3 py-2 text-sm"
          >
            <UserPlus className="w-4 h-4" /> Add
          </button>
        }
      />

      {/* Summary card */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-brand-gradient-soft border border-white/10">
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-brand-purple/20 blur-2xl" />
        <div className="relative">
          <p className="text-xs text-content-secondary">Shared subscriptions</p>
          <p className="text-3xl font-bold text-content-primary mt-0.5">{sharedSubs.length}</p>
          <div className="flex items-center gap-4 mt-2">
            <div>
              <p className="text-[11px] text-content-muted">Total shared cost</p>
              <p className="text-sm font-semibold text-content-primary">
                {formatCurrency(sharedSubs.reduce((sum, s) => sum + normalizedMonthly(s.cost, s.billingCycle), 0))}/mo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Members */}
      {family.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No family members yet"
          description={canShare ? 'Add members to share and split subscription costs.' : 'Upgrade to Premium to enable family sharing.'}
          action={
            canShare ? (
              <button onClick={() => setAddOpen(true)} className="btn-primary text-sm">
                <UserPlus className="w-4 h-4" /> Add member
              </button>
            ) : (
              <button onClick={() => paywall.open('family')} className="btn-primary text-sm">
                <Sparkles className="w-4 h-4" /> Unlock Premium
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {family.map((m) => {
            const share = memberShare(m.id);
            const memberSubs = sharedSubs.filter((s) => s.familyMemberIds.includes(m.id));
            return (
              <GlassCard key={m.id}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold text-base shrink-0"
                    style={{ backgroundColor: m.avatarColor }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-content-primary truncate">{m.name}</h3>
                      {m.relationship && (
                        <span className="chip bg-white/10 text-content-secondary">{m.relationship}</span>
                      )}
                    </div>
                    {m.email && (
                      <p className="text-xs text-content-secondary flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {m.email}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFamilyMember(m.id)}
                    className="text-content-muted hover:text-danger transition-colors p-2 -mr-1 shrink-0"
                    aria-label={`Remove ${m.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {memberSubs.length > 0 ? (
                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-content-secondary">Shared subscriptions</span>
                      <span className="text-xs font-semibold text-brand-cyan">{formatCurrency(share)}/mo</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {memberSubs.map((s) => (
                        <span key={s.id} className="chip bg-white/[0.05] text-content-secondary text-[11px]">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-content-muted mt-2">Not sharing any subscriptions.</p>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Shared subscriptions breakdown */}
      {sharedSubs.length > 0 && (
        <div>
          <h3 className="font-semibold text-content-primary text-sm mb-2">Shared subscriptions</h3>
          <div className="space-y-2">
            {sharedSubs.map((s) => {
              const split = sharedSplit(s);
              return (
                <GlassCard key={s.id}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-content-primary truncate">{s.name}</p>
                      <p className="text-xs text-content-secondary">{split.totalMembers} members sharing</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-content-primary">{formatCurrency(split.perMember)}/mo</p>
                      <p className="text-[11px] text-content-muted">per member</p>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Add member modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add family member">
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">Name</span>
            <input
              className="glass-input w-full px-3.5 py-3 text-base"
              placeholder="Member name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">Email (optional)</span>
            <input
              type="email"
              className="glass-input w-full px-3.5 py-3 text-base"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <div>
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">Relationship</span>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIPS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRelationship(r)}
                  className={`chip px-3 py-1.5 border transition-all ${
                    relationship === r
                      ? 'border-brand-purple/60 bg-brand-gradient-soft text-content-primary'
                      : 'border-white/10 bg-white/[0.03] text-content-secondary'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setAddOpen(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary flex-1">
              <Heart className="w-4 h-4" /> Add member
            </button>
          </div>
        </div>
      </Modal>

      {!canShare && family.length === 0 && (
        <div className="glass-card p-4 border-brand-purple/30 bg-brand-gradient-soft">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-4 h-4 text-brand-purple" />
            <p className="text-sm font-medium text-content-primary">Family Sharing is Premium</p>
          </div>
          <p className="text-xs text-content-secondary">Unlock unlimited members and shared cost splitting.</p>
          <button onClick={() => paywall.open('family')} className="btn-primary text-sm mt-3">
            See plans
          </button>
        </div>
      )}
    </div>
  );
}
