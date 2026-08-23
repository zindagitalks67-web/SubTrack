import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Bill } from '@/context/BillsContext';

interface BillFormProps {
  initialData?: Bill | null;
  onClose: () => void;
  onSubmit: (data: Omit<Bill, 'id'>) => void;
}

export function BillForm({ initialData, onClose, onSubmit }: BillFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [provider, setProvider] = useState(initialData?.provider || '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [currency, setCurrency] = useState(initialData?.currency || 'USD');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [category, setCategory] = useState(initialData?.category || 'Utilities');
  const [autoPay, setAutoPay] = useState(initialData?.autoPay || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      provider,
      amount: parseFloat(amount) || 0,
      currency,
      dueDate,
      category,
      autoPay,
      paid: initialData?.paid || false,
      notes: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-md p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-content-primary">{initialData ? 'Edit Bill' : 'Add Bill'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-content-muted" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">Bill Name</span>
            <input required className="glass-input w-full px-3.5 py-3 text-base" placeholder="Electricity" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">Provider</span>
            <input className="glass-input w-full px-3.5 py-3 text-base" placeholder="Tata Power" value={provider} onChange={(e) => setProvider(e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-content-secondary mb-1.5 block">Amount</span>
              <input required type="number" step="0.01" className="glass-input w-full px-3.5 py-3 text-base" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-content-secondary mb-1.5 block">Currency</span>
              <select className="glass-input w-full px-3.5 py-3 text-base" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-content-secondary mb-1.5 block">Due Date</span>
              <input type="date" required className="glass-input w-full px-3.5 py-3 text-base" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-content-secondary mb-1.5 block">Category</span>
              <select className="glass-input w-full px-3.5 py-3 text-base" value={category} onChange={(e) => setCategory(e.target.value)}>
                {['Utilities', 'Rent', 'Insurance', 'Internet', 'Loan', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={autoPay} onChange={(e) => setAutoPay(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm text-content-secondary">Auto-Pay enabled</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1"><Save className="w-4 h-4" /> Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}