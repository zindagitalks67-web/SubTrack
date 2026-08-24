import type { LucideIcon } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, icon: Icon, actions }: HeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30 border border-white/20 shrink-0">
          <Icon className="w-6 h-6 text-white" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-content-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-content-secondary truncate">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}