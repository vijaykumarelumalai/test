import React from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  IndianRupee, 
  HandCoins, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';
import { translations } from '../translations';

export default function MetricCards({ metrics = {}, language = 'en' }) {
  const t = translations[language] || translations.en;

  const cards = [
    {
      id: 'total',
      label: t.totalLabourCount || 'Total Labour Count',
      value: metrics.totalLabour || 0,
      trend: metrics.totalLabourTrend?.text || '0% change',
      trendUp: metrics.totalLabourTrend?.isUp ?? true,
      bg: 'bg-gradient-to-r from-blue-600 to-blue-500',
      icon: Users,
      isCurrency: false
    },
    {
      id: 'permanent',
      label: t.permanentLabour || 'Permanent Labour',
      value: metrics.permanentLabour || 0,
      trend: metrics.permanentLabourTrend?.text || '0% change',
      trendUp: metrics.permanentLabourTrend?.isUp ?? true,
      bg: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
      icon: UserCheck,
      isCurrency: false
    },
    {
      id: 'temporary',
      label: t.temporaryLabour || 'Temporary Labour',
      value: metrics.temporaryLabour || 0,
      trend: metrics.temporaryLabourTrend?.text || '0% change',
      trendUp: metrics.temporaryLabourTrend?.isUp ?? true,
      bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      icon: Clock,
      isCurrency: false
    },
    {
      id: 'paid',
      label: t.amountPaidToLabour || 'Amount Paid to Labour (Current Month)',
      value: metrics.monthlyGrossWages || 0,
      trend: metrics.monthlyGrossWagesTrend?.text || '0% change',
      trendUp: metrics.monthlyGrossWagesTrend?.isUp ?? true,
      bg: 'bg-gradient-to-r from-purple-600 to-violet-500',
      icon: IndianRupee,
      isCurrency: true
    },
    {
      id: 'advances',
      label: t.totalAdvances || 'Total Advances',
      value: metrics.totalAdvances || 0,
      trend: metrics.totalAdvancesTrend?.text || '0% change',
      trendUp: metrics.totalAdvancesTrend?.isUp ?? true,
      bg: 'bg-gradient-to-r from-rose-600 to-red-500',
      icon: HandCoins,
      isCurrency: true
    },
  ];

  const formatCurrency = (val) => {
    return '₹' + Number(val).toLocaleString('en-IN');
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isLastOnMobile = idx === cards.length - 1;
        return (
          <div
            key={card.id}
            className={`
              relative overflow-hidden rounded-2xl p-3.5 sm:p-5 text-white shadow-md shadow-slate-900/10 dark:shadow-black/30 border border-white/15 flex flex-col justify-between min-h-[120px] sm:min-h-[140px]
              ${card.bg} transition-transform hover:-translate-y-1 duration-200
              ${isLastOnMobile ? 'col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1' : ''}
            `}
          >
            {/* Top row: Icon and trend */}
            <div className="flex items-start justify-between gap-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner shrink-0">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold bg-black/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full backdrop-blur-xs whitespace-nowrap">
                {card.trendUp ? (
                  <TrendingUp className="w-3 h-3 text-white" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-white" />
                )}
                <span>{card.trend}</span>
              </div>
            </div>

            {/* Bottom: Value and label */}
            <div className="mt-3 sm:mt-4">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white drop-shadow-xs">
                {card.isCurrency ? formatCurrency(card.value) : card.value}
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-white/95 mt-1 leading-snug break-words">
                {card.label}
              </p>
            </div>

            {/* Subtle background glow circle */}
            <div className="absolute -bottom-6 -right-6 w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
}
