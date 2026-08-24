import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Transaction, TransactionType } from '@/context/FinanceContext';

interface TransactionFormProps {
  initialData?: Transaction | null;
  type: TransactionType;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'user_id'>) => Promise<void>;
}

export function TransactionForm({ initialData, type, onClose, onSubmit }: TransactionFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [currency, setCurrency] = useState(initialData?.currency || 'USD');
  const [category, setCategory] = useState(initialData?.category || 'Other');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      type,
      name,
      amount: parseFloat(amount) || 0,
      currency,
      category,
      date,
      notes: '',
    });
    onClose();
  };

  const categories = type === 'expense' 
    ? ['Food & Dining', 'Transportation', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other']
    : ['Salary', 'Freelance', 'Business', 'Investment', 'Rental Income', 'Other'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-md p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-content-primary">
            {initialData ? 'Edit Transaction' : type === 'expense' ? 'Add Expense' : 'Add Income'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5 text-content-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">Name</span>
            <input className="glass-input w-full px-3.5 py-3 text-base" placeholder="Movie ticket" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-content-secondary mb-1.5 block">Amount</span>
              <input type="number" step="0.01" className="glass-input w-full px-3.5 py-3 text-base" placeholder="50.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-content-secondary mb-1.5 block">Currency</span>
              <select className="glass-input w-full px-3.5 py-3 text-base" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">Category</span>
            <select className="glass-input w-full px-3.5 py-3 text-base" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">Date</span>
            <input type="date" className="glass-input w-full px-3.5 py-3 text-base" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}