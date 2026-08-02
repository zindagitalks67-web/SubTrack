import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

export interface ModalContextValue {
  onClose: () => void;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useModalContext(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModalContext must be used within a Modal');
  return ctx;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  title?: string;
}

const sizeClass: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({ open, onClose, children, size = 'md', title }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${sizeClass[size]} glass-card rounded-t-3xl sm:rounded-3xl
          shadow-glass max-h-[92vh] overflow-y-auto no-scrollbar
          animate-slide-up sm:animate-scale-in`}
      >
        {title && (
          <div className="sticky top-0 z-10 glass px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-content-primary">{title}</h2>
            <button
              onClick={onClose}
              className="text-content-muted hover:text-content-primary transition-colors p-1 -mr-1"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <ModalContext.Provider value={{ onClose }}>
          <div className="p-5">{children}</div>
        </ModalContext.Provider>
      </div>
    </div>
  );
}
