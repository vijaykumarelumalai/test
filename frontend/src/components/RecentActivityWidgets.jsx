import React from 'react';
import { ArrowUpRight, UserPlus, Banknote, ShieldAlert } from 'lucide-react';

export default function RecentActivityWidgets({ recentActivity = {}, onNavigate }) {
  const recentLabour = recentActivity.recentLabour || [];
  const recentAdvances = recentActivity.recentAdvances || [];
  const activeLoans = recentActivity.activeLoans || [];

  const formatCurrency = (val) => '₹' + Number(val).toLocaleString('en-IN');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Recent Labour Added */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Recent Labour Added</h3>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('labour')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">Type</th>
                <th className="py-2 px-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentLabour.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">No recent entries</td>
                </tr>
              ) : (
                recentLabour.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-2 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2.5 px-2 font-bold text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        item.worker_type === 'PERMANENT'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {item.worker_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-500 font-medium">{item.joining_date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Recent Payments / Advances */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Banknote className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Recent Payments</h3>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('advances')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">Amount</th>
                <th className="py-2 px-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentAdvances.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">No payment records</td>
                </tr>
              ) : (
                recentAdvances.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-2 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2.5 px-2 font-bold text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-2 font-black text-emerald-700">{formatCurrency(item.amount)}</td>
                    <td className="py-2.5 px-2 text-right text-slate-500 font-medium">{item.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Pending Advances / Loans */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Pending Advances / Loans</h3>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('loans')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">Balance</th>
                <th className="py-2 px-2 text-right">Disbursed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeLoans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">No active loans</td>
                </tr>
              ) : (
                activeLoans.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-2 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2.5 px-2 font-bold text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-2 font-black text-rose-600">{formatCurrency(item.balance_remaining)}</td>
                    <td className="py-2.5 px-2 text-right text-slate-500 font-medium">{item.disbursed_date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
