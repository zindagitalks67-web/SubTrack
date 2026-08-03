import { useState } from 'react';
import {
  Settings,
  Crown,
  Sparkles,
  RotateCcw,
  User,
  Bell,
  Database,
  Info,
  Check,
  Download,
  Globe,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';
import { Modal } from '@/components/common/Modal';
import { PLANS, TIER_LABELS } from '@/utils/constants';
import { CURRENCIES, type CurrencyCode, formatCurrency as formatConverted } from '@/utils/currency';
import { totalAnnualSpend } from '@/utils/calculations';

export function SettingsView() {
  const { profile, updateProfile, resetData, subscriptions, paywall } = useSubscriptions();
  const [resetOpen, setResetOpen] = useState(false);

  const [nameInput, setNameInput] = useState(profile.name);
  const [emailInput, setEmailInput] = useState(profile.email);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(
    (profile.currency as CurrencyCode) || 'USD'
  );

  const annualUSD = totalAnnualSpend(subscriptions);

  const handleSaveProfile = () => {
    updateProfile({
      name: nameInput.trim() || profile.name,
      email: emailInput.trim(),
      currency: selectedCurrency,
    });
    localStorage.setItem('preferred_currency', selectedCurrency);
  };

  const handleExportJSON = () => {
    const data = { subscriptions, profile, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtrack-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (subscriptions.length === 0) return;

    const headers = ['Subscription Name', 'Category', 'Price', 'Billing Cycle', 'Next Renewal Date', 'Status'];
    const rows = subscriptions.map((s) => [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.category}"`,
      s.cost,
      s.billingCycle,
      s.nextRenewalDate,
      s.active ? 'Active' : 'Paused',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtrack-subscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenPaywall = () => {
    if (paywall && typeof paywall.open === 'function') {
      paywall.open('settings' as any);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <Header title="Settings" subtitle="Manage your account and preferences" icon={Settings} />

      {/* Current plan */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-brand-gradient-strong shadow-glow">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur">
            {profile.tier === 'lifetime' ? <Crown className="w-6 h-6 text-white" /> : <Sparkles className="w-6 h-6 text-white" />}
          </div>
          <div>
            <p className="text-xs text-white/70">Current plan</p>
            <p className="text-xl font-bold text-white">{TIER_LABELS[profile.tier]}</p>
          </div>
        </div>
        {profile.tier === 'free' && (
          <button
            onClick={handleOpenPaywall}
            className="mt-4 w-full bg-white/15 hover:bg-white/25 backdrop-blur text-white font-semibold rounded-xl py-2.5 text-sm transition-all active:scale-[0.98]"
          >
            Upgrade to Premium
          </button>
        )}
      </div>

      {/* Profile & Currency */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-brand-purple" />
          <h3 className="font-semibold text-content-primary text-sm">Profile & Display Preferences</h3>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-content-secondary mb-1.5 block">Name</span>
            <input
              className="glass-input w-full px-3.5 py-2.5 text-sm"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs text-content-secondary mb-1.5 block">Email</span>
            <input
              type="email"
              className="glass-input w-full px-3.5 py-2.5 text-sm"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs text-content-secondary mb-1.5 block">Preferred Currency</span>
            <div className="relative">
              <select
                className="glass-input w-full px-3.5 py-2.5 text-sm appearance-none bg-[#121318]"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
              >
                {Object.values(CURRENCIES).map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.label}
                  </option>
                ))}
              </select>
              <Globe className="w-4 h-4 text-content-muted absolute right-3 top-3 pointer-events-none" />
            </div>
          </label>
          <button onClick={handleSaveProfile} className="btn-primary w-full text-sm">
            <Check className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </GlassCard>

      {/* Renewal Reminder */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-brand-blue" />
          <h3 className="font-semibold text-content-primary text-sm">Renewal Reminder</h3>
        </div>
        <p className="text-xs text-content-secondary mb-2">How many days before a renewal should we alert you?</p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 5, 7, 14].map((d) => (
            <button
              key={d}
              onClick={() => updateProfile({ reminderDays: d })}
              className={`chip px-3 py-1.5 border transition-all ${
                profile.reminderDays === d
                  ? 'border-brand-purple/60 bg-brand-gradient-soft text-content-primary'
                  : 'border-white/10 bg-white/[0.03] text-content-secondary'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
        {profile.tier === 'free' && (
          <p className="text-[11px] text-content-muted mt-2">Free tier supports up to 7 days. Custom reminders in Premium.</p>
        )}
      </GlassCard>

      {/* Data Export & Reset */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-brand-cyan" />
          <h3 className="font-semibold text-content-primary text-sm">Data & Export</h3>
        </div>
        <div className="space-y-2">
          <button onClick={handleExportCSV} className="btn-ghost w-full text-sm justify-start" disabled={profile.tier === 'free'}>
            <Download className="w-4 h-4 text-brand-cyan" /> Export as CSV (Excel)
            {profile.tier === 'free' && <span className="ml-auto text-[11px] text-content-muted">Premium</span>}
          </button>
          <button onClick={handleExportJSON} className="btn-ghost w-full text-sm justify-start" disabled={profile.tier === 'free'}>
            <Database className="w-4 h-4" /> Export Raw Backup (JSON)
            {profile.tier === 'free' && <span className="ml-auto text-[11px] text-content-muted">Premium</span>}
          </button>
          <button onClick={() => setResetOpen(true)} className="btn-danger w-full text-sm justify-start">
            <RotateCcw className="w-4 h-4" /> Reset to default data
          </button>
        </div>
        <p className="text-[11px] text-content-muted mt-2">
          {subscriptions.length} subscriptions stored locally. Annual spend: {formatConverted(annualUSD, selectedCurrency)}.
        </p>
      </GlassCard>

      {/* Plans overview */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-4 h-4 text-brand-purple" />
          <h3 className="font-semibold text-content-primary text-sm">Plans</h3>
        </div>
        <div className="space-y-2">
          {PLANS.map((p) => {
            const isCurrent = profile.tier === p.id;
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between rounded-xl p-3 border ${
                  p.highlight ? 'border-brand-purple/40 bg-brand-gradient-soft' : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-content-primary">{p.name}</span>
                    {p.badge && <span className="chip bg-white/10 text-content-secondary text-[10px]">{p.badge}</span>}
                  </div>
                  <span className="text-xs text-content-secondary">{p.price} {p.cadence}</span>
                </div>
                {isCurrent ? (
                  <span className="chip bg-success/15 text-success">Current</span>
                ) : (
                  p.id !== 'free' && (
                    <button
                      onClick={handleOpenPaywall}
                      className="btn-ghost px-3 py-1.5 text-xs"
                    >
                      Switch
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* About */}
      <div className="flex items-center gap-2 text-content-muted text-[11px] px-1">
        <Info className="w-3.5 h-3.5" />
        SubTrack · Demo build. Data is stored locally in your browser.
      </div>

      {/* Reset Confirmation Modal */}
      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset all data?">
        <p className="text-sm text-content-secondary">
          This will restore the 5 sample subscriptions, 3 family members, and default profile. This cannot be undone.
        </p>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setResetOpen(false)} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={() => {
              resetData();
              setResetOpen(false);
              setNameInput('Jordan Rivera');
              setEmailInput('jordan.rivera@example.com');
            }}
            className="btn-danger flex-1"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </Modal>
    </div>
  );
}