import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import MetricCards from './components/MetricCards';
import AttendanceWidget from './components/AttendanceWidget';
import LabourDirectory from './components/LabourDirectory';
import AdvancesManager from './components/AdvancesManager';
import LoanManager from './components/LoanManager';
import ReportsManager from './components/ReportsManager';
import SettingsManager from './components/SettingsManager';
import AddWorkerModal from './components/AddWorkerModal';
import WorkerMobilePortal from './components/WorkerMobilePortal';
import { 
  CalendarCheck, 
  UserPlus
} from 'lucide-react';
import { api } from './api';

export default function App() {
  // Sync tab with URL Hash (e.g. #/dashboard, #/labour, #/attendance, etc.)
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#/', '');
    const validTabs = ['dashboard', 'labour', 'attendance', 'advances', 'loans', 'reports', 'settings', 'worker-portal'];
    return validTabs.includes(hash) ? hash : 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState(getTabFromHash);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [metrics, setMetrics] = useState({});
  const [recentActivity, setRecentActivity] = useState({});
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);

  // Set active tab and update browser URL hash
  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    window.location.hash = `#/${tabId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      setActiveTabState(getTabFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [mRes, actRes] = await Promise.all([
        api.getMetrics(),
        api.getRecentActivity()
      ]);
      setMetrics(mRes.metrics || {});
      setRecentActivity(actRes || {});
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  // Dedicated Worker Mobile Portal Page
  if (activeTab === 'worker-portal') {
    return <WorkerMobilePortal onBackToAdmin={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans antialiased text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onSwitchToLabourView={() => setActiveTab('worker-portal')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header */}
        <TopHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* ======================================================== */}
          {/* PAGE 1: DEDICATED DASHBOARD / EXECUTIVE COMMAND CENTER   */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Dashboard Welcome Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Welcome back, Super Admin! Centralized overview of VK Traders workforce and finances.
                  </p>
                </div>

                {/* Quick Action Buttons to Jump to Separate Pages */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Attendance Page</span>
                  </button>
                  <button
                    onClick={() => setShowAddWorkerModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/30 transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Labour</span>
                  </button>
                </div>
              </div>

              {/* 5 Top KPI Metric Cards */}
              <MetricCards metrics={metrics} />

              {/* Attendance Marking Table directly on Dashboard */}
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Daily Attendance Roster</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mark daily presence, half-days, or variable daily wages. Shortcut buttons available for quick bulk marking.
                    </p>
                  </div>
                  <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    Multiplier: 1.0x / 0.5x / 0.0x
                  </span>
                </div>
                <AttendanceWidget onAttendanceSaved={loadDashboardData} />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 2: DEDICATED LABOUR DIRECTORY PAGE                  */}
          {/* ======================================================== */}
          {activeTab === 'labour' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <LabourDirectory onOpenAddWorker={() => setShowAddWorkerModal(true)} />
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 3: DEDICATED ATTENDANCE MANAGEMENT PAGE             */}
          {/* ======================================================== */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Daily Attendance Roster</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select any date to log or review past attendance, half-days, and variable daily wages
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  Auto Wage Multiplier: 1.0x / 0.5x / 0.0x
                </span>
              </div>
              <AttendanceWidget onAttendanceSaved={loadDashboardData} />
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 4: DEDICATED ADVANCES PAGE                          */}
          {/* ======================================================== */}
          {activeTab === 'advances' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <AdvancesManager />
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 5: DEDICATED LOANS PAGE                             */}
          {/* ======================================================== */}
          {activeTab === 'loans' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <LoanManager />
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 6: DEDICATED REPORTS & PAYROLL PAGE                 */}
          {/* ======================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <ReportsManager />
            </div>
          )}

          {/* ======================================================== */}
          {/* PAGE 7: DEDICATED SETTINGS & CONFIGURATION PAGE          */}
          {/* ======================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <SettingsManager />
            </div>
          )}

        </main>
      </div>

      {/* Add Worker Modal (Callable from any page) */}
      <AddWorkerModal
        isOpen={showAddWorkerModal}
        onClose={() => setShowAddWorkerModal(false)}
        onWorkerCreated={() => {
          loadDashboardData();
        }}
      />
    </div>
  );
}
