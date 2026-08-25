import { useState } from 'react';
import { Bell, CalendarClock } from 'lucide-react';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { Header } from '@/components/common/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { GlassCard } from '@/components/common/GlassCard';
import { useLanguage } from '@/context/LanguageContext';

export function AlertsView() {
  const { t } = useLanguage();
  const { alerts } = useSubscriptions();
  const [filter, setFilter] = useState<'all' | 'renewal' | 'price_hike'>('all');
  const filtered = alerts.filter(a => filter === 'all' ? true : a.kind === filter);

  return (
    <div className="animate-fade-in space-y-4">
      <Header title={t('alerts')} subtitle={`${alerts.length} ${t('activeAlerts')}`} icon={Bell} />
      <GlassCard>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t('reminderWindow')}</p>
            <p className="text-xs">{t('notifyBefore')}</p>
          </div>
          <div className="flex gap-2">
            {[1, 3, 7].map(d => <button key={d} className="chip px-3 py-1.5 border">{d}d</button>)}
          </div>
        </div>
      </GlassCard>
      <div className="flex gap-2">
        <button onClick={() => setFilter('all')} className={`chip px-4 py-2 border ${filter === 'all' ? 'bg-brand-purple/20' : ''}`}>{t('allLabel')} ({alerts.length})</button>
        <button onClick={() => setFilter('renewal')} className={`chip px-4 py-2 border ${filter === 'renewal' ? 'bg-brand-purple/20' : ''}`}>{t('renewalsLabel')} ({alerts.filter(a => a.kind === 'renewal').length})</button>
        <button onClick={() => setFilter('price_hike')} className={`chip px-4 py-2 border ${filter === 'price_hike' ? 'bg-brand-purple/20' : ''}`}>{t('priceHikesLabel')} ({alerts.filter(a => a.kind === 'price_hike').length})</button>
      </div>
      {filtered.length === 0 ? <EmptyState icon={Bell} title={t('allCaughtUp')} description={t('noData')} /> : filtered.map(alert => (
        <GlassCard key={alert.id} className="p-3">
          <p className="text-sm font-medium">{alert.title}</p>
          <p className="text-xs mt-1">{alert.message}</p>
        </GlassCard>
      ))}
    </div>
  );
}