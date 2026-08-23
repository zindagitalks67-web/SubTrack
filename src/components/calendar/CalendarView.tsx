import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useBills } from '@/context/BillsContext';
import { useFinance } from '@/context/FinanceContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';
import { EmptyState } from '@/components/common/EmptyState';

export function CalendarView() {
  const { t } = useTranslation();
  const { subscriptions } = useSubscriptions();
  const { bills } = useBills();
  const { transactions } = useFinance();

  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const events = useMemo(() => {
    const allEvents: { date: string; title: string; type: string }[] = [];
    subscriptions.forEach(s => { if (s.nextRenewalDate) allEvents.push({ date: s.nextRenewalDate, title: s.name, type: 'subscription' }); });
    bills.forEach(b => allEvents.push({ date: b.dueDate, title: b.name, type: 'bill' }));
    transactions.forEach(t => allEvents.push({ date: t.date, title: t.description, type: t.type }));
    return allEvents;
  }, [subscriptions, bills, transactions]);

  const monthEvents = events.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="animate-fade-in space-y-4">
      <Header title={t('calendar')} subtitle={`${monthName} ${year}`} icon={CalendarIcon} />

      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 bg-white/5 rounded-lg">
          <ChevronLeft className="w-5 h-5 text-content-secondary" />
        </button>
        <h3 className="text-lg font-semibold text-content-primary">{monthName} {year}</h3>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 bg-white/5 rounded-lg">
          <ChevronRight className="w-5 h-5 text-content-secondary" />
        </button>
      </div>

      <GlassCard className="p-4">
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-[10px] font-semibold text-content-muted">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) return <div key={index} className="h-12" />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = monthEvents.filter(e => e.date === dateStr);
            const isToday = new Date().toDateString() === new Date(dateStr).toDateString();
            return (
              <div key={index} className={`h-12 rounded-lg p-1 flex flex-col items-center justify-center border text-xs ${isToday ? 'border-brand-purple bg-brand-purple/20' : 'border-white/5'}`}>
                <span>{day}</span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((e, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${e.type === 'bill' ? 'bg-warning' : e.type === 'expense' ? 'bg-danger' : 'bg-brand-blue'}`} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {monthEvents.length === 0 ? (
        <EmptyState icon={CalendarIcon} title={t('noEventsThisMonth')} />
      ) : (
        <div className="space-y-2">
          <h3 className="font-semibold text-content-primary text-sm">{t('upcomingIn')} {monthName}</h3>
          {monthEvents.map((event, idx) => (
            <GlassCard key={idx} className="p-3 flex items-center justify-between">
              <p className="text-sm font-medium truncate">{event.title}</p>
              <p className="text-xs text-content-secondary">{new Date(event.date).toLocaleDateString()}</p>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}