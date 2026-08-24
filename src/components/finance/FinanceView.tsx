import { useState, useMemo } from 'react';
import { Plus, Wallet, TrendingUp, ArrowDownRight, Trash2, Pencil } from 'lucide-react';
import { useFinance, type Transaction, type TransactionType } from '@/context/FinanceContext';
import { TransactionForm } from './TransactionForm';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';
import { EmptyState } from '@/components/common/EmptyState';
import { useLanguage } from '@/context/LanguageContext';

export function FinanceView() {
  const { t } = useLanguage();
  const { transactions, totalExpenses, totalIncome, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [tab, setTab] = useState<TransactionType>('expense');
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.type === tab);
  }, [transactions, tab]);

  const openAdd = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const openEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleSubmit = async (data: Omit<Transaction, 'id' | 'user_id'>) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await addTransaction(data);
    }
    setShowForm(false);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <Header
        title={t('finance')}
        subtitle={`${t('totalIncome')}: ${totalIncome.toFixed(2)}`}
        icon={Wallet}
        actions={
          <button
            onClick={openAdd}
            className={`group relative px-5 py-2.5 text-sm font-semibold text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2 ${
              tab === 'expense' 
                ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-500/30' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/30'
            }`}
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            {tab === 'expense' ? t('addExpense') : t('addIncome')}
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4">
          <p className="text-xs text-content-secondary">{t('totalExpenses')}</p>
          <p className="text-xl font-bold text-red-500 mt-1">- {totalExpenses.toFixed(2)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-xs text-content-secondary">{t('totalIncome')}</p>
          <p className="text-xl font-bold text-emerald-500 mt-1">+ {totalIncome.toFixed(2)}</p>
        </GlassCard>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => setTab('expense')}
          className={`chip px-4 py-2 border transition-all ${tab === 'expense' ? 'border-red-500/50 bg-red-500/10 text-red-500' : 'border-white/10 bg-white/[0.03] text-content-secondary'}`}
        >
          <ArrowDownRight className="w-4 h-4 inline mr-1" /> {t('expenses')}
        </button>
        <button 
          onClick={() => setTab('income')}
          className={`chip px-4 py-2 border transition-all ${tab === 'income' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500' : 'border-white/10 bg-white/[0.03] text-content-secondary'}`}
        >
          <TrendingUp className="w-4 h-4 inline mr-1" /> {t('income')}
        </button>
      </div>

      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={`${t('noTransactions')}`}
          description="Add transactions to see them here."
          action={
            <button onClick={openAdd} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> {tab === 'expense' ? t('addExpense') : t('addIncome')}
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((transaction) => (
            <GlassCard key={transaction.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-content-primary truncate">{transaction.name}</p>
                  <p className="text-xs text-content-secondary">{transaction.category} · {transaction.date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className={`text-sm font-bold ${transaction.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {transaction.type === 'expense' ? '-' : '+'} {transaction.currency} {transaction.amount.toFixed(2)}
                  </p>
                  <button onClick={() => openEdit(transaction)} className="p-1.5 text-content-muted hover:bg-white/10 rounded-lg">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteTransaction(transaction.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {showForm && (
        <TransactionForm
          initialData={editingTransaction}
          type={tab}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}