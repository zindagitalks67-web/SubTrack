import { useState, useEffect } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { useSubscriptions } from '@/context/SubscriptionContext';
import { useBills } from '@/context/BillsContext';
import { useFinance } from '@/context/FinanceContext';
import { Header } from '@/components/common/Header';
import { GlassCard } from '@/components/common/GlassCard';
import { useLanguage } from '@/context/LanguageContext';
import { generateFinancialInsights } from '@/utils/geminiService';

export function InsightsView() {
  const { lang, t } = useLanguage();

  const { subscriptions } = useSubscriptions();
  const { bills } = useBills();
  const { transactions, totalIncome } = useFinance();

  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAI = async () => {
    setLoading(true);

    const data = {
      subscriptions: subscriptions.map(s => ({
        name: s.name,
        cost: s.cost,
        billingCycle: s.billingCycle,
        active: s.active,
      })),

      bills: bills.map(b => ({
        name: b.name,
        amount: b.amount,
        dueDate: b.dueDate,
        paid: b.paid,
      })),

      transactions: transactions.map(t => ({
        type: t.type,
        name: t.name,
        amount: t.amount,
        date: t.date,
      })),

      totalMonthlySpend: subscriptions
        .filter(s => s.active)
        .reduce((sum, s) => sum + (s.cost || 0), 0),

      totalIncome: totalIncome || 0,
    };

    const result = await generateFinancialInsights(data, lang);

    setInsights(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchAI();
  }, [lang]);

  return (
    <div className="animate-fade-in space-y-4">
      <Header
        title={t('aiInsights')}
        subtitle={t('smartRecs')}
        icon={Sparkles}
      />

      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-r from-purple-600 to-indigo-600">
        <p className="text-xs text-white/80">
          {t('poweredBy')}
        </p>

        <p className="text-2xl font-bold text-white mt-1">
          {t('financialHealth')}
        </p>
      </div>

      {loading ? (
        <GlassCard className="p-6 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-purple mb-3" />

          <p className="text-sm">
            {t('generating')}
          </p>
        </GlassCard>
      ) : (
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold mb-2">
            {t('geminiAnalysis')}
          </h3>

          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {insights || t('aiError')}
          </p>
        </GlassCard>
      )}

      <button
        onClick={fetchAI}
        disabled={loading}
        className="btn-primary w-full py-3 text-sm"
      >
        <RefreshCw className="w-4 h-4 inline mr-2" />
        {t('refreshInsights')}
      </button>
    </div>
  );
}