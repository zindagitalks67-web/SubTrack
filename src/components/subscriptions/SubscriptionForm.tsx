import { useEffect, useState } from 'react';
import { Trash2, Users } from 'lucide-react';
import type { Subscription, BillingCycle } from '@/types';
import { CATEGORIES, BILLING_CYCLES, BILLING_LABELS } from '@/utils/constants';
import { useSubscriptions, type SubscriptionDraft } from '@/context/SubscriptionContext';
import { useToastContext } from '@/context/ToastContext';
import { Modal } from '@/components/common/Modal';
import { toISODate } from '@/utils/dateHelpers';

interface SubscriptionFormProps {
  open: boolean;
  onClose: () => void;
  editing?: Subscription | null;
  onDeleted?: () => void;
}

const emptyDraft = (): SubscriptionDraft => ({
  name: '',
  category: 'Entertainment',
  cost: 0,
  billingCycle: 'monthly',
  startDate: toISODate(new Date()),
  active: true,
  shared: false,
  familyMemberIds: [],
  notes: '',
});

export function SubscriptionForm({ open, onClose, editing, onDeleted }: SubscriptionFormProps) {
  const { addSubscription, updateSubscription, deleteSubscription, family, paywall } = useSubscriptions();
  const { pushToast } = useToastContext();
  const [draft, setDraft] = useState<SubscriptionDraft>(emptyDraft());
  const [costInput, setCostInput] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      if (editing) {
        setDraft({
          id: editing.id,
          name: editing.name,
          category: editing.category,
          cost: editing.cost,
          billingCycle: editing.billingCycle,
          startDate: editing.startDate.slice(0, 10),
          active: editing.active,
          shared: editing.shared,
          familyMemberIds: editing.familyMemberIds,
          notes: editing.notes ?? '',
        });
        setCostInput(String(editing.cost));
      } else {
        const fresh = emptyDraft();
        setDraft(fresh);
        setCostInput('');
      }
      setTouched({});
    }
  }, [open, editing]);

  const set = <K extends keyof SubscriptionDraft>(key: K, value: SubscriptionDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const toggleMember = (id: string) => {
    setDraft((d) => ({
      ...d,
      familyMemberIds: d.familyMemberIds.includes(id)
        ? d.familyMemberIds.filter((m) => m !== id)
        : [...d.familyMemberIds, id],
    }));
  };

  const handleSubmit = () => {
    setTouched({ name: true, cost: true, category: true });
    const cost = parseFloat(costInput) || 0;
    const next = { ...draft, cost };

    if (!next.name.trim()) {
      pushToast('error', 'Subscription name is required.');
      return;
    }
    if (!next.category) {
      pushToast('error', 'Please select a category.');
      return;
    }
    if (cost <= 0) {
      pushToast('error', 'Cost must be greater than zero.');
      return;
    }
    if (next.shared && next.familyMemberIds.length === 0) {
      pushToast('warning', 'Sharing is on but no members selected — saving as personal.');
      next.shared = false;
    }
    if (next.shared && !paywall.isPaid) {
      paywall.open('family');
      return;
    }

    const result = next.id
      ? updateSubscription(next.id, next)
      : addSubscription(next);
    if (result.ok) onClose();
  };

  const handleDelete = () => {
    if (!editing) return;
    deleteSubscription(editing.id);
    onDeleted?.();
    onClose();
  };

  const nameError = touched.name && !draft.name.trim();
  const costError = touched.cost && (parseFloat(costInput) || 0) <= 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? 'Edit subscription' : 'Add subscription'}
    >
      <div className="space-y-4">
        {/* Name */}
        <Field label="Name" error={nameError ? 'Required' : undefined}>
          <input
            className={`glass-input w-full px-3.5 py-3 text-base ${nameError ? 'border-danger/50 ring-danger/30' : ''}`}
            placeholder="e.g. Netflix"
            value={draft.name}
            onChange={(e) => set('name', e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          />
        </Field>

        {/* Category */}
        <Field label="Category">
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => {
              const selected = draft.category === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => set('category', c.name)}
                  className={`rounded-xl px-2 py-2.5 text-xs font-medium border transition-all ${
                    selected
                      ? 'border-transparent text-white'
                      : 'border-white/10 bg-white/[0.03] text-content-secondary hover:bg-white/[0.06]'
                  }`}
                  style={selected ? { backgroundColor: `${c.color}33`, borderColor: `${c.color}80` } : undefined}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Cost + Cycle */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cost" error={costError ? 'Must be > 0' : undefined}>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted text-sm">$</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                className={`glass-input w-full pl-7 pr-3 py-3 text-base ${costError ? 'border-danger/50 ring-danger/30' : ''}`}
                placeholder="0.00"
                value={costInput}
                onChange={(e) => setCostInput(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, cost: true }))}
              />
            </div>
          </Field>
          <Field label="Billing cycle">
            <div className="grid grid-cols-3 gap-1.5">
              {BILLING_CYCLES.map((c: BillingCycle) => {
                const selected = draft.billingCycle === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set('billingCycle', c)}
                    className={`rounded-xl py-3 text-xs font-medium border transition-all ${
                      selected
                        ? 'border-brand-purple/60 bg-brand-gradient-soft text-content-primary'
                        : 'border-white/10 bg-white/[0.03] text-content-secondary hover:bg-white/[0.06]'
                    }`}
                  >
                    {BILLING_LABELS[c]}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        {/* Start date */}
        <Field label="Start date">
          <input
            type="date"
            className="glass-input w-full px-3.5 py-3 text-base"
            value={draft.startDate}
            onChange={(e) => set('startDate', e.target.value)}
          />
        </Field>

        {/* Shared toggle */}
        <button
          type="button"
          onClick={() => {
            if (!draft.shared && !paywall.isPaid) {
              paywall.open('family');
              return;
            }
            set('shared', !draft.shared);
          }}
          className={`w-full flex items-center justify-between rounded-xl px-4 py-3 border transition-all ${
            draft.shared
              ? 'border-brand-purple/50 bg-brand-gradient-soft'
              : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Users className={`w-5 h-5 ${draft.shared ? 'text-brand-purple' : 'text-content-muted'}`} />
            <div className="text-left">
              <p className="text-sm font-medium text-content-primary">Shared with family</p>
              <p className="text-xs text-content-secondary">Split cost across members</p>
            </div>
          </div>
          <span
            className={`w-11 h-6 rounded-full p-0.5 transition-colors ${draft.shared ? 'bg-brand-purple' : 'bg-white/15'}`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white transition-transform ${draft.shared ? 'translate-x-5' : ''}`}
            />
          </span>
        </button>

        {/* Member selection */}
        {draft.shared && (
          <div className="space-y-2 animate-slide-down">
            <p className="text-xs font-medium text-content-secondary">Select members</p>
            {family.length === 0 ? (
              <p className="text-xs text-content-muted">No family members yet — add some in the Family tab.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {family.map((m) => {
                  const sel = draft.familyMemberIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMember(m.id)}
                      className={`chip px-3 py-1.5 border transition-all ${
                        sel
                          ? 'border-brand-purple/60 bg-brand-purple/20 text-content-primary'
                          : 'border-white/10 bg-white/[0.03] text-content-secondary'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: m.avatarColor }}
                      />
                      {m.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <Field label="Notes (optional)">
          <textarea
            className="glass-input w-full px-3.5 py-3 text-sm min-h-[72px] resize-none"
            placeholder="Any details about this subscription…"
            value={draft.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
          />
        </Field>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {editing && (
            <button type="button" onClick={handleDelete} className="btn-danger px-3" aria-label="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="btn-primary flex-1">
            {editing ? 'Save changes' : 'Add subscription'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-content-secondary">{label}</span>
        {error && <span className="text-[11px] text-danger">{error}</span>}
      </span>
      {children}
    </label>
  );
}
