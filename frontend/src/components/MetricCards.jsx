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

export default function MetricCards({ metrics = {} }) {
  const cards = [
    {
      id: 'total',
      label: 'Total Labour Count',
      value: metrics.totalLabour || 0,
      trend: '↑ 5% vs last month',
      trendUp: true,
      bg: 'bg-gradient-to-r from-blue-600 to-blue-500',
      icon: Users,
      isCurrency: false
    },
    {
      id: 'permanent',
      label: 'Permanent Labour',
      value: metrics.permanentLabour || 0,
      trend: '↑ 3% vs last month',
      trendUp: true,
      bg: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
      icon: UserCheck,
      isCurrency: false
    },
    {
      id: 'temporary',
      label: 'Temporary Labour',
      value: metrics.temporaryLabour || 0,
      trend: '↑ 8% vs last month',
      trendUp: true,
      bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      icon: Clock,
      isCurrency: false
    },
    {
      id: 'paid',
      label: 'Amount Paid to Labour\n(Current Month)',
      value: metrics.monthlyGrossWages || 0,
      trend: '↑ 12% vs last month',
      trendUp: true,
      bg: 'bg-gradient-to-r from-purple-600 to-violet-500',
      icon: IndianRupee,
      isCurrency: true
    },
    {
      id: 'advances',
      label: 'Total Advances',
      value: metrics.totalAdvances || 0,
      trend: '↓ 5% vs last month',
      trendUp: false,
      bg: 'bg-gradient-to-r from-rose-600 to-red-500',
      icon: HandCoins,
      isCurrency: true
    },
  ];

  const formatCurrency = (val) => {
    return '₹' + Number(val).toLocaleString('en-IN');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`
              relative overflow-hidden rounded-2xl p-5 text-white shadow-lg shadow-slate-200/50 flex flex-col justify-between min-h-[140px]
              ${card.bg} transition-transform hover:-translate-y-1 duration-200
            `}
          >
            {/* Top row: Icon and trend */}
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium bg-black/15 px-2 py-1 rounded-full backdrop-blur-xs">
                {card.trendUp ? (
                  <TrendingUp className="w-3 h-3 text-white" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-white" />
                )}
                <span>{card.trend}</span>
              </div>
            </div>

            {/* Bottom: Value and label */}
            <div className="mt-4">
              <div className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                {card.isCurrency ? formatCurrency(card.value) : card.value}
              </div>
              <p className="text-xs font-semibold text-white/90 mt-1 whitespace-pre-line leading-tight">
                {card.label}
              </p>
            </div>

            {/* Subtle background glow circle */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
}
