import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function AnalyticsWidgets({ metrics = {}, onNavigate }) {
  const attendance = metrics.todayAttendance || { total: 0, present: 0, absent: 0, halfDay: 0 };
  const total = attendance.total || 1; // avoid divide by zero

  const presentPct = Math.round((attendance.present / total) * 100);
  const halfDayPct = Math.round((attendance.halfDay / total) * 100);
  const absentPct = Math.round((attendance.absent / total) * 100);

  const monthlyGross = metrics.monthlyGrossWages || 0;
  const advances = metrics.totalAdvances || 0;
  const maxBar = Math.max(monthlyGross, advances, 1);

  const paidBarHeight = Math.max(15, Math.round((monthlyGross / maxBar) * 100));
  const advBarHeight = Math.max(15, Math.round((advances / maxBar) * 100));

  const formatCurrency = (v) => '₹' + Number(v).toLocaleString('en-IN');

  return (
    <div className="space-y-6">
      {/* 1. Attendance Overview (Today) Donut Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">Attendance Overview (Today)</h3>
          <button 
            onClick={() => onNavigate && onNavigate('attendance')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5"
          >
            View Details <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="py-6 flex flex-col sm:flex-row items-center justify-around gap-6">
          {/* Custom SVG Donut Chart */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-100"
                strokeWidth="12"
                fill="none"
              />
              {/* Present (Green) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-emerald-500"
                strokeWidth="12"
                strokeDasharray={`${presentPct * 2.51} 251.2`}
                strokeDashoffset="0"
                fill="none"
                strokeLinecap="round"
              />
              {/* Half Day (Amber) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-amber-400"
                strokeWidth="12"
                strokeDasharray={`${halfDayPct * 2.51} 251.2`}
                strokeDashoffset={`-${presentPct * 2.51}`}
                fill="none"
                strokeLinecap="round"
              />
              {/* Absent (Red) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-rose-500"
                strokeWidth="12"
                strokeDasharray={`${absentPct * 2.51} 251.2`}
                strokeDashoffset={`-${(presentPct + halfDayPct) * 2.51}`}
                fill="none"
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Center Label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-900 leading-none">{attendance.total}</span>
              <span className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Total</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-3 w-full sm:w-40">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-600">Present</span>
              </div>
              <span className="font-black text-slate-900">{attendance.present}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="font-semibold text-slate-600">Absent</span>
              </div>
              <span className="font-black text-slate-900">{attendance.absent}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="font-semibold text-slate-600">Half Day</span>
              </div>
              <span className="font-black text-slate-900">{attendance.halfDay}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Payment & Advances (This Month) Comparison Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">Payment & Advances (This Month)</h3>
          <button 
            onClick={() => onNavigate && onNavigate('reports')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5"
          >
            View Details <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="pt-6 pb-2">
          {/* Visual Vertical Bars Comparison */}
          <div className="h-44 flex items-end justify-center gap-12 border-b border-slate-100 pb-2 px-4">
            {/* Amount Paid Bar */}
            <div className="flex flex-col items-center gap-2 w-20">
              <span className="text-[11px] font-bold text-blue-600">
                {formatCurrency(monthlyGross)}
              </span>
              <div 
                style={{ height: `${paidBarHeight}%` }}
                className="w-12 bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-xl shadow-md transition-all duration-500"
              />
              <span className="text-[11px] font-semibold text-slate-500 text-center leading-tight">
                Amount Paid
              </span>
            </div>

            {/* Advances Bar */}
            <div className="flex flex-col items-center gap-2 w-20">
              <span className="text-[11px] font-bold text-rose-600">
                {formatCurrency(advances)}
              </span>
              <div 
                style={{ height: `${advBarHeight}%` }}
                className="w-12 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-xl shadow-md transition-all duration-500"
              />
              <span className="text-[11px] font-semibold text-slate-500 text-center leading-tight">
                Advances
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
