import React, { useState, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { ToastProvider } from '@/context/ToastContext';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { AdminProvider } from '@/context/AdminContext';
import { AdminView } from '@/components/Admin/AdminView';
import { BillsProvider } from '@/context/BillsContext';
import { BillsView } from '@/components/bills/BillsView';
import { FinanceProvider } from '@/context/FinanceContext';
import { FinanceView } from '@/components/finance/FinanceView';
import { BudgetProvider } from '@/context/BudgetContext';
import { BudgetView } from '@/components/budget/BudgetView';
import { RecurringView } from '@/components/recurring/RecurringView';
import { SubscriptionProvider, useSubscriptions } from '@/context/SubscriptionContext';
import { LayoutDashboard, CreditCard, BarChart3, CalendarDays, Menu } from 'lucide-react';
import type { ViewKey } from '@/types';
import { ToastContainer } from '@/components/common/ToastContainer';
import { BottomNav, type NavItem } from '@/components/common/BottomNav';
import { Sidebar } from '@/components/common/Sidebar';
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

const getCoreNavItems = (t: (key: any) => string): NavItem[] => [
  { key: 'dashboard', label: t('home'), icon: LayoutDashboard },
  { key: 'subscriptions', label: t('subs'), icon: CreditCard },
  { key: 'bills', label: t('bills'), icon: CalendarDays },
  { key: 'analytics', label: t('analytics'), icon: BarChart3 },
];

function AppShell() {
  const { t } = useLanguage();
  const [view, setView] = useState<ViewKey>('dashboard');
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { subscriptions, addSubscription, updateSubscription } = useSubscriptions();
  const { isAdmin } = useAuth(); 
  
  const alerts = getAlerts(subscriptions);

  const coreNavItems = getCoreNavItems(t);
  const navWithBadges: NavItem[] = coreNavItems.map((item) =>
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
      {/* Top Bar with Menu Button */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex items-center justify-between max-w-md mx-auto w-full">
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">SubTrack</h1>
        <div className="w-6" />
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-5 pb-28 safe-top">
        {view === 'dashboard' && <DashboardView onNavigate={handleChange} onEditSubscription={openEditor} />}
        {view === 'subscriptions' && <SubscriptionsView />}
        {view === 'bills' && <BillsView />}
        {view === 'finance' && <FinanceView />}
        {view === 'analytics' && <AnalyticsView />}
        {view === 'calendar' && <CalendarView />}
        {view === 'budget' && <BudgetView />}
        {view === 'insights' && <InsightsView />}
        {view === 'alerts' && <AlertsView />}
        {view === 'family' && <FamilyView />}
        {view === 'settings' && <SettingsView />}
        {view === 'recurring' && <RecurringView />}
        {view === 'admin' && isAdmin && <AdminView />}
      </main>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} active={view} onChange={handleChange} />
      <BottomNav items={navWithBadges} active={view} onChange={handleChange} />
      <PaywallModal />
      <ToastContainer />
      
      {editOpen && (
        <SubscriptionForm
          initialData={editing}
          onClose={() => setEditOpen(false)}
          onSubmit={async (data) => {
            if (editing) await updateSubscription(editing.id, data);
            else await addSubscription(data);
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
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>;
  }

  if (!user) {
    return isLogin ? <Login onToggle={() => setIsLogin(false)} /> : <Signup onToggle={() => setIsLogin(true)} />;
  }

  return (
    <ToastProvider>
      <LanguageProvider>
        <AdminProvider>
          <BillsProvider>
            <FinanceProvider>
              <BudgetProvider>
                <SubscriptionProvider>
                  <div className="min-h-screen bg-gray-50">
                    <button onClick={signOut} className="fixed bottom-20 right-4 z-50 bg-red-500 text-white px-3 py-1 rounded-full text-xs shadow-lg">Logout</button>
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