import { useCallback, useState } from 'react';
import { LayoutDashboard, CreditCard, Bell, Users, Settings as SettingsIcon } from 'lucide-react';
import type { ViewKey, Subscription } from '@/types';
import { ToastProvider } from '@/context/ToastContext';
import { SubscriptionProvider, useSubscriptions } from '@/context/SubscriptionContext';
import { ToastContainer } from '@/components/common/ToastContainer';
import { BottomNav, type NavItem } from '@/components/common/BottomNav';
import { PaywallModal } from '@/components/common/PaywallModal';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { SubscriptionsView } from '@/components/subscriptions/SubscriptionsView';
import { FamilyView } from '@/components/family/FamilyView';
import { AlertsView } from '@/components/alerts/AlertsView';
import { SettingsView } from '@/components/SettingsView';

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { key: 'subscriptions', label: 'Subs', icon: CreditCard },
  { key: 'alerts', label: 'Alerts', icon: Bell },
  { key: 'family', label: 'Family', icon: Users },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

function AppShell() {
  const [view, setView] = useState<ViewKey>('dashboard');
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const { alerts } = useSubscriptions();

  const navWithBadges: NavItem[] = NAV_ITEMS.map((item) =>
    item.key === 'alerts' ? { ...item, badge: alerts.length } : item,
  );

  const openEditor = useCallback((s: Subscription) => {
    setEditing(s);
    setEditOpen(true);
  }, []);

  const handleChange = useCallback((v: ViewKey) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-5 pb-28 safe-top">
        {view === 'dashboard' && (
          <DashboardView onNavigate={handleChange} onEditSubscription={openEditor} />
        )}
        {view === 'subscriptions' && <SubscriptionsView />}
        {view === 'alerts' && <AlertsView />}
        {view === 'family' && <FamilyView />}
        {view === 'settings' && <SettingsView />}
      </main>

      <BottomNav items={navWithBadges} active={view} onChange={handleChange} />
      <PaywallModal />
      <ToastContainer />

      {/* Cross-view editor used by Dashboard upcoming cards */}
      <SubscriptionForm open={editOpen} onClose={() => setEditOpen(false)} editing={editing} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <SubscriptionProvider>
        <AppShell />
      </SubscriptionProvider>
    </ToastProvider>
  );
}
