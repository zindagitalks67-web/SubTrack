import { useState } from 'react';
import { X, ShieldCheck, ChevronDown, ChevronUp, CreditCard, Gift } from 'lucide-react';
import type { SubscriptionTier } from '@/types';
import { useSubscriptions } from '@/context/SubscriptionContext';

export function PaywallModal() {
  const { paywall, upgradeTier, profile } = useSubscriptions();
  const [selectedMethod, setSelectedMethod] = useState<string>('upi');
  const [upiExpanded, setUpiExpanded] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedApp, setSelectedApp] = useState('PhonePe');

  // Fix 1: Check paywall open state safely
  const isOpen = paywall?.state?.open ?? (paywall as any)?.isOpen ?? false;

  if (!isOpen) return null;

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Fix 2: Cast 'monthly' as SubscriptionTier
      upgradeTier('monthly' as SubscriptionTier);
      setIsProcessing(false);
      paywall.close();
    }, 1200);
  };

  const upiApps = [
    { name: 'PhonePe', color: 'bg-purple-600', icon: 'P' },
    { name: 'Cred', color: 'bg-black border border-white/20', icon: 'C' },
    { name: 'ICICI Bank Apps', color: 'bg-orange-600', icon: 'i' },
    { name: 'YES BANK', color: 'bg-red-600', icon: 'Y' },
    { name: 'IDFC Bank Apps', color: 'bg-amber-700', icon: 'F' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#121318] text-white rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header Section */}
        <div className="p-5 border-b border-white/10 relative">
          <button 
            onClick={() => paywall.close()} 
            className="absolute top-4 right-4 text-content-secondary hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-xl font-bold">
              S
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">SubTrack Pro</h3>
              <p className="text-xs text-content-secondary">{profile.email || 'user@example.com'}</p>
            </div>
            <div className="ml-auto text-right pr-6">
              <span className="text-xl font-black text-white">₹499.00</span>
              <p className="text-[10px] text-content-muted">/year</p>
            </div>
          </div>

          <p className="text-[11px] text-content-muted mt-3">
            By continuing, you agree to SubTrack Payment Terms. Encrypted and safe transaction.
          </p>
        </div>

        {/* Scrollable Payment Options */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">

          {/* 1. Pay with UPI */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <button
              onClick={() => {
                setSelectedMethod('upi');
                setUpiExpanded(!upiExpanded);
              }}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/[0.03]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  UPI
                </div>
                <div>
                  <p className="text-sm font-semibold">Pay with UPI</p>
                  <p className="text-[11px] text-content-muted">Instant payment via PhonePe, Cred & more</p>
                </div>
              </div>
              {upiExpanded ? <ChevronUp className="w-4 h-4 text-content-secondary" /> : <ChevronDown className="w-4 h-4 text-content-secondary" />}
            </button>

            {upiExpanded && (
              <div className="px-3 pb-3 space-y-1.5 border-t border-white/5 pt-2">
                {upiApps.map((app) => (
                  <label
                    key={app.name}
                    onClick={() => {
                      setSelectedMethod('upi');
                      setSelectedApp(app.name);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      selectedMethod === 'upi' && selectedApp === app.name
                        ? 'bg-purple-600/20 border border-purple-500/40'
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full ${app.color} flex items-center justify-center font-bold text-xs text-white`}>
                        {app.icon}
                      </div>
                      <span className="text-xs font-medium text-white">{app.name}</span>
                    </div>
                    <input
                      type="radio"
                      name="payment_option"
                      checked={selectedMethod === 'upi' && selectedApp === app.name}
                      onChange={() => {}}
                      className="accent-purple-500"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 2. Add Card */}
          <div 
            onClick={() => setSelectedMethod('card')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              selectedMethod === 'card'
                ? 'border-purple-500/50 bg-purple-600/15'
                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold">Add credit or debit card</span>
            </div>
            <span className="text-[10px] bg-white/10 text-content-secondary px-2 py-0.5 rounded-md">
              VISA / MasterCard / RuPay
            </span>
          </div>

          {/* 3. Redeem Code */}
          <div 
            onClick={() => setSelectedMethod('redeem')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              selectedMethod === 'redeem'
                ? 'border-purple-500/50 bg-purple-600/15'
                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Gift className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold">Redeem code</span>
            </div>
          </div>

        </div>

        {/* Footer Action Button */}
        <div className="p-4 border-t border-white/10 bg-black/40">
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isProcessing ? 'Processing Payment...' : `Subscribe with ${selectedMethod === 'upi' ? selectedApp : 'Selected Method'}`}
          </button>
          
          <div className="flex items-center justify-center gap-1 mt-2.5 text-[10px] text-content-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure 256-bit encrypted checkout</span>
          </div>
        </div>

      </div>
    </div>
  );
}