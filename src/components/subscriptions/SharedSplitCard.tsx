import React from 'react';
import { SharedMember } from '@/types';
import { CheckCircle2, XCircle, UserCheck } from 'lucide-react';

interface SharedSplitCardProps {
  members: SharedMember[];
  currencySymbol?: string;
  onToggleStatus: (memberId: string) => void;
}

export const SharedSplitCard: React.FC<SharedSplitCardProps> = ({
  members,
  currencySymbol = '₹',
  onToggleStatus,
}) => {
  if (!members || members.length === 0) return null;

  const totalOwed = members
    .filter((m) => !m.hasPaid)
    .reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 mt-3 space-y-3">
      <div className="flex justify-between items-center text-sm font-medium border-b border-slate-700/50 pb-2">
        <span className="text-slate-300 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-indigo-400" />
          Shared Splits ({members.length})
        </span>
        <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
          Pending: {currencySymbol}{totalOwed}
        </span>
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between bg-slate-900/50 px-3 py-2 rounded-lg text-xs"
          >
            <div>
              <p className="font-semibold text-slate-200">{member.name}</p>
              <p className="text-slate-400">
                {currencySymbol}{member.amount} / month
              </p>
            </div>

            <button
              onClick={() => onToggleStatus(member.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors font-medium ${
                member.hasPaid
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
              }`}
            >
              {member.hasPaid ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" /> Mark Paid
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};