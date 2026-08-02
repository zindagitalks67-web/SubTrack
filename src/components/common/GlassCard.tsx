import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`glass-card p-4 ${onClick ? 'cursor-pointer hover:border-white/15 transition-all duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
