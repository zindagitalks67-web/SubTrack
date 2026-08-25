import { useState } from 'react';
import { X, ShieldCheck, CreditCard, Gift, Smartphone, Lock } from 'lucide-react';
import type { SubscriptionTier } from '@/types';
import { useSubscriptions } from '@/context/SubscriptionContext';

export function PaywallModal() {
  const { paywall, profile, updateProfile } = useSubscriptions();
  const [selectedMethod, setSelectedMethod] = useState<'express' | 'card' | 'redeem'>('express');
  const [isProcessing, setIsProcessing] = useState(false);

  const isOpen = paywall?.isOpen ?? false;

  if (!isOpen) return null;

  const handlePayment = async () => {
    setIsProcessing(true);
    setTimeout(async () => {
      try {
        await updateProfile({ tier: 'premium' });
        paywall.upgradeTier('monthly');
        paywall.close();
        alert("🎉 Welcome to SubTrack Pro!");
      } catch (error) {
        alert("Payment failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[9999] paywall-modal-root flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
      <div className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ backgroundColor: '#16181D', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {/* Header */}
        <div className="p-6 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'linear-gradient(to bottom, rgba(139, 92, 246, 0.3), transparent)' }}>
          <button 
            onClick={() => paywall.close()} 
            className="absolute top-4 right-4 p-1 rounded-full"
            style={{ color: '#ffffff' }}
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#ffffff' }}>
              S
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: '#ffffff' }}>SubTrack Pro</h3>
              <p className="text-xs" style={{ color: '#9ca3af' }}>{profile.email || 'user@example.com'}</p>
            </div>
            <div className="ml-auto text-right pr-4">
              <span className="text-2xl font-black" style={{ color: '#ffffff' }}>$4.99</span>
              <p className="text-[10px]" style={{ color: '#9ca3af' }}>/ month</p>
            </div>
          </div>

          <p className="text-[11px] mt-3 flex items-center gap-1" style={{ color: '#9ca3af' }}>
            <Lock className="w-3 h-3 text-emerald-400" /> International secure checkout
          </p>
        </div>

        {/* Options */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 min-h-0">
          <div 
            onClick={() => setSelectedMethod('express')}
            className="p-4 rounded-2xl border cursor-pointer flex items-center justify-between"
            style={{ borderColor: selectedMethod === 'express' ? '#8b5cf6' : 'rgba(255,255,255,0.1)', backgroundColor: selectedMethod === 'express' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl border flex items-center justify-center" style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Smartphone className="w-5 h-5" style={{ color: '#ffffff' }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#ffffff' }}>Express Checkout</p>
                <p className="text-[11px]" style={{ color: '#9ca3af' }}>Apple Pay, Google Pay, Link</p>
              </div>
            </div>
            <input type="radio" checked={selectedMethod === 'express'} onChange={() => {}} style={{ accentColor: '#8b5cf6' }} />
          </div>

          <div 
            onClick={() => setSelectedMethod('card')}
            className="p-4 rounded-2xl border cursor-pointer flex items-center justify-between"
            style={{ borderColor: selectedMethod === 'card' ? '#8b5cf6' : 'rgba(255,255,255,0.1)', backgroundColor: selectedMethod === 'card' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl border flex items-center justify-center" style={{ borderColor: 'rgba(59, 130, 246, 0.3)', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <CreditCard className="w-5 h-5" style={{ color: '#60a5fa' }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#ffffff' }}>Credit or Debit Card</p>
                <p className="text-[11px]" style={{ color: '#9ca3af' }}>Visa, MasterCard, AMEX</p>
              </div>
            </div>
            <input type="radio" checked={selectedMethod === 'card'} onChange={() => {}} style={{ accentColor: '#8b5cf6' }} />
          </div>

          {selectedMethod === 'card' && (
            <div className="p-3 rounded-xl border space-y-2" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <input type="text" placeholder="Card number" className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={{ color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }} />
              <div className="flex gap-2">
                <input type="text" placeholder="MM / YY" className="w-1/2 rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={{ color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }} />
                <input type="text" placeholder="CVC" className="w-1/2 rounded-lg px-3 py-2.5 text-sm focus:outline-none" style={{ color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }} />
              </div>
            </div>
          )}

          <div 
            onClick={() => setSelectedMethod('redeem')}
            className="p-4 rounded-2xl border cursor-pointer flex items-center justify-between"
            style={{ borderColor: selectedMethod === 'redeem' ? '#8b5cf6' : 'rgba(255,255,255,0.1)', backgroundColor: selectedMethod === 'redeem' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl border flex items-center justify-center" style={{ borderColor: 'rgba(245, 158, 11, 0.3)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                <Gift className="w-5 h-5" style={{ color: '#fbbf24' }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#ffffff' }}>Redeem Promo Code</p>
                <p className="text-[11px]" style={{ color: '#9ca3af' }}>Have a gift card or code?</p>
              </div>
            </div>
            <input type="radio" checked={selectedMethod === 'redeem'} onChange={() => {}} style={{ accentColor: '#8b5cf6' }} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-lg transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg, #8b5cf6, #6366f1)', color: '#ffffff' }}
          >
            {isProcessing ? 'Processing...' : 'Subscribe for $4.99/mo'}
          </button>
          <div className="flex items-center justify-center gap-1 mt-3 text-[10px]" style={{ color: '#9ca3af' }}>
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
            <span>Encrypted SSL Secure</span>
          </div>
        </div>

      </div>
    </div>
  );
}