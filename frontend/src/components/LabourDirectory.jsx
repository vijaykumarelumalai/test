import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Building2, 
  IndianRupee, 
  Calendar, 
  Trash2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from '../api';

export default function LabourDirectory({ onOpenAddWorker }) {
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const res = await api.getWorkers();
      setWorkers(res.workers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  const filtered = workers.filter(w => {
    const matchesSearch = 
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.labour_id.toLowerCase().includes(search.toLowerCase()) ||
      w.phone.includes(search);
    const matchesType = filterType === 'ALL' || w.worker_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to deactivate worker ${name}?`)) {
      try {
        await api.deleteWorker(id);
        loadWorkers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Labour Directory</h2>
          <p className="text-xs text-slate-500 mt-1">Manage permanent and temporary workers of VK Traders</p>
        </div>

        <button
          onClick={onOpenAddWorker}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/30 transition active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Labour</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by worker name, Labour ID (VK-XXX), or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'PERMANENT', 'TEMPORARY'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex-1 sm:flex-none ${
                filterType === t 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t === 'ALL' ? 'All Labour' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Workers Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-slate-400 text-xs">
            Loading labourers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-slate-400 text-xs">
            No labourers found matching your search.
          </div>
        ) : (
          filtered.map((w) => (
            <div 
              key={w.id} 
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm ${
                    w.worker_type === 'PERMANENT' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {w.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{w.name}</h3>
                    <span className="text-xs font-black text-blue-700 tracking-tight">{w.labour_id}</span>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                  w.worker_type === 'PERMANENT' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {w.worker_type}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Phone className="w-3.5 h-3.5" /> Mobile:
                  </span>
                  <span className="font-bold text-slate-800">{w.phone}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Building2 className="w-3.5 h-3.5" /> Site:
                  </span>
                  <span className="font-medium text-slate-800">{w.department}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <IndianRupee className="w-3.5 h-3.5" /> Daily Wage:
                  </span>
                  <span className="font-black text-emerald-700">₹{w.daily_wage} / day</span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Joined: {w.joining_date}</span>
                  <button
                    onClick={() => handleDelete(w.id, w.name)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                    title="Deactivate worker"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
