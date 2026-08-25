import { useState } from 'react';
import { Globe, User, ShieldCheck, Database, LogOut, Languages } from 'lucide-react';
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
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '元', name: 'Chinese Yuan' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
];

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'english', label: 'English' },
  { code: 'mandarin', label: 'Mandarin Chinese' },
  { code: 'hindi', label: 'Hindi' },
  { code: 'spanish', label: 'Spanish' },
  { code: 'arabic', label: 'Modern Standard Arabic' },
  { code: 'french', label: 'French' },
  { code: 'bengali', label: 'Bengali' },
  { code: 'portuguese', label: 'Portuguese' },
  { code: 'russian', label: 'Russian' },
  { code: 'urdu', label: 'Urdu' },
  { code: 'hinglish', label: 'Hinglish' },
];

export function SettingsView() {
  const { user, isAdmin, signOut } = useAuth();
  const { profile, updateProfile } = useSubscriptions();
  const { lang, setLang, t } = useLanguage(); // ✅ t() use kiya

  const handleCurrencyChange = async (newCurrency: string) => {
    await updateProfile({ currency: newCurrency });
  };

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLang(newLang);
  };

  return (
    <div className="animate-fade-in space-y-4 max-w-2xl mx-auto">
      {/* ✅ Translate Title & Subtitle */}
      <Header title={t('settings')} subtitle={t('manageAccount')} icon={User} />

      <GlassCard>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{profile.name}</h3>
            <p className="text-xs text-content-secondary">{profile.email}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-semibold text-content-primary text-sm mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-brand-blue" /> {t('preferences')} {/* ✅ Translate */}
        </h3>
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">{t('currency')}</span>
            <select className="glass-input w-full px-3.5 py-3 text-base" value={profile.currency} onChange={(e) => handleCurrencyChange(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block flex items-center gap-1">
              <Languages className="w-3 h-3" /> {t('language')}
            </span>
            <select className="glass-input w-full px-3.5 py-3 text-base" value={lang} onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </label>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-semibold text-content-primary text-sm mb-4 flex items-center gap-2">
          <LogOut className="w-4 h-4 text-danger" /> {t('security')} {/* ✅ Translate */}
        </h3>
        <div className="flex gap-2">
          <input type="password" className="glass-input flex-1 px-3.5 py-3 text-base" placeholder={t('newPassword')} />
          <button className="btn-ghost px-4 text-sm">{t('update')}</button>
        </div>
      </GlassCard>

      {isAdmin && (
        <GlassCard className="border-danger/30 bg-danger/5">
          <h3 className="font-semibold text-danger text-sm mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> {t('adminPanel')} {/* ✅ Translate */}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-ghost text-sm"><Database className="w-4 h-4" /> {t('viewUsers')}</button>
            <button className="btn-ghost text-sm"><Database className="w-4 h-4" /> {t('manageData')}</button>
          </div>
        </GlassCard>
      )}

      <button onClick={signOut} className="btn-ghost w-full py-3 text-danger flex items-center justify-center gap-2">
        <LogOut className="w-4 h-4" /> {t('logout')} {/* ✅ Translate */}
      </button>
    </div>
  );
}