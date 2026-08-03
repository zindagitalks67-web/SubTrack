import { useState, useMemo } from 'react';
import { Plus, Search, ArrowUpDown } from 'lucide-react';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { Header } from '@/components/common/Header';
import { SubscriptionCard } from '@/components/subscriptions/SubscriptionCard';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';
import { EmptyState } from '@/components/common/EmptyState';
import { CATEGORIES } from '@/utils/constants';

type SortOption = 'date' | 'cost-desc' | 'cost-asc' | 'name';

export function SubscriptionsView() {
  const { subscriptions, paywall } = useSubscriptions();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('date');

  // Filter & Sort Logic
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              sub.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || sub.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'cost-desc') return b.cost - a.cost;
        if (sortBy === 'cost-asc') return a.cost - b.cost;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        // Default: Next Renewal Date
        return new Date(a.nextRenewalDate).getTime() - new Date(b.nextRenewalDate).getTime();
      });
  }, [subscriptions, searchQuery, selectedCategory, sortBy]);
  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-1 w-full max-w-full">
  {/* Filter tabs/buttons */}
</div>

  const handleOpenAddModal = () => {
    if (subscriptions.length >= 5) {
      paywall.open('limit_reached' as any);
    } else {
      setIsAddOpen(true);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <Header
        title="Subscriptions"
        subtitle={`Managing ${subscriptions.length} active services`}
        actions={
          <button onClick={handleOpenAddModal} className="btn-primary text-xs py-2 px-3">
            <Plus className="w-4 h-4" /> Add
          </button>
        }
      />

      {/* Search & Sort Controls */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-secondary" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-content-muted"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-content-secondary hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="glass-input px-3 py-2 text-xs rounded-xl bg-[#121318] text-white cursor-pointer appearance-none pr-8 border border-white/10"
            >
              <option value="date">Next Renewal</option>
              <option value="cost-desc">Price: High to Low</option>
              <option value="cost-asc">Price: Low to High</option>
              <option value="name">Name A-Z</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-content-secondary pointer-events-none" />
          </div>
        </div>

        {/* Category Pills (Filter) */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-white/[0.04] text-content-secondary hover:bg-white/[0.08]'
            }`}
          >
            All ({subscriptions.length})
          </button>
          {CATEGORIES.map((cat: any) => {
            const categoryName = typeof cat === 'string' ? cat : cat.name;
            const count = subscriptions.filter((s) => s.category === categoryName).length;
            if (count === 0) return null;
            return (
              <button
                key={categoryName}
                onClick={() => setSelectedCategory(categoryName)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === categoryName
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-white/[0.04] text-content-secondary hover:bg-white/[0.08]'
                }`}
              >
                {categoryName} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Subscriptions List / Empty State */}
      {filteredSubscriptions.length > 0 ? (
        <div className="space-y-2.5">
          {filteredSubscriptions.map((sub) => (
            <SubscriptionCard 
              key={sub.id} 
              subscription={sub} 
              onEdit={() => {}}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No subscriptions found"
          description={
            searchQuery || selectedCategory !== 'All'
              ? 'Try adjusting your search or filter criteria.'
              : 'Add your first subscription to start tracking.'
          }
        />
      )}

      {/* Add Subscription Form Modal */}
      <SubscriptionForm 
        open={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
      />
    </div>
  );
}