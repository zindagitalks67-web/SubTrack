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
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0]);

  const safeFamily = family || [];
  const safeSubs = subscriptions || [];

  const sharedSubs = safeSubs.filter((s: any) => s.active && s.shared);
  const memberShare = (memberId: string) => {
    let total = 0;
    for (const s of sharedSubs) {
      if (s.familyMemberIds.includes(memberId)) total += sharedSplit(s as any).perMember;
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

  const canShare = paywall?.isPaid || false;

  return (
    <div className="animate-fade-in space-y-4">
      <Header title="Family" subtitle={`${safeFamily.length} members`} icon={Users} actions={
        <button onClick={() => canShare ? setAddOpen(true) : paywall.open('family')} className="btn-primary px-3 py-2 text-sm">
          <UserPlus className="w-4 h-4" /> Add Member
        </button>
      } />

      {/* Summary */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-brand-gradient-soft border border-white/10">
        <p className="text-xs text-content-secondary">Shared subscriptions</p>
        <p className="text-3xl font-bold text-content-primary mt-0.5">{sharedSubs.length}</p>
        <p className="text-sm font-semibold text-content-primary mt-2">
          {/* ✅ FIX: normalizedMonthly needs 2 arguments (cost and billingCycle) */}
          {formatCurrency(sharedSubs.reduce((sum: number, s: any) => sum + normalizedMonthly(s.cost as any, s.billingCycle as any), 0))}/mo
        </p>
      </div>

      {safeFamily.length === 0 ? (
        <EmptyState icon={Users} title="No family members yet" description="Add members to share and split costs." />
      ) : (
        <div className="space-y-3">
          {safeFamily.map((m: any) => (
            <GlassCard key={m.id}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold" style={{ backgroundColor: m.avatarColor }}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{m.name}</h3>
                  {m.email && <p className="text-xs text-content-secondary">{m.email}</p>}
                </div>
                <button onClick={() => removeFamilyMember(m.id)} className="text-content-muted hover:text-danger p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {addOpen && (
        <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add member">
          <div className="space-y-4">
            <input className="glass-input w-full px-3.5 py-3" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="glass-input w-full px-3.5 py-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button onClick={handleSubmit} className="btn-primary w-full py-3">
              <Heart className="w-4 h-4" /> Save
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}