import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Printer, Calendar, IndianRupee } from 'lucide-react';
import { api } from '../api';

export default function ReportsManager() {
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    window.open(`/api/v1/reports/export-csv?month=${targetMonth}`, '_blank');
  };

  const ledger = reportData?.ledger || [];
  const totals = reportData?.totals || { grossWage: 0, advances: 0, loans: 0, netPayable: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs print:hidden">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Monthly Payroll & Wage Reports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated month-end ledger calculated as: Net Payable = (Days Worked × Rate) - Advances - Loan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 outline-hidden"
          />
          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/30 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Totals Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Gross Wages</span>
          <p className="text-xl font-black text-blue-700 mt-1">₹{totals.grossWage.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Advances</span>
          <p className="text-xl font-black text-rose-600 mt-1">₹{totals.advances.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Loan Deductions</span>
          <p className="text-xl font-black text-purple-600 mt-1">₹{totals.loans.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase">Net Payable</span>
          <p className="text-xl font-black text-emerald-800 mt-1">₹{totals.netPayable.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            VK Traders Payroll Ledger — {targetMonth}
          </h3>
          <span className="text-xs text-slate-400 font-medium">Auto-generated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100 text-[10px]">
              <tr>
                <th className="py-3 px-3">Labour ID</th>
                <th className="py-3 px-4">Labour Name</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Present</th>
                <th className="py-3 px-3">Half-Day</th>
                <th className="py-3 px-3">Absent</th>
                <th className="py-3 px-3">Days Worked</th>
                <th className="py-3 px-3">Gross Wage</th>
                <th className="py-3 px-3">Advances</th>
                <th className="py-3 px-3">Loan Ded.</th>
                <th className="py-3 px-4 text-right font-black">Net Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">Loading payroll ledger...</td>
                </tr>
              ) : ledger.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">No data found for this month</td>
                </tr>
              ) : (
                ledger.map((row) => (
                  <tr key={row.workerId} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-black text-blue-700">{row.labourId}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        row.workerType === 'PERMANENT' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {row.workerType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-700">{row.daysPresent}</td>
                    <td className="py-3 px-3 font-semibold text-amber-600">{row.daysHalf}</td>
                    <td className="py-3 px-3 font-semibold text-rose-600">{row.daysAbsent}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{row.totalDaysWorked}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">₹{row.grossWage.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-bold text-rose-600">₹{row.advancesDeducted.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-bold text-purple-600">₹{row.loanDeducted.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-black text-sm text-emerald-700">
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
