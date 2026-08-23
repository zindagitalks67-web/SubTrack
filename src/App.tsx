import React, { useState, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { ToastProvider } from '@/context/ToastContext';
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
  Sparkles // 👈 Sparkles icon import kiya
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
import { FinanceView } from '@/components/finance/FinanceView';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { CalendarView } from '@/components/calendar/CalendarView';
import { BudgetView } from '@/components/budget/BudgetView';
import { InsightsView } from '@/components/insights/InsightsView'; // 👈 InsightsView import kiya

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

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { key: 'subscriptions', label: 'Subs', icon: CreditCard },
  { key: 'finance', label: 'Finance', icon: Wallet },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
  { key: 'budget', label: 'Budget', icon: Target },
  { key: 'insights', label: 'AI Insights', icon: Sparkles }, // 👈 Naya AI Insights button
  { key: 'alerts', label: 'Alerts', icon: Bell },
  { key: 'family', label: 'Family', icon: Users },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

function AppShell() {
  const [view, setView] = useState<ViewKey>('dashboard');
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  
  const { subscriptions, addSubscription, updateSubscription } = useSubscriptions();
  
  const alerts = getAlerts(subscriptions);

  const navWithBadges: NavItem[] = NAV_ITEMS.map((item) =>
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
        {view === 'subscriptions' && <SubscriptionsView />}
        {view === 'finance' && <FinanceView />}
        {view === 'analytics' && <AnalyticsView />}
        {view === 'calendar' && <CalendarView />}
        {view === 'budget' && <BudgetView />}
        {view === 'insights' && <InsightsView />} {/* 👈 AI Insights render kiya */}
        {view === 'alerts' && <AlertsView />}
        {view === 'family' && <FamilyView />}
        {view === 'settings' && <SettingsView />}
      </main>
      <BottomNav items={navWithBadges} active={view} onChange={handleChange} />
      <PaywallModal />
      <ToastContainer />
      
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
    </ToastProvider>
  );
}