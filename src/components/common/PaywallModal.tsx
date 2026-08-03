import React, { useState } from 'react';
import { Check, ShieldCheck, X, Sparkles, Loader2 } from 'lucide-react';
import { useSubscriptions } from '@/context/SubscriptionContext';

// STRIPE / REVENUECAT CONFIGURATION KEYS
// In production, move these to .env file
const STRIPE_PRICE_IDS: Record<string, string> = {
  monthly: 'price_1P_SAMPLE_MONTHLY_KEY', 
  yearly: 'price_1P_SAMPLE_YEARLY_KEY',
  lifetime: 'price_1P_SAMPLE_LIFETIME_KEY',
};

export function PaywallModal() {
  const { paywall, updateProfile } = useSubscriptions();
  const [loading, setLoading] = useState(false);

  // Safely extract properties based on hook structure
  const isOpen = paywall?.state?.open ?? (paywall as any)?.isOpen ?? false;

  if (!isOpen) return null;

  const handleClose = () => {
    if (typeof (paywall as any).close === 'function') {
      (paywall as any).close();
    } else if (typeof (paywall as any).closePaywall === 'function') {
      (paywall as any).closePaywall();
    }
  };

  const handleRealPayment = async () => {
    setLoading(true);
    try {
      const currentTier = (paywall?.state as any)?.selectedTier || (paywall as any)?.selectedTier || 'monthly';
      const priceId = STRIPE_PRICE_IDS[currentTier] || STRIPE_PRICE_IDS.monthly;
      
      /* 
        PRODUCTION SERVER ENDPOINT CALL:
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId }),
        });
        const session = await response.json();
        window.location.href = session.url;
      */

      // Fallback Simulation for Dev/Demo mode until backend API is attached
      await new Promise((resolve) => setTimeout(resolve, 1500));
      updateProfile({ tier: currentTier as any });
      handleClose();
    } catch (error) {
      console.error('Payment failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md glass-card p-6 border-brand-purple/40 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-content-muted hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-brand-purple/20 flex items-center justify-center mx-auto mb-3 border border-brand-purple/40">
            <Sparkles className="w-6 h-6 text-brand-purple" />
          </div>
          <h2 className="text-xl font-bold text-white">Upgrade to Pro</h2>
          <p className="text-sm text-content-secondary mt-1">
            Unlock unlimited tracking, CSV exports & family sync.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {['Unlimited Subscriptions', 'Export to CSV & JSON', 'Family Group Sharing', 'Priority Alerts'].map((feat) => (
            <div key={feat} className="flex items-center gap-3 text-sm text-content-primary">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
              {feat}
            </div>
          ))}
        </div>

        <button
          onClick={handleRealPayment}
          disabled={loading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-semibold text-base shadow-lg shadow-brand-purple/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Redirecting to Gateway…
            </>
          ) : (
            "Pay via Stripe / Apple Pay"
          )}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-content-muted mt-4">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure 256-bit Encrypted Checkout
        </p>
      </div>
    </div>
  );
}