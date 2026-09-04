import React, { useState, useEffect } from 'react';
import { Banknote, Plus, Search, Trash2, Calendar, IndianRupee } from 'lucide-react';
import { api } from '../api';
import { translations } from '../translations';

export default function AdvancesManager({ language = 'en' }) {
  const t = translations[language] || translations.en;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t.advancesLedger || 'Advances Management'}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.advancesSubtitle || 'Track daily and weekly cash advances.'} {t.totalAdvancesIssued || 'Total Advances'}: <span className="font-extrabold text-rose-600 dark:text-rose-400">₹{totalAmount.toLocaleString('en-IN')}</span>
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.recordAdvance || 'Record Advance'}</span>
        </button>
      </div>

      {/* Advances Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-100 dark:border-slate-800 text-[10px]">
              <tr>
                <th className="py-3 px-4">{t.sNo || 'Labour ID'}</th>
                <th className="py-3 px-4">{t.worker || 'Worker Name'}</th>
                <th className="py-3 px-3">{t.type || 'Type'}</th>
                <th className="py-3 px-4">{t.date || 'Date'}</th>
                <th className="py-3 px-4">{t.amount || 'Amount (₹)'}</th>
                <th className="py-3 px-3">{t.paymentMode || 'Mode'}</th>
                <th className="py-3 px-4">{t.reason || 'Reason / Notes'}</th>
                <th className="py-3 px-4 text-right">{t.actions || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {advances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No cash advances recorded yet.
                  </td>
                </tr>
              ) : (
                advances.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-black text-blue-700 dark:text-blue-400">{a.labour_id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{a.worker_name}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.worker_type === 'PERMANENT' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}>
                        {a.worker_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">{a.date}</td>
                    <td className="py-3.5 px-4 font-black text-rose-600 dark:text-rose-400 text-sm">₹{Number(a.amount).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-md text-[10px]">
                        {a.payment_mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{a.reason || '-'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => handleDelete(a.id)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">Record Cash Advance</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Labour</label>
                <select
                  value={formData.workerId}
                  onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden"
                  required
                >
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.labour_id} - {w.name} ({w.worker_type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Advance Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 2000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="BANK">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g. Festival advance, medical..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition active:scale-95"
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
