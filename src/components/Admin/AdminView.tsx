import { useState } from 'react';
import { ShieldCheck, Users, Layers, Calendar, Wallet, Trash2 } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';
import { EmptyState } from '@/components/common/EmptyState';

export function AdminView() {
  const { adminData, loading, deleteSubscription, deleteBill, deleteTransaction } = useAdmin();
  const [tab, setTab] = useState<'subscriptions' | 'bills' | 'transactions'>('subscriptions');

  return (
    <div className="animate-fade-in space-y-4">
      <Header title="Admin Panel" subtitle="Full access to all user data" icon={ShieldCheck} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-3 text-center">
          <Layers className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{adminData.subscriptions.length}</p>
          <p className="text-[10px] text-content-secondary">Subs</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <Calendar className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{adminData.bills.length}</p>
          <p className="text-[10px] text-content-secondary">Bills</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <Wallet className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{adminData.transactions.length}</p>
          <p className="text-[10px] text-content-secondary">Txns</p>
        </GlassCard>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['subscriptions', 'bills', 'transactions'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`chip px-4 py-2 border transition-all capitalize ${
              tab === t
                ? 'border-purple-500/50 bg-purple-500/10 text-purple-500'
                : 'border-white/10 bg-white/[0.03] text-content-secondary'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Data List */}
      {loading ? (
        <p className="text-center text-sm text-content-muted">Loading data...</p>
      ) : (
        <div className="space-y-2">
          {tab === 'subscriptions' && adminData.subscriptions.length === 0 && <EmptyState icon={Layers} title="No subscriptions found" description="All users data appears here." />}
          {tab === 'bills' && adminData.bills.length === 0 && <EmptyState icon={Calendar} title="No bills found" description="All users bills appear here." />}
          {tab === 'transactions' && adminData.transactions.length === 0 && <EmptyState icon={Wallet} title="No transactions found" description="All users transactions appear here." />}

          {tab === 'subscriptions' && adminData.subscriptions.map((sub) => (
            <GlassCard key={sub.id} className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium">{sub.name}</p>
                <p className="text-xs text-content-secondary">{sub.user_id} · {sub.price} {sub.currency}</p>
              </div>
              <button onClick={() => deleteSubscription(sub.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </GlassCard>
          ))}

          {tab === 'bills' && adminData.bills.map((bill) => (
            <GlassCard key={bill.id} className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium">{bill.name}</p>
                <p className="text-xs text-content-secondary">{bill.user_id} · {bill.amount} {bill.currency}</p>
              </div>
              <button onClick={() => deleteBill(bill.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </GlassCard>
          ))}

          {tab === 'transactions' && adminData.transactions.map((txn) => (
            <GlassCard key={txn.id} className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium">{txn.name}</p>
                <p className="text-xs text-content-secondary">{txn.user_id} · {txn.type} · {txn.amount} {txn.currency}</p>
              </div>
              <button onClick={() => deleteTransaction(txn.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}