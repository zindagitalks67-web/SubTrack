import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  showLogo?: boolean; // Naya option custom logo control karne ke liye
}

export function Header({ title, subtitle, icon: Icon, actions, showLogo = true }: HeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 min-w-0">
        {/* Agar Lucide Icon pass kiya gaya hai toh wo dikhega, warna Custom 3D Logo dikhega */}
        {Icon ? (
          <div className="w-10 h-10 rounded-xl bg-brand-gradient-soft border border-white/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-brand-purple" />
          </div>
        ) : showLogo ? (
          <img 
            src="/icon.png" 
            alt="SubTrack Logo" 
            className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-md border border-white/10" 
          />
        ) : null}

        <div className="min-w-0">
          <h1 className="text-xl font-bold text-content-primary truncate">{title}</h1>
          {subtitle && <p className="text-sm text-content-secondary truncate">{subtitle}</p>}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}