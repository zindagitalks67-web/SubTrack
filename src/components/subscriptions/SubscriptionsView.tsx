import React, { useState } from 'react';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { SubscriptionCard } from './SubscriptionCard';
import { SubscriptionForm } from './SubscriptionForm'; // Jo bhi aapka edit/add modal component ho
import type { Subscription } from '@/types';
import { Plus, Search, ArrowUpDown } from 'lucide-react';

export function SubscriptionsView() {
  const { subscriptions } = useSubscriptions();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  // Categories list
  const categories = ['All', 'Entertainment', 'Music', 'Productivity', 'Storage', 'Utility'];

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesCategory = selectedCategory === 'All' || sub.category === selectedCategory;
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleEditClick = (sub: Subscription) => {
    setEditingSubscription(sub);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header & Search */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-content-primary">Subscriptions</h1>
            <p className="text-xs text-content-secondary">Managing {subscriptions.length} active services</p>
          </div>
          <button
            onClick={() => {
              setEditingSubscription(null);
              setIsEditModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-brand-indigo hover:bg-brand-indigo/90 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-content-muted" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-panel border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-content-primary focus:outline-none focus:border-brand-indigo"
            />
          </div>
        </div>
      </div>

      {/* FIXED: Filter Tabs with horizontal scroll and no cut-offs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 w-full max-w-full">
        {categories.map((category) => {
          const count = category === 'All' 
            ? subscriptions.length 
            : subscriptions.filter(s => s.category === category).length;
            
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-brand-indigo text-white shadow-lg'
                  : 'bg-panel border border-white/10 text-content-secondary hover:text-content-primary'
              }`}
            >
              {category} ({count})
            </button>
          );
        })}
      </div>

      {/* Subscriptions Grid / List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredSubscriptions.length > 0 ? (
          filteredSubscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onEdit={handleEditClick}
            />
          ))
        ) : (
          <div className="text-center py-10 text-xs text-content-muted">
            No subscriptions found.
          </div>
        )}
      </div>

   {/* Edit / Add Modal Component Integration */}
      <SubscriptionForm
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSubscription(null);
        }}
      />
    </div>
  );
}