import { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { useBills } from '@/context/BillsContext';
import type { Bill } from '@/context/BillsContext';
import { BillForm } from './BillForm';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { GlassCard } from '@/components/common/GlassCard';

export function BillsView() {
  const { bills, addBill, updateBill, deleteBill } = useBills();
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="animate-fade-in space-y-4">
      <Header
        title="Bills"
        subtitle={`${bills.length} bills · ${totalBills.toFixed(2)} total`}
        icon={Receipt}
        actions={
          <button onClick={() => { setEditingBill(null); setShowForm(true); }} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Bill
          </button>
        }
      />

      {bills.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No bills yet"
          description="Add your electricity, rent, internet, or insurance bills to track them."
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Add Bill
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => (
            <GlassCard key={bill.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-content-primary">{bill.name}</p>
                  <p className="text-xs text-content-secondary">{bill.provider} · {bill.category} · Due {bill.dueDate}</p>
                  {bill.autoPay && <span className="text-[10px] text-brand-cyan">Auto-Pay</span>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-content-primary">{bill.currency} {bill.amount.toFixed(2)}</p>
                  <button
                    onClick={() => updateBill(bill.id, { paid: !bill.paid })}
                    className={`text-xs font-medium px-2 py-1 rounded-full mt-1 ${bill.paid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}
                  >
                    {bill.paid ? 'Paid' : 'Unpaid'}
                  </button>
                </div>
                <button onClick={() => deleteBill(bill.id)} className="text-content-muted hover:text-danger p-2">✕</button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {showForm && (
        <BillForm
          initialData={editingBill}
          onClose={() => setShowForm(false)}
          onSubmit={(data: Omit<Bill, 'id'>) => {
            if (editingBill) {
              updateBill(editingBill.id, data);
            } else {
              addBill(data);
            }
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}