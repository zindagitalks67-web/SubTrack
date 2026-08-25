import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, CreditCard, Zap, Wallet } from 'lucide-react';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useBills } from '@/context/BillsContext';
import { useFinance } from '@/context/FinanceContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';
import { useLanguage } from '@/context/LanguageContext';

export function CalendarView() {
  const { t } = useLanguage();
  const { subscriptions } = useSubscriptions();
  const { bills } = useBills();
  const { transactions } = useFinance();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const allEvents = useMemo(() => {
    const events: { date: string; title: string; amount: number; type: string }[] = [];
    subscriptions.filter(s => s.nextRenewalDate).forEach(s => events.push({ date: s.nextRenewalDate!.split('T')[0], title: s.name, amount: s.cost, type: 'sub' }));
    bills.filter(b => b.dueDate).forEach(b => events.push({ date: b.dueDate.split('T')[0], title: b.name, amount: b.amount, type: 'bill' }));
    transactions.filter(txn => txn.date).forEach(txn => events.push({ date: txn.date.split('T')[0], title: txn.name, amount: txn.amount, type: 'txn' }));
    return events;
  }, [subscriptions, bills, transactions]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (string | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    return days;
  }, [year, month]);

  const selectedEvents = allEvents.filter(e => e.date === selectedDate);
  const monthYearLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getEventStyle = (type: string) => {
    if (type === 'sub') return { icon: CreditCard, color: 'bg-purple-500/20 text-purple-500' };
    if (type === 'bill') return { icon: Zap, color: 'bg-orange-500/20 text-orange-500' };
    return { icon: Wallet, color: 'bg-green-500/20 text-green-500' };
  };

  return (
    <div className="animate-fade-in space-y-4">
      <Header title={t('calendar')} subtitle={t('calendarSub')} icon={Calendar} />
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{monthYearLabel}</h3>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-white/10 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-white/10 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day} className="text-[11px] font-semibold text-content-muted">{day}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {calendarDays.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="h-12" />;
            const dayEvents = allEvents.filter(e => e.date === date);
            const isToday = date === new Date().toISOString().split('T')[0];
            return (
              <button key={date} onClick={() => setSelectedDate(date)} className={`relative h-12 rounded-xl flex flex-col items-center justify-center transition-all ${isToday ? 'bg-brand-purple/20' : 'hover:bg-white/5'}`}>
                <span className="text-sm">{parseInt(date.split('-')[2], 10)}</span>
                {dayEvents.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-brand-purple mt-1" />}
              </button>
            );
          })}
        </div>
        {selectedDate && (
          <div className="pt-3 border-t">
            <h4 className="text-sm font-semibold mb-2">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h4>
            {selectedEvents.length === 0 ? <p className="text-xs">{t('noData')}</p> : selectedEvents.map((event, idx) => {
              const style = getEventStyle(event.type);
              const Icon = style.icon;
              return (
                <div key={idx} className={`flex items-center gap-3 p-2 rounded-lg border ${style.color}`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{event.title}</p></div>
                  <p className="text-xs font-bold">${event.amount.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}