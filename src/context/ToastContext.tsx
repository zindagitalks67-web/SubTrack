import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Toast } from '@/types';
import { useToasts } from '@/hooks/useToasts';

interface ToastContextValue {
  toasts: Toast[];
  pushToast: (type: Toast['type'], message: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, push, dismiss } = useToasts();
  const value = useMemo<ToastContextValue>(
    () => ({ toasts, pushToast: push, dismissToast: dismiss }),
    [toasts, push, dismiss],
  );
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}
