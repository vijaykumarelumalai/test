import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  User, 
  Calendar, 
  IndianRupee, 
  HandCoins, 
  CreditCard, 
  LogOut, 
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';

export default function WorkerMobilePortal({ onBackToAdmin }) {
  const [workerSession, setWorkerSession] = useState(null);
  const [phone, setPhone] = useState('9840111111'); // prefilled with sample worker Ramesh Kumar
  const [pin, setPin] = useState('1111');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const [summaryData, setSummaryData] = useState(null);
  const [targetMonth, setTargetMonth] = useState(new Date().toISOString().slice(0, 7));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const res = await api.workerLogin({ phone, pin });
      localStorage.setItem('vk_token', res.token);
      setWorkerSession(res.worker);
      loadWorkerSummary();
    } catch (err) {
      setLoginError(err.message || 'Invalid Phone Number or PIN');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkerSummary = async () => {
    try {
      const res = await api.getLabourSummary(targetMonth);
      setSummaryData(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (workerSession) {
      loadWorkerSummary();
    }
  }, [targetMonth, workerSession]);

  const handleLogout = () => {
    localStorage.removeItem('vk_token');
    setWorkerSession(null);
    setSummaryData(null);
  };

  const summary = summaryData?.summary || {
    daysPresent: 0,
    daysHalf: 0,
    daysAbsent: 0,
    totalWorkedDays: 0,
    grossWage: 0,
    totalAdvances: 0,
    loanDeduction: 0,
    netPayable: 0
  };

  const attendanceRecords = summaryData?.attendanceRecords || [];
  const advances = summaryData?.advances || [];
  const loan = summaryData?.loan;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-3 sm:p-6">
      {/* Mobile Device Mockup Frame */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col min-h-[700px]">
        
        {/* Top App Bar */}
        <div className="bg-[#0f172a] text-white p-4 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={onBackToAdmin}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-medium p-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin View</span>
          </button>
          <span className="font-extrabold text-sm tracking-tight text-amber-400">
            VK Traders Mobile
          </span>
          {workerSession && (
            <button
              onClick={handleLogout}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold"
            >
              Logout
            </button>
          )}
        </div>

        {/* Body Content */}
        {!workerSession ? (
          /* Worker Login Screen */
          <div className="p-6 flex-1 flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Smartphone className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Labour Login</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your mobile number and 4-digit PIN to see your attendance and wages
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-3 bg-slate-50 text-sm font-bold rounded-xl border border-slate-200 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">4-Digit PIN</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Last 4 digits of phone"
                  className="w-full px-4 py-3 bg-slate-50 text-sm font-bold text-center tracking-widest rounded-xl border border-slate-200 focus:border-blue-500 outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition"
              >
                {loading ? 'Logging in...' : 'View My Attendance & Wages'}
              </button>
            </form>

            <div className="mt-8 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
              <span className="text-[11px] text-blue-700 font-medium">
                Demo: Log in with <span className="font-bold">9840111111</span> & PIN <span className="font-bold">1111</span> (Ramesh Kumar VK-001)
              </span>
            </div>
          </div>
        ) : (
          /* Worker Dashboard */
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Worker Identity Card */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 rounded-2xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase">
                    {workerSession.workerType}
                  </span>
                  <h3 className="text-lg font-black mt-1.5">{workerSession.name}</h3>
                  <p className="text-xs text-blue-200 font-bold">{workerSession.labourId}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-blue-200 block">Daily Wage</span>
                  <span className="text-base font-black text-amber-300">₹{workerSession.dailyWage}</span>
                </div>
              </div>
            </div>

            {/* Month Filter */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                Select Month:
              </span>
              <input
                type="month"
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200"
              />
            </div>

            {/* Net Balance Highlight Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-lg">
              <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
                Estimated Net Payable Balance
              </span>
              <div className="text-3xl font-black mt-1">
                ₹{Number(summary.netPayable).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-100 mt-1">
                Calculated after deducting advances & loan repayments
              </p>
            </div>

            {/* 3 Metric Mini Cards */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Days Worked</span>
                <span className="text-base font-black text-blue-700 mt-0.5 block">{summary.totalWorkedDays}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Gross Wages</span>
                <span className="text-base font-black text-slate-900 mt-0.5 block">₹{summary.grossWage}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Advances</span>
                <span className="text-base font-black text-rose-600 mt-0.5 block">₹{summary.totalAdvances}</span>
              </div>
            </div>

            {/* Daily Attendance History List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <h4 className="font-bold text-xs text-slate-900 mb-3 flex items-center justify-between">
                <span>Daily Attendance Log</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {attendanceRecords.length} entries recorded
                </span>
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-slate-100">
                {attendanceRecords.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">No records for this month</p>
                ) : (
                  attendanceRecords.map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-xs font-bold text-slate-800">{r.date}</span>
                        <span className="text-[10px] text-slate-400 block">Wage: ₹{r.effective_daily_wage}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          r.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                          r.status === 'HALF_DAY' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {r.status}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          ₹{r.earned_amount}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Advances History */}
            {advances.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <h4 className="font-bold text-xs text-slate-900 mb-2">Advances Received</h4>
                <div className="space-y-2">
                  {advances.map(a => (
                    <div key={a.id} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{a.date}</span>
                        <span className="text-[10px] text-slate-400 block">{a.reason || 'Cash Advance'}</span>
                      </div>
                      <span className="font-black text-rose-600">₹{a.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
