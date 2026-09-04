import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, FileText, Download, Calendar, IndianRupee, CheckCheck } from 'lucide-react';
import { api } from '../api';
import { translations } from '../translations';

export default function ReportsManager({ language = 'en' }) {
  const t = translations[language] || translations.en;
  const [targetMonth, setTargetMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.getMonthlyLedger(targetMonth);
      setReportData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [targetMonth]);

  // Export to PDF using browser's high-fidelity print-to-PDF engine
  const handleExportPdf = () => {
    window.print();
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    window.open(`/api/v1/reports/export-csv?month=${targetMonth}`, '_blank');
  };

  const ledger = reportData?.ledger || [];
  const totals = reportData?.totals || { grossWage: 0, advances: 0, loans: 0, netPayable: 0 };

  return (
    <div className="space-y-6">
      {/* Header with Export PDF and Export Excel / CSV Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs print:hidden transition-colors">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t.monthlyReports || 'Monthly Payroll & Wage Reports'}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.reportsSubtitle || 'Automated month-end ledger calculated as: Net Payable = (Days Worked × Rate) - Advances - Loan'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="month"
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden"
          />

          {/* Export PDF Button (Per client requirement) */}
          <button
            onClick={handleExportPdf}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/30 transition active:scale-95"
            title="Export as PDF Document"
          >
            <FileText className="w-4 h-4" />
            <span>{t.exportPdf || 'Export PDF'}</span>
          </button>

          {/* Export Excel / CSV Button (Per client requirement) */}
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/30 transition active:scale-95"
            title="Export as Excel / CSV Spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t.exportExcel || 'Export Excel / CSV'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Totals Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t.grossWage || 'Gross Wages'}</span>
          <p className="text-xl font-black text-blue-700 dark:text-blue-400 mt-1">₹{totals.grossWage.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t.totalAdvances || 'Total Advances'}</span>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">₹{totals.advances.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t.loanDeducted || 'Loan Deductions'}</span>
          <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">₹{totals.loans.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 shadow-xs transition-colors">
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">{t.netPayable || 'Net Payable'}</span>
          <p className="text-xl font-black text-emerald-800 dark:text-emerald-300 mt-1">₹{totals.netPayable.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {t.appName || 'VK Traders'} {t.reports || 'Payroll Ledger'} — {targetMonth}
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Auto-generated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-100 dark:border-slate-800 text-[10px]">
              <tr>
                <th className="py-3 px-3">{t.sNo || 'Labour ID'}</th>
                <th className="py-3 px-4">{t.worker || 'Labour Name'}</th>
                <th className="py-3 px-3">{t.type || 'Type'}</th>
                <th className="py-3 px-3">{t.present || 'Present'}</th>
                <th className="py-3 px-3">{t.halfDay || 'Half-Day'}</th>
                <th className="py-3 px-3">{t.absent || 'Absent'}</th>
                <th className="py-3 px-3">{t.daysWorked || 'Days Worked'}</th>
                <th className="py-3 px-3">{t.grossWage || 'Gross Wage'}</th>
                <th className="py-3 px-3">{t.advancesDeducted || 'Advances'}</th>
                <th className="py-3 px-3">{t.loanDeducted || 'Loan Ded.'}</th>
                <th className="py-3 px-4 text-right font-black">{t.netPayable || 'Net Payable'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 dark:text-slate-500">Loading payroll ledger...</td>
                </tr>
              ) : ledger.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 dark:text-slate-500">No data found for this month</td>
                </tr>
              ) : (
                ledger.map((row) => (
                  <tr key={row.workerId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-black text-blue-700 dark:text-blue-400">{row.labourId}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{row.name}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        row.workerType === 'PERMANENT' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}>
                        {row.workerType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-700 dark:text-emerald-400">{row.daysPresent}</td>
                    <td className="py-3 px-3 font-semibold text-amber-600 dark:text-amber-400">{row.daysHalf}</td>
                    <td className="py-3 px-3 font-semibold text-rose-600 dark:text-rose-400">{row.daysAbsent}</td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-200">{row.totalDaysWorked}</td>
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">₹{row.grossWage.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-bold text-rose-600 dark:text-rose-400">₹{row.advancesDeducted.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-bold text-purple-600 dark:text-purple-400">₹{row.loanDeducted.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-black text-sm text-emerald-700 dark:text-emerald-400">
                      ₹{row.netPayable.toLocaleString('en-IN')}
                    </td>
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
