import { useState } from 'react';
import { X, ShieldCheck, CreditCard, Gift, Smartphone, Lock } from 'lucide-react';
import type { SubscriptionTier } from '@/types';
import { useSubscriptions } from '@/context/SubscriptionContext';

export function PaywallModal() {
  const { paywall, profile } = useSubscriptions();  // ✅ upgradeTier ko hata diya
  const [selectedMethod, setSelectedMethod] = useState<'express' | 'card' | 'redeem'>('express');
  const [isProcessing, setIsProcessing] = useState(false);

  const isOpen = paywall?.isOpen ?? false;

  if (!isOpen) return null;

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      paywall.upgradeTier('monthly' as SubscriptionTier);  // ✅ `paywall.upgradeTier` use kiya
      setIsProcessing(false);
      paywall.close();  // ✅ `paywall.close` use kiya
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#121318] text-white rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header Section */}
        <div className="p-6 border-b border-white/10 relative bg-gradient-to-b from-purple-900/20 to-transparent">
          <button 
            onClick={() => paywall.close()} 
            className="absolute top-4 right-4 text-content-secondary hover:text-white p-1 rounded-full hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-xl font-bold shadow-lg shadow-purple-500/30">
              S
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">SubTrack Pro</h3>
              <p className="text-xs text-content-secondary">{profile.email || 'user@example.com'}</p>
            </div>
            <div className="ml-auto text-right pr-4">
              <span className="text-2xl font-black text-white">$4.99</span>
              <p className="text-[10px] text-content-muted">/ month</p>
            </div>
          </div>

          <p className="text-[11px] text-content-muted mt-3 flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400 inline" /> International secure checkout powered by Stripe
          </p>
        </div>

        {/* Scrollable Payment Options */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 custom-scrollbar">

          {/* 1. Express Checkout */}
          <div 
            onClick={() => setSelectedMethod('express')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              selectedMethod === 'express'
                ? 'border-purple-500 bg-purple-600/15 shadow-md shadow-purple-500/10'
                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Express Checkout</p>
                <p className="text-[11px] text-content-muted">Apple Pay, Google Pay, Link</p>
              </div>
            </div>
            <input
              type="radio"
              name="payment_type"
              checked={selectedMethod === 'express'}
              onChange={() => {}}
              className="accent-purple-500"
            />
          </div>

          {/* 2. Credit or Debit Card */}
          <div 
            onClick={() => setSelectedMethod('card')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              selectedMethod === 'card'
                ? 'border-purple-500 bg-purple-600/15 shadow-md shadow-purple-500/10'
                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Credit or Debit Card</p>
                <p className="text-[11px] text-content-muted">Visa, MasterCard, AMEX, Discover</p>
              </div>
            </div>
            <input
              type="radio"
              name="payment_type"
              checked={selectedMethod === 'card'}
              onChange={() => {}}
              className="accent-purple-500"
            />
          </div>

          {/* Card Form inputs */}
          {selectedMethod === 'card' && (
            <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 space-y-2 animate-fade-in">
              <input 
                type="text" 
                placeholder="Card number" 
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="MM / YY" 
                  className="w-1/2 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <input 
                  type="text" 
                  placeholder="CVC" 
                  className="w-1/2 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* 3. Gift / Promo Code */}
          <div 
            onClick={() => setSelectedMethod('redeem')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              selectedMethod === 'redeem'
                ? 'border-purple-500 bg-purple-600/15 shadow-md shadow-purple-500/10'
                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Redeem Promo Code</p>
                <p className="text-[11px] text-content-muted">Have a gift card or discount code?</p>
              </div>
            </div>
            <input
              type="radio"
              name="payment_type"
              checked={selectedMethod === 'redeem'}
              onChange={() => {}}
              className="accent-purple-500"
            />
          </div>

        </div>

        {/* Footer Action Button */}
        <div className="p-5 border-t border-white/10 bg-black/40">
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isProcessing ? 'Processing Transaction...' : 'Subscribe for $4.99/mo'}
          </button>
          
          <div className="flex items-center justify-center gap-1 mt-3 text-[10px] text-content-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted 256-Bit SSL Global Payment Gateway</span>
          </div>
        </div>

      </div>
    </div>
  );
}