import { useState } from 'react';
import { Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import type { Transaction } from '@/context/FinanceContext';
import { TransactionForm } from './TransactionForm';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { GlassCard } from '@/components/common/GlassCard';

export function FinanceView() {
  // ✅ FIXED: addTransaction aur updateTransaction ko yahan destructure kiya hai
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [showForm, setShowForm] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(t => t.type === activeTab);

  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="animate-fade-in space-y-4">
      <Header
        title="Finance"
        subtitle={`Expenses: ${totalSpent.toFixed(2)} · Income: ${totalIncome.toFixed(2)}`}
        icon={Wallet}
        actions={
          <button
            onClick={() => { setEditingTxn(null); setShowForm(true); }}
            className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add {activeTab === 'expense' ? 'Expense' : 'Income'}
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('expense')}
          className={`chip px-4 py-2 border transition-all flex items-center gap-2 ${
            activeTab === 'expense'
              ? 'border-danger/60 bg-danger/10 text-danger'
              : 'border-white/10 bg-white/[0.03] text-content-secondary'
          }`}
        >
          <TrendingDown className="w-4 h-4" /> Expenses
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`chip px-4 py-2 border transition-all flex items-center gap-2 ${
            activeTab === 'income'
              ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400'
              : 'border-white/10 bg-white/[0.03] text-content-secondary'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Income
        </button>
      </div>

      {/* List */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={activeTab === 'expense' ? TrendingDown : TrendingUp}
          title={`No ${activeTab === 'expense' ? 'expenses' : 'income'} yet`}
          description={`Add your ${activeTab === 'expense' ? 'expenses' : 'income'} to track your finances.`}
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Add {activeTab === 'expense' ? 'Expense' : 'Income'}
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((txn) => (
            <GlassCard key={txn.id} className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-content-primary truncate">{txn.description}</p>
                  <p className="text-xs text-content-secondary">
                    {txn.category} · {txn.date}
                  </p>
                </div>
                <div className={`text-right shrink-0 font-semibold ${txn.type === 'expense' ? 'text-danger' : 'text-emerald-400'}`}>
                  {txn.type === 'expense' ? '-' : '+'} {txn.currency} {txn.amount.toFixed(2)}
                </div>
                <button
                  onClick={() => { setEditingTxn(txn); setShowForm(true); }}
                  className="text-content-muted hover:text-brand-purple p-1"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteTransaction(txn.id)}
                  className="text-content-muted hover:text-danger p-1"
                >
                  🗑️
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {showForm && (
        <TransactionForm
          initialData={editingTxn}
          defaultType={activeTab}
          onClose={() => setShowForm(false)}
          onSubmit={(data: Omit<Transaction, 'id'>) => { // ✅ FIX: data ka type diya
            if (editingTxn) {
              updateTransaction(editingTxn.id, data);
            } else {
              addTransaction(data);
            }
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}