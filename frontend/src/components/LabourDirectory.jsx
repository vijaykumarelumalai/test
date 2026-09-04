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
  Clock,
  Copy,
  KeyRound
} from 'lucide-react';
import { api } from '../api';
import { translations } from '../translations';

export default function LabourDirectory({ onOpenAddWorker, language = 'en' }) {
  const t = translations[language] || translations.en;
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

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

  const handleCopyCredentials = (w) => {
    const pin = w.login_pin || (w.phone ? w.phone.slice(-4) : '0000');
    const text = `VK Traders Worker Login:\nMobile: ${w.phone}\nPIN: ${pin}\nID: ${w.labour_id}`;
    navigator.clipboard.writeText(text);
    setCopiedId(w.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t.labourDirectory || 'Labour Directory'}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.labourSubtitle || 'Manage permanent and temporary workers & view their mobile app credentials'}</p>
        </div>

        <button
          onClick={onOpenAddWorker}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/30 transition active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t.addNewWorker || 'Add New Labour'}</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchLabour || 'Search by worker name, Labour ID (VK-XXX), or phone...'}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-hidden transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'PERMANENT', 'TEMPORARY'].map((typeKey) => (
            <button
              key={typeKey}
              onClick={() => setFilterType(typeKey)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex-1 sm:flex-none ${
                filterType === typeKey 
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {typeKey === 'ALL' ? (t.allTypes || 'All Labour') : 
               typeKey === 'PERMANENT' ? (t.permanent || 'Permanent') : 
               (t.temporary || 'Temporary')}
            </button>
          ))}
        </div>
      </div>

      {/* Workers Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
            Loading labourers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
            No labourers found matching your search.
          </div>
        ) : (
          filtered.map((w) => {
            const pin = w.login_pin || (w.phone ? w.phone.slice(-4) : '0000');
            const isCopied = copiedId === w.id;

            return (
              <div 
                key={w.id} 
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm ${
                        w.worker_type === 'PERMANENT' 
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}>
                        {w.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{w.name}</h3>
                        <span className="text-xs font-black text-blue-700 dark:text-blue-400 tracking-tight">{w.labour_id}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                      w.worker_type === 'PERMANENT' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {w.worker_type}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                        <Building2 className="w-3.5 h-3.5" /> Site:
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{w.department}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                        <IndianRupee className="w-3.5 h-3.5" /> Daily Wage:
                      </span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400">₹{w.daily_wage} / day</span>
                    </div>
                  </div>

                  {/* Worker Mobile App Login & Password Box (Requested by Super Admin) */}
                  <div className="mt-3 p-3 rounded-xl bg-blue-50/60 dark:bg-slate-800/80 border border-blue-200/60 dark:border-slate-700/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-blue-800 dark:text-blue-300 tracking-wider flex items-center gap-1">
                        <KeyRound className="w-3 h-3" /> App Login Credentials
                      </span>
                      <button
                        onClick={() => handleCopyCredentials(w)}
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-1"
                        title="Copy credentials"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] block">Login Phone:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{w.phone}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] block">Password / PIN:</span>
                        <span className="font-black text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/70 px-2 py-0.5 rounded-md tracking-wider">
                          {pin}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 dark:text-slate-500">Joined: {w.joining_date}</span>
                  <button
                    onClick={() => handleDelete(w.id, w.name)}
                    className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 p-1"
                    title="Deactivate worker"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
