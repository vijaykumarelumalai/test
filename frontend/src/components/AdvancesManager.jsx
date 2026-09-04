import React, { useState, useEffect } from 'react';
import { Banknote, Plus, Search, Trash2, Calendar, IndianRupee } from 'lucide-react';
import { api } from '../api';

export default function AdvancesManager() {
  const [advances, setAdvances] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    workerId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'CASH',
    reason: ''
  });

  const loadData = async () => {
    try {
      const [advRes, wrkRes] = await Promise.all([
        api.getAdvances(),
        api.getWorkers()
      ]);
      setAdvances(advRes.advances || []);
      setTotalAmount(advRes.totalAmount || 0);
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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.recordAdvance(formData);
      setShowAddModal(false);
      setFormData({
        workerId: workers[0]?.id || '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMode: 'CASH',
        reason: ''
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this advance record?')) {
      try {
        await api.deleteAdvance(id);
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Advances Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track daily and weekly cash advances. Total Advances: <span className="font-extrabold text-rose-600">₹{totalAmount.toLocaleString('en-IN')}</span>
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Record Advance</span>
        </button>
      </div>

      {/* Advances Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100 text-[10px]">
              <tr>
                <th className="py-3 px-4">Labour ID</th>
                <th className="py-3 px-4">Worker Name</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount (₹)</th>
                <th className="py-3 px-3">Mode</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {advances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No cash advances recorded yet.
                  </td>
                </tr>
              ) : (
                advances.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-black text-blue-700">{a.labour_id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{a.worker_name}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.worker_type === 'PERMANENT' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {a.worker_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{a.date}</td>
                    <td className="py-3.5 px-4 font-black text-rose-600 text-sm">₹{Number(a.amount).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md text-[10px]">
                        {a.payment_mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{a.reason || '-'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => handleDelete(a.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Advance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-extrabold text-base text-slate-900 mb-4">Record Cash Advance</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Labour</label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Advance Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 2000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 outline-hidden"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="BANK">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g. Festival advance, medical..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 outline-hidden"
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
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30"
                >
                  Save Advance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
