import { useState } from 'react';
import { Users, UserPlus, Trash2, Mail, X } from 'lucide-react';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { GlassCard } from '@/components/common/GlassCard';
import { useLanguage } from '@/context/LanguageContext';

export function FamilyView() {
  const { t } = useLanguage();
  const { family, subscriptions, addFamilyMember, removeFamilyMember } = useSubscriptions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  
  const sharedSubs = subscriptions.filter(s => s.active && s.shared);

  const openAddModal = () => {
    setName('');
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    addFamilyMember({ name, email: '', relationship: 'Family' });
    setName('');
    setIsModalOpen(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <Header 
        title={t('family')} 
        subtitle={`${family.length} ${t('members')}`} 
        icon={Users} 
        actions={
          <button onClick={openAddModal} className="btn-primary px-3 py-2 text-sm">
            <UserPlus className="w-4 h-4" /> {t('addMember')}
          </button>
        }
      />

      <GlassCard className="p-5">
        <p className="text-xs">{t('sharedSubs')}</p>
        <p className="text-3xl font-bold mt-0.5">{sharedSubs.length}</p>
        <p className="text-xs mt-2">${sharedSubs.reduce((sum, s) => sum + (s.cost || 0), 0).toFixed(2)}/mo</p>
      </GlassCard>

      {family.length === 0 ? (
        <EmptyState icon={Users} title={t('noFamilyYet')} description={t('addMembersToShare')} />
      ) : (
        family.map(m => (
          <GlassCard key={m.id}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold" style={{ backgroundColor: m.avatarColor }}>
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{m.name}</p>
                {m.email && <p className="text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> {m.email}</p>}
              </div>
              <button onClick={() => removeFamilyMember(m.id)} className="text-red-500 p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </GlassCard>
        ))
      )}

      {/* ✅ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Member ka naam..."
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 btn-ghost py-2">Cancel</button>
              <button onClick={handleAdd} className="flex-1 btn-primary py-2">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}