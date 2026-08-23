import { useState } from 'react';
import { Users, UserPlus, Trash2, Mail, Crown, Sparkles, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { GlassCard } from '@/components/common/GlassCard';
import { Modal } from '@/components/common/Modal';
import { RELATIONSHIPS } from '@/utils/constants';
import { formatCurrency, sharedSplit, normalizedMonthly } from '@/utils/calculations';

export function FamilyView() {
  const { t } = useTranslation();
  const { family, subscriptions, addFamilyMember, removeFamilyMember, paywall } = useSubscriptions();
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0]);

  const sharedSubs = subscriptions.filter(s => s.active && s.shared);
  const memberShare = (memberId: string) => { 
    let total = 0; 
    for (const s of sharedSubs) { 
      if (s.familyMemberIds.includes(memberId)) total += sharedSplit(s as any).perMember; 
    } 
    return total; 
  };

  const handleSubmit = () => { 
    const ok = addFamilyMember({ name, email, relationship }); 
    if (ok) { setName(''); setEmail(''); setRelationship(RELATIONSHIPS[0]); setAddOpen(false); } 
  };
  
  const canShare = paywall.isPaid;

  return (
    <div className="animate-fade-in space-y-4">
      <Header 
        title={t('family')} 
        subtitle={`${family.length} ${t('family')}`} 
        icon={Users} 
        actions={
          <button 
            onClick={() => canShare ? setAddOpen(true) : paywall.open('family')} 
            className="btn-primary px-3 py-2 text-sm"
          >
            <UserPlus className="w-4 h-4" /> {t('addMember')}
          </button>
        } 
      />

      {family.length === 0 ? (
        <EmptyState icon={Users} title={t('noFamily')} description={t('familyDesc')} />
      ) : (
        <div className="space-y-3">
          {family.map((m) => (
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
        <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('addMember')}>
          <div className="space-y-4">
            <input 
              className="glass-input w-full px-3.5 py-3" 
              placeholder={t('name')} 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
            <input 
              className="glass-input w-full px-3.5 py-3" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <button onClick={handleSubmit} className="btn-primary w-full py-3">
              <Heart className="w-4 h-4" /> {t('save')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}