import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { Toast } from '@/types';
import { useToastContext } from '@/context/ToastContext';

const config = {
  success: { icon: CheckCircle2, color: 'text-success', ring: 'border-success/30 bg-success/10' },
  error: { icon: AlertCircle, color: 'text-danger', ring: 'border-danger/30 bg-danger/10' },
  warning: { icon: AlertTriangle, color: 'text-warning', ring: 'border-warning/30 bg-warning/10' },
  info: { icon: Info, color: 'text-brand-blue', ring: 'border-brand-blue/30 bg-brand-blue/10' },
} as const;

export function ToastContainer() {
  const { toasts, dismissToast } = useToastContext();

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 w-full max-w-sm px-3 safe-top">
      {toasts.map((t: Toast) => {
        const c = config[t.type];
        const Icon = c.icon;
        return (
          <div
            key={t.id}
            className={`glass-card border ${c.ring} px-4 py-3 w-full flex items-start gap-3 animate-toast-in shadow-glass`}
            role="status"
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${c.color}`} />
            <p className="text-sm text-content-primary flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-content-muted hover:text-content-primary transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
