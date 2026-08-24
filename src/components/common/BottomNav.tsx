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
          const Icon = item.icon; // Direct component reference
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className="nav-item flex flex-col items-center justify-center gap-1 py-2 flex-1"
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <span className={`relative flex items-center justify-center w-9 h-9 rounded-2xl transition-all duration-300 ${isActive ? 'bg-purple-500/20 scale-110 shadow-md shadow-purple-500/20' : 'bg-transparent'}`}>
                {/* Icon render with explicit color and size */}
                <Icon
                  className={`w-[22px] h-[22px] transition-colors duration-200 ${
                    isActive ? 'text-brand-purple' : 'text-gray-500'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{ color: isActive ? '#8b5cf6' : '#6b7280' }} 
                />
                {item.badge != null && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-gray-50">
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