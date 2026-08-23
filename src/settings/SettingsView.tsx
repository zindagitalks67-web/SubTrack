import { useState } from 'react';
import { Globe, User, ShieldCheck, Database, LogOut, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';

// 🌍 Global Currencies List
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '元', name: 'Chinese Yuan' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

// 🌍 11 Major Languages List
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文 (Mandarin Chinese)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'ar', name: 'العربية (Modern Standard Arabic)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'pt', name: 'Português (Portuguese)' },
  { code: 'ru', name: 'Русский (Russian)' },
  { code: 'ur', name: 'اردو (Urdu)' },
  { code: 'hi-en', name: 'Hinglish (Hindi + English)' },
];

export function SettingsView() {
  const { user, isAdmin, signOut } = useAuth();
  const { profile, updateProfile } = useSubscriptions();
  const { t, i18n } = useTranslation();

  const [name, setName] = useState(profile.name);
  const [currency, setCurrency] = useState(profile.currency);
  const [reminderDays, setReminderDays] = useState(profile.reminderDays);

  const handleSave = () => {
    updateProfile({ name, currency, reminderDays });
    alert('Profile updated successfully!');
  };

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="animate-fade-in space-y-4 max-w-2xl mx-auto">
      <Header title={t('settings')} subtitle="Manage your account and preferences" icon={User} />

      {/* International Settings */}
      <GlassCard>
        <h3 className="font-semibold text-content-primary text-sm mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-brand-blue" /> International Preferences
        </h3>
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">Full Name</span>
            <input className="glass-input w-full px-3.5 py-3 text-base" value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">Preferred Currency</span>
            <select className="glass-input w-full px-3.5 py-3 text-base" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>
              ))}
            </select>
          </label>

          {/* Language Selector (11 Languages) */}
          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block flex items-center gap-1">
              <Languages className="w-3.5 h-3.5" /> Preferred Language
            </span>
            <select className="glass-input w-full px-3.5 py-3 text-base" value={i18n.language} onChange={(e) => handleLanguageChange(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">Reminder Window</span>
            <div className="flex gap-2">
              {[1, 3, 7].map((d) => (
                <button key={d} onClick={() => setReminderDays(d)} className={`chip px-4 py-2 border transition-all ${reminderDays === d ? 'border-brand-purple/60 bg-brand-gradient-soft text-content-primary' : 'border-white/10 bg-white/[0.03] text-content-secondary'}`}>{d} days</button>
              ))}
            </div>
          </label>

          <button onClick={handleSave} className="btn-primary w-full py-3">Save Changes</button>
        </div>
      </GlassCard>

      {/* Admin Panel */}
      {isAdmin && (
        <GlassCard className="border-danger/30 bg-danger/5">
          <h3 className="font-semibold text-danger text-sm mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Admin Panel (Full Access)
          </h3>
          <p className="text-xs text-content-secondary mb-3">You are logged in as an Administrator. You have full access to all data.</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => alert('Admin: View All Users')} className="btn-ghost text-sm"><Database className="w-4 h-4" /> View All Users</button>
            <button onClick={() => alert('Admin: Manage Global Data')} className="btn-ghost text-sm"><Database className="w-4 h-4" /> Manage Data</button>
          </div>
        </GlassCard>
      )}

      {/* Logout */}
      <button onClick={signOut} className="btn-ghost w-full py-3 text-danger flex items-center justify-center gap-2">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  );
}