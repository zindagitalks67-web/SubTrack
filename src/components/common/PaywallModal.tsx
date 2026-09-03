import { useState } from 'react';
import { X, Check, CreditCard, Gift, Smartphone } from 'lucide-react';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type Plan = 'monthly' | 'yearly' | 'lifetime';

export function PaywallModal() {
  const { paywall, profile } = useSubscriptions();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const isOpen = paywall?.isOpen ?? false;
  const userEmail = profile?.email || '';

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!user?.id) { alert('Please login again.'); return; }
    if (!userEmail) { alert('Email not found.'); return; }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { user_id: user.id, email: userEmail, plan: selectedPlan }
      });

      if (error) {
        alert('Payment failed: ' + error.message);
        setIsProcessing(false);
        return;
      }

      // 🔥 ROBUST URL EXTRACTION (Fix for "URL missing")
      let checkoutUrl = data?.url;
      
      // If data is array [ { url: "..." } ]
      if (!checkoutUrl && Array.isArray(data) && data[0]?.url) {
        checkoutUrl = data[0].url;
      }
      
      // If data is JSON string '{"url":"..."}'
      if (!checkoutUrl && typeof data === 'string') {
        try { checkoutUrl = JSON.parse(data)?.url; } catch (e) {}
      }

      if (!checkoutUrl) {
        console.error('Stripe URL missing:', data);
        alert('Stripe checkout URL was not returned.');
        setIsProcessing(false);
        return;
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      alert('Something went wrong while starting payment.');
      setIsProcessing(false);
    }
  };

  const plans = [
    { id: 'monthly' as Plan, name: 'Monthly', price: '$4.99', period: '/ month', description: 'Flexible monthly subscription' },
    { id: 'yearly' as Plan, name: 'Yearly', price: '$29.99', period: '/ year', description: 'Best value for regular users', badge: 'SAVE 50%' },
    { id: 'lifetime' as Plan, name: 'Lifetime', price: '$49.99', period: ' one-time', description: 'Pay once, use forever', badge: 'BEST VALUE' },
  ];

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.82)', backdropFilter: 'blur(5px)' }}>
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl" style={{ backgroundColor: '#1B1D24', border: '1px solid rgba(255,255,255,0.14)', maxHeight: '90vh' }}>
        <div className="relative px-6 py-5" style={{ background: 'linear-gradient(135deg, #252033 0%, #1B1D24 100%)', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <button type="button" onClick={() => paywall.close()} disabled={isProcessing} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10 disabled:opacity-50" style={{ color: '#FFFFFF' }}>
            <X className="h-5 w-5" />
          </button>
          <div className="pr-10">
            <h3 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>SubTrack Pro</h3>
            <p className="mt-1 text-sm" style={{ color: '#C4C7D0' }}>{userEmail}</p>
            <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: '#A7F3D0' }}><span>🔒</span><span>Secure checkout powered by Stripe</span></div>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-5" style={{ maxHeight: '48vh' }}>
          <div className="mb-4">
            <h4 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>Choose your plan</h4>
            <p className="mt-1 text-sm" style={{ color: '#B8BBC5' }}>Select the plan that works best for you.</p>
          </div>
          <div className="space-y-3">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <button key={plan.id} type="button" onClick={() => setSelectedPlan(plan.id)} disabled={isProcessing} className="w-full rounded-2xl p-4 text-left transition-all duration-200" style={{ backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.18)' : 'rgba(255,255,255,0.055)', border: isSelected ? '1.5px solid #8B5CF6' : '1px solid rgba(255,255,255,0.14)', opacity: isProcessing ? 0.7 : 1 }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: isSelected ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.08)' }}>
                        {plan.id === 'monthly' && <CreditCard className="h-5 w-5" style={{ color: isSelected ? '#A78BFA' : '#CBD5E1' }} />}
                        {plan.id === 'yearly' && <Smartphone className="h-5 w-5" style={{ color: isSelected ? '#A78BFA' : '#CBD5E1' }} />}
                        {plan.id === 'lifetime' && <Gift className="h-5 w-5" style={{ color: isSelected ? '#A78BFA' : '#CBD5E1' }} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold" style={{ color: '#FFFFFF' }}>{plan.name}</span>
                          {plan.badge && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#86EFAC' }}>{plan.badge}</span>}
                        </div>
                        <p className="mt-1 text-xs" style={{ color: '#B8BBC5' }}>{plan.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: '#FFFFFF' }}>{plan.price}</div>
                      <div className="text-xs" style={{ color: '#AEB2BD' }}>{plan.period}</div>
                    </div>
                  </div>
                  {isSelected && <div className="mt-3 flex items-center gap-2 text-xs font-medium" style={{ color: '#C4B5FD' }}><Check className="h-4 w-4" /> Selected plan</div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-5" style={{ backgroundColor: '#15171C', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <button type="button" onClick={handlePayment} disabled={isProcessing} className="w-full rounded-2xl px-4 py-4 text-sm font-bold transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60" style={{ background: 'linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%)', color: '#FFFFFF', boxShadow: '0 8px 25px rgba(99,102,241,0.25)' }}>
            {isProcessing ? 'Opening secure checkout...' : `Continue with ${selectedPlanData?.name} — ${selectedPlanData?.price}${selectedPlanData?.period}`}
          </button>
          <p className="mt-3 text-center text-[11px]" style={{ color: '#8F94A1' }}>You will be redirected to Stripe's secure payment page.</p>
        </div>
      </div>
    </div>
  );
}