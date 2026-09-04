import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  Save, 
  CheckCheck, 
  XCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../api';
import { translations } from '../translations';

export default function AttendanceWidget({ onAttendanceSaved, language = 'en' }) {
  const t = translations[language] || translations.en;
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState([]);
  const [filteredRoster, setFilteredRoster] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const loadRoster = async () => {
    try {
      const [res, deptRes] = await Promise.all([
        api.getAttendanceByDate(selectedDate),
        api.getDepartments().catch(() => ({ departments: [] }))
      ]);
      const data = (res.roster || []).map(item => ({
        ...item,
        currentStatus: item.status !== 'UNMARKED' ? item.status : 'PRESENT',
        wageInput: item.effective_daily_wage || item.default_daily_wage
      }));
      setRoster(data);
      if (deptRes.departments) {
        setDepartments(deptRes.departments);
      }
    } catch (err) {
      console.error('Failed to load roster:', err);
    }
  };

  useEffect(() => {
    loadRoster();
  }, [selectedDate]);

  useEffect(() => {
    let list = [...roster];
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(r => 
        r.name.toLowerCase().includes(s) || 
        r.labour_id.toLowerCase().includes(s) || 
        r.phone.includes(s)
      );
    }
    if (filterDept !== 'ALL') {
      list = list.filter(r => r.department === filterDept);
    }
    if (filterType !== 'ALL') {
      list = list.filter(r => r.worker_type === filterType);
    }
    setFilteredRoster(list);
    setCurrentPage(1);
  }, [roster, search, filterDept, filterType]);

  const handleStatusChange = (workerId, newStatus) => {
    setRoster(prev => prev.map(w => 
      w.worker_id === workerId ? { ...w, currentStatus: newStatus } : w
    ));
    setSaveSuccess(false);
  };

  const handleWageChange = (workerId, val) => {
    setRoster(prev => prev.map(w => 
      w.worker_id === workerId ? { ...w, wageInput: val } : w
    ));
    setSaveSuccess(false);
  };

  const handleMarkAll = (status) => {
    setRoster(prev => prev.map(w => ({ ...w, currentStatus: status })));
    setSaveSuccess(false);
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const payload = roster.map(w => ({
        worker_id: w.worker_id,
        status: w.currentStatus,
        effective_daily_wage: parseFloat(w.wageInput) || w.default_daily_wage,
        remarks: ''
      }));

      await api.saveDailyAttendance(selectedDate, payload);
      setSaveSuccess(true);
      if (onAttendanceSaved) onAttendanceSaved();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      alert('Failed to save attendance: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredRoster.length / pageSize) || 1;
  const paginatedList = filteredRoster.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {/* Top Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{t.dailyAttendanceRoster || 'Mark Attendance (Today)'}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.attendanceSubtitle || 'Record daily present, half-day, and absent entries'}</p>
          </div>
        </div>

        {/* Date Selector & Shortcut Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition"
          />
          
          {/* Mark All Present Shortcut */}
          <button
            onClick={() => handleMarkAll('PRESENT')}
            className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition active:scale-95"
            title="Mark all workers Present for today"
          >
            <CheckCheck className="w-4 h-4" />
            <span>{t.markAllPresent || 'Mark All Present'}</span>
          </button>

          {/* Mark All Absent (Holiday) Shortcut */}
          <button
            onClick={() => handleMarkAll('ABSENT')}
            className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 transition active:scale-95"
            title="Mark all workers Absent for Holiday or site shutdown"
          >
            <XCircle className="w-4 h-4" />
            <span>{t.markAllAbsent || 'Mark All Absent (Holiday)'}</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveAttendance}
            disabled={isSaving}
            className={`
              px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95
              ${saveSuccess 
                ? 'bg-emerald-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'}
            `}
          >
            {isSaving ? (
              <span>{t.saving || 'Saving...'}</span>
            ) : saveSuccess ? (
              <>
                <CheckCheck className="w-4 h-4" />
                <span>{t.saved || 'Saved!'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t.saveAttendance || 'Save Attendance'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search labour by name, ID, or mobile..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Dynamic Departments Filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden flex-1 sm:flex-none"
          >
            <option value="ALL">{t.allDepartments || 'All Departments/Sites'}</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden flex-1 sm:flex-none"
          >
            <option value="ALL">{t.allTypes || 'All Labour Types'}</option>
            <option value="PERMANENT">{t.permanent || 'Permanent Only'}</option>
            <option value="TEMPORARY">{t.temporary || 'Temporary Only'}</option>
          </select>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4 w-8">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-0" />
              </th>
              <th className="py-3 px-3 w-8">#</th>
              <th className="py-3 px-3">{t.sNo || 'Labour ID'}</th>
              <th className="py-3 px-4">{t.worker || 'Name & Login Info'}</th>
              <th className="py-3 px-3">{t.type || 'Type'}</th>
              <th className="py-3 px-4">{t.dept || 'Department/Site'}</th>
              <th className="py-3 px-3">{t.dailyWage || 'Daily Wage (₹)'}</th>
              <th className="py-3 px-4 text-center">{t.status || 'Attendance'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  No labourers found matching your criteria.
                </td>
              </tr>
            ) : (
              paginatedList.map((worker, index) => {
                const rowIndex = (currentPage - 1) * pageSize + index + 1;
                const isSelected = selectedIds.includes(worker.worker_id);

                return (
                  <tr key={worker.worker_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {
                          setSelectedIds(prev => 
                            isSelected ? prev.filter(id => id !== worker.worker_id) : [...prev, worker.worker_id]
                          );
                        }}
                        className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0 dark:bg-slate-800"
                      />
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-500 dark:text-slate-400">{rowIndex}</td>
                    <td className="py-3.5 px-3 font-extrabold text-blue-700 dark:text-blue-400 tracking-tight">
                      {worker.labour_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{worker.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">📱 {worker.login_phone || worker.phone}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="font-black text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/70 px-1.5 py-0.5 rounded tracking-wider" title="Labour 4-digit PIN password">
                          🔑 PIN: {worker.login_pin || (worker.phone ? worker.phone.slice(-4) : '0000')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                        worker.worker_type === 'PERMANENT' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {worker.worker_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {worker.department}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="relative w-24">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                        <input
                          type="number"
                          value={worker.wageInput}
                          onChange={(e) => handleWageChange(worker.worker_id, e.target.value)}
                          className="w-full pl-6 pr-2 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-hidden"
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Present Button */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(worker.worker_id, 'PRESENT')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            worker.currentStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300'
                          }`}
                        >
                          {t.present || 'Present'}
                        </button>

                        {/* Half Day Button */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(worker.worker_id, 'HALF_DAY')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            worker.currentStatus === 'HALF_DAY'
                              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-300'
                          }`}
                        >
                          {t.halfDay || 'Half Day'}
                        </button>

                        {/* Absent Button */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(worker.worker_id, 'ABSENT')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            worker.currentStatus === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300'
                          }`}
                        >
                          {t.absent || 'Absent'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer: Pagination & Save Button */}
      <div className="p-4 bg-slate-50/60 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(filteredRoster.length, (currentPage - 1) * pageSize + 1)}</span> to <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(filteredRoster.length, currentPage * pageSize)}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{filteredRoster.length}</span> labours
        </div>

        <div className="flex items-center gap-3">
          {/* Pagination buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-700 dark:text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Save Attendance Action */}
          <button
            onClick={handleSaveAttendance}
            disabled={isSaving}
            className={`
              px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md
              ${saveSuccess 
                ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 active:scale-95'}
            `}
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : saveSuccess ? (
              <>
                <CheckCheck className="w-4 h-4" />
                <span>Attendance Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Attendance</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
