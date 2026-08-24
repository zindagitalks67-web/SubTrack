import React, { useState, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { ToastProvider } from '@/context/ToastContext';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
// ✅ Admin Imports
import { AdminProvider } from '@/context/AdminContext';
import { AdminView } from '@/components/Admin/AdminView';
// ✅ Bills Imports
import { BillsProvider } from '@/context/BillsContext';
import { BillsView } from '@/components/bills/BillsView';
// ✅ Finance Imports
import { FinanceProvider } from '@/context/FinanceContext';
import { FinanceView } from '@/components/finance/FinanceView';
// ✅ Budget Imports
import { BudgetProvider } from '@/context/BudgetContext';
import { BudgetView } from '@/components/budget/BudgetView';
// ✅ Recurring Imports
import { RecurringView } from '@/components/recurring/RecurringView';
// ✅ Subscription Imports
import { SubscriptionProvider, useSubscriptions } from '@/context/SubscriptionContext';
import { 
  LayoutDashboard, 
  CreditCard, 
  Bell, 
  Users, 
  Settings as SettingsIcon, 
  Wallet, 
  BarChart3,
  CalendarDays,
  Target,
  Sparkles,
  ShieldCheck,
  RefreshCw 
} from 'lucide-react';
import type { ViewKey } from '@/types';
import { ToastContainer } from '@/components/common/ToastContainer';
import { BottomNav, type NavItem } from '@/components/common/BottomNav';
import { PaywallModal } from '@/components/common/PaywallModal';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { SubscriptionsView } from '@/components/subscriptions/SubscriptionsView';
import { FamilyView } from '@/components/family/FamilyView';
import { AlertsView } from '@/components/alerts/AlertsView';
import { SettingsView } from '@/settings/SettingsView';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { CalendarView } from '@/components/calendar/CalendarView';
import { InsightsView } from '@/components/insights/InsightsView';

// ✅ getAlerts function
const getAlerts = (subscriptions: any[]): any[] => {
  const now = new Date();
  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  return subscriptions.filter((sub: any) => {
    const renewalStr = sub.nextRenewal || sub.next_renewal;
    if (!renewalStr) return false;
    const renewal = new Date(renewalStr);
    return renewal >= now && renewal <= sevenDaysLater;
  });
};

// ✅ Dynamic Nav Items using translation function
const getNavItems = (t: (key: any) => string): NavItem[] => [
  { key: 'dashboard', label: t('home'), icon: LayoutDashboard },
  { key: 'bills', label: t('bills'), icon: CalendarDays },
  { key: 'subscriptions', label: t('subs'), icon: CreditCard },
  { key: 'recurring', label: t('recurring'), icon: RefreshCw },
  { key: 'finance', label: t('finance'), icon: Wallet },
  { key: 'analytics', label: t('analytics'), icon: BarChart3 },
  { key: 'calendar', label: t('calendar'), icon: CalendarDays },
  { key: 'budget', label: t('budget'), icon: Target },
  { key: 'insights', label: 'AI Insights', icon: Sparkles },
  { key: 'alerts', label: t('alerts'), icon: Bell },
  { key: 'family', label: t('family'), icon: Users },
  { key: 'settings', label: t('settings'), icon: SettingsIcon },
];

function AppShell() {
  const { t } = useLanguage();
  const [view, setView] = useState<ViewKey>('dashboard');
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  
  const { subscriptions, addSubscription, updateSubscription } = useSubscriptions();
  const { isAdmin } = useAuth(); 
  
  const alerts = getAlerts(subscriptions);

  // ✅ Dynamic Nav Items using t()
  const baseNavItems = getNavItems(t);
  const navItems: NavItem[] = isAdmin 
    ? [...baseNavItems, { key: 'admin', label: 'Admin', icon: ShieldCheck }] 
    : baseNavItems;

  const navWithBadges: NavItem[] = navItems.map((item) =>
    item.key === 'alerts' ? { ...item, badge: alerts.length } : item,
  );

  const openEditor = useCallback((s: any) => {
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
        {view === 'bills' && <BillsView />}
        {view === 'subscriptions' && <SubscriptionsView />}
        {view === 'recurring' && <RecurringView />}
        {view === 'finance' && <FinanceView />}
        {view === 'analytics' && <AnalyticsView />}
        {view === 'calendar' && <CalendarView />}
        {view === 'budget' && <BudgetView />}
        {view === 'insights' && <InsightsView />}
        {view === 'alerts' && <AlertsView />}
        {view === 'family' && <FamilyView />}
        {view === 'settings' && <SettingsView />}
        {view === 'admin' && isAdmin && <AdminView />}
      </main>
      <BottomNav items={navWithBadges} active={view} onChange={handleChange} />
      <PaywallModal />
      <ToastContainer />
      
      {editOpen && (
        <SubscriptionForm
          initialData={editing}
          onClose={() => setEditOpen(false)}
          onSubmit={async (data) => {
            if (editing) {
              await updateSubscription(editing.id, data);
            } else {
              await addSubscription(data);
            }
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  const { user, loading, signOut } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return isLogin ? (
      <Login onToggle={() => setIsLogin(false)} />
    ) : (
      <Signup onToggle={() => setIsLogin(true)} />
    );
  }

  return (
    <ToastProvider>
      <LanguageProvider>
        {/* ✅ Providers Hierarchy: Admin -> Bills -> Finance -> Budget -> Subscription */}
        <AdminProvider>
          <BillsProvider>
            <FinanceProvider>
              <BudgetProvider>
                <SubscriptionProvider>
                  <div className="min-h-screen bg-gray-50">
                    <button
                      onClick={signOut}
                      className="fixed bottom-20 right-4 z-50 bg-red-500 text-white px-3 py-1 rounded-full text-xs shadow-lg"
                    >
                      Logout
                    </button>
                    <AppShell />
                  </div>
                </SubscriptionProvider>
              </BudgetProvider>
            </FinanceProvider>
          </BillsProvider>
        </AdminProvider>
      </LanguageProvider>
    </ToastProvider>
  );
}