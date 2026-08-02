import { Check, Sparkles, Crown } from 'lucide-react';
import type { SubscriptionTier } from '@/types';
import { PLANS } from '@/utils/constants';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { Modal } from './Modal';

const paidPlans = PLANS.filter((p) => p.id !== 'free');

const triggerCopy: Record<string, { title: string; subtitle: string }> = {
  limit: {
    title: 'You have reached the free limit',
    subtitle: 'Free includes up to 3 active subscriptions. Upgrade to add unlimited subscriptions.',
  },
  family: {
    title: 'Family Sharing is a Premium feature',
    subtitle: 'Share subscriptions with the whole family and split the costs.',
  },
  feature: {
    title: 'Unlock Premium features',
    subtitle: 'Advanced analytics, custom reminders and more await.',
  },
  manual: {
    title: 'Upgrade to SubTrack Premium',
    subtitle: 'Pick a plan that works for you. Cancel anytime.',
  },
};

export function PaywallModal() {
  const { paywall, upgradeTier, profile } = useSubscriptions();
  const { state, close } = paywall;
  const copy = state.trigger ? triggerCopy[state.trigger] : triggerCopy.manual;

  const handleSelect = (tier: SubscriptionTier) => {
    upgradeTier(tier);
    close();
  };

  return (
    <Modal open={state.open} onClose={close} size="lg">
      <div className="text-center mb-5">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-gradient items-center justify-center mb-3 shadow-glow">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-content-primary">{copy.title}</h2>
        <p className="text-sm text-content-secondary mt-1 max-w-sm mx-auto">{copy.subtitle}</p>
      </div>

      <div className="grid gap-3">
        {paidPlans.map((plan) => {
          const isLifetime = plan.id === 'lifetime';
          const isCurrent = profile.tier === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => !isCurrent && handleSelect(plan.id)}
              disabled={isCurrent}
              className={`relative text-left rounded-2xl p-4 border transition-all duration-200 ${
                plan.highlight
                  ? 'border-brand-purple/50 bg-brand-gradient-soft shadow-glow'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
              } ${isCurrent ? 'opacity-60 cursor-default' : 'active:scale-[0.99]'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${plan.accent}22`, color: plan.accent }}
                  >
                    {isLifetime ? <Crown className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-content-primary">{plan.name}</span>
                      {plan.badge && (
                        <span
                          className="chip text-[10px] px-2 py-0.5"
                          style={{
                            backgroundColor: `${plan.accent}22`,
                            color: plan.accent,
                          }}
                        >
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-bold text-content-primary">{plan.price}</span>
                      <span className="text-xs text-content-secondary">{plan.cadence}</span>
                    </div>
                  </div>
                </div>
                {isCurrent ? (
                  <span className="chip bg-white/10 text-content-secondary">Current</span>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-white/20 shrink-0" />
                )}
              </div>

              <ul className="mt-3 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-content-secondary">
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: plan.accent }} />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-content-muted mt-4">
        Demo build — selecting a plan instantly unlocks features. No payment is processed.
      </p>
    </Modal>
  );
}
