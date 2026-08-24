import { useState } from 'react';
import { Globe, User, ShieldCheck, Database, LogOut, Languages, Lock, Mail, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useLanguage } from '@/context/LanguageContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';
import type { LanguageCode } from '@/utils/translations';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'english', label: 'English' },
  { code: 'hindi', label: 'Hindi' },
  { code: 'hinglish', label: 'Hinglish' },
  { code: 'spanish', label: 'Spanish' },
  { code: 'mandarin', label: 'Mandarin' },
  { code: 'arabic', label: 'Arabic' },
];

export function SettingsView() {
  const { user, isAdmin, signOut } = useAuth();
  const { profile, updateProfile } = useSubscriptions();
  const { lang, setLang, t } = useLanguage();

  const [name, setName] = useState(profile.name);
  const [currency, setCurrency] = useState(profile.currency);
  const [reminderDays, setReminderDays] = useState(profile.reminderDays);
  const [newPassword, setNewPassword] = useState('');

  const handleSave = async () => {
    await updateProfile({ name, currency, reminderDays });
    alert('Profile updated successfully!');
  };

  const handleChangePassword = async () => {
    if (!newPassword) return alert('Enter a new password');
    // 🔒 Real Supabase password change logic yahan add karein
    alert('Password change requested! (Implement in AuthContext)');
    setNewPassword('');
  };

  return (
    <div className="animate-fade-in space-y-4 max-w-2xl mx-auto">
      <Header title={t('settings')} subtitle={t('manageAccount')} icon={User} />

      {/* Profile Card */}
      <GlassCard>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{profile.name}</h3>
            <p className="text-xs text-content-secondary">{profile.email}</p>
          </div>
          <button className="p-2 bg-white/10 rounded-full text-content-secondary hover:bg-white/20">
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-semibold text-content-primary text-sm mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-brand-blue" /> {t('settings')}
        </h3>
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">{t('fullName')}</span>
            <input className="glass-input w-full px-3.5 py-3 text-base" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">{t('currency')}</span>
            <select className="glass-input w-full px-3.5 py-3 text-base" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block flex items-center gap-1">
              <Languages className="w-3 h-3" /> {t('language')}
            </span>
            <select className="glass-input w-full px-3.5 py-3 text-base" value={lang} onChange={(e) => setLang(e.target.value as LanguageCode)}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </label>
          <button onClick={handleSave} className="btn-primary w-full py-3">{t('saveChanges')}</button>
        </div>
      </GlassCard>

      {/* Security Card */}
      <GlassCard>
        <h3 className="font-semibold text-content-primary text-sm mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-danger" /> Security
        </h3>
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">New Password</span>
            <div className="flex gap-2">
              <input type="password" className="glass-input flex-1 px-3.5 py-3 text-base" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="********" />
              <button onClick={handleChangePassword} className="btn-ghost px-4 text-sm">Update</button>
            </div>
          </label>
        </div>
      </GlassCard>

      {/* Admin Panel */}
      {isAdmin && (
        <GlassCard className="border-danger/30 bg-danger/5">
          <h3 className="font-semibold text-danger text-sm mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Admin Panel (Full Access)</h3>
          <p className="text-xs text-content-secondary mb-3">You are logged in as an Administrator.</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => alert('Admin: View All Users')} className="btn-ghost text-sm"><Database className="w-4 h-4" /> View Users</button>
            <button onClick={() => alert('Admin: Manage Data')} className="btn-ghost text-sm"><Database className="w-4 h-4" /> Manage Data</button>
          </div>
        </GlassCard>
      )}

      <button onClick={signOut} className="btn-ghost w-full py-3 text-danger flex items-center justify-center gap-2">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  );
}