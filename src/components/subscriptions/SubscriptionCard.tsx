import React from 'react';
import { Calendar, DollarSign, Users, Edit2, Trash2 } from 'lucide-react';
import type { Subscription } from '@/context/SubscriptionContext';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (sub: Subscription) => void;
  onDelete?: (id: string) => void;
}

export function SubscriptionCard({ subscription, onEdit, onDelete }: SubscriptionCardProps) {
  const {
    id,
    name,
    price,
    currency,
    billingCycle,
    nextRenewal,
    category,
    active,
    shared_with,
  } = subscription;

  const formattedDate = nextRenewal
    ? new Date(nextRenewal).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  const cycleLabel = billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${active ? 'border-gray-200 dark:border-gray-700' : 'border-red-200 dark:border-red-800'} p-4 transition-all`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{category || 'Uncategorized'}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(subscription)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Edit2 className="w-4 h-4 text-gray-500" />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1 text-sm">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {currency} {price.toFixed(2)} / {cycleLabel}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Next: {formattedDate}</span>
        </div>
        {shared_with && shared_with.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{shared_with.length} shared</span>
          </div>
        )}
        {!active && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Inactive</span>
        )}
      </div>
    </div>
  );
}