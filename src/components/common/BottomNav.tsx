import type { LucideIcon } from 'lucide-react';
import type { ViewKey } from '@/types';

export interface NavItem {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface BottomNavProps {
  items: NavItem[];
  active: ViewKey;
  onChange: (view: ViewKey) => void;
}

export function BottomNav({ items, active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-white/[0.08] safe-bottom"
      aria-label="Primary"
    >
      <div className="flex items-stretch max-w-md mx-auto">
        {items.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className="nav-item"
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <span className="relative">
                <Icon
                  className={`w-[22px] h-[22px] transition-colors duration-200 ${
                    isActive ? 'text-brand-purple' : 'text-content-muted'
                  }`}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                {item.badge != null && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </span>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-content-primary' : 'text-content-muted'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-brand-gradient" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
