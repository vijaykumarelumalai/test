import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, IndianRupee, CheckCircle2, Building, Calendar, Percent } from 'lucide-react';
import { api } from '../api';

export default function LoanManager() {
  const [loans, setLoans] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalPrincipal, setTotalPrincipal] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const [formData, setFormData] = useState({
    workerId: '',
    loanProvidedFrom: 'VK Traders',
    principalAmount: '',
    interestAmount: '0',
    disbursedDate: new Date().toISOString().split('T')[0],
    monthlyDeduction: '',
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
      setTotalPrincipal(loanRes.totalPrincipal || 0);
      setTotalInterest(loanRes.totalInterest || 0);
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

  const handleAddLoan = async (e) => {
    e.preventDefault();
    try {
      await api.createLoan(formData);
      setShowAddModal(false);
      setFormData({
        workerId: workers[0]?.id || '',
        loanProvidedFrom: 'VK Traders',
        principalAmount: '',
        interestAmount: '0',
        disbursedDate: new Date().toISOString().split('T')[0],
        monthlyDeduction: '',
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

  const nextSNo = loans.length + 1;

  return (
    <div className="space-y-6">
      {/* Header with Add Loan Button (Renamed per client requirement) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Worker Loan Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track individual loans, funding source, principal, interest, and remaining balance
          </p>
        </div>

        {/* Renamed button: 'Add Loan' */}
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Loan</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Principal Disbursed</span>
          <p className="text-xl font-black text-slate-900 mt-1">₹{totalPrincipal.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Interest Accrued</span>
          <p className="text-xl font-black text-amber-600 mt-1">₹{totalInterest.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Total Outstanding Balance</span>
          <p className="text-xl font-black text-blue-800 mt-1">₹{totalBalance.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Loans Table with Required Fields: S.No, Loan Provided From, Principal, Date, Interest Amount, Total */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100 text-[10px]">
              <tr>
                <th className="py-3 px-3 w-12">S.No</th>
                <th className="py-3 px-3">Loan ID</th>
                <th className="py-3 px-4">Labour Name</th>
                <th className="py-3 px-4">Loan Provided From</th>
                <th className="py-3 px-4">Principal (₹)</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Interest (₹)</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Remaining Balance</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No active or historical loans recorded. Click "Add Loan" to create one.
                  </td>
                </tr>
              ) : (
                loans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-3 font-bold text-slate-400">{l.s_no}</td>
                    <td className="py-3.5 px-3 font-black text-slate-700">{l.loan_id}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{l.worker_name}</p>
                      <span className="text-[10px] font-black text-blue-700">{l.labour_id}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                        {l.loan_provided_from}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">₹{Number(l.principal_amount).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-3 text-slate-500 font-medium">{l.disbursed_date}</td>
                    <td className="py-3.5 px-3 font-bold text-amber-700">₹{Number(l.interest_amount).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">₹{Number(l.total_payable).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-black text-rose-600 text-sm">₹{Number(l.balance_remaining).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        l.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {l.status}
                      </span>
                    </td>
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

      {/* Add Loan Modal (Renamed from Issue Loan) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Add Loan</h3>
                <p className="text-[11px] text-slate-400">Auto-Generated S.No: <span className="font-bold text-blue-700">#{nextSNo}</span></p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLoan} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Labour <span className="text-rose-500">*</span></label>
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

              {/* Loan Provided From */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Loan Provided From <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.loanProvidedFrom}
                  onChange={(e) => setFormData({ ...formData, loanProvidedFrom: e.target.value })}
                  placeholder="e.g. VK Traders, Company Account, Partner Name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 outline-hidden"
                />
              </div>

              {/* Principal Amount & Interest Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Principal Amount (₹) <span className="text-rose-500">*</span>
                  </label>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Interest Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.interestAmount}
                    onChange={(e) => setFormData({ ...formData, interestAmount: e.target.value })}
                    placeholder="e.g. 1000 (0 for no interest)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 outline-hidden"
                  />
                </div>
              </div>

              {/* Disbursed Date & Monthly Deduction */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.disbursedDate}
                    onChange={(e) => setFormData({ ...formData, disbursedDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monthly Deduction (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.monthlyDeduction}
                    onChange={(e) => setFormData({ ...formData, monthlyDeduction: e.target.value })}
                    placeholder="e.g. 2000"
                    className="w-full px-3.5 py-2 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 outline-hidden"
                  />
                </div>
              </div>

              {/* Total Payable Summary Banner */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Total Loan Payable:</span>
                <span className="font-black text-blue-800 text-sm">
                  ₹{((parseFloat(formData.principalAmount) || 0) + (parseFloat(formData.interestAmount) || 0)).toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Purpose</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Medical emergency, wedding, tools..."
                  className="w-full px-3.5 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 outline-hidden"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30"
                >
                  Add Loan
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
