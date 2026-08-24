import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, CreditCard, Zap, Wallet, CheckCircle2 } from 'lucide-react';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useBills } from '@/context/BillsContext';
import { useFinance } from '@/context/FinanceContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';

interface CalendarEvent {
  date: string; // YYYY-MM-DD
  title: string;
  amount: number;
  currency: string;
  type: 'subscription' | 'bill' | 'transaction';
}

export function CalendarView() {
  const { subscriptions } = useSubscriptions();
  const { bills } = useBills();
  const { transactions } = useFinance();

  // Current date state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Year and Month from currentDate
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // ✅ Aggregate all events into a single array
  const allEvents = useMemo<CalendarEvent[]>(() => {
    const events: CalendarEvent[] = [];

    // Subscriptions
    subscriptions.forEach((sub) => {
      if (sub.nextRenewalDate) {
        events.push({
          date: sub.nextRenewalDate.split('T')[0],
          title: sub.name,
          amount: sub.cost,
          currency: sub.currency,
          type: 'subscription',
        });
      }
    });

    // Bills
    bills.forEach((bill) => {
      if (bill.dueDate) {
        events.push({
          date: bill.dueDate.split('T')[0],
          title: bill.name,
          amount: bill.amount,
          currency: bill.currency,
          type: 'bill',
        });
      }
    });

    // Finance Transactions (Expenses & Income)
    transactions.forEach((txn) => {
      if (txn.date) {
        events.push({
          date: txn.date.split('T')[0],
          title: txn.name,
          amount: txn.amount,
          currency: txn.currency,
          type: 'transaction',
        });
      }
    });

    return events;
  }, [subscriptions, bills, transactions]);

  // ✅ Calendar Grid Logic
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const startingDay = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (string | null)[] = [];
    
    // Fill empty slots before the first day
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Fill actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }

    return days;
  }, [year, month]);

  // Helper to change month
  const changeMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  // Get events for the selected date
  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return allEvents.filter((event) => event.date === selectedDate);
  }, [selectedDate, allEvents]);

  // Format Date for header
  const monthYearLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Icon and Color mapping
  const getEventStyle = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'subscription':
        return { icon: CreditCard, color: 'bg-purple-500/20 text-purple-500 border-purple-500/30' };
      case 'bill':
        return { icon: Zap, color: 'bg-orange-500/20 text-orange-500 border-orange-500/30' };
      case 'transaction':
        return { icon: Wallet, color: 'bg-green-500/20 text-green-500 border-green-500/30' };
      default:
        return { icon: Wallet, color: 'bg-white/10 text-white border-white/10' };
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <Header title="Calendar" subtitle="Subscriptions, Bills & Expenses" icon={Calendar} />

      {/* Calendar Card */}
      <GlassCard>
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-content-primary">{monthYearLabel}</h3>
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-lg text-content-secondary">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-lg text-content-secondary">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weekdays header */}
        <div className="grid grid-cols-7 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <span key={day} className="text-[11px] font-semibold text-content-muted">{day}</span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="h-12" />;
            }

            const isToday = date === new Date().toISOString().split('T')[0];
            const isSelected = date === selectedDate;
            const dayEvents = allEvents.filter((event) => event.date === date);
            const hasEvents = dayEvents.length > 0;

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`relative h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-brand-purple/20 border border-brand-purple/50'
                    : isToday
                    ? 'bg-white/10 border border-white/10'
                    : 'hover:bg-white/5'
                }`}
              >
                <span className={`text-sm font-medium ${isToday ? 'text-brand-purple' : 'text-content-primary'}`}>
                  {parseInt(date.split('-')[2], 10)}
                </span>
                {hasEvents && (
                  <div className="flex gap-0.5 mt-1">
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <span key={idx} className={`w-1.5 h-1.5 rounded-full ${getEventStyle(event.type).color.split(' ')[1]}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Events */}
        {selectedDate && (
          <div className="pt-3 border-t border-white/10">
            <h4 className="text-sm font-semibold text-content-primary mb-2">
              Events on {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </h4>
            {selectedEvents.length === 0 ? (
              <p className="text-xs text-content-muted">No events for this day.</p>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map((event, index) => {
                  const style = getEventStyle(event.type);
                  const Icon = style.icon;
                  return (
                    <div key={index} className={`flex items-center gap-3 p-2 rounded-lg border ${style.color}`}>
                      <Icon className="w-4 h-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{event.title}</p>
                        <p className="text-[10px] opacity-80 capitalize">{event.type}</p>
                      </div>
                      <p className="text-xs font-bold">
                        {event.currency} {event.amount.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}