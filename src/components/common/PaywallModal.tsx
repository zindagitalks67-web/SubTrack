import { useState } from 'react';
import { Crown, Sparkles, Check, CreditCard, ShieldCheck } from 'lucide-react';
import type { SubscriptionTier } from '@/types';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { Modal } from '@/components/common/Modal';
import { PLANS } from '@/utils/constants';

export function PaywallModal() {
  const { paywall, upgradeTier } = useSubscriptions();
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<SubscriptionTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Safely extract open state based on context structure
  const isOpen = typeof paywall === 'object' && 'isOpen' in paywall 
    ? Boolean((paywall as any).isOpen)
    : Boolean((paywall as any).state?.isOpen);

  const handleConfirmUpgrade = () => {
    if (!selectedTierForCheckout) return;
    setIsProcessing(true);

    setTimeout(() => {
      upgradeTier(selectedTierForCheckout);
      setIsProcessing(false);
      setSelectedTierForCheckout(null);
      paywall.close();
    }, 1200);
  };

  const selectedPlanDetails = PLANS.find((p) => p.id === selectedTierForCheckout);

  return (
    <>
      {/* Primary Paywall Modal */}
      <Modal open={isOpen} onClose={() => paywall.close()} title="Upgrade your plan">
        <div className="space-y-4">
          <p className="text-xs text-content-secondary">
            Unlock advanced analytics, family sharing, custom reminders, and unlimited subscriptions tracking.
          </p>

          <div className="space-y-2.5">
            {PLANS.filter((p) => p.id !== 'free').map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl p-4 border transition-all ${
                  p.highlight
                    ? 'border-brand-purple/50 bg-brand-gradient-soft shadow-glow'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {p.id === 'lifetime' ? (
                      <Crown className="w-5 h-5 text-brand-cyan" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-brand-purple" />
                    )}
                    <span className="font-bold text-content-primary">{p.name}</span>
                    {p.badge && <span className="chip bg-white/10 text-content-secondary text-[10px]">{p.badge}</span>}
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-content-primary">{p.price}</span>
                    <span className="text-[11px] text-content-muted block">{p.cadence}</span>
                  </div>
                </div>

                <ul className="space-y-1 mb-3 text-xs text-content-secondary">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelectedTierForCheckout(p.id as SubscriptionTier)}
                  className="btn-primary w-full text-xs py-2"
                >
                  Get {p.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Checkout / Payment Simulation Modal */}
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
                <span>CSV & JSON Data Export</span>
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
    </>
  );
}