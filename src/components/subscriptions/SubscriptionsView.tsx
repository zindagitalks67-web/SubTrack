import { useState } from 'react';
import { Plus, Search, Layers } from 'lucide-react';
import { useSubscriptions } from '@/context/SubscriptionContext';
import type { Subscription } from '@/context/SubscriptionContext';
import { SubscriptionCard } from './SubscriptionCard';
import { SubscriptionForm } from './SubscriptionForm';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';

export function SubscriptionsView() {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription } = useSubscriptions();
  const [showForm, setShowForm] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filtered = subscriptions.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      deleteSubscription(id);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <Header
        title="Subscriptions"
        subtitle={`Managing ${subscriptions.length} active services`}
        icon={Layers}
        actions={
          <button
            onClick={() => {
              setEditingSub(null);
              setShowForm(true);
            }}
            className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Subscription
          </button>
        }
      />

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['All', 'Entertainment', 'Music', 'Productivity', 'Cloud Storage', 'Other'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`chip px-3 py-1.5 border transition-all ${
                categoryFilter === cat
                  ? 'border-brand-purple/60 bg-brand-gradient-soft text-content-primary'
                  : 'border-white/10 bg-white/[0.03] text-content-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No subscriptions found"
          description="Add one by clicking the '+' button above."
          action={
            <button onClick={() => { setEditingSub(null); setShowForm(true); }} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Add Subscription
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <SubscriptionForm
          initialData={editingSub}
          onClose={() => setShowForm(false)}
          onSubmit={async (data) => {
            if (editingSub) {
              await updateSubscription(editingSub.id, data);
            } else {
              await addSubscription(data);
            }
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}