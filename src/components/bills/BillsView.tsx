import { useState, useMemo } from 'react';
import { Plus, Search, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
import { useBills, type Bill } from '@/context/BillsContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';
import { useLanguage } from '@/context/LanguageContext';

export function BillsView() {
  const { t } = useLanguage();
  const { bills, addBill, updateBill, deleteBill, markAsPaid, loading } = useBills();
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'paid'>('all');

  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' ? true : filter === 'paid' ? b.paid : !b.paid;
      return matchesSearch && matchesFilter;
    });
  }, [bills, search, filter]);

  const openAdd = () => {
    setEditingBill(null);
    setShowForm(true);
  };

  const openEdit = (bill: Bill) => {
    setEditingBill(bill);
    setShowForm(true);
  };

  const handleSubmit = async (data: Omit<Bill, 'id' | 'user_id'>) => {
    if (editingBill) {
      await updateBill(editingBill.id, data);
    } else {
      await addBill(data);
    }
    setShowForm(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <Header
        title={t('bills')}
        subtitle={`${bills.filter(b => !b.paid).length} unpaid`}
        icon={Calendar}
        actions={
          <button
            onClick={openAdd}
            className="group relative px-5 py-2.5 text-sm font-semibold text-white rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:via-cyan-500 hover:to-teal-500 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            {t('addBill')}
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
          <input
            type="text"
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: t('all') },
            { key: 'upcoming', label: t('upcoming') },
            { key: 'paid', label: 'Paid' } // 👈 Paid label yahan hardcode kiya (t('paid') abhi add nahi hai translations mein)
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`chip px-3 py-1.5 border transition-all capitalize ${
                filter === f.key
                  ? 'border-brand-blue/60 bg-brand-gradient-soft text-content-primary'
                  : 'border-white/10 bg-white/[0.03] text-content-secondary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filteredBills.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={t('noBills')}
          description={t('addBill')}
          action={
            <button onClick={openAdd} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> {t('addBill')}
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredBills.map((bill) => (
            <GlassCard key={bill.id} className={bill.paid ? 'opacity-60' : ''}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-content-primary truncate">{bill.name}</p>
                  <p className="text-xs text-content-secondary">
                    {bill.provider} · Due: {bill.dueDate}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className={`text-sm font-bold ${bill.paid ? 'text-emerald-500' : 'text-content-primary'}`}>
                    {bill.currency} {bill.amount.toFixed(2)}
                  </p>
                  {!bill.paid && (
                    <button onClick={() => markAsPaid(bill.id)} className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => openEdit(bill)} className="p-1.5 text-content-muted hover:bg-white/10 rounded-lg">
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteBill(bill.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {showForm && (
        <Modal open={showForm} onClose={() => setShowForm(false)} title={editingBill ? t('edit') : t('addBill')}>
          <BillForm initialData={editingBill} onClose={() => setShowForm(false)} onSubmit={handleSubmit} />
        </Modal>
      )}
    </div>
  );
}

function BillForm({ initialData, onClose, onSubmit }: { initialData: Bill | null; onClose: () => void; onSubmit: (data: Omit<Bill, 'id' | 'user_id'>) => Promise<void> }) {
  const { t } = useLanguage();
  const [name, setName] = useState(initialData?.name || '');
  const [provider, setProvider] = useState(initialData?.provider || '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [currency, setCurrency] = useState(initialData?.currency || 'USD');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [category, setCategory] = useState(initialData?.category || 'Other');
  const [paid, setPaid] = useState(initialData?.paid || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name, provider, amount: parseFloat(amount) || 0, currency, dueDate, category, paid,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-xs font-medium text-content-secondary mb-1.5 block">{t('fullName')}</span>
        <input className="glass-input w-full px-3.5 py-3 text-base" placeholder="Electricity Bill" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium text-content-secondary mb-1.5 block">Amount</span>
          <input type="number" step="0.01" className="glass-input w-full px-3.5 py-3 text-base" placeholder="100" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-content-secondary mb-1.5 block">Currency</span>
          <select className="glass-input w-full px-3.5 py-3 text-base" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-medium text-content-secondary mb-1.5 block">Due Date</span>
        <input type="date" className="glass-input w-full px-3.5 py-3 text-base" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </label>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-ghost flex-1">{t('cancel')}</button>
        <button type="submit" className="btn-primary flex-1">{t('save')}</button>
      </div>
    </form>
  );
}