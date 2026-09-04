import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  Save, 
  CheckCheck, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../api';

export default function AttendanceWidget({ onAttendanceSaved }) {
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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Top Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Mark Attendance (Today)</h2>
            <p className="text-xs text-slate-500">Record daily present, half-day, and absent entries</p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition"
          />
          <button
            onClick={() => handleMarkAll('PRESENT')}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5 transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Present</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search labour by name, ID, or mobile..."
            className="w-full pl-9 pr-3 py-2 bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Dynamic Departments Filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2 bg-white text-xs font-medium text-slate-700 rounded-xl border border-slate-200 outline-hidden flex-1 sm:flex-none"
          >
            <option value="ALL">All Departments/Sites</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-white text-xs font-medium text-slate-700 rounded-xl border border-slate-200 outline-hidden flex-1 sm:flex-none"
          >
            <option value="ALL">All Labour Types</option>
            <option value="PERMANENT">Permanent Only</option>
            <option value="TEMPORARY">Temporary Only</option>
          </select>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4 w-8">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-0" />
              </th>
              <th className="py-3 px-3 w-8">#</th>
              <th className="py-3 px-3">Labour ID</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-4">Department/Site</th>
              <th className="py-3 px-3">Daily Wage (₹)</th>
              <th className="py-3 px-4 text-center">Attendance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No labourers found matching your criteria.
                </td>
              </tr>
            ) : (
              paginatedList.map((worker, index) => {
                const rowIndex = (currentPage - 1) * pageSize + index + 1;
                const isSelected = selectedIds.includes(worker.worker_id);

                return (
                  <tr key={worker.worker_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {
                          setSelectedIds(prev => 
                            isSelected ? prev.filter(id => id !== worker.worker_id) : [...prev, worker.worker_id]
                          );
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-0"
                      />
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-500">{rowIndex}</td>
                    <td className="py-3.5 px-3 font-extrabold text-blue-700 tracking-tight">
                      {worker.labour_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{worker.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                        <span className="text-slate-500 font-medium">📱 {worker.login_phone || worker.phone}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-black text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded tracking-wider" title="Labour 4-digit PIN password">
                          🔑 PIN: {worker.login_pin || (worker.phone ? worker.phone.slice(-4) : '0000')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                        worker.worker_type === 'PERMANENT' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {worker.worker_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {worker.department}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="relative w-24">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                        <input
                          type="number"
                          value={worker.wageInput}
                          onChange={(e) => handleWageChange(worker.worker_id, e.target.value)}
                          className="w-full pl-6 pr-2 py-1.5 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-bold text-slate-800 rounded-lg border border-slate-200 focus:border-blue-500 outline-hidden"
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
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          Present
                        </button>

                        {/* Absent Button */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(worker.worker_id, 'ABSENT')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            worker.currentStatus === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          Absent
                        </button>

                        {/* Half Day Button */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(worker.worker_id, 'HALF_DAY')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            worker.currentStatus === 'HALF_DAY'
                              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          Half Day
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
      <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-700">{Math.min(filteredRoster.length, (currentPage - 1) * pageSize + 1)}</span> to <span className="font-bold text-slate-700">{Math.min(filteredRoster.length, currentPage * pageSize)}</span> of <span className="font-bold text-slate-700">{filteredRoster.length}</span> labours
        </div>

        <div className="flex items-center gap-3">
          {/* Pagination buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-30"
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
