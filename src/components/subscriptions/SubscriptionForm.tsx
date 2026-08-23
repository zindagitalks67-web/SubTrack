import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Subscription } from '@/context/SubscriptionContext';

interface SubscriptionFormProps {
  initialData?: Subscription | null;
  onClose: () => void;
  onSubmit: (data: Omit<Subscription, 'id' | 'user_id'>) => Promise<void>;
}

export function SubscriptionForm({ initialData, onClose, onSubmit }: SubscriptionFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [cost, setCost] = useState(initialData?.cost?.toString() || '');
  const [currency, setCurrency] = useState(initialData?.currency || 'USD');
  const [billingCycle, setBillingCycle] = useState<'weekly' | 'monthly' | 'yearly'>(initialData?.billingCycle || 'monthly');
  const [category, setCategory] = useState(initialData?.category || 'Entertainment');
  const [nextRenewalDate, setNextRenewalDate] = useState(initialData?.nextRenewalDate || '');
  const [shared, setShared] = useState(initialData?.shared || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      cost: parseFloat(cost) || 0,
      currency,
      billingCycle,
      category,
      nextRenewalDate: nextRenewalDate || null,
      shared,
      active: true,
      priceHistory: [],
      familyMemberIds: [],
      notes: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-md p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-content-primary">
            {initialData ? 'Edit Subscription' : 'Add Subscription'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5 text-content-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">Name</span>
            <input
              required
              className="glass-input w-full px-3.5 py-3 text-base"
              placeholder="Netflix"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-content-secondary mb-1.5 block">Cost</span>
              <input
                required
                type="number"
                step="0.01"
                className="glass-input w-full px-3.5 py-3 text-base"
                placeholder="11.99"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-content-secondary mb-1.5 block">Currency</span>
              <select
                className="glass-input w-full px-3.5 py-3 text-base"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-content-secondary mb-1.5 block">Billing Cycle</span>
              <select
                className="glass-input w-full px-3.5 py-3 text-base"
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as 'weekly' | 'monthly' | 'yearly')} // ✅ FIX: Cast kiya
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="weekly">Weekly</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-content-secondary mb-1.5 block">Category</span>
              <select
                className="glass-input w-full px-3.5 py-3 text-base"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Entertainment">Entertainment</option>
                <option value="Music">Music</option>
                <option value="Productivity">Productivity</option>
                <option value="Cloud Storage">Cloud Storage</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">Next Renewal Date</span>
            <input
              type="date"
              className="glass-input w-full px-3.5 py-3 text-base"
              value={nextRenewalDate}
              onChange={(e) => setNextRenewalDate(e.target.value)}
            />
          </label>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={shared}
              onChange={(e) => setShared(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-content-secondary">Shared with family</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">
              <Save className="w-4 h-4" /> {initialData ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}