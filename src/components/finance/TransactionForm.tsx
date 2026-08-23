import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Transaction } from '@/context/FinanceContext';

interface TransactionFormProps {
  initialData?: Transaction | null;
  defaultType?: 'income' | 'expense';
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
}

export function TransactionForm({ initialData, defaultType = 'expense', onClose, onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || defaultType);
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [currency, setCurrency] = useState(initialData?.currency || 'USD');
  const [category, setCategory] = useState(initialData?.category || (defaultType === 'expense' ? 'Food & Dining' : 'Salary'));
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      amount: parseFloat(amount) || 0,
      currency,
      category,
      description,
      date,
      paymentMethod,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-card w-full max-w-md p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-content-primary">
            {initialData ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5 text-content-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 px-3 rounded-xl border transition-all ${
                type === 'expense' ? 'bg-danger/10 border-danger/50 text-danger' : 'border-white/10 text-content-secondary'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 px-3 rounded-xl border transition-all ${
                type === 'income' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'border-white/10 text-content-secondary'
              }`}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-content-secondary mb-1.5 block">Amount</span>
              <input
                required
                type="number"
                step="0.01"
                className="glass-input w-full px-3.5 py-3 text-base"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-content-secondary mb-1.5 block">Currency</span>
              <select
                className="glass-input w-full px-3.5 py-3 text-base"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-content-secondary mb-1.5 block">Category</span>
              <select
                className="glass-input w-full px-3.5 py-3 text-base"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {type === 'expense' ? (
                  <>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Travel">Travel</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Family">Family</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                  </>
                ) : (
                  <>
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Business">Business</option>
                    <option value="Investments">Investments</option>
                    <option value="Rental Income">Rental Income</option>
                    <option value="Other Income">Other Income</option>
                  </>
                )}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-content-secondary mb-1.5 block">Date</span>
              <input
                required
                type="date"
                className="glass-input w-full px-3.5 py-3 text-base"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">Description</span>
            <input
              required
              className="glass-input w-full px-3.5 py-3 text-base"
              placeholder="e.g., Monthly Salary, Groceries"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-content-secondary mb-1.5 block">Payment Method (optional)</span>
            <input
              className="glass-input w-full px-3.5 py-3 text-base"
              placeholder="Credit Card, UPI, Cash..."
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
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