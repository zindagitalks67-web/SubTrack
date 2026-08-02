import { useState } from 'react';
import { Settings, Crown, Sparkles, RotateCcw, User, Bell, Database, Info, Check, CreditCard, ShieldCheck } from 'lucide-react';
import type { SubscriptionTier } from '@/types';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';
import { Modal } from '@/components/common/Modal';
import { PLANS, TIER_LABELS } from '@/utils/constants';
import { formatCurrency, totalAnnualSpend } from '@/utils/calculations';

export function SettingsView() {
  const { profile, updateProfile, upgradeTier, resetData, subscriptions, paywall } = useSubscriptions();
  const [resetOpen, setResetOpen] = useState(false);
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<SubscriptionTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [nameInput, setNameInput] = useState(profile.name);
  const [emailInput, setEmailInput] = useState(profile.email);
  const [currency, setCurrency] = useState(profile.currency);

  const annual = totalAnnualSpend(subscriptions);

  const handleSaveProfile = () => {
    updateProfile({ name: nameInput.trim() || profile.name, email: emailInput.trim(), currency });
  };

  const handleExport = () => {
    const data = { subscriptions, profile, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtrack-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmUpgrade = () => {
    if (!selectedTierForCheckout) return;
    setIsProcessing(true);

    // Simulate payment checkout process delay
    setTimeout(() => {
      upgradeTier(selectedTierForCheckout);
      setIsProcessing(false);
      setSelectedTierForCheckout(null);
    }, 1200);
  };

  const selectedPlanDetails = PLANS.find((p) => p.id === selectedTierForCheckout);

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
            onClick={() => paywall.open('manual')}
            className="mt-4 w-full bg-white/15 hover:bg-white/25 backdrop-blur text-white font-semibold rounded-xl py-2.5 text-sm transition-all active:scale-[0.98]"
          >
            Upgrade to Premium
          </button>
        )}
      </div>

      {/* Profile */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-brand-purple" />
          <h3 className="font-semibold text-content-primary text-sm">Profile</h3>
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
            <span className="text-xs text-content-secondary mb-1.5 block">Currency</span>
            <select
              className="glass-input w-full px-3.5 py-2.5 text-sm"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
              <option value="AUD">AUD ($)</option>
            </select>
          </label>
          <button onClick={handleSaveProfile} className="btn-primary w-full text-sm">
            <Check className="w-4 h-4" /> Save profile
          </button>
        </div>
      </GlassCard>

      {/* Reminder */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-brand-blue" />
          <h3 className="font-semibold text-content-primary text-sm">Renewal reminder</h3>
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

      {/* Data */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-brand-cyan" />
          <h3 className="font-semibold text-content-primary text-sm">Data</h3>
        </div>
        <div className="space-y-2">
          <button onClick={handleExport} className="btn-ghost w-full text-sm justify-start" disabled={profile.tier === 'free'}>
            <Database className="w-4 h-4" /> Export data (JSON)
            {profile.tier === 'free' && <span className="ml-auto text-[11px] text-content-muted">Premium</span>}
          </button>
          <button onClick={() => setResetOpen(true)} className="btn-danger w-full text-sm justify-start">
            <RotateCcw className="w-4 h-4" /> Reset to default data
          </button>
        </div>
        <p className="text-[11px] text-content-muted mt-2">
          {subscriptions.length} subscriptions stored locally. Annual spend: {formatCurrency(annual, currency)}.
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
                      onClick={() => setSelectedTierForCheckout(p.id as SubscriptionTier)}
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

      {/* Checkout Modal */}
      <Modal open={!!selectedTierForCheckout} onClose={() => setSelectedTierForCheckout(null)} title="Checkout & Upgrade">
        {selectedPlanDetails && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4 bg-brand-gradient-soft border border-brand-purple/30 text-center">
              <Sparkles className="w-8 h-8 text-brand-purple mx-auto mb-2" />
              <h4 className="font-bold text-lg text-content-primary">{selectedPlanDetails.name} Plan</h4>
              <p className="text-2xl font-black text-brand-purple mt-1">
                {selectedPlanDetails.price} <span className="text-xs font-normal text-content-secondary">{selectedPlanDetails.cadence}</span>
              </p>
            </div>

            <div className="space-y-2 text-xs text-content-secondary">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success shrink-0" />
                <span>Unlimited Subscriptions Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success shrink-0" />
                <span>Family Sharing & Member Management</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success shrink-0" />
                <span>Advanced Analytics & Data Export</span>
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3 flex items-center justify-between text-xs text-content-muted">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-content-secondary" />
                <span>Payment Method</span>
              </div>
              <span className="text-content-primary font-medium">Demo Checkout</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setSelectedTierForCheckout(null)} className="btn-ghost flex-1 text-sm" disabled={isProcessing}>
                Cancel
              </button>
              <button onClick={handleConfirmUpgrade} className="btn-primary flex-1 text-sm" disabled={isProcessing}>
                {isProcessing ? 'Processing Payment...' : 'Complete Payment'}
              </button>
            </div>

            <p className="flex items-center justify-center gap-1 text-[10px] text-content-muted text-center">
              <ShieldCheck className="w-3 h-3 text-success" />
              Encrypted 256-bit payment simulation
            </p>
          </div>
        )}
      </Modal>

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