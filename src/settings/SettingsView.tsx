import { useState, useRef, useEffect } from 'react';
import { Globe, User, ShieldCheck, Database, LogOut, Languages, Camera, Download, Moon, Sun, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useBills } from '@/context/BillsContext';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { exportToCSV } from '@/utils/exportData';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';
import type { LanguageCode } from '@/utils/translations';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' }, { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' }, { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }, { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }, { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '元', name: 'Chinese Yuan' },
];

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'english', label: 'English' }, { code: 'mandarin', label: 'Mandarin Chinese' },
  { code: 'hindi', label: 'Hindi' }, { code: 'spanish', label: 'Spanish' },
  { code: 'arabic', label: 'Modern Standard Arabic' }, { code: 'french', label: 'French' },
  { code: 'bengali', label: 'Bengali' }, { code: 'portuguese', label: 'Portuguese' },
  { code: 'russian', label: 'Russian' }, { code: 'urdu', label: 'Urdu' },
  { code: 'hinglish', label: 'Hinglish' },
];

export function SettingsView() {
  const { user, isAdmin, signOut } = useAuth();
  const { profile, updateProfile, subscriptions, fetchProfile, paywall } = useSubscriptions();
  const { bills } = useBills();
  const { transactions } = useFinance();
  const { lang, setLang, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const [name, setName] = useState(profile.name);
  const [currency, setCurrency] = useState(profile.currency);
  const [reminderDays, setReminderDays] = useState(profile.reminderDays);
  const [newPassword, setNewPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') { fetchProfile(); window.history.replaceState({}, document.title, window.location.pathname); }
  }, [fetchProfile]);

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !user) return;
    const filePath = `${user.id}/${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) { alert('Upload failed: ' + uploadError.message); return; }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    await supabase.auth.updateUser({ data: { avatar_url: urlData.publicUrl } });
    alert('Profile photo updated! Please refresh.'); window.location.reload();
  };

  const handleSave = async () => { try { await updateProfile({ name, currency, reminderDays }); alert('Profile updated successfully!'); } catch (error) { alert('Error saving profile. Please try again.'); } };
  const handlePasswordChange = async () => { if (!newPassword) return alert('Enter a new password'); alert('Password change requested!'); setNewPassword(''); };
  const handleExport = () => { exportToCSV('My_Subscriptions', subscriptions); exportToCSV('My_Bills', bills); exportToCSV('My_Transactions', transactions); alert('Data exported successfully!'); };

  return (
    <div className="animate-fade-in space-y-4 max-w-2xl mx-auto">
      <Header title={t('settings')} subtitle={t('manageAccount')} icon={User} />

      {/* Button - Click karte hi paywall.open() call hoga */}
      <button onClick={() => paywall.open('settings')} className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:brightness-110 transition-all">
        <Crown className="w-5 h-5" /> Upgrade to Pro - See Plans
      </button>

      <GlassCard>
        <div className="flex items-center gap-4 mb-4">
          {user?.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} className="w-16 h-16 rounded-2xl object-cover shadow-lg" /> : <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">{profile.name.charAt(0).toUpperCase()}</div>}
          <div className="flex-1"><h3 className="font-semibold text-lg">{profile.name}</h3><p className="text-xs text-content-secondary">{profile.email}</p></div>
          <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><Camera className="w-4 h-4" /></button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProfileUpload} />
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-semibold text-content-primary text-sm mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-brand-blue" /> {t('preferences')}</h3>
        <div className="space-y-4">
          <label className="block"><span className="text-xs font-medium text-content-secondary mb-1.5 block">{t('fullName')}</span><input className="glass-input w-full px-3.5 py-3 text-base" value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className="block"><span className="text-xs font-medium text-content-secondary mb-1.5 block">{t('currency')}</span><select className="glass-input w-full px-3.5 py-3 text-base" value={currency} onChange={(e) => setCurrency(e.target.value)}>{CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>)}</select></label>
          <label className="block"><span className="text-xs font-medium text-content-secondary mb-1.5 block flex items-center gap-1"><Languages className="w-3 h-3" /> {t('language')}</span><select className="glass-input w-full px-3.5 py-3 text-base" value={lang} onChange={(e) => setLang(e.target.value as LanguageCode)}>{LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</select></label>
          <button onClick={handleSave} className="btn-primary w-full py-3">{t('saveChanges')}</button>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-semibold text-content-primary text-sm mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-danger" /> {t('security')}</h3>
        <div className="space-y-4"><div className="flex gap-2"><input type="password" className="glass-input flex-1 px-3.5 py-3 text-base" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t('newPassword')} /><button onClick={handlePasswordChange} className="btn-ghost px-4 text-sm">{t('update')}</button></div></div>
      </GlassCard>

      <button onClick={toggleTheme} className="btn-ghost w-full py-3 text-sm flex items-center justify-center gap-2">{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}{isDark ? 'Light Mode' : 'Dark Mode'}</button>
      <button onClick={handleExport} className="btn-ghost w-full py-3 text-sm flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Export Data (CSV)</button>

      {isAdmin && (
        <GlassCard className="border-danger/30 bg-danger/5">
          <h3 className="font-semibold text-danger text-sm mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> {t('adminPanel')}</h3>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => alert('Admin: View All Users')} className="btn-ghost text-sm"><Database className="w-4 h-4" /> {t('viewUsers')}</button>
            <button onClick={() => alert('Admin: Manage Data')} className="btn-ghost text-sm"><Database className="w-4 h-4" /> {t('manageData')}</button>
          </div>
        </GlassCard>
      )}
      <button onClick={signOut} className="btn-ghost w-full py-3 text-danger flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> {t('logout')}</button>
    </div>
  );
}