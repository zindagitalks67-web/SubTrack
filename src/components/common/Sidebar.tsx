import { X, Layers, Calendar, Wallet, Target, Sparkles, Bell, Users, Settings, ShieldCheck } from 'lucide-react';
import type { ViewKey } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  active: ViewKey;
  onChange: (view: ViewKey) => void;
}

export function Sidebar({ open, onClose, active, onChange }: SidebarProps) {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  const groups = [
    {
      label: 'Track',
      items: [
        { key: 'recurring' as ViewKey, label: t('recurring'), icon: Layers },
        { key: 'calendar' as ViewKey, label: t('calendar'), icon: Calendar },
        { key: 'finance' as ViewKey, label: t('finance'), icon: Wallet },
      ],
    },
    {
      label: 'Insights',
      items: [
        { key: 'budget' as ViewKey, label: t('budget'), icon: Target },
        { key: 'insights' as ViewKey, label: t('aiInsights'), icon: Sparkles },
      ],
    },
    {
      label: 'Account',
      items: [
        { key: 'alerts' as ViewKey, label: t('alerts'), icon: Bell },
        { key: 'family' as ViewKey, label: t('family'), icon: Users },
        { key: 'settings' as ViewKey, label: t('settings'), icon: Settings },
        ...(isAdmin ? [{ key: 'admin' as ViewKey, label: 'Admin', icon: ShieldCheck }] : []),
      ],
    },
  ];

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 transition-transform duration-300 transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Groups */}
        <div className="p-4 space-y-6 overflow-y-auto h-full pb-20">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        onChange(item.key);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-brand-purple/10 text-brand-purple dark:text-brand-purple'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}