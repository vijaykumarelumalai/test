import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, IndianRupee, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export default function LoanManager() {
  const [loans, setLoans] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const [formData, setFormData] = useState({
    workerId: '',
    principalAmount: '',
    monthlyDeduction: '',
    disbursedDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [repayAmount, setRepayAmount] = useState('');

  const loadData = async () => {
    try {
      const [loanRes, wrkRes] = await Promise.all([
        api.getLoans(),
        api.getWorkers()
      ]);
      setLoans(loanRes.loans || []);
      setTotalBalance(loanRes.totalActiveBalance || 0);
      setWorkers(wrkRes.workers || []);
      if (wrkRes.workers?.length > 0 && !formData.workerId) {
        setFormData(prev => ({ ...prev, workerId: wrkRes.workers[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssue = async (e) => {
    e.preventDefault();
    try {
      await api.createLoan(formData);
      setShowIssueModal(false);
      setFormData({
        workerId: workers[0]?.id || '',
        principalAmount: '',
        monthlyDeduction: '',
        disbursedDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRepay = async (e) => {
    e.preventDefault();
    if (!selectedLoan) return;
    try {
      await api.repayLoan(selectedLoan.id, {
        amount: repayAmount,
        date: new Date().toISOString().split('T')[0],
        notes: 'Manual repayment'
      });
      setShowRepayModal(false);
      setSelectedLoan(null);
      setRepayAmount('');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Worker Loan Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Long-term employee loans with amortized monthly salary deductions. Outstanding Balance: <span className="font-extrabold text-blue-700">₹{totalBalance.toLocaleString('en-IN')}</span>
          </p>
        </div>

        <button
          onClick={() => setShowIssueModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Loan</span>
        </button>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100 text-[10px]">
              <tr>
                <th className="py-3 px-4">Loan ID</th>
                <th className="py-3 px-4">Labour Name</th>
                <th className="py-3 px-4">Principal (₹)</th>
                <th className="py-3 px-4">Monthly Deduction</th>
                <th className="py-3 px-4">Remaining Balance</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Disbursed Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No active or historical loans recorded.
                  </td>
                </tr>
              ) : (
                loans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-black text-slate-800">{l.loan_id}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{l.worker_name}</p>
                      <span className="text-[10px] font-black text-blue-700">{l.labour_id}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">₹{Number(l.principal_amount).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">₹{Number(l.monthly_deduction).toLocaleString('en-IN')} / mo</td>
                    <td className="py-3.5 px-4 font-black text-rose-600 text-sm">₹{Number(l.balance_remaining).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        l.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{l.disbursed_date}</td>
                    <td className="py-3.5 px-4 text-right">
                      {l.status === 'ACTIVE' && (
                        <button
                          onClick={() => {
                            setSelectedLoan(l);
                            setRepayAmount(l.monthly_deduction || '');
                            setShowRepayModal(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200"
                        >
                          Repay
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Loan Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-extrabold text-base text-slate-900 mb-4">Issue Worker Loan</h3>
            <form onSubmit={handleIssue} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Worker</label>
                <select
                  value={formData.workerId}
                  onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 outline-hidden"
                  required
                >
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.labour_id} - {w.name} ({w.worker_type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Principal Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={formData.principalAmount}
                  onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                  placeholder="e.g. 20000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Deduction Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={10}
                  value={formData.monthlyDeduction}
                  onChange={(e) => setFormData({ ...formData, monthlyDeduction: e.target.value })}
                  placeholder="e.g. 2000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Disbursed Date</label>
                <input
                  type="date"
                  required
                  value={formData.disbursedDate}
                  onChange={(e) => setFormData({ ...formData, disbursedDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 outline-hidden"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                >
                  Issue Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repay Loan Modal */}
      {showRepayModal && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
            <h3 className="font-extrabold text-base text-slate-900 mb-1">Record Repayment</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedLoan.worker_name} ({selectedLoan.loan_id})</p>
            <form onSubmit={handleRepay} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Repayment Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedLoan.balance_remaining}
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Current Balance: ₹{Number(selectedLoan.balance_remaining).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRepayModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Confirm Repay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
